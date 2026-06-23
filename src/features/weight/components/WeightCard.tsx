import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import type { WeightEntry } from '../../../shared/database/schema';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  entry: WeightEntry;
  onPress: () => void;
}

export function WeightCard({ entry, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <View style={styles.row}>
        <Text style={styles.value}>{entry.valueKg.toFixed(1)}</Text>
        <Text style={styles.unit}> kg</Text>
        <View style={styles.spacer} />
        <Text style={styles.date}>{formatDate(new Date(entry.timestamp))}</Text>
      </View>
      {!!entry.notes && (
        <Text style={styles.notes} numberOfLines={1}>
          {entry.notes}
        </Text>
      )}
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
    alignItems: 'baseline',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
  },
  unit: {
    fontSize: 14,
    color: '#757575',
  },
  spacer: { flex: 1 },
  date: {
    fontSize: 13,
    color: '#757575',
  },
  notes: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
