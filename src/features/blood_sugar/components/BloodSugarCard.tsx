import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { BloodSugarReading, BloodSugarContext } from '../../../shared/database/schema';
import { colorForBloodSugar } from '../utils/colorForBloodSugar';
import { locale } from '../../../shared/i18n';

const CONTEXT_KEYS: Record<BloodSugarContext, string> = {
  fasting: 'blood_sugar.fasting',
  before_meal: 'blood_sugar.before_meal',
  after_meal_2h: 'blood_sugar.after_meal_2h',
  random: 'blood_sugar.random',
};

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
  reading: BloodSugarReading;
  onPress: () => void;
}

export function BloodSugarCard({ reading, onPress }: Props) {
  const { t } = useTranslation();
  const valueColor = colorForBloodSugar(reading.valueMmol);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <View style={styles.row}>
        <Text style={[styles.value, { color: valueColor }]}>
          {reading.valueMmol.toFixed(1)}
        </Text>
        <Text style={styles.unit}> {t('blood_sugar.mmol_unit')}</Text>
        <View style={styles.spacer} />
        <Chip compact style={styles.chip} textStyle={styles.chipText}>
          {t(CONTEXT_KEYS[reading.context])}
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
