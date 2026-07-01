import {
  filterByTimeRange,
  getTimeRangeBounds,
  shiftAnchor,
  canGoNext,
  canGoPrevious,
  formatDateRangeLabel,
  type TimeRange,
} from '../utils/filterByTimeRange';

const NOW = new Date('2026-06-23T14:00:00');

function makeEntry(isoTimestamp: string) {
  return { id: 1, timestamp: new Date(isoTimestamp) };
}

describe('getTimeRangeBounds', () => {
  it('today: start is midnight, end is 23:59:59.999', () => {
    const [start, end] = getTimeRangeBounds('today', NOW);
    expect(start).toEqual(new Date('2026-06-23T00:00:00.000'));
    expect(end).toEqual(new Date('2026-06-23T23:59:59.999'));
  });

  it('7days: start is 7 days ago at midnight', () => {
    const [start, end] = getTimeRangeBounds('7days', NOW);
    expect(start).toEqual(new Date('2026-06-16T00:00:00.000'));
    expect(end).toEqual(new Date('2026-06-23T23:59:59.999'));
  });

  it('30days: start is 30 days ago at midnight', () => {
    const [start, end] = getTimeRangeBounds('30days', NOW);
    expect(start).toEqual(new Date('2026-05-24T00:00:00.000'));
    expect(end).toEqual(new Date('2026-06-23T23:59:59.999'));
  });
});

describe('filterByTimeRange', () => {
  const entries = [
    makeEntry('2026-06-23T08:00:00'),  // today
    makeEntry('2026-06-23T20:00:00'),  // today
    makeEntry('2026-06-20T12:00:00'),  // 3 days ago
    makeEntry('2026-06-10T12:00:00'),  // 13 days ago
    makeEntry('2026-05-20T12:00:00'),  // 34 days ago — outside 30d
  ];

  it('today: returns only entries from today', () => {
    const result = filterByTimeRange(entries, 'today', NOW);
    expect(result).toHaveLength(2);
    expect(result[0].timestamp).toEqual(new Date('2026-06-23T08:00:00'));
    expect(result[1].timestamp).toEqual(new Date('2026-06-23T20:00:00'));
  });

  it('7days: returns entries from the past 7 days inclusive', () => {
    const result = filterByTimeRange(entries, '7days', NOW);
    expect(result).toHaveLength(3);
  });

  it('30days: returns entries from the past 30 days inclusive', () => {
    const result = filterByTimeRange(entries, '30days', NOW);
    expect(result).toHaveLength(4);
  });

  it('includes entries exactly at the boundary start (midnight 7 days ago)', () => {
    const boundary = [makeEntry('2026-06-16T00:00:00.000')];
    const result = filterByTimeRange(boundary, '7days', NOW);
    expect(result).toHaveLength(1);
  });

  it('excludes entries just before the boundary', () => {
    const boundary = [makeEntry('2026-06-15T23:59:59.999')];
    const result = filterByTimeRange(boundary, '7days', NOW);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when no entries match', () => {
    const result = filterByTimeRange([], 'today', NOW);
    expect(result).toHaveLength(0);
  });

  it('works with string timestamps', () => {
    const stringEntries = [{ id: 1, timestamp: '2026-06-23T10:00:00' }];
    const result = filterByTimeRange(stringEntries, 'today', NOW);
    expect(result).toHaveLength(1);
  });
});

describe('shiftAnchor', () => {
  it.each<[TimeRange, number]>([
    ['today', 1],
    ['7days', 7],
    ['30days', 30],
  ])('shifts %s by %d days per step', (range, days) => {
    const next = shiftAnchor(range, NOW, -1);
    expect(next.getTime()).toBe(NOW.getTime() - days * 24 * 60 * 60 * 1000);
  });

  it('shifts forward with direction 1', () => {
    const next = shiftAnchor('7days', NOW, 1);
    expect(next.getTime()).toBe(NOW.getTime() + 7 * 24 * 60 * 60 * 1000);
  });

  it('paging back then forward returns to the original anchor', () => {
    const back = shiftAnchor('30days', NOW, -1);
    const forward = shiftAnchor('30days', back, 1);
    expect(forward.getTime()).toBe(NOW.getTime());
  });
});

describe('canGoNext', () => {
  it('is false when the anchor is the current day', () => {
    expect(canGoNext('today', NOW, NOW)).toBe(false);
  });

  it('is true when the anchor is before the current day', () => {
    const anchor = new Date('2026-06-20T14:00:00');
    expect(canGoNext('today', anchor, NOW)).toBe(true);
  });

  it('ignores time-of-day when comparing to the current day', () => {
    const lateInDay = new Date('2026-06-23T23:00:00');
    expect(canGoNext('today', NOW, lateInDay)).toBe(false);
  });
});

describe('canGoPrevious', () => {
  it('is false when there is no data at all', () => {
    expect(canGoPrevious('today', NOW, null)).toBe(false);
  });

  it('is true when the previous period would still reach the oldest data', () => {
    const oldest = new Date('2026-06-01T00:00:00');
    expect(canGoPrevious('7days', NOW, oldest)).toBe(true);
  });

  it('is false once paging back would be entirely before the oldest data', () => {
    const oldest = new Date('2026-06-20T00:00:00'); // within the current 7-day window
    // Current window: 06-16..06-23. Previous window would be 06-09..06-16 — entirely
    // before the oldest record (06-20), so no more paging back should be allowed.
    expect(canGoPrevious('7days', NOW, oldest)).toBe(false);
  });

  it('is true at the exact boundary where the previous period ends on the oldest data', () => {
    const oldest = new Date('2026-06-16T00:00:00'); // equals the previous 7-day window's end
    expect(canGoPrevious('7days', NOW, oldest)).toBe(true);
  });
});

describe('formatDateRangeLabel', () => {
  it('formats "today" as a single date', () => {
    expect(formatDateRangeLabel('today', NOW, 'en-US')).toBe('June 23');
  });

  it('formats a same-month range without repeating the month', () => {
    expect(formatDateRangeLabel('7days', NOW, 'en-US')).toBe('16 – Jun 23');
  });

  it('formats a cross-month range with both months shown', () => {
    expect(formatDateRangeLabel('30days', NOW, 'en-US')).toBe('May 24 – Jun 23');
  });
});
