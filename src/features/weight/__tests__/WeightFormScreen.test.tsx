import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { WeightFormScreen } from '../screens/WeightFormScreen';

const mockAdd = jest.fn().mockResolvedValue(undefined);
const mockUpdate = jest.fn().mockResolvedValue(undefined);

jest.mock('../store', () => ({
  useWeightStore: (selector: (s: any) => any) =>
    selector({ entries: [], add: mockAdd, update: mockUpdate }),
}));

let pickerOnChange: ((event: any, date?: Date) => void) | undefined;
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return jest.fn(({ onChange, testID }: any) => {
    pickerOnChange = onChange;
    return React.createElement(View, { testID: testID ?? 'date-picker' });
  });
});

const mockNavigation = { setOptions: jest.fn(), goBack: jest.fn() } as any;
const mockRoute = { params: {} } as any;

async function renderScreen() {
  return render(
    <PaperProvider>
      <WeightFormScreen navigation={mockNavigation} route={mockRoute} />
    </PaperProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  pickerOnChange = undefined;
});

describe('WeightFormScreen', () => {
  it('saves with a valid weight and default date', async () => {
    const { getByTestId, queryByText } = await renderScreen();

    await fireEvent.changeText(getByTestId('weight-value-input'), '80');
    await fireEvent.press(getByTestId('save-button'));

    expect(queryByText('weight.error_required')).toBeNull();
    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ valueKg: 80 }));
  });

  it('rounds the value to one decimal place', async () => {
    const { getByTestId } = await renderScreen();

    await fireEvent.changeText(getByTestId('weight-value-input'), '80.456');
    await fireEvent.press(getByTestId('save-button'));

    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ valueKg: 80.5 }));
  });

  it('shows an error when value is missing', async () => {
    const { getByTestId, queryByText } = await renderScreen();

    await fireEvent.press(getByTestId('save-button'));

    expect(queryByText('weight.error_required')).toBeTruthy();
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('rejects a date in the future', async () => {
    const { getByTestId, queryByText } = await renderScreen();

    await act(async () => {
      pickerOnChange?.({ type: 'set' }, new Date('2030-06-25'));
    });
    await fireEvent.changeText(getByTestId('weight-value-input'), '80');
    await fireEvent.press(getByTestId('save-button'));

    expect(queryByText('weight.error_future')).toBeTruthy();
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('accepts a date in the past', async () => {
    const { getByTestId, queryByText } = await renderScreen();

    await act(async () => {
      pickerOnChange?.({ type: 'set' }, new Date('2025-01-15'));
    });
    await fireEvent.changeText(getByTestId('weight-value-input'), '80');
    await fireEvent.press(getByTestId('save-button'));

    expect(queryByText('weight.error_future')).toBeNull();
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });
});
