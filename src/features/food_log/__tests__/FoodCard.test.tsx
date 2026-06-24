import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { FoodCard } from '../components/FoodCard';
import type { FoodEntry } from '../../../shared/database/schema';

async function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

const baseEntry: FoodEntry = {
  id: 1,
  name: 'Oatmeal with berries',
  category: 'breakfast',
  timestamp: new Date('2026-06-17T08:30:00'),
};

describe('FoodCard', () => {
  it('renders the food name', async () => {
    const { getByText } = await renderWithPaper(
      <FoodCard entry={baseEntry} onPress={() => {}} />,
    );
    expect(getByText('Oatmeal with berries')).toBeTruthy();
  });

  it('renders the category label', async () => {
    const { getByText } = await renderWithPaper(
      <FoodCard entry={baseEntry} onPress={() => {}} />,
    );
    expect(getByText('food.breakfast')).toBeTruthy();
  });

  it('renders Lunch category label', async () => {
    const entry = { ...baseEntry, category: 'lunch' as const };
    const { getByText } = await renderWithPaper(
      <FoodCard entry={entry} onPress={() => {}} />,
    );
    expect(getByText('food.lunch')).toBeTruthy();
  });

  it('renders Dinner category label', async () => {
    const entry = { ...baseEntry, category: 'dinner' as const };
    const { getByText } = await renderWithPaper(
      <FoodCard entry={entry} onPress={() => {}} />,
    );
    expect(getByText('food.dinner')).toBeTruthy();
  });

  it('renders Snack category label', async () => {
    const entry = { ...baseEntry, category: 'snack' as const };
    const { getByText } = await renderWithPaper(
      <FoodCard entry={entry} onPress={() => {}} />,
    );
    expect(getByText('food.snack')).toBeTruthy();
  });

  it('renders Drink category label', async () => {
    const entry = { ...baseEntry, category: 'drink' as const };
    const { getByText } = await renderWithPaper(
      <FoodCard entry={entry} onPress={() => {}} />,
    );
    expect(getByText('food.drink')).toBeTruthy();
  });

  it('renders Treat category label', async () => {
    const entry = { ...baseEntry, category: 'treat' as const };
    const { getByText } = await renderWithPaper(
      <FoodCard entry={entry} onPress={() => {}} />,
    );
    expect(getByText('food.treat')).toBeTruthy();
  });

  it('renders Alcohol category label', async () => {
    const entry = { ...baseEntry, category: 'alcohol' as const };
    const { getByText } = await renderWithPaper(
      <FoodCard entry={entry} onPress={() => {}} />,
    );
    expect(getByText('food.alcohol')).toBeTruthy();
  });
});
