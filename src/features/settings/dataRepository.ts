import { eq } from 'drizzle-orm';
import { db } from '../../shared/database/client';
import {
  bloodSugarReadings,
  foodEntries,
  weightEntries,
  appSettings,
  type BloodSugarReading,
  type FoodEntry,
  type WeightEntry,
  type AppSettings,
  type NewBloodSugarReading,
  type NewFoodEntry,
  type NewWeightEntry,
} from '../../shared/database/schema';

export const dataRepository = {
  getAllBloodSugar: (): BloodSugarReading[] =>
    db.select().from(bloodSugarReadings).all(),

  getAllFood: (): FoodEntry[] =>
    db.select().from(foodEntries).all(),

  getAllWeight: (): WeightEntry[] =>
    db.select().from(weightEntries).all(),

  getSettings: (): AppSettings | null =>
    db.select().from(appSettings).get() ?? null,

  bloodSugarExists: (id: number): boolean =>
    !!db.select({ id: bloodSugarReadings.id }).from(bloodSugarReadings).where(eq(bloodSugarReadings.id, id)).get(),

  insertBloodSugar: (r: NewBloodSugarReading): void => {
    db.insert(bloodSugarReadings).values(r).run();
  },

  foodExists: (id: number): boolean =>
    !!db.select({ id: foodEntries.id }).from(foodEntries).where(eq(foodEntries.id, id)).get(),

  insertFood: (f: NewFoodEntry): void => {
    db.insert(foodEntries).values(f).run();
  },

  weightExists: (id: number): boolean =>
    !!db.select({ id: weightEntries.id }).from(weightEntries).where(eq(weightEntries.id, id)).get(),

  insertWeight: (w: NewWeightEntry): void => {
    db.insert(weightEntries).values(w).run();
  },

  settingsExist: (): boolean =>
    !!db.select({ id: appSettings.id }).from(appSettings).get(),

  insertSettings: (s: AppSettings): void => {
    db.insert(appSettings).values(s).run();
  },
};
