export type TimeRange = 'today' | '7days' | '30days';

export function getTimeRangeBounds(range: TimeRange, now = new Date()): [Date, Date] {
  const start = new Date(now);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (range === '7days') {
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
  }

  return [start, end];
}

export function filterByTimeRange<T extends { timestamp: Date | string | number }>(
  entries: T[],
  range: TimeRange,
  now?: Date,
): T[] {
  const [start, end] = getTimeRangeBounds(range, now);
  const startMs = start.getTime();
  const endMs = end.getTime();
  return entries.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t >= startMs && t <= endMs;
  });
}
