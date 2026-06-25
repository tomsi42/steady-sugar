import { sqlite } from '../../shared/database/client';
import type {
  WeightEntry,
  NewWeightEntry,
} from '../../shared/database/schema';

type RawRow = {
  id: number;
  value_kg: number;
  timestamp: number;
  notes: string | null;
};

function mapRow(r: RawRow): WeightEntry {
  return {
    id: r.id,
    valueKg: r.value_kg,
    timestamp: new Date(r.timestamp),
    notes: r.notes ?? '',
  };
}

export const weightRepository = {
  getAll: async (): Promise<WeightEntry[]> => {
    const rows = await sqlite.getAllAsync<RawRow>(
      'SELECT * FROM weight_entries ORDER BY timestamp DESC',
    );
    return rows.map(mapRow);
  },

  insert: async (data: Omit<NewWeightEntry, 'id'>): Promise<WeightEntry> => {
    const rows = await sqlite.getAllAsync<RawRow>(
      'INSERT INTO weight_entries (value_kg, timestamp, notes) VALUES (?, ?, ?) RETURNING *',
      [data.valueKg, data.timestamp.getTime(), data.notes ?? ''],
    );
    return mapRow(rows[0]);
  },

  update: async (id: number, data: Partial<Omit<NewWeightEntry, 'id'>>): Promise<WeightEntry> => {
    const sets: string[] = [];
    const params: (string | number | null)[] = [];
    if (data.valueKg !== undefined) { sets.push('value_kg = ?'); params.push(data.valueKg); }
    if (data.timestamp !== undefined) { sets.push('timestamp = ?'); params.push(data.timestamp.getTime()); }
    if (data.notes !== undefined) { sets.push('notes = ?'); params.push(data.notes ?? ''); }
    params.push(id);
    const rows = await sqlite.getAllAsync<RawRow>(
      `UPDATE weight_entries SET ${sets.join(', ')} WHERE id = ? RETURNING *`,
      params,
    );
    return mapRow(rows[0]);
  },

  delete: async (id: number): Promise<void> => {
    await sqlite.runAsync('DELETE FROM weight_entries WHERE id = ?', [id]);
  },
};
