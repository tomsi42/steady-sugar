import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import { useWeightStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'WeightForm'>;

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function todayAtNoon(): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
}

function dateAtNoon(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function WeightFormScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { entryId } = route.params ?? {};
  const entries = useWeightStore((s) => s.entries);
  const add = useWeightStore((s) => s.add);
  const update = useWeightStore((s) => s.update);

  const existing = entryId != null ? entries.find((e) => e.id === entryId) : undefined;

  const [valueText, setValueText] = useState(existing ? String(existing.valueKg) : '');
  const [date, setDate] = useState<Date>(
    existing ? dateAtNoon(new Date(existing.timestamp)) : todayAtNoon(),
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [valueError, setValueError] = useState('');
  const [softWarning, setSoftWarning] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const isEdit = existing != null;

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Weight' : 'Log Weight' });
  }, [navigation, isEdit]);

  function handleValueChange(text: string) {
    setValueText(text);
    setValueError('');
    setSoftWarning('');
    const num = parseFloat(text);
    if (!isNaN(num) && (num < 45 || num > 200)) {
      setSoftWarning('Value outside typical range (45–200 kg)');
    }
  }

  function handlePickerChange(event: DateTimePickerEvent, selected?: Date) {
    setShowPicker(Platform.OS === 'ios');
    if (event.type === 'dismissed' || !selected) return;
    const chosen = dateAtNoon(selected);
    if (chosen > new Date()) return;
    setDate(chosen);
  }

  function handleSave() {
    const num = parseFloat(valueText);
    if (!valueText.trim() || isNaN(num)) {
      setValueError('Please enter a weight value');
      return;
    }
    if (date > new Date()) {
      setValueError('Date cannot be in the future');
      return;
    }

    const rounded = Math.round(num * 10) / 10;

    if (isEdit && existing) {
      update(existing.id, { valueKg: rounded, notes: notes || '', timestamp: date });
    } else {
      add({ valueKg: rounded, notes: notes || '', timestamp: date });
    }

    navigation.goBack();
  }

  function formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const minimumDate = new Date(Date.now() - ONE_YEAR_MS);
  const maximumDate = new Date();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          label="Weight (kg)"
          value={valueText}
          onChangeText={handleValueChange}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.valueInput}
          error={!!valueError}
          testID="weight-value-input"
        />
        {!!valueError && <HelperText type="error">{valueError}</HelperText>}
        {!!softWarning && !valueError && (
          <HelperText type="info" style={{ color: '#FF6F00' }}>
            {softWarning}
          </HelperText>
        )}

        <Text variant="labelLarge" style={styles.sectionLabel}>
          Date
        </Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={[styles.dateButton, { borderColor: theme.colors.outline }]}
          testID="date-button"
        >
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handlePickerChange}
          />
        )}

        <TextInput
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.notes}
          testID="notes-input"
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          testID="save-button"
        >
          {isEdit ? 'Update' : 'Save'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 40 },
  valueInput: { fontSize: 24 },
  sectionLabel: { marginTop: 20, marginBottom: 8, color: '#757575' },
  dateButton: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  dateText: { fontSize: 16 },
  notes: { marginTop: 20 },
  saveButton: { marginTop: 32 },
  saveButtonContent: { paddingVertical: 6 },
});
