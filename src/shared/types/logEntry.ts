import type { BloodSugarReading, FoodEntry, WeightEntry } from '../database/schema';

export type LogEntry =
  | { type: 'blood_sugar'; data: BloodSugarReading }
  | { type: 'food'; data: FoodEntry }
  | { type: 'weight'; data: WeightEntry };

export function entryTimestamp(entry: LogEntry): Date {
  return new Date(entry.data.timestamp);
}
