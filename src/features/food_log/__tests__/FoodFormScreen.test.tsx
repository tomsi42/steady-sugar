import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { FoodFormScreen } from '../screens/FoodFormScreen';

const mockAdd = jest.fn().mockResolvedValue(undefined);
const mockUpdate = jest.fn().mockResolvedValue(undefined);

jest.mock('../store', () => ({
  useFoodLogStore: (selector: (s: any) => any) =>
    selector({ entries: [], add: mockAdd, update: mockUpdate }),
}));

const pickerOnChange: Record<string, (event: any, date?: Date) => void> = {};
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return jest.fn(({ onChange, testID, mode }: any) => {
    pickerOnChange[testID ?? `picker-${mode}`] = onChange;
    return React.createElement(View, { testID: testID ?? `picker-${mode}` });
  });
});

const mockNavigation = { setOptions: jest.fn(), goBack: jest.fn() } as any;
const mockRoute = { params: {} } as any;

async function renderScreen() {
  return render(
    <PaperProvider>
      <FoodFormScreen navigation={mockNavigation} route={mockRoute} />
    </PaperProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(pickerOnChange).forEach((k) => delete pickerOnChange[k]);
});

describe('FoodFormScreen', () => {
  it('saves with a valid food name and default timestamp', async () => {
    const { getByTestId, queryByText } = await renderScreen();

    await fireEvent.changeText(getByTestId('food-name-input'), 'Oatmeal');
    await fireEvent.press(getByTestId('save-button'));

    expect(queryByText('food.error_name')).toBeNull();
    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ name: 'Oatmeal' }));
  });

  it('shows an error when name is missing', async () => {
    const { getByTestId, queryByText } = await renderScreen();

    await fireEvent.press(getByTestId('save-button'));

    expect(queryByText('food.error_name')).toBeTruthy();
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('rejects a timestamp in the future', async () => {
    const { getByTestId, queryByText } = await renderScreen();

    await act(async () => {
      pickerOnChange['date-picker']?.({ type: 'set' }, new Date('2030-06-25T10:00:00'));
    });
    await fireEvent.changeText(getByTestId('food-name-input'), 'Oatmeal');
    await fireEvent.press(getByTestId('save-button'));

    expect(queryByText('food.error_future')).toBeTruthy();
    expect(mockAdd).not.toHaveBeenCalled();
  });
});
