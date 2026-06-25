import React, { useState, useLayoutEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import { useWeightStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'WeightForm'>;

function dateAtNoon(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function WeightFormScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { entryId } = route.params ?? {};
  const entries = useWeightStore((s) => s.entries);
  const add = useWeightStore((s) => s.add);
  const update = useWeightStore((s) => s.update);

  const existing = entryId != null ? entries.find((e) => e.id === entryId) : undefined;
  const initial = existing ? new Date(existing.timestamp) : new Date();

  const [valueText, setValueText] = useState(existing ? String(existing.valueKg) : '');
  const [date, setDate] = useState<Date>(initial);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [valueError, setValueError] = useState('');
  const [dateError, setDateError] = useState('');
  const [softWarning, setSoftWarning] = useState('');

  const isEdit = existing != null;

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? t('weight.title_edit') : t('weight.title_add') });
  }, [navigation, isEdit, t]);

  function handleValueChange(text: string) {
    setValueText(text);
    setValueError('');
    setSoftWarning('');
    const num = parseFloat(text);
    if (!isNaN(num) && (num < 45 || num > 200)) {
      setSoftWarning(t('weight.warning_range'));
    }
  }

  function handleDateChange(_event: DateTimePickerEvent, selected?: Date) {
    if (selected) {
      setDate(selected);
      setDateError('');
    }
  }

  function handleSave() {
    const num = parseFloat(valueText);
    if (!valueText.trim() || isNaN(num)) {
      setValueError(t('weight.error_required'));
      return;
    }

    const ts = dateAtNoon(date);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (ts > endOfToday) {
      setDateError(t('weight.error_future'));
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

  const maxDate = new Date();
  maxDate.setHours(23, 59, 59, 999);

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
          label={t('weight.label')}
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
          {t('common.date')}
        </Text>
        <DateTimePicker
          value={date}
          mode="date"
          maximumDate={maxDate}
          display={Platform.OS === 'ios' ? 'compact' : 'spinner'}
          onChange={handleDateChange}
          testID="date-picker"
        />
        {!!dateError && <HelperText type="error">{dateError}</HelperText>}

        <TextInput
          label={t('common.notes_optional')}
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
          {isEdit ? t('common.update') : t('common.save')}
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
