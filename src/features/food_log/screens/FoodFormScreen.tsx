import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput, Button, HelperText, Chip } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import type { FoodCategory } from '../../../shared/database/schema';
import { useFoodLogStore } from '../store';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/categoryColors';
import {
  parseDateText,
  parseTimeText,
  formatDateText,
  formatTimeText,
  formatDateInput,
  formatTimeInput,
} from '../../../shared/utils/dateTimeText';

type Props = NativeStackScreenProps<RootStackParamList, 'FoodForm'>;

const CATEGORIES: FoodCategory[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'drink',
  'treat',
  'alcohol',
];

export function FoodFormScreen({ route, navigation }: Props) {
  const { entryId } = route.params ?? {};
  const entries = useFoodLogStore((s) => s.entries);
  const add = useFoodLogStore((s) => s.add);
  const update = useFoodLogStore((s) => s.update);

  const existing = entryId != null ? entries.find((e) => e.id === entryId) : undefined;
  const initial = existing ? new Date(existing.timestamp) : new Date();

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState<FoodCategory>(existing?.category ?? 'snack');
  const [dateText, setDateText] = useState(formatDateText(initial));
  const [timeText, setTimeText] = useState(formatTimeText(initial));
  const [nameError, setNameError] = useState('');
  const [timestampError, setTimestampError] = useState('');

  const isEdit = existing != null;

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Food / Drink' : 'Log Food / Drink' });
  }, [navigation, isEdit]);

  function parseTimestamp(): Date | null {
    const d = parseDateText(dateText);
    const t = parseTimeText(timeText);
    if (!d || !t) return null;
    d.setHours(t.hours, t.minutes, 0, 0);
    return d;
  }

  function handleSave() {
    if (!name.trim()) {
      setNameError('Please enter a name for this entry');
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
      update(existing.id, { name: name.trim(), category, timestamp: ts });
    } else {
      add({ name: name.trim(), category, timestamp: ts });
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
        <Text variant="labelLarge" style={styles.sectionLabel}>
          Category
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          testID="category-scroll"
        >
          {CATEGORIES.map((cat) => {
            const selected = category === cat;
            const color = CATEGORY_COLORS[cat];
            return (
              <Chip
                key={cat}
                selected={selected}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryChip,
                  { backgroundColor: selected ? color : '#F5F5F5' },
                ]}
                textStyle={[
                  styles.categoryChipText,
                  { color: selected ? '#FFFFFF' : '#616161' },
                ]}
                testID={`category-chip-${cat}`}
              >
                {CATEGORY_LABELS[cat]}
              </Chip>
            );
          })}
        </ScrollView>

        <TextInput
          label="What did you eat or drink?"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setNameError('');
          }}
          mode="outlined"
          style={styles.nameInput}
          error={!!nameError}
          multiline
          numberOfLines={2}
          testID="food-name-input"
        />
        {!!nameError && <HelperText type="error">{nameError}</HelperText>}

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
  sectionLabel: { marginTop: 20, marginBottom: 8, color: '#757575' },
  chipRow: { gap: 8, paddingBottom: 4 },
  categoryChip: { marginRight: 0 },
  categoryChipText: { fontSize: 13 },
  nameInput: { fontSize: 16, marginTop: 20 },
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  dateInput: { flex: 3 },
  timeInput: { flex: 2 },
  saveButton: { marginTop: 32 },
  saveButtonContent: { paddingVertical: 6 },
});
