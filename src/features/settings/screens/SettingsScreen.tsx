import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  List,
  Divider,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import { useSettingsStore } from '../store';
import { useBloodSugarStore } from '../../blood_sugar/store';
import { useFoodLogStore } from '../../food_log/store';
import { useWeightStore } from '../../weight/store';
import { CATEGORY_COLORS } from '../../food_log/utils/categoryColors';
import type { FoodCategory } from '../../../shared/database/schema';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const CATEGORIES: FoodCategory[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'drink',
  'treat',
  'alcohol',
];

const APP_VERSION = '1.0.0';

export function SettingsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const settings = useSettingsStore((s) => s.settings);
  const targetMin = useSettingsStore((s) => s.targetMinMmol);
  const targetMax = useSettingsStore((s) => s.targetMaxMmol);
  const update = useSettingsStore((s) => s.update);
  const clearAllSettings = useSettingsStore((s) => s.clearAll);

  const [nameText, setNameText] = useState(settings?.userName ?? '');
  const [minText, setMinText] = useState(targetMin.toFixed(1));
  const [maxText, setMaxText] = useState(targetMax.toFixed(1));
  const [rangeError, setRangeError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  function currentData() {
    return {
      userName: nameText,
      targetMinMmol: parseFloat(minText),
      targetMaxMmol: parseFloat(maxText),
    };
  }

  function handleNameBlur() {
    const trimmed = nameText.trim();
    if (!trimmed) return;
    update({ ...currentData(), userName: trimmed });
  }

  function handleRangeBlur() {
    const min = parseFloat(minText);
    const max = parseFloat(maxText);
    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0) {
      setRangeError(t('settings.error_invalid'));
      return;
    }
    if (min >= max) {
      setRangeError(t('settings.error_min_max'));
      return;
    }
    setRangeError('');
    update({ ...currentData(), targetMinMmol: min, targetMaxMmol: max });
  }

  function handleClearAll() {
    setConfirmVisible(false);
    clearAllSettings();
    useBloodSugarStore.setState({ readings: [] });
    useFoodLogStore.setState({ entries: [] });
    useWeightStore.setState({ entries: [] });
    navigation.reset({ index: 0, routes: [{ name: 'OnboardingWelcome' }] });
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <List.Subheader style={styles.subheader}>{t('settings.profile')}</List.Subheader>
        <View style={styles.section}>
          <TextInput
            label={t('settings.name_label')}
            value={nameText}
            onChangeText={setNameText}
            onBlur={handleNameBlur}
            mode="outlined"
            returnKeyType="done"
            testID="settings-name-input"
          />
        </View>

        <Divider />

        <List.Subheader style={styles.subheader}>{t('settings.targets')}</List.Subheader>
        <View style={styles.section}>
          <TextInput
            label={t('common.min_mmol')}
            value={minText}
            onChangeText={(v) => {
              setMinText(v);
              setRangeError('');
            }}
            onBlur={handleRangeBlur}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.rangeInput}
            testID="settings-min-input"
          />
          <TextInput
            label={t('common.max_mmol')}
            value={maxText}
            onChangeText={(v) => {
              setMaxText(v);
              setRangeError('');
            }}
            onBlur={handleRangeBlur}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.rangeInput}
            testID="settings-max-input"
          />
          {rangeError ? <Text style={styles.error}>{rangeError}</Text> : null}
        </View>

        <Divider />

        <List.Subheader style={styles.subheader}>{t('settings.categories')}</List.Subheader>
        {CATEGORIES.map((cat) => (
          <List.Item
            key={cat}
            title={t(`food.${cat}`)}
            left={() => (
              <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
            )}
          />
        ))}

        <Divider />

        <List.Subheader style={styles.subheader}>{t('settings.data_management')}</List.Subheader>
        <List.Item
          title={t('settings.export_import')}
          description={t('settings.coming_v2')}
          left={(props) => <List.Icon {...props} icon="swap-horizontal" color="#BDBDBD" />}
          titleStyle={styles.disabledText}
          descriptionStyle={styles.disabledText}
        />
        <View style={styles.section}>
          <Button
            mode="outlined"
            onPress={() => setConfirmVisible(true)}
            textColor="#E53935"
            style={styles.clearButton}
            testID="clear-data-button"
          >
            {t('settings.clear_button')}
          </Button>
        </View>

        <Divider />

        <List.Subheader style={styles.subheader}>{t('settings.about')}</List.Subheader>
        <List.Item
          title={t('settings.version')}
          right={() => (
            <Text style={styles.versionText}>{APP_VERSION}</Text>
          )}
        />
        <List.Item
          title={t('settings.built_with')}
          titleStyle={styles.aboutText}
        />
      </ScrollView>

      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>{t('settings.confirm_title')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('settings.confirm_body')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={handleClearAll} textColor="#E53935" testID="confirm-clear-button">
              {t('settings.clear_confirm_button')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { paddingBottom: 40 },
  subheader: { color: '#00897B', fontWeight: '600' },
  section: { paddingHorizontal: 16, paddingBottom: 12 },
  rangeInput: { marginBottom: 12 },
  error: { color: '#E53935', marginBottom: 4 },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignSelf: 'center',
    marginLeft: 16,
    marginRight: 8,
  },
  disabledText: { color: '#BDBDBD' },
  clearButton: { borderColor: '#E53935' },
  versionText: { alignSelf: 'center', color: '#757575', marginRight: 16 },
  aboutText: { color: '#757575' },
});
