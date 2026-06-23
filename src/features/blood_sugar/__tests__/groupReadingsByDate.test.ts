import { groupReadingsByDate } from '../utils/groupReadingsByDate';
import type { BloodSugarReading } from '../../../shared/database/schema';

function makeReading(id: number, date: Date): BloodSugarReading {
  return {
    id,
    valueMmol: 5.5,
    timestamp: date,
    context: 'random',
    notes: '',
  };
}

function daysAgo(n: number, baseDate: Date): Date {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - n);
  return d;
}

describe('groupReadingsByDate', () => {
  // Use a fixed "now" so tests are deterministic: Wednesday 2026-06-17 12:00
  const now = new Date('2026-06-17T12:00:00');

  it('places a reading from today in Today group', () => {
    const reading = makeReading(1, new Date('2026-06-17T08:30:00'));
    const groups = groupReadingsByDate([reading], now);
    expect(groups[0].title).toBe('Today');
    expect(groups[0].data).toHaveLength(1);
  });

  it('places a reading from yesterday in Yesterday group', () => {
    const reading = makeReading(1, new Date('2026-06-16T20:00:00'));
    const groups = groupReadingsByDate([reading], now);
    expect(groups[0].title).toBe('Yesterday');
  });

  it('places a reading from earlier this week in This Week group', () => {
    // now is Wednesday 2026-06-17; Monday was 2026-06-15
    const reading = makeReading(1, new Date('2026-06-15T10:00:00'));
    const groups = groupReadingsByDate([reading], now);
    expect(groups[0].title).toBe('This Week');
  });

  it('places a reading from last week in Last Week group', () => {
    const reading = makeReading(1, new Date('2026-06-10T10:00:00'));
    const groups = groupReadingsByDate([reading], now);
    expect(groups[0].title).toBe('Last Week');
  });

  it('places readings older than last week in Older group', () => {
    const reading = makeReading(1, new Date('2026-05-01T10:00:00'));
    const groups = groupReadingsByDate([reading], now);
    expect(groups[0].title).toBe('Older');
  });

  it('omits groups with no readings', () => {
    const reading = makeReading(1, new Date('2026-06-17T08:30:00'));
    const groups = groupReadingsByDate([reading], now);
    expect(groups).toHaveLength(1);
    expect(groups.every((g) => g.data.length > 0)).toBe(true);
  });

  it('returns empty array when no readings', () => {
    expect(groupReadingsByDate([], now)).toHaveLength(0);
  });

  it('puts multiple readings in correct groups', () => {
    const readings = [
      makeReading(1, new Date('2026-06-17T08:00:00')), // today
      makeReading(2, new Date('2026-06-17T14:00:00')), // today
      makeReading(3, new Date('2026-06-16T20:00:00')), // yesterday
      makeReading(4, new Date('2026-05-01T10:00:00')), // older
    ];
    const groups = groupReadingsByDate(readings, now);
    const todayGroup = groups.find((g) => g.title === 'Today');
    const yesterdayGroup = groups.find((g) => g.title === 'Yesterday');
    const olderGroup = groups.find((g) => g.title === 'Older');

    expect(todayGroup?.data).toHaveLength(2);
    expect(yesterdayGroup?.data).toHaveLength(1);
    expect(olderGroup?.data).toHaveLength(1);
  });
});
