import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { DateTimeInputProps } from './DateTimeInput';
import { locale } from '../i18n';

function formatDate(d: Date): string {
  return d.toLocaleDateString(locale);
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

// Android's native picker isn't an inline widget like iOS's — mounting it imperatively opens
// a dialog, and its effect re-opens that dialog whenever it re-renders with a new `onChange`
// reference (which happens on every keystroke elsewhere in the form, since inline handlers are
// recreated each render). Keeping it always-mounted causes exactly that reopen loop. The fix is
// the pattern this library expects: show a button with the current value, and only mount the
// picker (as a dialog) while the user is actively choosing — unmounting it immediately after.
export function DateTimeInput({ value, mode, maximumDate, is24Hour, onChange, testID }: DateTimeInputProps) {
  const [visible, setVisible] = useState(false);

  function handleChange(_event: DateTimePickerEvent, selected?: Date) {
    setVisible(false);
    if (selected) onChange(selected);
  }

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.button} testID={testID}>
        <Text>{mode === 'date' ? formatDate(value) : formatTime(value)}</Text>
      </TouchableOpacity>
      {visible && (
        <DateTimePicker
          value={value}
          mode={mode}
          maximumDate={maximumDate}
          is24Hour={is24Hour}
          display="spinner"
          onChange={handleChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
});
