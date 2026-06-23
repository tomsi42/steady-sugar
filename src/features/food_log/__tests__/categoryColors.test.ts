import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/categoryColors';
import type { FoodCategory } from '../../../shared/database/schema';

const ALL_CATEGORIES: FoodCategory[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'drink',
  'treat',
  'alcohol',
];

describe('CATEGORY_COLORS', () => {
  it('has a colour for every category', () => {
    ALL_CATEGORIES.forEach((cat) => {
      expect(CATEGORY_COLORS[cat]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('uses the correct colour for each category per spec', () => {
    expect(CATEGORY_COLORS.breakfast).toBe('#42A5F5');
    expect(CATEGORY_COLORS.lunch).toBe('#26A69A');
    expect(CATEGORY_COLORS.dinner).toBe('#5C6BC0');
    expect(CATEGORY_COLORS.snack).toBe('#FFCA28');
    expect(CATEGORY_COLORS.drink).toBe('#26C6DA');
    expect(CATEGORY_COLORS.treat).toBe('#FF7043');
    expect(CATEGORY_COLORS.alcohol).toBe('#EF5350');
  });
});

describe('CATEGORY_LABELS', () => {
  it('has a label for every category', () => {
    ALL_CATEGORIES.forEach((cat) => {
      expect(typeof CATEGORY_LABELS[cat]).toBe('string');
      expect(CATEGORY_LABELS[cat].length).toBeGreaterThan(0);
    });
  });
});
