import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const sqlite = SQLite.openDatabaseSync('sugarwise.db');
export const db = drizzle(sqlite, { schema });

export async function initDatabase() {
  sqlite.execSync(`
    CREATE TABLE IF NOT EXISTS blood_sugar_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value_mmol REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      context TEXT NOT NULL CHECK(context IN ('fasting','before_meal','after_meal_2h','random')),
      notes TEXT DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_blood_sugar_timestamp ON blood_sugar_readings(timestamp);

    CREATE TABLE IF NOT EXISTS food_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('breakfast','lunch','dinner','snack','treat','drink','alcohol')),
      timestamp INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_food_timestamp ON food_entries(timestamp);

    CREATE TABLE IF NOT EXISTS weight_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value_kg REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      notes TEXT DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_weight_timestamp ON weight_entries(timestamp);

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      user_name TEXT NOT NULL DEFAULT '',
      target_min_mmol REAL NOT NULL DEFAULT 3.9,
      target_max_mmol REAL NOT NULL DEFAULT 7.8
    );

    INSERT OR IGNORE INTO app_settings (id, user_name, target_min_mmol, target_max_mmol)
    VALUES (1, '', 3.9, 7.8);
  `);
}
