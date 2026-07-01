import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, SegmentedButtons, Menu, Button, IconButton } from 'react-native-paper';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { useBloodSugarStore } from '../../blood_sugar/store';
import { useFoodLogStore } from '../../food_log/store';
import { useWeightStore } from '../../weight/store';
import { useSettingsStore } from '../../settings/store';
import {
  filterByTimeRange,
  getTimeRangeBounds,
  shiftAnchor,
  canGoNext,
  canGoPrevious,
  formatDateRangeLabel,
  type TimeRange,
} from '../utils/filterByTimeRange';
import { groupMealMarkers } from '../utils/groupMealMarkers';
import { theme } from '../../../app/theme';
import { locale } from '../../../shared/i18n';

function oldestTimestamp(entries: { timestamp: Date | string | number }[]): Date | null {
  if (entries.length === 0) return null;
  return entries.reduce(
    (min, e) => {
      const t = new Date(e.timestamp);
      return t < min ? t : min;
    },
    new Date(entries[0].timestamp),
  );
}

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
  const [anchor, setAnchor] = useState<Date>(() => new Date());

  useEffect(() => {
    bloodSugarLoad();
    foodLoad();
    weightLoad();
    settingsLoad();
  }, [bloodSugarLoad, foodLoad, weightLoad, settingsLoad]);

  // Switching range or chart type always snaps navigation back to the current period.
  useEffect(() => {
    setAnchor(new Date());
  }, [timeRange, chartType]);

  const isBloodSugar = chartType === 'blood_sugar';

  const oldestDataDate = useMemo(
    () => oldestTimestamp(isBloodSugar ? readings : weightEntries),
    [isBloodSugar, readings, weightEntries],
  );
  const canNext = canGoNext(timeRange, anchor);
  const canPrev = canGoPrevious(timeRange, anchor, oldestDataDate);
  const rangeLabel = formatDateRangeLabel(timeRange, anchor, locale);

  function goToPrevious() {
    if (!canPrev) return;
    setAnchor((prev) => shiftAnchor(timeRange, prev, -1));
  }

  function goToNext() {
    if (!canNext) return;
    setAnchor((prev) => shiftAnchor(timeRange, prev, 1));
  }

  function jumpToToday() {
    setAnchor(new Date());
  }

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(40)
        .onEnd((event) => {
          if (event.translationX < 0) {
            goToNext();
          } else {
            goToPrevious();
          }
        })
        .runOnJS(true),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeRange, canNext, canPrev],
  );

  const [domainStart, domainEnd] = useMemo(() => {
    const [start, end] = getTimeRangeBounds(timeRange, anchor);
    return [start.getTime(), end.getTime()];
  }, [timeRange, anchor]);

  const filteredReadings = useMemo(
    () => filterByTimeRange(readings, timeRange, anchor),
    [readings, timeRange, anchor],
  );

  const filteredFood = useMemo(
    () => filterByTimeRange(foodEntries, timeRange, anchor),
    [foodEntries, timeRange, anchor],
  );

  const filteredWeight = useMemo(
    () => filterByTimeRange(weightEntries, timeRange, anchor),
    [weightEntries, timeRange, anchor],
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
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  }

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

      <View style={styles.navigationRow}>
        <IconButton
          icon="chevron-left"
          onPress={goToPrevious}
          disabled={!canPrev}
          testID="graph-prev-button"
        />
        <View style={styles.navigationLabelContainer}>
          <Text style={styles.navigationLabel} testID="graph-range-label">
            {rangeLabel}
          </Text>
          {canNext && (
            <Text style={styles.todayLink} onPress={jumpToToday} testID="graph-today-button">
              {t('graph.jump_to_today')}
            </Text>
          )}
        </View>
        <IconButton
          icon="chevron-right"
          onPress={goToNext}
          disabled={!canNext}
          testID="graph-next-button"
        />
      </View>

      <GestureDetector gesture={swipeGesture}>
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
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 16 },
  controls: { alignItems: 'flex-start', marginBottom: 12 },
  menuButtonContent: { flexDirection: 'row-reverse' },
  segmented: { marginBottom: 16 },
  navigationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navigationLabelContainer: { flex: 1, alignItems: 'center' },
  navigationLabel: { fontSize: 15, fontWeight: '600', color: '#212121' },
  todayLink: { fontSize: 12, color: '#00897B', marginTop: 2 },
  chartContainer: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#212121', marginBottom: 8 },
  emptySubtext: { color: '#757575', textAlign: 'center' },
});
