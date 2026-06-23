import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import type { BloodSugarReading, BloodSugarContext } from '../../../shared/database/schema';
import { colorForBloodSugar } from '../utils/colorForBloodSugar';

const CONTEXT_LABELS: Record<BloodSugarContext, string> = {
  fasting: 'Fasting',
  before_meal: 'Before meal',
  after_meal_2h: 'After meal 2h',
  random: 'Random',
};

function formatTimestamp(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

interface Props {
  reading: BloodSugarReading;
  onPress: () => void;
}

export function BloodSugarCard({ reading, onPress }: Props) {
  const valueColor = colorForBloodSugar(reading.valueMmol);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <View style={styles.row}>
        <Text style={[styles.value, { color: valueColor }]}>
          {reading.valueMmol.toFixed(1)}
        </Text>
        <Text style={styles.unit}> mmol/L</Text>
        <View style={styles.spacer} />
        <Chip compact style={styles.chip} textStyle={styles.chipText}>
          {CONTEXT_LABELS[reading.context]}
        </Chip>
      </View>
      <Text style={styles.timestamp}>{formatTimestamp(new Date(reading.timestamp))}</Text>
      {!!reading.notes && <Text style={styles.notes} numberOfLines={1}>{reading.notes}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  unit: {
    fontSize: 14,
    color: '#757575',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  spacer: {
    flex: 1,
  },
  chip: {
    backgroundColor: '#E0F2F1',
  },
  chipText: {
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  notes: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
    fontStyle: 'italic',
  },
});
