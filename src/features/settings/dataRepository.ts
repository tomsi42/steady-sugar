import { sqlite } from '../../shared/database/client';
import type {
  BloodSugarReading,
  FoodEntry,
  WeightEntry,
  AppSettings,
  NewBloodSugarReading,
  NewFoodEntry,
  NewWeightEntry,
} from '../../shared/database/schema';

export const dataRepository = {
  getAllBloodSugar: async (): Promise<BloodSugarReading[]> => {
    const rows = await sqlite.getAllAsync<any>('SELECT * FROM blood_sugar_readings');
    return rows.map((r: any) => ({
      id: r.id,
      valueMmol: r.value_mmol,
      timestamp: new Date(r.timestamp),
      context: r.context,
      notes: r.notes ?? '',
    }));
  },

  getAllFood: async (): Promise<FoodEntry[]> => {
    const rows = await sqlite.getAllAsync<any>('SELECT * FROM food_entries');
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      timestamp: new Date(r.timestamp),
      photoUri: r.photo_uri,
    }));
  },

  getAllWeight: async (): Promise<WeightEntry[]> => {
    const rows = await sqlite.getAllAsync<any>('SELECT * FROM weight_entries');
    return rows.map((r: any) => ({
      id: r.id,
      valueKg: r.value_kg,
      timestamp: new Date(r.timestamp),
      notes: r.notes ?? '',
    }));
  },

  getSettings: async (): Promise<AppSettings | null> => {
    const row = await sqlite.getFirstAsync<any>('SELECT * FROM app_settings WHERE id = 1');
    if (!row) return null;
    return {
      id: row.id,
      userName: row.user_name,
      targetMinMmol: row.target_min_mmol,
      targetMaxMmol: row.target_max_mmol,
    };
  },

  bloodSugarExists: async (id: number): Promise<boolean> => {
    const row = await sqlite.getFirstAsync<any>(
      'SELECT id FROM blood_sugar_readings WHERE id = ?',
      [id],
    );
    return row !== null;
  },

  insertBloodSugar: async (r: NewBloodSugarReading): Promise<void> => {
    await sqlite.runAsync(
      'INSERT INTO blood_sugar_readings (id, value_mmol, timestamp, context, notes) VALUES (?, ?, ?, ?, ?)',
      [r.id ?? null, r.valueMmol, r.timestamp.getTime(), r.context, r.notes ?? ''],
    );
  },

  foodExists: async (id: number): Promise<boolean> => {
    const row = await sqlite.getFirstAsync<any>(
      'SELECT id FROM food_entries WHERE id = ?',
      [id],
    );
    return row !== null;
  },

  insertFood: async (f: NewFoodEntry): Promise<void> => {
    await sqlite.runAsync(
      'INSERT INTO food_entries (id, name, category, timestamp, photo_uri) VALUES (?, ?, ?, ?, ?)',
      [f.id ?? null, f.name, f.category, f.timestamp.getTime(), f.photoUri ?? null],
    );
  },

  weightExists: async (id: number): Promise<boolean> => {
    const row = await sqlite.getFirstAsync<any>(
      'SELECT id FROM weight_entries WHERE id = ?',
      [id],
    );
    return row !== null;
  },

  insertWeight: async (w: NewWeightEntry): Promise<void> => {
    await sqlite.runAsync(
      'INSERT INTO weight_entries (id, value_kg, timestamp, notes) VALUES (?, ?, ?, ?)',
      [w.id ?? null, w.valueKg, w.timestamp.getTime(), w.notes ?? ''],
    );
  },

  settingsExist: async (): Promise<boolean> => {
    const row = await sqlite.getFirstAsync<any>('SELECT id FROM app_settings WHERE id = 1');
    return row !== null;
  },

  insertSettings: async (s: AppSettings): Promise<void> => {
    await sqlite.runAsync(
      'INSERT INTO app_settings (id, user_name, target_min_mmol, target_max_mmol) VALUES (?, ?, ?, ?)',
      [s.id, s.userName, s.targetMinMmol, s.targetMaxMmol],
    );
  },
};
