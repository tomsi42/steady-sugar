import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingWelcome'>;

export function OnboardingWelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="water" size={72} color="#00897B" style={styles.icon} />
      <Text variant="displaySmall" style={styles.title}>
        SugarWise
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Track your blood sugar, food, and weight — all in one place.
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('OnboardingName')}
        style={styles.button}
        contentStyle={styles.buttonContent}
        testID="get-started-button"
      >
        Get Started
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FAFAFA',
  },
  icon: { marginBottom: 16 },
  title: { color: '#212121', marginBottom: 12, textAlign: 'center' },
  subtitle: { color: '#757575', textAlign: 'center', marginBottom: 48 },
  button: { width: '100%' },
  buttonContent: { paddingVertical: 6 },
});
