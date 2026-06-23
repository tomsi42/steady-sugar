import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { BloodSugarCard } from '../components/BloodSugarCard';
import type { BloodSugarReading } from '../../../shared/database/schema';

async function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

const baseReading: BloodSugarReading = {
  id: 1,
  valueMmol: 5.5,
  timestamp: new Date('2026-06-17T08:30:00'),
  context: 'fasting',
  notes: '',
};

describe('BloodSugarCard', () => {
  it('renders the blood sugar value', async () => {
    const { getByText } = await renderWithPaper(
      <BloodSugarCard reading={baseReading} onPress={() => {}} />,
    );
    expect(getByText('5.5')).toBeTruthy();
  });

  it('renders the context label', async () => {
    const { getByText } = await renderWithPaper(
      <BloodSugarCard reading={baseReading} onPress={() => {}} />,
    );
    expect(getByText('Fasting')).toBeTruthy();
  });

  it('renders notes when present', async () => {
    const reading = { ...baseReading, notes: 'morning check' };
    const { getByText } = await renderWithPaper(
      <BloodSugarCard reading={reading} onPress={() => {}} />,
    );
    expect(getByText('morning check')).toBeTruthy();
  });

  it('does not render notes when notes is empty', async () => {
    const { queryByText } = await renderWithPaper(
      <BloodSugarCard reading={baseReading} onPress={() => {}} />,
    );
    expect(queryByText('morning check')).toBeNull();
  });

  it('renders Before meal context label', async () => {
    const reading = { ...baseReading, context: 'before_meal' as const };
    const { getByText } = await renderWithPaper(
      <BloodSugarCard reading={reading} onPress={() => {}} />,
    );
    expect(getByText('Before meal')).toBeTruthy();
  });

  it('renders After meal 2h context label', async () => {
    const reading = { ...baseReading, context: 'after_meal_2h' as const };
    const { getByText } = await renderWithPaper(
      <BloodSugarCard reading={reading} onPress={() => {}} />,
    );
    expect(getByText('After meal 2h')).toBeTruthy();
  });

  it('renders Random context label', async () => {
    const reading = { ...baseReading, context: 'random' as const };
    const { getByText } = await renderWithPaper(
      <BloodSugarCard reading={reading} onPress={() => {}} />,
    );
    expect(getByText('Random')).toBeTruthy();
  });
});
