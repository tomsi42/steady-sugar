import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import type { FoodEntry } from '../../../shared/database/schema';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/categoryColors';

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
  entry: FoodEntry;
  onPress: () => void;
}

export function FoodCard({ entry, onPress }: Props) {
  const chipColor = CATEGORY_COLORS[entry.category];
  const label = CATEGORY_LABELS[entry.category];

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.name}
        </Text>
        <Chip
          compact
          style={[styles.chip, { backgroundColor: chipColor }]}
          textStyle={styles.chipText}
        >
          {label}
        </Chip>
      </View>
      <Text style={styles.timestamp}>{formatTimestamp(new Date(entry.timestamp))}</Text>
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
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  chip: {
    flexShrink: 0,
  },
  chipText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
});
