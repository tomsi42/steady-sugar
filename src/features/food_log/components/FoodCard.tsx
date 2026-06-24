import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { FoodEntry } from '../../../shared/database/schema';
import { CATEGORY_COLORS } from '../utils/categoryColors';
import { locale } from '../../../shared/i18n';

function formatTimestamp(date: Date): string {
  return date.toLocaleDateString(locale, {
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
  const { t } = useTranslation();
  const chipColor = CATEGORY_COLORS[entry.category];

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <View style={styles.row}>
        {entry.photoUri ? (
          <Image
            source={{ uri: entry.photoUri }}
            style={styles.thumbnail}
            testID="food-photo-thumbnail"
          />
        ) : null}
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {entry.name}
            </Text>
            <Chip
              compact
              style={[styles.chip, { backgroundColor: chipColor }]}
              textStyle={styles.chipText}
            >
              {t(`food.${entry.category}`)}
            </Chip>
          </View>
          <Text style={styles.timestamp}>{formatTimestamp(new Date(entry.timestamp))}</Text>
        </View>
      </View>
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
    gap: 12,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 6,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  nameRow: {
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
