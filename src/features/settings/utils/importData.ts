import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { dataRepository } from '../dataRepository';

export type ImportResult =
  | { type: 'success'; count: number }
  | { type: 'cancelled' }
  | { type: 'error' };

interface BackupPayload {
  version: number;
  bloodSugarReadings: Array<{
    id: number;
    valueMmol: number;
    timestamp: number;
    context: string;
    notes: string;
  }>;
  foodEntries: Array<{
    id: number;
    name: string;
    category: string;
    timestamp: number;
  }>;
  weightEntries: Array<{
    id: number;
    valueKg: number;
    timestamp: number;
    notes: string;
  }>;
  settings: {
    id: number;
    userName: string;
    targetMinMmol: number;
    targetMaxMmol: number;
  } | null;
}

function isValidBackup(data: unknown): data is BackupPayload {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    d.version === 1 &&
    Array.isArray(d.bloodSugarReadings) &&
    Array.isArray(d.foodEntries) &&
    Array.isArray(d.weightEntries)
  );
}

export async function importData(): Promise<ImportResult> {
  const picked = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  if (picked.canceled) return { type: 'cancelled' };

  let raw: string;
  try {
    raw = await FileSystem.readAsStringAsync(picked.assets[0].uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch {
    return { type: 'error' };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { type: 'error' };
  }

  if (!isValidBackup(payload)) return { type: 'error' };

  let count = 0;

  for (const r of payload.bloodSugarReadings) {
    if (!dataRepository.bloodSugarExists(r.id)) {
      dataRepository.insertBloodSugar({
        id: r.id,
        valueMmol: r.valueMmol,
        timestamp: new Date(r.timestamp),
        context: r.context as 'fasting' | 'before_meal' | 'after_meal_2h' | 'random',
        notes: r.notes,
      });
      count++;
    }
  }

  for (const f of payload.foodEntries) {
    if (!dataRepository.foodExists(f.id)) {
      dataRepository.insertFood({
        id: f.id,
        name: f.name,
        category: f.category as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'treat' | 'drink' | 'alcohol',
        timestamp: new Date(f.timestamp),
        photoUri: null,
      });
      count++;
    }
  }

  for (const w of payload.weightEntries) {
    if (!dataRepository.weightExists(w.id)) {
      dataRepository.insertWeight({
        id: w.id,
        valueKg: w.valueKg,
        timestamp: new Date(w.timestamp),
        notes: w.notes,
      });
      count++;
    }
  }

  if (payload.settings && !dataRepository.settingsExist()) {
    dataRepository.insertSettings(payload.settings);
  }

  return { type: 'success', count };
}
