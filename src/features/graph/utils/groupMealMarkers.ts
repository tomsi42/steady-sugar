import type { FoodEntry } from '../../../shared/database/schema';

export interface MealMarker {
  timestamp: Date;
  count: number;
  names: string[];
}

const WINDOW_MS = 30 * 60 * 1000;

export function groupMealMarkers(
  entries: FoodEntry[],
  windowMs: number = WINDOW_MS,
): MealMarker[] {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const markers: MealMarker[] = [];
  let groupTimestamp = new Date(sorted[0].timestamp);
  let groupNames: string[] = [sorted[0].name];
  let prevMs = new Date(sorted[0].timestamp).getTime();

  for (let i = 1; i < sorted.length; i++) {
    const currMs = new Date(sorted[i].timestamp).getTime();
    if (currMs - prevMs <= windowMs) {
      groupNames.push(sorted[i].name);
    } else {
      markers.push({ timestamp: groupTimestamp, count: groupNames.length, names: groupNames });
      groupTimestamp = new Date(sorted[i].timestamp);
      groupNames = [sorted[i].name];
    }
    prevMs = currMs;
  }
  markers.push({ timestamp: groupTimestamp, count: groupNames.length, names: groupNames });

  return markers;
}
