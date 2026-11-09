// packages/canvas/src/common/widgets/Climate/index.tsx

/**
 * @fileoverview Climate canvas widget
 * @description Household-surface thermostat widget — shows the current
 *   temperature for a zone, lets the user adjust the target set point and
 *   flip between heat / cool / auto / off modes. Registers itself with the
 *   canvas catalog at module load (side-effect import from
 *   `../common/widgets/index.ts`).
 *
 *   Purely uncontrolled: the widget reads its initial values from the
 *   validated payload and emits `set_target` / `set_mode` events on every
 *   user interaction. The agent is the source of truth and re-renders the
 *   block with an updated payload.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { ReactElement } from 'react';

import {
  Button,
  ButtonGroup,
  Card,
  RangeInput,
  Text,
} from '@donotdev/components';

import {
  ClimateActions,
  ClimatePayloadSchema,
  type ClimatePayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/** Canonical ordering of the four thermostat modes in the UI. */
const CLIMATE_MODES = ['heat', 'cool', 'auto', 'off'] as const;

/** Icon name (lucide-react identifier) shown on the Card header. */
const ZONE_ICON = 'Thermometer';

/** Lucide icon per mode, used as the button icon for quick scanning. */
const MODE_ICONS: Record<(typeof CLIMATE_MODES)[number], string> = {
  heat: 'Flame',
  cool: 'Snowflake',
  auto: 'CircuitBoard',
  off: 'Power',
};

/** Human-readable mode label. Widget-internal, not user-facing product copy. */
const MODE_LABELS: Record<(typeof CLIMATE_MODES)[number], string> = {
  heat: 'Heat',
  cool: 'Cool',
  auto: 'Auto',
  off: 'Off',
};

/**
 * Climate widget component.
 *
 * Renders a card containing the zone name (with thermometer icon), the
 * current reading, an optional humidity reading, a `RangeInput` that
 * constrains the target between `minTarget` and `maxTarget`, and a
 * `ButtonGroup` of four mode buttons.
 *
 * Emits:
 * - `set_target` with `{ zoneId, targetTemp }` whenever the target changes.
 * - `set_mode` with `{ zoneId, mode }` whenever a mode button is clicked.
 *
 * @example
 * ```tsx
 * <Climate
 *   payload={{
 *     zoneId: 'salon',
 *     zoneName: 'Salon',
 *     currentTemp: 19.4,
 *     targetTemp: 21,
 *     unit: 'C',
 *     minTarget: 15,
 *     maxTarget: 28,
 *     mode: 'heat',
 *   }}
 *   emit={(action, payload) => console.log(action, payload)}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export function Climate(props: CanvasWidgetProps): ReactElement {
  const payload = props.payload as ClimatePayload;
  const {
    zoneId,
    zoneName,
    currentTemp,
    targetTemp,
    unit,
    minTarget,
    maxTarget,
    mode,
    humidity,
  } = payload;

  const current = `${formatTemp(currentTemp)}\u00B0${unit}`;
  const target = String(targetTemp);

  const handleRangeChange = (nextMin: string, nextMax: string): void => {
    // Single set point: whichever side the user edited becomes the new target.
    const picked = nextMax !== target ? nextMax : nextMin;
    const parsed = Number.parseFloat(picked);
    if (!Number.isFinite(parsed) || parsed === targetTemp) return;
    props.emit('set_target', { zoneId, targetTemp: parsed });
  };

  const handleClear = (): void => {
    // Reset to the midpoint of the allowed range — the safest neutral target.
    const mid = (minTarget + maxTarget) / 2;
    if (mid === targetTemp) return;
    props.emit('set_target', { zoneId, targetTemp: mid });
  };

  return (
    <Card
      elevated
      icon={ZONE_ICON}
      title={zoneName}
      subtitle={
        humidity !== undefined ? `${current} \u00B7 ${humidity}% RH` : current
      }
    >
      <Text level="h2" as="p">
        {current}
      </Text>
      <RangeInput
        type="number"
        label={`Target (\u00B0${unit})`}
        min={minTarget}
        max={maxTarget}
        step={0.5}
        minValue={target}
        maxValue={target}
        actualMin={minTarget}
        actualMax={maxTarget}
        onChange={handleRangeChange}
        onClear={handleClear}
      />
      <ButtonGroup aria-label={`${zoneName} mode`} variant="outline">
        {CLIMATE_MODES.map((m) => (
          <Button
            key={m}
            icon={MODE_ICONS[m]}
            variant={m === mode ? 'primary' : 'outline'}
            aria-pressed={m === mode}
            onClick={() => {
              if (m === mode) return;
              props.emit('set_mode', { zoneId, mode: m });
            }}
          >
            {MODE_LABELS[m]}
          </Button>
        ))}
      </ButtonGroup>
    </Card>
  );
}

/**
 * Format a temperature reading for display. Strips trailing `.0` so `21.0`
 * renders as `21` while `19.4` stays `19.4`.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function formatTemp(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

registerWidget({
  kind: 'Climate',
  schema: ClimatePayloadSchema,
  actions: ClimateActions,
  surface: 'household',
  defaultLifetime: 'ephemeral',
  component: Climate,
});
