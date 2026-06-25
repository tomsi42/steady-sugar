import { sqlite } from '../../shared/database/client';
import type { AppSettings } from '../../shared/database/schema';

type RawRow = {
  id: number;
  user_name: string;
  target_min_mmol: number;
  target_max_mmol: number;
};

function mapRow(r: RawRow): AppSettings {
  return {
    id: r.id,
    userName: r.user_name,
    targetMinMmol: r.target_min_mmol,
    targetMaxMmol: r.target_max_mmol,
  };
}

export const settingsRepository = {
  get: async (): Promise<AppSettings | null> => {
    const row = await sqlite.getFirstAsync<RawRow>('SELECT * FROM app_settings WHERE id = 1');
    return row ? mapRow(row) : null;
  },

  upsert: async (data: Omit<AppSettings, 'id'>): Promise<AppSettings> => {
    const rows = await sqlite.getAllAsync<RawRow>(
      `INSERT INTO app_settings (id, user_name, target_min_mmol, target_max_mmol)
       VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         user_name = excluded.user_name,
         target_min_mmol = excluded.target_min_mmol,
         target_max_mmol = excluded.target_max_mmol
       RETURNING *`,
      [data.userName, data.targetMinMmol, data.targetMaxMmol],
    );
    return mapRow(rows[0]);
  },

  clearAll: async (): Promise<void> => {
    await sqlite.execAsync(`
      DELETE FROM blood_sugar_readings;
      DELETE FROM food_entries;
      DELETE FROM weight_entries;
      DELETE FROM app_settings;
    `);
  },
};
