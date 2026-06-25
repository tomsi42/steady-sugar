import React from 'react';
import { Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

export interface DateTimeInputProps {
  value: Date;
  mode: 'date' | 'time';
  maximumDate?: Date;
  is24Hour?: boolean;
  onChange: (date: Date) => void;
  testID?: string;
}

export function DateTimeInput({ value, mode, maximumDate, is24Hour, onChange, testID }: DateTimeInputProps) {
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      maximumDate={maximumDate}
      is24Hour={is24Hour}
      display={Platform.OS === 'ios' ? 'compact' : 'spinner'}
      onChange={(_event: DateTimePickerEvent, selected?: Date) => {
        if (selected) onChange(selected);
      }}
      testID={testID}
    />
  );
}
