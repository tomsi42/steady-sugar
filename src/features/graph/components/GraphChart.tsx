import React from 'react';
import { CartesianChart, Line } from 'victory-native';
import { Circle, Rect, Text as SkiaText, useFont } from '@shopify/react-native-skia';
import interRegular from '@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf';

import { colorForBloodSugar } from '../../blood_sugar/utils/colorForBloodSugar';
import type { MealMarker } from '../utils/groupMealMarkers';

interface ChartPoint {
  timestamp: number;
  value: number;
  [key: string]: unknown;
}

export interface GraphChartProps {
  isBloodSugar: boolean;
  bsChartData: ChartPoint[];
  weightChartData: ChartPoint[];
  domainStart: number;
  domainEnd: number;
  xTickCount: number;
  formatXLabel: (val: number) => string;
  targetMin: number;
  targetMax: number;
  mealMarkers: MealMarker[];
}

// Imports @shopify/react-native-skia and victory-native, both of which construct a
// Skia singleton at module-evaluation time. On web that singleton is only valid after
// LoadSkiaWeb() resolves, so this module must only ever be imported lazily (see
// GraphScreen's React.lazy usage) — never as a static top-level import.
export default function GraphChart({
  isBloodSugar,
  bsChartData,
  weightChartData,
  domainStart,
  domainEnd,
  xTickCount,
  formatXLabel,
  targetMin,
  targetMax,
  mealMarkers,
}: GraphChartProps) {
  // A bundled font (rather than matchFont's system font lookup) is required for axis
  // labels to render at all on web, where Skia's CanvasKit has no system fonts available.
  // useFont resolves asynchronously, so `font` is null on the first render and the axis
  // labels appear once it loads — same behavior on native, just effectively instant there.
  const font = useFont(interRegular, 10);

  if (isBloodSugar) {
    return (
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
              <Line points={points.value} color="#00897B" strokeWidth={2} />
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
    );
  }

  return (
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
            point.y !== null ? <Circle key={i} cx={point.x} cy={point.y} r={5} color="#5C6BC0" /> : null,
          )}
        </>
      )}
    </CartesianChart>
  );
}
