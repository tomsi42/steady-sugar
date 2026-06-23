import type { BloodSugarReading } from '../../../shared/database/schema';

export type DateGroupLabel = 'Today' | 'Yesterday' | 'This Week' | 'Last Week' | 'Older';

export interface GroupedReadings {
  title: DateGroupLabel;
  data: BloodSugarReading[];
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function groupReadingsByDate(
  readings: BloodSugarReading[],
  now = new Date(),
): GroupedReadings[] {
  const today = startOfDay(now);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Start of ISO week (Monday) containing today
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - daysFromMonday);

  // Start of last week (Monday one week before thisWeekStart)
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const buckets: Record<DateGroupLabel, BloodSugarReading[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'Last Week': [],
    Older: [],
  };

  for (const reading of readings) {
    const day = startOfDay(new Date(reading.timestamp));
    const t = day.getTime();

    if (t === today.getTime()) {
      buckets.Today.push(reading);
    } else if (t === yesterday.getTime()) {
      buckets.Yesterday.push(reading);
    } else if (t >= thisWeekStart.getTime()) {
      buckets['This Week'].push(reading);
    } else if (t >= lastWeekStart.getTime()) {
      buckets['Last Week'].push(reading);
    } else {
      buckets.Older.push(reading);
    }
  }

  const order: DateGroupLabel[] = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Older'];
  return order
    .filter((label) => buckets[label].length > 0)
    .map((label) => ({ title: label, data: buckets[label] }));
}
