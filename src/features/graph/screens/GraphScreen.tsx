import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, SegmentedButtons, Menu, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useBloodSugarStore } from '../../blood_sugar/store';
import { useFoodLogStore } from '../../food_log/store';
import { useWeightStore } from '../../weight/store';
import { useSettingsStore } from '../../settings/store';
import {
  filterByTimeRange,
  getTimeRangeBounds,
  type TimeRange,
} from '../utils/filterByTimeRange';
import { groupMealMarkers } from '../utils/groupMealMarkers';
import { theme } from '../../../app/theme';

// Lazy-loaded so victory-native/@shopify/react-native-skia (and the Skia singleton they
// construct at module-evaluation time) are only imported after LoadSkiaWeb() has resolved
// on web — see GraphChart.tsx and App.tsx's initSkiaWeb() call.
const GraphChart = lazy(() => import('../components/GraphChart'));

type ChartType = 'blood_sugar' | 'weight';

export function GraphScreen() {
  const { t } = useTranslation();
  const readings = useBloodSugarStore((s) => s.readings);
  const bloodSugarLoad = useBloodSugarStore((s) => s.load);
  const foodEntries = useFoodLogStore((s) => s.entries);
  const foodLoad = useFoodLogStore((s) => s.load);
  const weightEntries = useWeightStore((s) => s.entries);
  const weightLoad = useWeightStore((s) => s.load);
  const targetMin = useSettingsStore((s) => s.targetMinMmol);
  const targetMax = useSettingsStore((s) => s.targetMaxMmol);
  const settingsLoad = useSettingsStore((s) => s.load);

  const [chartType, setChartType] = useState<ChartType>('blood_sugar');
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    bloodSugarLoad();
    foodLoad();
    weightLoad();
    settingsLoad();
  }, [bloodSugarLoad, foodLoad, weightLoad, settingsLoad]);

  const [domainStart, domainEnd] = useMemo(() => {
    const [start, end] = getTimeRangeBounds(timeRange);
    return [start.getTime(), end.getTime()];
  }, [timeRange]);

  const filteredReadings = useMemo(
    () => filterByTimeRange(readings, timeRange),
    [readings, timeRange],
  );

  const filteredFood = useMemo(
    () => filterByTimeRange(foodEntries, timeRange),
    [foodEntries, timeRange],
  );

  const filteredWeight = useMemo(
    () => filterByTimeRange(weightEntries, timeRange),
    [weightEntries, timeRange],
  );

  const bsChartData = useMemo(
    () =>
      filteredReadings.map((r) => ({
        timestamp: new Date(r.timestamp).getTime(),
        value: r.valueMmol,
      })),
    [filteredReadings],
  );

  const weightChartData = useMemo(
    () =>
      filteredWeight.map((w) => ({
        timestamp: new Date(w.timestamp).getTime(),
        value: w.valueKg,
      })),
    [filteredWeight],
  );

  const mealMarkers = useMemo(() => groupMealMarkers(filteredFood), [filteredFood]);

  const xTickCount = timeRange === 'today' ? 5 : timeRange === '7days' ? 7 : 6;

  function formatXLabel(val: number): string {
    const date = new Date(val);
    if (timeRange === 'today') {
      return `${date.getHours()}h`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const isBloodSugar = chartType === 'blood_sugar';
  const hasData = isBloodSugar ? bsChartData.length > 0 : weightChartData.length > 0;
  const chartTypeLabel = isBloodSugar ? t('graph.blood_sugar') : t('graph.weight');

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              icon="chevron-down"
              contentStyle={styles.menuButtonContent}
              testID="chart-type-button"
            >
              {chartTypeLabel}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setChartType('blood_sugar');
              setMenuVisible(false);
            }}
            title={t('graph.blood_sugar')}
            testID="menu-blood-sugar"
          />
          <Menu.Item
            onPress={() => {
              setChartType('weight');
              setMenuVisible(false);
            }}
            title={t('graph.weight')}
            testID="menu-weight"
          />
        </Menu>
      </View>

      <SegmentedButtons
        value={timeRange}
        onValueChange={(v) => setTimeRange(v as TimeRange)}
        buttons={[
          { value: 'today', label: t('graph.range_today'), testID: 'range-today' },
          { value: '7days', label: t('graph.range_7days'), testID: 'range-7days' },
          { value: '30days', label: t('graph.range_30days'), testID: 'range-30days' },
        ]}
        style={styles.segmented}
      />

      {hasData ? (
        <View style={styles.chartContainer} testID="chart-container">
          <Suspense fallback={<ActivityIndicator size="large" color={theme.colors.primary} />}>
            <GraphChart
              isBloodSugar={isBloodSugar}
              bsChartData={bsChartData}
              weightChartData={weightChartData}
              domainStart={domainStart}
              domainEnd={domainEnd}
              xTickCount={xTickCount}
              formatXLabel={formatXLabel}
              targetMin={targetMin}
              targetMax={targetMax}
              mealMarkers={mealMarkers}
            />
          </Suspense>
        </View>
      ) : (
        <View style={styles.emptyContainer} testID="no-data">
          <Text variant="bodyLarge" style={styles.emptyText}>
            {t('log.empty_title')}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            {isBloodSugar ? t('graph.empty_blood_sugar') : t('graph.empty_weight')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 16 },
  controls: { alignItems: 'flex-start', marginBottom: 12 },
  menuButtonContent: { flexDirection: 'row-reverse' },
  segmented: { marginBottom: 16 },
  chartContainer: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#212121', marginBottom: 8 },
  emptySubtext: { color: '#757575', textAlign: 'center' },
});
