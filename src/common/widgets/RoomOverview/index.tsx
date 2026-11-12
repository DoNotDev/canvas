// packages/canvas/src/common/widgets/RoomOverview/index.tsx

/**
 * @fileoverview RoomOverview canvas widget
 * @description Renders every device in a room as a grid of toggleable cells.
 *   The agent emits this block to answer "what's on in the salon?" and the
 *   user can flip individual devices without leaving the canvas. Registers
 *   itself with the catalog at module load so the surface's widget barrel
 *   picks it up via a side-effect-only import.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Card, Grid, Slider, Switch, Text } from '@donotdev/components';

import {
  RoomOverviewActions,
  RoomOverviewPayloadSchema,
  type RoomOverviewPayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * RoomOverview — grid of device cells for a single room.
 *
 * Each cell is a `Card` holding the device label, a `Switch` bound to
 * `power` (emits `toggle_device` on change), and, when the device exposes
 * a 0..100 `level`, a `Slider` (emits `set_device_level` on change).
 *
 * Uncontrolled at the DOM layer: the payload is the source of truth, the
 * widget forwards user intent through `emit` and lets the next agent-sent
 * payload re-seed the controls. No internal React state.
 *
 * @component
 * @example
 * ```tsx
 * <RoomOverview
 *   payload={{
 *     roomId: 'salon',
 *     roomName: 'Salon',
 *     devices: [
 *       { deviceId: 'light-ceiling', label: 'Plafonnier', kind: 'light', power: true, level: 40 },
 *       { deviceId: 'plug-tv', label: 'TV', kind: 'plug', power: false },
 *     ],
 *   }}
 *   emit={(action, payload) => console.log(action, payload)}
 * />
 * ```
 *
 * @param {CanvasWidgetProps} props - Canvas host props (validated payload + emit).
 * @returns {JSX.Element} The rendered room overview grid.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
const RoomOverview = (props: CanvasWidgetProps) => {
  // why: payload is valibot-validated against this widget's schema (validateBlock) before render
  const p = props.payload as RoomOverviewPayload;
  const { emit } = props;

  return (
    <Card title={<Text as="h3">{p.roomName}</Text>}>
      <Grid cols={[1, 2, 3, 4]} gap="medium">
        {p.devices.map((device) => {
          const hasLevel = device.level !== undefined;
          return (
            <Card key={device.deviceId} title={device.label} icon={device.icon}>
              <Switch
                defaultChecked={device.power}
                variant="success"
                onCheckedChange={(next) =>
                  emit('toggle_device', {
                    deviceId: device.deviceId,
                    power: next,
                  })
                }
              />
              {hasLevel && (
                <Slider
                  defaultValue={[device.level as number]}
                  min={0}
                  max={100}
                  step={1}
                  variant="primary"
                  showValue
                  onValueCommit={(values) =>
                    emit('set_device_level', {
                      deviceId: device.deviceId,
                      level: values[0],
                    })
                  }
                />
              )}
            </Card>
          );
        })}
      </Grid>
    </Card>
  );
};

registerWidget({
  kind: 'RoomOverview',
  schema: RoomOverviewPayloadSchema,
  actions: RoomOverviewActions,
  surface: 'household',
  defaultLifetime: 'ephemeral',
  component: RoomOverview,
});

export default RoomOverview;
export { RoomOverview };
