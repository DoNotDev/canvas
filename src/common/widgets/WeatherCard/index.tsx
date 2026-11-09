// packages/canvas/src/common/widgets/WeatherCard/index.tsx

/**
 * @fileoverview WeatherCard canvas widget
 * @description Household-surface, read-only weather widget. Shows current
 *   conditions for a location (big temperature + condition icon) and two
 *   optional forecast strips: an hourly `Grid` and a daily `Grid`.
 *
 *   Registers itself with the canvas catalog at module load. No user
 *   actions — the widget never emits; the agent is the sole source of
 *   truth and pushes fresh payloads when the forecast changes.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Card, Grid, Text } from '@donotdev/components';

import {
  WeatherCardActions,
  WeatherCardPayloadSchema,
  type WeatherCardPayload,
  type WeatherSlot,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * Map a closed-vocabulary `condition` to its lucide-react icon name.
 *
 * Literal object (not a function) so invalid conditions become TypeScript
 * errors instead of runtime undefineds.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
const CONDITION_ICONS: Record<WeatherSlot['condition'], string> = {
  sunny: 'Sun',
  cloudy: 'Cloud',
  rain: 'CloudRain',
  snow: 'CloudSnow',
  storm: 'CloudLightning',
  fog: 'CloudFog',
  'clear-night': 'Moon',
  'partly-cloudy': 'CloudSun',
};

/**
 * Convert a Celsius reading to the payload's requested display unit.
 *
 * Payload values are always stored in Celsius; this helper applies the
 * Fahrenheit conversion at render time when `unit === 'F'`. Rounds to the
 * nearest whole degree to keep the big temperature readable.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function displayTemp(tempC: number, unit: 'C' | 'F' | undefined): number {
  if (unit === 'F') return Math.round((tempC * 9) / 5 + 32);
  return Math.round(tempC);
}

/**
 * Format an hourly-forecast cell's time label as `HH:00` in UTC.
 *
 * Falls back to the raw `timeISO` string if the value can't be parsed —
 * keeps the widget resilient to unexpected agent input without silently
 * hiding data.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function formatHour(timeISO: string): string {
  const d = new Date(timeISO);
  if (Number.isNaN(d.getTime())) return timeISO;
  return `${String(d.getUTCHours()).padStart(2, '0')}:00`;
}

/** Short weekday labels indexed by `Date.getUTCDay()` (0 = Sunday). */
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Format a daily-forecast cell's label as a short weekday (`Mon`, `Tue`…).
 *
 * Falls back to the raw `timeISO` string if the value can't be parsed.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function formatDay(timeISO: string): string {
  const d = new Date(timeISO);
  if (Number.isNaN(d.getTime())) return timeISO;
  return DAY_LABELS[d.getUTCDay()] ?? timeISO;
}

/**
 * WeatherCard — current conditions + optional hourly & daily forecasts.
 *
 * Layout:
 * - Outer `Card` titled with the location and iconned by the current
 *   condition. Its content is the big current temperature and a muted
 *   subtitle echoing the condition key.
 * - If `hourly` is present, a `Grid` of small cards (time, temp, icon).
 * - If `daily` is present, a `Grid` of small cards (day, temp, icon).
 *
 * Payload is validated by the catalog before the component mounts, so the
 * cast to `WeatherCardPayload` is sound.
 *
 * @example
 * ```tsx
 * <WeatherCard
 *   payload={{
 *     location: 'Paris, FR',
 *     current: {
 *       timeISO: '2026-04-15T14:00:00Z',
 *       tempC: 18.4,
 *       condition: 'partly-cloudy',
 *     },
 *     unit: 'C',
 *   }}
 *   emit={() => {}}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const WeatherCard: FC<CanvasWidgetProps> = (props) => {
  const payload = props.payload as WeatherCardPayload;
  const { location, current, hourly, daily, unit } = payload;

  const unitSuffix = unit === 'F' ? 'F' : 'C';
  const currentTemp = `${displayTemp(current.tempC, unit)}\u00B0${unitSuffix}`;
  const currentIcon = CONDITION_ICONS[current.condition];

  return (
    <Card
      elevated
      icon={currentIcon}
      title={location}
      subtitle={current.condition}
    >
      <Text level="h1" as="p">
        {currentTemp}
      </Text>

      {hourly && hourly.length > 0 ? (
        <Grid cols={[2, 4, 6, 8]} gap="tight">
          {hourly.map((slot) => (
            <Card
              key={`h-${slot.timeISO}`}
              icon={CONDITION_ICONS[slot.condition]}
              title={formatHour(slot.timeISO)}
              subtitle={`${displayTemp(slot.tempC, unit)}\u00B0${unitSuffix}`}
            />
          ))}
        </Grid>
      ) : null}

      {daily && daily.length > 0 ? (
        <Grid cols={[2, 3, 5, 7]} gap="tight">
          {daily.map((slot) => (
            <Card
              key={`d-${slot.timeISO}`}
              icon={CONDITION_ICONS[slot.condition]}
              title={formatDay(slot.timeISO)}
              subtitle={`${displayTemp(slot.tempC, unit)}\u00B0${unitSuffix}`}
            />
          ))}
        </Grid>
      ) : null}
    </Card>
  );
};

registerWidget({
  kind: 'WeatherCard',
  schema: WeatherCardPayloadSchema,
  actions: WeatherCardActions,
  surface: 'household',
  defaultLifetime: 'ephemeral',
  component: WeatherCard,
});
