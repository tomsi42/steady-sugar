import { groupMealMarkers } from '../utils/groupMealMarkers';
import type { FoodEntry } from '../../../shared/database/schema';

function makeEntry(id: number, isoTimestamp: string, name = 'food'): FoodEntry {
  return {
    id,
    name,
    category: 'lunch',
    timestamp: new Date(isoTimestamp),
  };
}

describe('groupMealMarkers', () => {
  it('returns empty array for no entries', () => {
    expect(groupMealMarkers([])).toEqual([]);
  });

  it('returns a single marker for a single entry', () => {
    const result = groupMealMarkers([makeEntry(1, '2026-06-23T12:00:00', 'sandwich')]);
    expect(result).toHaveLength(1);
    expect(result[0]!.count).toBe(1);
    expect(result[0]!.names).toEqual(['sandwich']);
  });

  it('groups two entries within 30 minutes into one marker', () => {
    const entries = [
      makeEntry(1, '2026-06-23T12:00:00', 'salad'),
      makeEntry(2, '2026-06-23T12:20:00', 'soup'),
    ];
    const result = groupMealMarkers(entries);
    expect(result).toHaveLength(1);
    expect(result[0]!.count).toBe(2);
    expect(result[0]!.names).toContain('salad');
    expect(result[0]!.names).toContain('soup');
  });

  it('keeps two entries exactly 30 min apart in the same group', () => {
    const entries = [
      makeEntry(1, '2026-06-23T12:00:00'),
      makeEntry(2, '2026-06-23T12:30:00'),
    ];
    const result = groupMealMarkers(entries);
    expect(result).toHaveLength(1);
  });

  it('splits entries more than 30 minutes apart into separate markers', () => {
    const entries = [
      makeEntry(1, '2026-06-23T12:00:00', 'lunch'),
      makeEntry(2, '2026-06-23T12:31:00', 'dessert'),
    ];
    const result = groupMealMarkers(entries);
    expect(result).toHaveLength(2);
    expect(result[0]!.names).toEqual(['lunch']);
    expect(result[1]!.names).toEqual(['dessert']);
  });

  it('uses timestamp of first entry in the group', () => {
    const entries = [
      makeEntry(1, '2026-06-23T12:00:00'),
      makeEntry(2, '2026-06-23T12:15:00'),
    ];
    const result = groupMealMarkers(entries);
    expect(result[0]!.timestamp).toEqual(new Date('2026-06-23T12:00:00'));
  });

  it('groups three entries within sliding 30-min window', () => {
    // A at 0, B at 25min, C at 50min — A+B grouped, then B+C => all grouped since B-C <= 30min
    const entries = [
      makeEntry(1, '2026-06-23T12:00:00', 'A'),
      makeEntry(2, '2026-06-23T12:25:00', 'B'),
      makeEntry(3, '2026-06-23T12:50:00', 'C'),
    ];
    const result = groupMealMarkers(entries);
    expect(result).toHaveLength(1);
    expect(result[0]!.count).toBe(3);
  });

  it('handles unsorted input by sorting internally', () => {
    const entries = [
      makeEntry(2, '2026-06-23T12:20:00', 'B'),
      makeEntry(1, '2026-06-23T12:00:00', 'A'),
    ];
    const result = groupMealMarkers(entries);
    expect(result).toHaveLength(1);
    expect(result[0]!.timestamp).toEqual(new Date('2026-06-23T12:00:00'));
  });

  it('accepts a custom window in ms', () => {
    const entries = [
      makeEntry(1, '2026-06-23T12:00:00'),
      makeEntry(2, '2026-06-23T12:05:00'),  // 5 min apart
    ];
    // With a 3-minute window, they should be separate
    const result = groupMealMarkers(entries, 3 * 60 * 1000);
    expect(result).toHaveLength(2);
  });

  it('produces correct count and names for multiple groups', () => {
    const entries = [
      makeEntry(1, '2026-06-23T08:00:00', 'toast'),
      makeEntry(2, '2026-06-23T08:10:00', 'coffee'),
      makeEntry(3, '2026-06-23T13:00:00', 'sandwich'),
    ];
    const result = groupMealMarkers(entries);
    expect(result).toHaveLength(2);
    expect(result[0]!.count).toBe(2);
    expect(result[1]!.count).toBe(1);
    expect(result[1]!.names).toEqual(['sandwich']);
  });
});
