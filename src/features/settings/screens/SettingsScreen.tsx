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
  Snackbar,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import { useSettingsStore } from '../store';
import { useBloodSugarStore } from '../../blood_sugar/store';
import { useFoodLogStore } from '../../food_log/store';
import { useWeightStore } from '../../weight/store';
import { exportData } from '../utils/exportData';
import { importData } from '../utils/importData';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const APP_VERSION = '1.1.0';

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
  const [snackMessage, setSnackMessage] = useState('');

  function currentData() {
    return {
      userName: nameText,
      targetMinMmol: parseFloat(minText),
      targetMaxMmol: parseFloat(maxText),
    };
  }

  async function handleNameBlur() {
    const trimmed = nameText.trim();
    if (!trimmed) return;
    await update({ ...currentData(), userName: trimmed });
  }

  async function handleRangeBlur() {
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
    await update({ ...currentData(), targetMinMmol: min, targetMaxMmol: max });
  }

  async function handleClearAll() {
    setConfirmVisible(false);
    await clearAllSettings();
    useBloodSugarStore.setState({ readings: [] });
    useFoodLogStore.setState({ entries: [] });
    useWeightStore.setState({ entries: [] });
    navigation.reset({ index: 0, routes: [{ name: 'OnboardingWelcome' }] });
  }

  async function handleExport() {
    try {
      await exportData();
    } catch {
      setSnackMessage(t('settings.import_error'));
    }
  }

  async function handleImport() {
    const result = await importData();
    if (result.type === 'cancelled') return;
    if (result.type === 'error') {
      setSnackMessage(t('settings.import_error'));
      return;
    }
    if (result.count === 0) {
      setSnackMessage(t('settings.import_none'));
    } else {
      setSnackMessage(t('settings.import_success', { count: result.count }));
    }
    // Reload all stores so the log reflects newly imported data
    await Promise.all([
      useBloodSugarStore.getState().load(),
      useFoodLogStore.getState().load(),
      useWeightStore.getState().load(),
    ]);
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

        <List.Subheader style={styles.subheader}>{t('settings.data_management')}</List.Subheader>
        <View style={styles.section}>
          <Button
            mode="outlined"
            icon="export"
            onPress={handleExport}
            style={styles.dataButton}
            testID="export-button"
          >
            {t('settings.export_button')}
          </Button>
          <Text style={styles.dataDesc}>{t('settings.export_desc')}</Text>
          <Button
            mode="outlined"
            icon="import"
            onPress={handleImport}
            style={[styles.dataButton, styles.importButton]}
            testID="import-button"
          >
            {t('settings.import_button')}
          </Button>
          <Text style={styles.dataDesc}>{t('settings.import_desc')}</Text>
        </View>

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

      <Snackbar
        visible={!!snackMessage}
        onDismiss={() => setSnackMessage('')}
        duration={3000}
        testID="import-snackbar"
      >
        {snackMessage}
      </Snackbar>
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
  dataButton: { marginBottom: 4 },
  importButton: { marginTop: 12 },
  dataDesc: { fontSize: 12, color: '#9E9E9E', marginBottom: 4 },
  clearButton: { borderColor: '#E53935', marginTop: 8 },
  versionText: { alignSelf: 'center', color: '#757575', marginRight: 16 },
  aboutText: { color: '#757575' },
});
