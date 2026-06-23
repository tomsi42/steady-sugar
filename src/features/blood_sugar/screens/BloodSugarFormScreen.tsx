import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import type { BloodSugarContext } from '../../../shared/database/schema';
import { useBloodSugarStore } from '../store';
import {
  parseDateText,
  parseTimeText,
  formatDateText,
  formatTimeText,
  formatDateInput,
  formatTimeInput,
} from '../../../shared/utils/dateTimeText';

type Props = NativeStackScreenProps<RootStackParamList, 'BloodSugarForm'>;

const CONTEXT_OPTIONS: { value: BloodSugarContext; label: string }[] = [
  { value: 'fasting', label: 'Fasting' },
  { value: 'before_meal', label: 'Before meal' },
  { value: 'after_meal_2h', label: 'After meal 2h' },
  { value: 'random', label: 'Random' },
];

export function BloodSugarFormScreen({ route, navigation }: Props) {
  const { readingId } = route.params ?? {};
  const readings = useBloodSugarStore((s) => s.readings);
  const add = useBloodSugarStore((s) => s.add);
  const update = useBloodSugarStore((s) => s.update);

  const existing = readingId != null ? readings.find((r) => r.id === readingId) : undefined;
  const initial = existing ? new Date(existing.timestamp) : new Date();

  const [valueText, setValueText] = useState(existing ? String(existing.valueMmol) : '');
  const [context, setContext] = useState<BloodSugarContext>(existing?.context ?? 'random');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [dateText, setDateText] = useState(formatDateText(initial));
  const [timeText, setTimeText] = useState(formatTimeText(initial));
  const [valueError, setValueError] = useState('');
  const [timestampError, setTimestampError] = useState('');
  const [softWarning, setSoftWarning] = useState('');

  const isEdit = existing != null;

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Reading' : 'Log Blood Sugar' });
  }, [navigation, isEdit]);

  function handleValueChange(text: string) {
    setValueText(text);
    setValueError('');
    setSoftWarning('');
    const num = parseFloat(text);
    if (!isNaN(num) && (num < 0 || num > 35)) {
      setSoftWarning('Value outside typical range (0–35 mmol/L)');
    }
  }

  function parseTimestamp(): Date | null {
    const d = parseDateText(dateText);
    const t = parseTimeText(timeText);
    if (!d || !t) return null;
    d.setHours(t.hours, t.minutes, 0, 0);
    return d;
  }

  function handleSave() {
    const num = parseFloat(valueText);
    if (!valueText.trim() || isNaN(num)) {
      setValueError('Please enter a blood sugar value');
      return;
    }

    const ts = parseTimestamp();
    if (!ts) {
      setTimestampError('Enter date as DD/MM/YYYY and time as HH:MM');
      return;
    }
    if (ts > new Date()) {
      setTimestampError('Timestamp cannot be in the future');
      return;
    }
    setTimestampError('');

    if (isEdit && existing) {
      update(existing.id, { valueMmol: num, context, notes: notes || '', timestamp: ts });
    } else {
      add({ valueMmol: num, context, notes: notes || '', timestamp: ts });
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
          label="Blood sugar (mmol/L)"
          value={valueText}
          onChangeText={handleValueChange}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.valueInput}
          error={!!valueError}
          testID="blood-sugar-value-input"
        />
        {!!valueError && <HelperText type="error">{valueError}</HelperText>}
        {!!softWarning && !valueError && (
          <HelperText type="info" style={{ color: '#FF6F00' }}>
            {softWarning}
          </HelperText>
        )}

        <Text variant="labelLarge" style={styles.sectionLabel}>
          Context
        </Text>
        <SegmentedButtons
          value={context}
          onValueChange={(v) => setContext(v as BloodSugarContext)}
          buttons={CONTEXT_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
            testID: `context-${o.value}`,
          }))}
          style={styles.segmented}
        />

        <Text variant="labelLarge" style={styles.sectionLabel}>
          When
        </Text>
        <View style={styles.dateTimeRow}>
          <TextInput
            label="DD/MM/YYYY"
            value={dateText}
            onChangeText={(v) => {
              setDateText(formatDateInput(v));
              setTimestampError('');
            }}
            mode="outlined"
            keyboardType="number-pad"
            maxLength={10}
            style={styles.dateInput}
            testID="date-input"
          />
          <TextInput
            label="HH:MM"
            value={timeText}
            onChangeText={(v) => {
              setTimeText(formatTimeInput(v));
              setTimestampError('');
            }}
            mode="outlined"
            keyboardType="number-pad"
            maxLength={5}
            style={styles.timeInput}
            testID="time-input"
          />
        </View>
        {!!timestampError && <HelperText type="error">{timestampError}</HelperText>}

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
  segmented: { flexWrap: 'wrap' },
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  dateInput: { flex: 3 },
  timeInput: { flex: 2 },
  notes: { marginTop: 20 },
  saveButton: { marginTop: 32 },
  saveButtonContent: { paddingVertical: 6 },
});
