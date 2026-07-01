import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  parseContourCsv,
  importContourCsv,
  buildContourImportMessage,
} from '../utils/importContourCsv';
import { CONTOUR_SAMPLE_CSV } from '../__fixtures__/contourSample';

const mockBloodSugarExistsByTimestampValue = jest.fn();
const mockInsertBloodSugar = jest.fn();

jest.mock('../dataRepository', () => ({
  dataRepository: {
    bloodSugarExistsByTimestampValue: (timestamp: number, valueMmol: number) =>
      mockBloodSugarExistsByTimestampValue(timestamp, valueMmol),
    insertBloodSugar: (r: any) => mockInsertBloodSugar(r),
  },
}));

const mockGetDocument = DocumentPicker.getDocumentAsync as jest.Mock;
const mockReadFile = FileSystem.readAsStringAsync as jest.Mock;

const HEADER =
  '﻿#,Dato og klokkeslett,BGValue[mmol/L],Måltidsmarkering,Datakilde,Notater,Aktivitet,Måltid[g],Medisin,Sted';

function csv(...rows: string[]): string {
  return [HEADER, ...rows].join('\n');
}

describe('parseContourCsv', () => {
  it('parses a basic row with comma-decimal value and local timestamp', () => {
    const result = parseContourCsv(
      csv('1,"08.06.2026 13:47:35","4,3","Ingen markering","Måler","","","","",""'),
    );
    expect(result).not.toBeNull();
    expect(result!.rows).toHaveLength(1);
    const row = result!.rows[0];
    expect(row.valueMmol).toBe(4.3);
    expect(row.timestamp).toEqual(new Date(2026, 5, 8, 13, 47, 35));
    expect(row.context).toBe('random');
    expect(row.unknownMarking).toBe(false);
  });

  it.each([
    ['Ingen markering', 'random'],
    ['Før måltid', 'before_meal'],
    ['Etter måltid', 'after_meal_2h'],
  ])('maps marking "%s" to context "%s"', (marking, context) => {
    const result = parseContourCsv(
      csv(`1,"08.06.2026 13:47:35","4,3","${marking}","Måler","","","","",""`),
    );
    expect(result!.rows[0].context).toBe(context);
    expect(result!.rows[0].unknownMarking).toBe(false);
  });

  it('falls back to random and flags unknown markings not in the mapping table', () => {
    const result = parseContourCsv(
      csv('1,"08.06.2026 13:47:35","4,3","Ukjent verdi","Måler","","","","",""'),
    );
    const row = result!.rows[0];
    expect(row.context).toBe('random');
    expect(row.unknownMarking).toBe(true);
    expect(row.notes).toContain('Ukjent Contour-markering: "Ukjent verdi"');
  });

  it('folds Notater and Sted into notes', () => {
    const result = parseContourCsv(
      csv('1,"08.06.2026 13:47:35","4,3","Ingen markering","Måler","Følte meg svimmel","","","","Husarveien"'),
    );
    expect(result!.rows[0].notes).toBe('Følte meg svimmel; Sted: Husarveien');
  });

  it('skips rows with an unparseable date or value and counts them as invalid', () => {
    const result = parseContourCsv(
      csv(
        '1,"not-a-date","4,3","Ingen markering","Måler","","","","",""',
        '2,"08.06.2026 13:47:35","not-a-number","Ingen markering","Måler","","","","",""',
        '3,"08.06.2026 13:47:35","4,3","Ingen markering","Måler","","","","",""',
      ),
    );
    expect(result!.rows).toHaveLength(1);
    expect(result!.invalidCount).toBe(2);
  });

  it('returns null when the header does not match the expected Contour columns', () => {
    const result = parseContourCsv('a,b,c\n1,2,3');
    expect(result).toBeNull();
  });

  it('returns null for an empty file', () => {
    expect(parseContourCsv('')).toBeNull();
  });

  it('parses the real sample export without any invalid rows', () => {
    const result = parseContourCsv(CONTOUR_SAMPLE_CSV);
    expect(result).not.toBeNull();
    expect(result!.invalidCount).toBe(0);
    expect(result!.rows.length).toBe(69);
    expect(result!.rows[0]).toMatchObject({
      valueMmol: 4.3,
      context: 'random',
      timestamp: new Date(2026, 5, 8, 13, 47, 35),
    });
  });
});

