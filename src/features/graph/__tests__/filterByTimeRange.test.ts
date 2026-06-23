import {
  filterByTimeRange,
  getTimeRangeBounds,
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
