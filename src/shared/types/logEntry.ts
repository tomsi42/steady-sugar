import type { BloodSugarReading, FoodEntry } from '../database/schema';

export type LogEntry =
  | { type: 'blood_sugar'; data: BloodSugarReading }
  | { type: 'food'; data: FoodEntry };

export function entryTimestamp(entry: LogEntry): Date {
  return new Date(entry.data.timestamp);
}
