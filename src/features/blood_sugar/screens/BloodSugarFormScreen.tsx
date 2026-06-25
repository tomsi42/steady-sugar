import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import type { BloodSugarContext } from '../../../shared/database/schema';
import { useBloodSugarStore } from '../store';
import { DateTimeInput } from '../../../shared/components/DateTimeInput';

type Props = NativeStackScreenProps<RootStackParamList, 'BloodSugarForm'>;

const CONTEXT_OPTIONS: BloodSugarContext[] = ['fasting', 'before_meal', 'after_meal_2h', 'random'];

function isToday(d: Date): boolean {
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function BloodSugarFormScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { readingId } = route.params ?? {};
  const readings = useBloodSugarStore((s) => s.readings);
  const add = useBloodSugarStore((s) => s.add);
  const update = useBloodSugarStore((s) => s.update);

  const existing = readingId != null ? readings.find((r) => r.id === readingId) : undefined;
  const initial = existing ? new Date(existing.timestamp) : new Date();

  const [valueText, setValueText] = useState(existing ? String(existing.valueMmol) : '');
  const [context, setContext] = useState<BloodSugarContext>(existing?.context ?? 'random');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [timestamp, setTimestamp] = useState<Date>(initial);
  const [valueError, setValueError] = useState('');
  const [timestampError, setTimestampError] = useState('');
  const [softWarning, setSoftWarning] = useState('');

  const isEdit = existing != null;

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? t('blood_sugar.title_edit') : t('blood_sugar.title_add') });
  }, [navigation, isEdit, t]);

  function handleValueChange(text: string) {
    setValueText(text);
    setValueError('');
    setSoftWarning('');
    const num = parseFloat(text);
    if (!isNaN(num) && (num < 0 || num > 35)) {
      setSoftWarning(t('blood_sugar.warning_range'));
    }
  }

  function handleDateChange(selected: Date) {
    setTimestamp(
      new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        timestamp.getHours(),
        timestamp.getMinutes(),
        0,
        0,
      ),
    );
    setTimestampError('');
  }

  function handleTimeChange(selected: Date) {
    setTimestamp(
      new Date(
        timestamp.getFullYear(),
        timestamp.getMonth(),
        timestamp.getDate(),
        selected.getHours(),
        selected.getMinutes(),
        0,
        0,
      ),
    );
    setTimestampError('');
  }

  async function handleSave() {
    const num = parseFloat(valueText);
    if (!valueText.trim() || isNaN(num)) {
      setValueError(t('blood_sugar.error_required'));
      return;
    }

    if (timestamp > new Date()) {
      setTimestampError(t('blood_sugar.error_future'));
      return;
    }
    setTimestampError('');

    if (isEdit && existing) {
      await update(existing.id, { valueMmol: num, context, notes: notes || '', timestamp });
    } else {
      await add({ valueMmol: num, context, notes: notes || '', timestamp });
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
          label={t('blood_sugar.label')}
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
          {t('blood_sugar.context')}
        </Text>
        <SegmentedButtons
          value={context}
          onValueChange={(v) => setContext(v as BloodSugarContext)}
          buttons={CONTEXT_OPTIONS.map((o) => ({
            value: o,
            label: t(`blood_sugar.${o}`),
            testID: `context-${o}`,
          }))}
          style={styles.segmented}
        />

        <Text variant="labelLarge" style={styles.sectionLabel}>
          {t('common.when')}
        </Text>
        <View style={styles.dateTimeRow}>
          <DateTimeInput
            value={timestamp}
            mode="date"
            maximumDate={new Date()}
            onChange={handleDateChange}
            testID="date-picker"
          />
          <DateTimeInput
            value={timestamp}
            mode="time"
            is24Hour
            maximumDate={isToday(timestamp) ? new Date() : undefined}
            onChange={handleTimeChange}
            testID="time-picker"
          />
        </View>
        {!!timestampError && <HelperText type="error">{timestampError}</HelperText>}

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
  segmented: { flexWrap: 'wrap' },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  notes: { marginTop: 20 },
  saveButton: { marginTop: 32 },
  saveButtonContent: { paddingVertical: 6 },
});
