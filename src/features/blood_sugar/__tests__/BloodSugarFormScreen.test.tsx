import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { BloodSugarFormScreen } from '../screens/BloodSugarFormScreen';

const mockAdd = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../store', () => ({
  useBloodSugarStore: (selector: (s: any) => any) =>
    selector({ readings: [], add: mockAdd, update: mockUpdate }),
}));

// Two pickers render simultaneously; capture each by testID
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
      <BloodSugarFormScreen navigation={mockNavigation} route={mockRoute} />
    </PaperProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(pickerOnChange).forEach((k) => delete pickerOnChange[k]);
});

describe('BloodSugarFormScreen', () => {
  it('saves with a valid value and default timestamp', async () => {
    const { getByTestId, queryByText } = await renderScreen();

    await fireEvent.changeText(getByTestId('blood-sugar-value-input'), '5.6');
    await fireEvent.press(getByTestId('save-button'));

    expect(queryByText('blood_sugar.error_required')).toBeNull();
    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ valueMmol: 5.6 }));
  });

  it('shows an error when value is missing', async () => {
    const { getByTestId, queryByText } = await renderScreen();

    await fireEvent.press(getByTestId('save-button'));

    expect(queryByText('blood_sugar.error_required')).toBeTruthy();
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('rejects a timestamp in the future', async () => {
    const { getByTestId, queryByText } = await renderScreen();

    await act(async () => {
      pickerOnChange['date-picker']?.({ type: 'set' }, new Date('2030-06-25T10:00:00'));
    });
    await fireEvent.changeText(getByTestId('blood-sugar-value-input'), '5.6');
    await fireEvent.press(getByTestId('save-button'));

    expect(queryByText('blood_sugar.error_future')).toBeTruthy();
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('preserves the time when only the date changes', async () => {
    const { getByTestId } = await renderScreen();

    await act(async () => {
      pickerOnChange['time-picker']?.({ type: 'set' }, new Date('2025-01-01T09:30:00'));
    });
    await act(async () => {
      pickerOnChange['date-picker']?.({ type: 'set' }, new Date('2025-03-10T00:00:00'));
    });
    await fireEvent.changeText(getByTestId('blood-sugar-value-input'), '5.6');
    await fireEvent.press(getByTestId('save-button'));

    const saved: Date = mockAdd.mock.calls[0][0].timestamp;
    expect(saved.getFullYear()).toBe(2025);
    expect(saved.getMonth()).toBe(2); // March = 2
    expect(saved.getDate()).toBe(10);
    expect(saved.getHours()).toBe(9);
    expect(saved.getMinutes()).toBe(30);
  });
});
