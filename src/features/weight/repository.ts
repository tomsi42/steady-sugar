import { desc, eq } from 'drizzle-orm';
import { db } from '../../shared/database/client';
import {
  weightEntries,
  type WeightEntry,
  type NewWeightEntry,
} from '../../shared/database/schema';

export const weightRepository = {
  getAll: (): WeightEntry[] =>
    db.select().from(weightEntries).orderBy(desc(weightEntries.timestamp)).all(),

  insert: (data: Omit<NewWeightEntry, 'id'>): WeightEntry =>
    db.insert(weightEntries).values(data).returning().get(),

  update: (id: number, data: Partial<Omit<NewWeightEntry, 'id'>>): WeightEntry =>
    db.update(weightEntries).set(data).where(eq(weightEntries.id, id)).returning().get(),

  delete: (id: number): void => {
    db.delete(weightEntries).where(eq(weightEntries.id, id)).run();
  },
};
