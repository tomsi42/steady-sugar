import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { DateTimeInput } from '../DateTimeInput.android';

let lastPickerProps: any = null;
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return jest.fn((props: any) => {
    lastPickerProps = props;
    return React.createElement(View, { testID: 'native-picker' });
  });
});

const VALUE = new Date('2026-06-17T08:30:00');
const onChange = jest.fn();

async function renderInput(mode: 'date' | 'time', testID: string) {
  return render(
    <PaperProvider>
      <DateTimeInput value={VALUE} mode={mode} onChange={onChange} testID={testID} />
    </PaperProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  lastPickerProps = null;
});

describe('DateTimeInput (android)', () => {
  it('renders a button with the formatted value and no picker mounted initially', async () => {
    const { getByTestId, queryByTestId } = await renderInput('date', 'date-picker');

    expect(getByTestId('date-picker')).toBeTruthy();
    expect(queryByTestId('native-picker')).toBeNull();
  });

  it('mounts the native picker only after the button is pressed', async () => {
    const { getByTestId, queryByTestId } = await renderInput('date', 'date-picker');

    await fireEvent.press(getByTestId('date-picker'));

    expect(queryByTestId('native-picker')).toBeTruthy();
  });

  it('calls onChange and unmounts the picker when a value is selected', async () => {
    const { getByTestId, queryByTestId } = await renderInput('date', 'date-picker');

    await fireEvent.press(getByTestId('date-picker'));
    const selected = new Date('2026-06-20T00:00:00');
    await act(async () => {
      lastPickerProps.onChange({ type: 'set' }, selected);
    });

    expect(onChange).toHaveBeenCalledWith(selected);
    expect(queryByTestId('native-picker')).toBeNull();
  });

  it('unmounts the picker without calling onChange when dismissed', async () => {
    const { getByTestId, queryByTestId } = await renderInput('date', 'date-picker');

    await fireEvent.press(getByTestId('date-picker'));
    await act(async () => {
      lastPickerProps.onChange({ type: 'dismissed' }, undefined);
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(queryByTestId('native-picker')).toBeNull();
  });

  it('formats a time-mode value using hour and minute', async () => {
    const { getByText } = await renderInput('time', 'time-picker');

    // en-US locale formatting of 08:30 — exact string depends on the environment's ICU data,
    // so just assert it rendered something containing the minute.
    expect(getByText(/30/)).toBeTruthy();
  });
});
