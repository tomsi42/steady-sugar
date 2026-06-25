import { sqlite } from '../../shared/database/client';
import type {
  BloodSugarReading,
  NewBloodSugarReading,
} from '../../shared/database/schema';

type RawRow = {
  id: number;
  value_mmol: number;
  timestamp: number;
  context: string;
  notes: string | null;
};

function mapRow(r: RawRow): BloodSugarReading {
  return {
    id: r.id,
    valueMmol: r.value_mmol,
    timestamp: new Date(r.timestamp),
    context: r.context as BloodSugarReading['context'],
    notes: r.notes ?? '',
  };
}

export const bloodSugarRepository = {
  getAll: async (): Promise<BloodSugarReading[]> => {
    const rows = await sqlite.getAllAsync<RawRow>(
      'SELECT * FROM blood_sugar_readings ORDER BY timestamp DESC',
    );
    return rows.map(mapRow);
  },

  insert: async (data: Omit<NewBloodSugarReading, 'id'>): Promise<BloodSugarReading> => {
    const rows = await sqlite.getAllAsync<RawRow>(
      'INSERT INTO blood_sugar_readings (value_mmol, timestamp, context, notes) VALUES (?, ?, ?, ?) RETURNING *',
      [data.valueMmol, data.timestamp.getTime(), data.context, data.notes ?? ''],
    );
    return mapRow(rows[0]);
  },

  update: async (
    id: number,
    data: Partial<Omit<NewBloodSugarReading, 'id'>>,
  ): Promise<BloodSugarReading> => {
    const sets: string[] = [];
    const params: (string | number | null)[] = [];
    if (data.valueMmol !== undefined) { sets.push('value_mmol = ?'); params.push(data.valueMmol); }
    if (data.timestamp !== undefined) { sets.push('timestamp = ?'); params.push(data.timestamp.getTime()); }
    if (data.context !== undefined) { sets.push('context = ?'); params.push(data.context); }
    if (data.notes !== undefined) { sets.push('notes = ?'); params.push(data.notes ?? ''); }
    params.push(id);
    const rows = await sqlite.getAllAsync<RawRow>(
      `UPDATE blood_sugar_readings SET ${sets.join(', ')} WHERE id = ? RETURNING *`,
      params,
    );
    return mapRow(rows[0]);
  },

  delete: async (id: number): Promise<void> => {
    await sqlite.runAsync('DELETE FROM blood_sugar_readings WHERE id = ?', [id]);
  },
};
