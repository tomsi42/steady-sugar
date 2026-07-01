export type TimeRange = 'today' | '7days' | '30days';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function periodDays(range: TimeRange): number {
  if (range === 'today') return 1;
  if (range === '7days') return 7;
  return 30;
}

export function getTimeRangeBounds(range: TimeRange, now = new Date()): [Date, Date] {
  const start = new Date(now);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - periodDays(range));
    start.setHours(0, 0, 0, 0);
  }

  return [start, end];
}

// The anchor stands in for "now" — paging shifts it back/forward by one full period
// (1/7/30 days) so getTimeRangeBounds(range, anchor) yields the previous/next window.
export function shiftAnchor(range: TimeRange, anchor: Date, direction: 1 | -1): Date {
  const shifted = new Date(anchor);
  shifted.setDate(shifted.getDate() + direction * periodDays(range));
  return shifted;
}

export function canGoNext(range: TimeRange, anchor: Date, now = new Date()): boolean {
  return startOfDay(anchor).getTime() < startOfDay(now).getTime();
}

// Disabled once the previous period would end entirely before the oldest record —
// i.e. once paging back further is guaranteed to show nothing.
export function canGoPrevious(
  range: TimeRange,
  anchor: Date,
  oldestDataDate: Date | null,
): boolean {
  if (!oldestDataDate) return false;
  const prevAnchor = shiftAnchor(range, anchor, -1);
  const [, prevEnd] = getTimeRangeBounds(range, prevAnchor);
  return prevEnd.getTime() >= startOfDay(oldestDataDate).getTime();
}

export function formatDateRangeLabel(range: TimeRange, anchor: Date, locale: string): string {
  const [start, end] = getTimeRangeBounds(range, anchor);

  if (range === 'today') {
    return end.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  }

  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString(locale, {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  });
  const endStr = end.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  return `${startStr} – ${endStr}`;
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
