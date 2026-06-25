import { sqlite } from '../../shared/database/client';
import type {
  FoodEntry,
  NewFoodEntry,
} from '../../shared/database/schema';

type RawRow = {
  id: number;
  name: string;
  category: string;
  timestamp: number;
  photo_uri: string | null;
};

function mapRow(r: RawRow): FoodEntry {
  return {
    id: r.id,
    name: r.name,
    category: r.category as FoodEntry['category'],
    timestamp: new Date(r.timestamp),
    photoUri: r.photo_uri,
  };
}

export const foodRepository = {
  getAll: async (): Promise<FoodEntry[]> => {
    const rows = await sqlite.getAllAsync<RawRow>(
      'SELECT * FROM food_entries ORDER BY timestamp DESC',
    );
    return rows.map(mapRow);
  },

  insert: async (data: Omit<NewFoodEntry, 'id'>): Promise<FoodEntry> => {
    const rows = await sqlite.getAllAsync<RawRow>(
      'INSERT INTO food_entries (name, category, timestamp, photo_uri) VALUES (?, ?, ?, ?) RETURNING *',
      [data.name, data.category, data.timestamp.getTime(), data.photoUri ?? null],
    );
    return mapRow(rows[0]);
  },

  update: async (id: number, data: Partial<Omit<NewFoodEntry, 'id'>>): Promise<FoodEntry> => {
    const sets: string[] = [];
    const params: (string | number | null)[] = [];
    if (data.name !== undefined) { sets.push('name = ?'); params.push(data.name); }
    if (data.category !== undefined) { sets.push('category = ?'); params.push(data.category); }
    if (data.timestamp !== undefined) { sets.push('timestamp = ?'); params.push(data.timestamp.getTime()); }
    if (data.photoUri !== undefined) { sets.push('photo_uri = ?'); params.push(data.photoUri ?? null); }
    params.push(id);
    const rows = await sqlite.getAllAsync<RawRow>(
      `UPDATE food_entries SET ${sets.join(', ')} WHERE id = ? RETURNING *`,
      params,
    );
    return mapRow(rows[0]);
  },

  delete: async (id: number): Promise<void> => {
    await sqlite.runAsync('DELETE FROM food_entries WHERE id = ?', [id]);
  },
};
