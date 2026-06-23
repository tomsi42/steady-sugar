import { desc, eq } from 'drizzle-orm';
import { db } from '../../shared/database/client';
import {
  foodEntries,
  type FoodEntry,
  type NewFoodEntry,
} from '../../shared/database/schema';

export const foodRepository = {
  getAll: (): FoodEntry[] =>
    db.select().from(foodEntries).orderBy(desc(foodEntries.timestamp)).all(),

  insert: (data: Omit<NewFoodEntry, 'id'>): FoodEntry =>
    db.insert(foodEntries).values(data).returning().get(),

  update: (id: number, data: Partial<Omit<NewFoodEntry, 'id'>>): FoodEntry =>
    db.update(foodEntries).set(data).where(eq(foodEntries.id, id)).returning().get(),

  delete: (id: number): void => {
    db.delete(foodEntries).where(eq(foodEntries.id, id)).run();
  },
};
