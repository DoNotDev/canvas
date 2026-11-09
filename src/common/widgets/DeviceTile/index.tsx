// packages/canvas/src/common/widgets/DeviceTile/index.tsx

/**
 * @fileoverview DeviceTile canvas widget
 * @description Renders a single smart-home device (light, plug, blind,
 *   switch) as a card with an on/off `Switch` and, when the payload carries
 *   a `level`, a 0..100 `Slider` for dimmer / blind position.
 *
 *   User input fires immediately — no internal React state is held for the
 *   control surfaces. `Switch` toggles emit `set_power`; `Slider` commits
 *   emit `set_level`. The agent is the source of truth for device state; a
 *   re-render with a new payload will reconcile the UI.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Card, Slider, Switch, Text } from '@donotdev/components';

import {
  DeviceTileActions,
  DeviceTilePayloadSchema,
  type DeviceTilePayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * `DeviceTile` widget component.
 *
 * The catalog guarantees `props.payload` has already been validated against
 * `DeviceTilePayloadSchema` before the widget is mounted, so the payload is
 * cast directly — no redundant re-parse in the render path.
 *
 * @param props - Standard canvas widget props. `payload` is a
 *   `DeviceTilePayload`; `emit(action, payload)` dispatches back to the
 *   agent.
 * @returns A `Card` containing the device label, an optional icon, a power
 *   `Switch`, and (when the payload defines `level`) a position `Slider`.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const DeviceTile: FC<CanvasWidgetProps> = (props) => {
  const p = props.payload as DeviceTilePayload;

  const handlePower = (next: boolean): void => {
    props.emit('set_power', { deviceId: p.deviceId, power: next });
  };

  const handleLevel = (values: readonly number[]): void => {
    const next = values[0];
    if (typeof next !== 'number') return;
    props.emit('set_level', { deviceId: p.deviceId, level: next });
  };

  return (
    <Card title={p.label} icon={p.icon} elevated>
      <Switch
        key={`power-${String(p.power)}`}
        defaultChecked={p.power}
        onCheckedChange={handlePower}
      />
      {typeof p.level === 'number' ? (
        <>
          <Text as="span" variant="muted">
            {p.level}%
          </Text>
          <Slider
            key={`level-${p.level}`}
            defaultValue={[p.level]}
            min={0}
            max={100}
            step={1}
            onValueCommit={handleLevel}
          />
        </>
      ) : null}
    </Card>
  );
};

registerWidget({
  kind: 'DeviceTile',
  schema: DeviceTilePayloadSchema,
  actions: DeviceTileActions,
  surface: 'household',
  defaultLifetime: 'ephemeral',
  component: DeviceTile,
});
