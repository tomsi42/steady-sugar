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
import {
  parseDateText,
  parseTimeText,
  formatDateText,
  formatTimeText,
  formatDateInput,
  formatTimeInput,
} from '../../../shared/utils/dateTimeText';

type Props = NativeStackScreenProps<RootStackParamList, 'BloodSugarForm'>;

const CONTEXT_OPTIONS: BloodSugarContext[] = ['fasting', 'before_meal', 'after_meal_2h', 'random'];

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
  const [dateText, setDateText] = useState(formatDateText(initial));
  const [timeText, setTimeText] = useState(formatTimeText(initial));
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

  function parseTimestamp(): Date | null {
    const d = parseDateText(dateText);
    const t2 = parseTimeText(timeText);
    if (!d || !t2) return null;
    d.setHours(t2.hours, t2.minutes, 0, 0);
    return d;
  }

  function handleSave() {
    const num = parseFloat(valueText);
    if (!valueText.trim() || isNaN(num)) {
      setValueError(t('blood_sugar.error_required'));
      return;
    }

    const ts = parseTimestamp();
    if (!ts) {
      setTimestampError(t('blood_sugar.error_timestamp'));
      return;
    }
    if (ts > new Date()) {
      setTimestampError(t('blood_sugar.error_future'));
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
          <TextInput
            label={t('common.date_placeholder')}
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
            label={t('common.time_placeholder')}
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
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  dateInput: { flex: 3 },
  timeInput: { flex: 2 },
  notes: { marginTop: 20 },
  saveButton: { marginTop: 32 },
  saveButtonContent: { paddingVertical: 6 },
});
