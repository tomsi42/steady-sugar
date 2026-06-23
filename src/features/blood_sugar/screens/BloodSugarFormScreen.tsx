import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText, useTheme } from 'react-native-paper';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import type { BloodSugarContext } from '../../../shared/database/schema';
import { useBloodSugarStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'BloodSugarForm'>;

const CONTEXT_OPTIONS: { value: BloodSugarContext; label: string }[] = [
  { value: 'fasting', label: 'Fasting' },
  { value: 'before_meal', label: 'Before meal' },
  { value: 'after_meal_2h', label: 'After meal 2h' },
  { value: 'random', label: 'Random' },
];

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function BloodSugarFormScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { readingId } = route.params ?? {};
  const readings = useBloodSugarStore((s) => s.readings);
  const add = useBloodSugarStore((s) => s.add);
  const update = useBloodSugarStore((s) => s.update);

  const existing = readingId != null ? readings.find((r) => r.id === readingId) : undefined;

  const [valueText, setValueText] = useState(existing ? String(existing.valueMmol) : '');
  const [context, setContext] = useState<BloodSugarContext>(existing?.context ?? 'random');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [timestamp, setTimestamp] = useState<Date>(
    existing ? new Date(existing.timestamp) : new Date(),
  );

  const [showPicker, setShowPicker] = useState(false);
  const [androidPickerMode, setAndroidPickerMode] = useState<'date' | 'time'>('date');
  const [valueError, setValueError] = useState('');
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

  function handleTimestampPress() {
    if (Platform.OS === 'android') {
      setAndroidPickerMode('date');
    }
    setShowPicker(true);
  }

  function handlePickerChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setShowPicker(false);
        return;
      }
      if (!selected) {
        setShowPicker(false);
        return;
      }
      if (androidPickerMode === 'date') {
        // Merge selected date into existing timestamp
        const next = new Date(timestamp);
        next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
        setTimestamp(next);
        // Now show time picker
        setAndroidPickerMode('time');
        setShowPicker(true);
      } else {
        setShowPicker(false);
        const next = new Date(timestamp);
        next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        if (next > new Date()) return; // reject future
        setTimestamp(next);
      }
    } else {
      // iOS: keep picker open, update value continuously
      if (selected) {
        if (selected > new Date()) return; // reject future
        setTimestamp(selected);
      }
    }
  }

  function handleSave() {
    const num = parseFloat(valueText);
    if (!valueText.trim() || isNaN(num)) {
      setValueError('Please enter a blood sugar value');
      return;
    }
    if (timestamp > new Date()) {
      setValueError('Timestamp cannot be in the future');
      return;
    }

    if (isEdit && existing) {
      update(existing.id, { valueMmol: num, context, notes: notes || '', timestamp });
    } else {
      add({ valueMmol: num, context, notes: notes || '', timestamp });
    }

    navigation.goBack();
  }

  function formatTimestamp(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
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
        <TouchableOpacity
          onPress={handleTimestampPress}
          style={[styles.timestampButton, { borderColor: theme.colors.outline }]}
          testID="timestamp-button"
        >
          <Text style={styles.timestampText}>{formatTimestamp(timestamp)}</Text>
        </TouchableOpacity>

        {showPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={timestamp}
            mode={androidPickerMode}
            is24Hour
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handlePickerChange}
          />
        )}

        {showPicker && Platform.OS === 'ios' && (
          <View style={styles.iosPickerContainer}>
            <DateTimePicker
              value={timestamp}
              mode="datetime"
              display="spinner"
              is24Hour
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={handlePickerChange}
            />
            <Button onPress={() => setShowPicker(false)} mode="text">
              Done
            </Button>
          </View>
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
  segmented: { flexWrap: 'wrap' },
  timestampButton: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  timestampText: { fontSize: 16 },
  iosPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  notes: { marginTop: 20 },
  saveButton: { marginTop: 32 },
  saveButtonContent: { paddingVertical: 6 },
});
