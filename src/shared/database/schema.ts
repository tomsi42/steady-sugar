import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core';

export const bloodSugarReadings = sqliteTable('blood_sugar_readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  valueMmol: real('value_mmol').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  context: text('context', {
    enum: ['fasting', 'before_meal', 'after_meal_2h', 'random'],
  }).notNull(),
  notes: text('notes').default(''),
});

export const foodEntries = sqliteTable('food_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category', {
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'treat', 'drink', 'alcohol'],
  }).notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const weightEntries = sqliteTable('weight_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  valueKg: real('value_kg').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  notes: text('notes').default(''),
});

export const appSettings = sqliteTable('app_settings', {
  id: integer('id').primaryKey(),
  userName: text('user_name').notNull(),
  targetMinMmol: real('target_min_mmol').notNull().default(3.9),
  targetMaxMmol: real('target_max_mmol').notNull().default(7.8),
});

export type BloodSugarReading = typeof bloodSugarReadings.$inferSelect;
export type NewBloodSugarReading = typeof bloodSugarReadings.$inferInsert;
export type BloodSugarContext = BloodSugarReading['context'];

export type FoodEntry = typeof foodEntries.$inferSelect;
export type NewFoodEntry = typeof foodEntries.$inferInsert;
export type FoodCategory = FoodEntry['category'];

export type WeightEntry = typeof weightEntries.$inferSelect;
export type NewWeightEntry = typeof weightEntries.$inferInsert;

export type AppSettings = typeof appSettings.$inferSelect;
