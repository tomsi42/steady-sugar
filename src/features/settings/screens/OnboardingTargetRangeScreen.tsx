import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import { useSettingsStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingTargetRange'>;

export function OnboardingTargetRangeScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { name } = route.params;
  const update = useSettingsStore((s) => s.update);

  const [minText, setMinText] = useState('3.9');
  const [maxText, setMaxText] = useState('7.8');
  const [error, setError] = useState('');

  function handleDone() {
    const min = parseFloat(minText);
    const max = parseFloat(maxText);
    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0) {
      setError(t('onboarding.range_error_invalid'));
      return;
    }
    if (min >= max) {
      setError(t('onboarding.range_error_order'));
      return;
    }
    update({ userName: name, targetMinMmol: min, targetMaxMmol: max });
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.heading}>
          {t('onboarding.range_heading')}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {t('onboarding.range_description')}
        </Text>
        <TextInput
          label={t('common.min_mmol')}
          value={minText}
          onChangeText={(v) => {
            setMinText(v);
            setError('');
          }}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          testID="min-input"
        />
        <TextInput
          label={t('common.max_mmol')}
          value={maxText}
          onChangeText={(v) => {
            setMaxText(v);
            setError('');
          }}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          testID="max-input"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          mode="contained"
          onPress={handleDone}
          style={styles.button}
          contentStyle={styles.buttonContent}
          testID="done-button"
        >
          {t('common.done')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  heading: { color: '#212121', marginBottom: 12 },
  description: { color: '#757575', marginBottom: 24 },
  input: { marginBottom: 12 },
  error: { color: '#E53935', marginBottom: 8 },
  button: { marginTop: 8 },
  buttonContent: { paddingVertical: 6 },
});