describe('importContourCsv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBloodSugarExistsByTimestampValue.mockResolvedValue(false);
    mockGetDocument.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///contour.csv' }],
    });
    mockReadFile.mockResolvedValue(
      csv(
        '1,"08.06.2026 13:47:35","4,3","Ingen markering","Måler","","","","",""',
        '2,"10.06.2026 07:43:27","8,8","Før måltid","Måler","","","","",""',
      ),
    );
  });

  it('returns cancelled when the picker is dismissed', async () => {
    mockGetDocument.mockResolvedValue({ canceled: true });
    const result = await importContourCsv();
    expect(result).toEqual({ type: 'cancelled' });
  });

  it('returns error when the file cannot be read', async () => {
    mockReadFile.mockRejectedValue(new Error('read failed'));
    const result = await importContourCsv();
    expect(result).toEqual({ type: 'error' });
  });

  it('returns error when the header does not match', async () => {
    mockReadFile.mockResolvedValue('a,b,c\n1,2,3');
    const result = await importContourCsv();
    expect(result).toEqual({ type: 'error' });
  });

  it('imports new rows and reports the correct counts', async () => {
    const result = await importContourCsv();
    expect(result).toEqual({
      type: 'success',
      imported: 2,
      duplicates: 0,
      invalid: 0,
      unknownMarkings: 0,
    });
    expect(mockInsertBloodSugar).toHaveBeenCalledTimes(2);
    expect(mockInsertBloodSugar).toHaveBeenCalledWith(
      expect.objectContaining({ valueMmol: 4.3, context: 'random' }),
    );
    expect(mockInsertBloodSugar).toHaveBeenCalledWith(
      expect.objectContaining({ valueMmol: 8.8, context: 'before_meal' }),
    );
  });

  it('skips rows whose timestamp and value already exist', async () => {
    mockBloodSugarExistsByTimestampValue.mockResolvedValueOnce(true);
    const result = await importContourCsv();
    expect(result).toEqual({
      type: 'success',
      imported: 1,
      duplicates: 1,
      invalid: 0,
      unknownMarkings: 0,
    });
    expect(mockInsertBloodSugar).toHaveBeenCalledTimes(1);
  });

  it('counts rows that used the unknown-marking fallback', async () => {
    mockReadFile.mockResolvedValue(
      csv('1,"08.06.2026 13:47:35","4,3","Noe annet","Måler","","","","",""'),
    );
    const result = await importContourCsv();
    expect(result).toEqual({
      type: 'success',
      imported: 1,
      duplicates: 0,
      invalid: 0,
      unknownMarkings: 1,
    });
  });
});

describe('buildContourImportMessage', () => {
  const t = (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key;

  it('returns null for cancelled', () => {
    expect(buildContourImportMessage(t, { type: 'cancelled' })).toBeNull();
  });

  it('returns the error message for error', () => {
    expect(buildContourImportMessage(t, { type: 'error' })).toBe('settings.import_contour_error');
  });

  it('returns the none message when nothing new was imported', () => {
    expect(
      buildContourImportMessage(t, {
        type: 'success',
        imported: 0,
        duplicates: 3,
        invalid: 0,
        unknownMarkings: 0,
      }),
    ).toBe('settings.import_contour_none');
  });

  it('returns the success message without a suffix when there are no unknown markings', () => {
    expect(
      buildContourImportMessage(t, {
        type: 'success',
        imported: 5,
        duplicates: 0,
        invalid: 0,
        unknownMarkings: 0,
      }),
    ).toBe('settings.import_contour_success:{"count":5}');
  });

  it('appends the unknown-marking suffix when applicable', () => {
    expect(
      buildContourImportMessage(t, {
        type: 'success',
        imported: 5,
        duplicates: 0,
        invalid: 0,
        unknownMarkings: 2,
      }),
    ).toBe(
      'settings.import_contour_success:{"count":5} settings.import_contour_unknown_suffix:{"count":2}',
    );
  });
});
