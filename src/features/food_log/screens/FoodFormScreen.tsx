import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput, Button, HelperText, Chip, useTheme } from 'react-native-paper';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import type { FoodCategory } from '../../../shared/database/schema';
import { useFoodLogStore } from '../store';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/categoryColors';

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

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function FoodFormScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { entryId } = route.params ?? {};
  const entries = useFoodLogStore((s) => s.entries);
  const add = useFoodLogStore((s) => s.add);
  const update = useFoodLogStore((s) => s.update);

  const existing = entryId != null ? entries.find((e) => e.id === entryId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState<FoodCategory>(existing?.category ?? 'snack');
  const [timestamp, setTimestamp] = useState<Date>(
    existing ? new Date(existing.timestamp) : new Date(),
  );
  const [nameError, setNameError] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [androidPickerMode, setAndroidPickerMode] = useState<'date' | 'time'>('date');

  const isEdit = existing != null;

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Food / Drink' : 'Log Food / Drink' });
  }, [navigation, isEdit]);

  function handleTimestampPress() {
    if (Platform.OS === 'android') setAndroidPickerMode('date');
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
        const next = new Date(timestamp);
        next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
        setTimestamp(next);
        setAndroidPickerMode('time');
        setShowPicker(true);
      } else {
        setShowPicker(false);
        const next = new Date(timestamp);
        next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        if (next > new Date()) return;
        setTimestamp(next);
      }
    } else {
      if (selected) {
        if (selected > new Date()) return;
        setTimestamp(selected);
      }
    }
  }

  function handleSave() {
    if (!name.trim()) {
      setNameError('Please enter a name for this entry');
      return;
    }
    if (timestamp > new Date()) {
      setNameError('Timestamp cannot be in the future');
      return;
    }

    if (isEdit && existing) {
      update(existing.id, { name: name.trim(), category, timestamp });
    } else {
      add({ name: name.trim(), category, timestamp });
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
  saveButton: { marginTop: 32 },
  saveButtonContent: { paddingVertical: 6 },
});
