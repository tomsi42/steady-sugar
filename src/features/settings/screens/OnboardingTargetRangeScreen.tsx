import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import { useSettingsStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingTargetRange'>;

export function OnboardingTargetRangeScreen({ route, navigation }: Props) {
  const { name } = route.params;
  const update = useSettingsStore((s) => s.update);

  const [minText, setMinText] = useState('3.9');
  const [maxText, setMaxText] = useState('7.8');
  const [error, setError] = useState('');

  function handleDone() {
    const min = parseFloat(minText);
    const max = parseFloat(maxText);
    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0) {
      setError('Please enter valid numbers');
      return;
    }
    if (min >= max) {
      setError('Minimum must be less than maximum');
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
          Set your target range
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          Your doctor's recommended blood sugar range in mmol/L. You can change this any time in
          Settings.
        </Text>
        <TextInput
          label="Minimum (mmol/L)"
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
          label="Maximum (mmol/L)"
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
          Done
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
