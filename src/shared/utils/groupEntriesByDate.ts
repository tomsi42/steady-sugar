import type { LogEntry } from '../types/logEntry';
import { entryTimestamp } from '../types/logEntry';

export type DateGroupLabel = 'Today' | 'Yesterday' | 'This Week' | 'Last Week' | 'Older';

export interface GroupedEntries {
  title: DateGroupLabel;
  data: LogEntry[];
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function groupEntriesByDate(
  entries: LogEntry[],
  now = new Date(),
): GroupedEntries[] {
  const today = startOfDay(now);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - daysFromMonday);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const buckets: Record<DateGroupLabel, LogEntry[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'Last Week': [],
    Older: [],
  };

  for (const entry of entries) {
    const day = startOfDay(entryTimestamp(entry));
    const t = day.getTime();

    if (t === today.getTime()) {
      buckets.Today.push(entry);
    } else if (t === yesterday.getTime()) {
      buckets.Yesterday.push(entry);
    } else if (t >= thisWeekStart.getTime()) {
      buckets['This Week'].push(entry);
    } else if (t >= lastWeekStart.getTime()) {
      buckets['Last Week'].push(entry);
    } else {
      buckets.Older.push(entry);
    }
  }

  const order: DateGroupLabel[] = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Older'];
  return order
    .filter((label) => buckets[label].length > 0)
    .map((label) => ({ title: label, data: buckets[label] }));
}
