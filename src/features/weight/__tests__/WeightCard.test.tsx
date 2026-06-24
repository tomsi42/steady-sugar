import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { WeightCard } from '../components/WeightCard';
import type { WeightEntry } from '../../../shared/database/schema';

async function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

const baseEntry: WeightEntry = {
  id: 1,
  valueKg: 82.4,
  timestamp: new Date('2026-06-17T12:00:00'),
  notes: '',
};

describe('WeightCard', () => {
  it('renders the weight value with one decimal place', async () => {
    const { getByText } = await renderWithPaper(
      <WeightCard entry={baseEntry} onPress={() => {}} />,
    );
    expect(getByText('82.4')).toBeTruthy();
  });

  it('renders the kg unit', async () => {
    const { getByText } = await renderWithPaper(
      <WeightCard entry={baseEntry} onPress={() => {}} />,
    );
    expect(getByText(' weight.kg_unit')).toBeTruthy();
  });

  it('renders date only (no time)', async () => {
    const { getByText, queryByText } = await renderWithPaper(
      <WeightCard entry={baseEntry} onPress={() => {}} />,
    );
    expect(getByText('Jun 17')).toBeTruthy();
    // Should not show time
    expect(queryByText(/12:00/)).toBeNull();
  });

  it('renders notes when present', async () => {
    const entry = { ...baseEntry, notes: 'after workout' };
    const { getByText } = await renderWithPaper(
      <WeightCard entry={entry} onPress={() => {}} />,
    );
    expect(getByText('after workout')).toBeTruthy();
  });

  it('does not render notes when notes is empty', async () => {
    const { queryByText } = await renderWithPaper(
      <WeightCard entry={baseEntry} onPress={() => {}} />,
    );
    expect(queryByText('after workout')).toBeNull();
  });

  it('formats whole numbers with one decimal place', async () => {
    const entry = { ...baseEntry, valueKg: 80 };
    const { getByText } = await renderWithPaper(
      <WeightCard entry={entry} onPress={() => {}} />,
    );
    expect(getByText('80.0')).toBeTruthy();
  });
});
