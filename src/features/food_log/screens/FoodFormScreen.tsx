import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, HelperText, Chip, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import type { FoodCategory } from '../../../shared/database/schema';
import { useFoodLogStore } from '../store';
import { CATEGORY_COLORS } from '../utils/categoryColors';
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
  const { t } = useTranslation();
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
  const [photoUri, setPhotoUri] = useState<string | null>(existing?.photoUri ?? null);
  const [nameError, setNameError] = useState('');
  const [timestampError, setTimestampError] = useState('');

  const isEdit = existing != null;

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? t('food.title_edit') : t('food.title_add') });
  }, [navigation, isEdit, t]);

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleChoosePhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library permission is required to choose photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
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
    if (!name.trim()) {
      setNameError(t('food.error_name'));
      return;
    }

    const ts = parseTimestamp();
    if (!ts) {
      setTimestampError(t('food.error_timestamp'));
      return;
    }
    if (ts > new Date()) {
      setTimestampError(t('food.error_future'));
      return;
    }
    setTimestampError('');

    if (isEdit && existing) {
      update(existing.id, { name: name.trim(), category, timestamp: ts, photoUri });
    } else {
      add({ name: name.trim(), category, timestamp: ts, photoUri });
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
          {t('food.category_label')}
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
                {t(`food.${cat}`)}
              </Chip>
            );
          })}
        </ScrollView>

        <TextInput
          label={t('food.name_placeholder')}
          value={name}
          onChangeText={(text) => {
            setName(text);
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

        {/* Photo section */}
        <Text variant="labelLarge" style={styles.sectionLabel}>
          {t('food.photo_label')}
        </Text>
        {photoUri ? (
          <View style={styles.photoPreview} testID="photo-preview">
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            <IconButton
              icon="close-circle"
              size={24}
              iconColor="#E53935"
              style={styles.removeButton}
              onPress={() => setPhotoUri(null)}
              testID="remove-photo-button"
            />
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <Button
              mode="outlined"
              icon="camera"
              onPress={handleTakePhoto}
              style={styles.photoButton}
              testID="take-photo-button"
            >
              {t('food.photo_take')}
            </Button>
            <Button
              mode="outlined"
              icon="image"
              onPress={handleChoosePhoto}
              style={styles.photoButton}
              testID="choose-photo-button"
            >
              {t('food.photo_choose')}
            </Button>
          </View>
        )}

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
  sectionLabel: { marginTop: 20, marginBottom: 8, color: '#757575' },
  chipRow: { gap: 8, paddingBottom: 4 },
  categoryChip: { marginRight: 0 },
  categoryChipText: { fontSize: 13 },
  nameInput: { fontSize: 16, marginTop: 20 },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoButton: { flex: 1 },
  photoPreview: { position: 'relative', alignSelf: 'flex-start' },
  previewImage: { width: 120, height: 120, borderRadius: 8 },
  removeButton: { position: 'absolute', top: -8, right: -8, margin: 0 },
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  dateInput: { flex: 3 },
  timeInput: { flex: 2 },
  saveButton: { marginTop: 32 },
  saveButtonContent: { paddingVertical: 6 },
});
