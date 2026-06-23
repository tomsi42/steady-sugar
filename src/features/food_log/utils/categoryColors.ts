import type { FoodCategory } from '../../../shared/database/schema';

export const CATEGORY_COLORS: Record<FoodCategory, string> = {
  breakfast: '#42A5F5',
  lunch: '#26A69A',
  dinner: '#5C6BC0',
  snack: '#FFCA28',
  drink: '#26C6DA',
  treat: '#FF7043',
  alcohol: '#EF5350',
};

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  drink: 'Drink',
  treat: 'Treat',
  alcohol: 'Alcohol',
};
