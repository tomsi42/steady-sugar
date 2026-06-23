import { groupEntriesByDate } from '../groupEntriesByDate';
import type { LogEntry } from '../../types/logEntry';
import type { BloodSugarReading, FoodEntry } from '../../database/schema';

function makeBloodSugar(id: number, date: Date): LogEntry {
  const r: BloodSugarReading = {
    id,
    valueMmol: 5.5,
    timestamp: date,
    context: 'random',
    notes: '',
  };
  return { type: 'blood_sugar', data: r };
}

function makeFood(id: number, date: Date): LogEntry {
  const e: FoodEntry = {
    id,
    name: 'Oatmeal',
    category: 'breakfast',
    timestamp: date,
  };
  return { type: 'food', data: e };
}

// Fixed "now": Wednesday 2026-06-17 12:00
const now = new Date('2026-06-17T12:00:00');

describe('groupEntriesByDate', () => {
  it('groups a blood sugar entry into Today', () => {
    const entry = makeBloodSugar(1, new Date('2026-06-17T08:00:00'));
    const groups = groupEntriesByDate([entry], now);
    expect(groups[0].title).toBe('Today');
    expect(groups[0].data).toHaveLength(1);
  });

  it('groups a food entry into Today', () => {
    const entry = makeFood(1, new Date('2026-06-17T09:30:00'));
    const groups = groupEntriesByDate([entry], now);
    expect(groups[0].title).toBe('Today');
  });

  it('groups entries from yesterday into Yesterday', () => {
    const entry = makeBloodSugar(1, new Date('2026-06-16T20:00:00'));
    const groups = groupEntriesByDate([entry], now);
    expect(groups[0].title).toBe('Yesterday');
  });

  it('groups entries from earlier this week into This Week', () => {
    const entry = makeFood(1, new Date('2026-06-15T10:00:00'));
    const groups = groupEntriesByDate([entry], now);
    expect(groups[0].title).toBe('This Week');
  });

  it('groups entries from last week into Last Week', () => {
    const entry = makeBloodSugar(1, new Date('2026-06-10T10:00:00'));
    const groups = groupEntriesByDate([entry], now);
    expect(groups[0].title).toBe('Last Week');
  });

  it('groups old entries into Older', () => {
    const entry = makeFood(1, new Date('2026-05-01T10:00:00'));
    const groups = groupEntriesByDate([entry], now);
    expect(groups[0].title).toBe('Older');
  });

  it('mixes blood sugar and food entries in the same group', () => {
    const bs = makeBloodSugar(1, new Date('2026-06-17T08:00:00'));
    const food = makeFood(2, new Date('2026-06-17T08:30:00'));
    const groups = groupEntriesByDate([bs, food], now);
    expect(groups[0].title).toBe('Today');
    expect(groups[0].data).toHaveLength(2);
  });

  it('returns empty array for no entries', () => {
    expect(groupEntriesByDate([], now)).toHaveLength(0);
  });

  it('omits empty groups', () => {
    const entry = makeBloodSugar(1, new Date('2026-06-17T08:00:00'));
    const groups = groupEntriesByDate([entry], now);
    expect(groups).toHaveLength(1);
    expect(groups.every((g) => g.data.length > 0)).toBe(true);
  });
});
