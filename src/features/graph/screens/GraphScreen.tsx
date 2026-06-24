import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons, Menu, Button } from 'react-native-paper';
import { CartesianChart, Line } from 'victory-native';
import { Circle, Rect, Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import { useTranslation } from 'react-i18next';

import { useBloodSugarStore } from '../../blood_sugar/store';
import { useFoodLogStore } from '../../food_log/store';
import { useWeightStore } from '../../weight/store';
import { useSettingsStore } from '../../settings/store';
import { colorForBloodSugar } from '../../blood_sugar/utils/colorForBloodSugar';
import {
  filterByTimeRange,
  getTimeRangeBounds,
  type TimeRange,
} from '../utils/filterByTimeRange';
import { groupMealMarkers } from '../utils/groupMealMarkers';

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

  const font = useMemo(() => {
    try {
      return matchFont({ fontSize: 10 });
    } catch {
      return null;
    }
  }, []);

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
          {isBloodSugar ? (
            <CartesianChart
              data={bsChartData}
              xKey="timestamp"
              yKeys={['value']}
              domain={{ x: [domainStart, domainEnd] }}
              domainPadding={{ top: 10, bottom: 8 }}
              axisOptions={{
                font,
                tickCount: { x: xTickCount, y: 5 },
                formatXLabel: (val) => formatXLabel(val as number),
              }}
            >
              {({ points, chartBounds, xScale, yScale }) => {
                const bandTop = yScale(targetMax);
                const bandBottom = yScale(targetMin);
                return (
                  <>
                    <Rect
                      x={chartBounds.left}
                      y={bandTop}
                      width={chartBounds.right - chartBounds.left}
                      height={bandBottom - bandTop}
                      color="rgba(76, 175, 80, 0.3)"
                    />
                    <Line
                      points={points.value}
                      color="#00897B"
                      strokeWidth={2}
                    />
                    {points.value.map((point, i) =>
                      point.y !== null && point.yValue !== null ? (
                        <Circle
                          key={i}
                          cx={point.x}
                          cy={point.y}
                          r={5}
                          color={colorForBloodSugar(point.yValue as number)}
                        />
                      ) : null,
                    )}
                    {mealMarkers.map((marker, i) => {
                      const mx = xScale(marker.timestamp.getTime());
                      if (mx < chartBounds.left || mx > chartBounds.right) return null;
                      const barH = 8;
                      const barY = chartBounds.bottom - barH;
                      return (
                        <React.Fragment key={i}>
                          <Rect x={mx - 1.5} y={barY} width={3} height={barH} color="#FF8F00" />
                          {marker.count > 1 && font && (
                            <SkiaText
                              font={font}
                              text={`×${marker.count}`}
                              x={mx + 4}
                              y={barY + 6}
                              color="#FF8F00"
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </>
                );
              }}
            </CartesianChart>
          ) : (
            <CartesianChart
              data={weightChartData}
              xKey="timestamp"
              yKeys={['value']}
              domain={{ x: [domainStart, domainEnd] }}
              domainPadding={10}
              axisOptions={{
                font,
                tickCount: { x: xTickCount, y: 5 },
                formatXLabel: (val) => formatXLabel(val as number),
              }}
            >
              {({ points }) => (
                <>
                  <Line points={points.value} color="#5C6BC0" strokeWidth={2} />
                  {points.value.map((point, i) =>
                    point.y !== null ? (
                      <Circle key={i} cx={point.x} cy={point.y} r={5} color="#5C6BC0" />
                    ) : null,
                  )}
                </>
              )}
            </CartesianChart>
          )}
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
