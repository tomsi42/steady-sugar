import React, { useState, useLayoutEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import { useWeightStore } from '../store';
import {
  parseDateText,
  formatDateText,
  formatDateInput,
} from '../../../shared/utils/dateTimeText';

type Props = NativeStackScreenProps<RootStackParamList, 'WeightForm'>;

function dateAtNoon(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function WeightFormScreen({ route, navigation }: Props) {
  const { entryId } = route.params ?? {};
  const entries = useWeightStore((s) => s.entries);
  const add = useWeightStore((s) => s.add);
  const update = useWeightStore((s) => s.update);

  const existing = entryId != null ? entries.find((e) => e.id === entryId) : undefined;
  const initial = existing ? new Date(existing.timestamp) : new Date();

  const [valueText, setValueText] = useState(existing ? String(existing.valueKg) : '');
  const [dateText, setDateText] = useState(formatDateText(initial));
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [valueError, setValueError] = useState('');
  const [dateError, setDateError] = useState('');
  const [softWarning, setSoftWarning] = useState('');

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

  function handleSave() {
    const num = parseFloat(valueText);
    if (!valueText.trim() || isNaN(num)) {
      setValueError('Please enter a weight value');
      return;
    }

    const parsed = parseDateText(dateText);
    if (!parsed) {
      setDateError('Enter date as DD/MM/YYYY');
      return;
    }
    const ts = dateAtNoon(parsed);
    if (ts > new Date()) {
      setDateError('Date cannot be in the future');
      return;
    }
    setDateError('');

    const rounded = Math.round(num * 10) / 10;

    if (isEdit && existing) {
      update(existing.id, { valueKg: rounded, notes: notes || '', timestamp: ts });
    } else {
      add({ valueKg: rounded, notes: notes || '', timestamp: ts });
    }

    navigation.goBack();
  }

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
        <TextInput
          label="DD/MM/YYYY"
          value={dateText}
          onChangeText={(v) => {
            setDateText(formatDateInput(v));
            setDateError('');
          }}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={10}
          error={!!dateError}
          testID="date-input"
        />
        {!!dateError && <HelperText type="error">{dateError}</HelperText>}

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
  notes: { marginTop: 20 },
  saveButton: { marginTop: 32 },
  saveButtonContent: { paddingVertical: 6 },
});
