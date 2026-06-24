import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingName'>;

export function OnboardingNameScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleNext() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('onboarding.name_error'));
      return;
    }
    navigation.navigate('OnboardingTargetRange', { name: trimmed });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.heading}>
          {t('onboarding.name_heading')}
        </Text>
        <TextInput
          label={t('settings.name_label')}
          value={name}
          onChangeText={(v) => {
            setName(v);
            setError('');
          }}
          mode="outlined"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={handleNext}
          style={styles.input}
          testID="name-input"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
          testID="next-button"
        >
          {t('common.next')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  heading: { color: '#212121', marginBottom: 24 },
  input: { marginBottom: 8 },
  error: { color: '#E53935', marginBottom: 8 },
  button: { marginTop: 16 },
  buttonContent: { paddingVertical: 6 },
});
