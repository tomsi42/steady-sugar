import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { dataRepository } from '../dataRepository';
import type { BloodSugarContext } from '../../../shared/database/schema';

export type ContourImportResult =
  | { type: 'success'; imported: number; duplicates: number; invalid: number; unknownMarkings: number }
  | { type: 'cancelled' }
  | { type: 'error' };

export interface ParsedContourRow {
  timestamp: Date;
  valueMmol: number;
  context: BloodSugarContext;
  notes: string;
  unknownMarking: boolean;
}

interface ParsedContourCsv {
  rows: ParsedContourRow[];
  invalidCount: number;
}

// Contour's meal-marking vocabulary is Norwegian-only for this milestone.
const MARKING_MAP: Record<string, BloodSugarContext> = {
  'Ingen markering': 'random',
  'Før måltid': 'before_meal',
  'Etter måltid': 'after_meal_2h',
};

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function parseContourDate(raw: string): Date | null {
  const match = raw.trim().match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, dd, mm, yyyy, hh, min, ss] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseContourValue(raw: string): number | null {
  const value = parseFloat(raw.trim().replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

function mapMarking(raw: string): { context: BloodSugarContext; unknown: boolean } {
  const trimmed = raw.trim();
  if (trimmed in MARKING_MAP) {
    return { context: MARKING_MAP[trimmed], unknown: false };
  }
  return { context: 'random', unknown: true };
}

function buildNotes(notater: string, sted: string, unknownMarking: string | null): string {
  const parts: string[] = [];
  if (notater.trim()) parts.push(notater.trim());
  if (sted.trim()) parts.push(`Sted: ${sted.trim()}`);
  if (unknownMarking) parts.push(`Ukjent Contour-markering: "${unknownMarking}"`);
  return parts.join('; ');
}

export function parseContourCsv(raw: string): ParsedContourCsv | null {
  const text = raw.replace(/^\uFEFF/, '');
  const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return null;

  const header = parseCsvLine(lines[0]);
  const dateIdx = header.indexOf('Dato og klokkeslett');
  const valueIdx = header.indexOf('BGValue[mmol/L]');
  const markingIdx = header.indexOf('Måltidsmarkering');
  const notesIdx = header.indexOf('Notater');
  const stedIdx = header.indexOf('Sted');

  if (dateIdx === -1 || valueIdx === -1 || markingIdx === -1) return null;

  const rows: ParsedContourRow[] = [];
  let invalidCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const timestamp = parseContourDate(fields[dateIdx] ?? '');
    const valueMmol = parseContourValue(fields[valueIdx] ?? '');
    if (!timestamp || valueMmol === null) {
      invalidCount++;
      continue;
    }

    const { context, unknown } = mapMarking(fields[markingIdx] ?? '');
    const notes = buildNotes(
      notesIdx !== -1 ? fields[notesIdx] ?? '' : '',
      stedIdx !== -1 ? fields[stedIdx] ?? '' : '',
      unknown ? (fields[markingIdx] ?? '').trim() : null,
    );

    rows.push({ timestamp, valueMmol, context, notes, unknownMarking: unknown });
  }

  return { rows, invalidCount };
}

export async function importContourCsv(): Promise<ContourImportResult> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
  });
  if (picked.canceled) return { type: 'cancelled' };

  let raw: string;
  try {
    if (Platform.OS === 'web') {
      raw = await fetch(picked.assets[0].uri).then((r) => r.text());
    } else {
      raw = await FileSystem.readAsStringAsync(picked.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }
  } catch {
    return { type: 'error' };
  }

  const parsed = parseContourCsv(raw);
  if (!parsed) return { type: 'error' };

  let imported = 0;
  let duplicates = 0;
  let unknownMarkings = 0;

  for (const row of parsed.rows) {
    const exists = await dataRepository.bloodSugarExistsByTimestampValue(
      row.timestamp.getTime(),
      row.valueMmol,
    );
    if (exists) {
      duplicates++;
      continue;
    }

    await dataRepository.insertBloodSugar({
      valueMmol: row.valueMmol,
      timestamp: row.timestamp,
      context: row.context,
      notes: row.notes,
    });
    imported++;
    if (row.unknownMarking) unknownMarkings++;
  }

  return { type: 'success', imported, duplicates, invalid: parsed.invalidCount, unknownMarkings };
}

export function buildContourImportMessage(
  t: (key: string, params?: Record<string, unknown>) => string,
  result: ContourImportResult,
): string | null {
  if (result.type === 'cancelled') return null;
  if (result.type === 'error') return t('settings.import_contour_error');
  if (result.imported === 0) return t('settings.import_contour_none');

  let message = t('settings.import_contour_success', { count: result.imported });
  if (result.unknownMarkings > 0) {
    message += ` ${t('settings.import_contour_unknown_suffix', { count: result.unknownMarkings })}`;
  }
  return message;
}
