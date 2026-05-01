// packages/canvas/src/common/widgets/RoomOverview/schema.ts

/**
 * @fileoverview RoomOverview widget schemas
 * @description Valibot schemas and inferred types describing the payload and
 *   action vocabulary of the `RoomOverview` canvas widget. Validated at the
 *   trust boundary by the catalog (`validateBlock` / `validateEvent`). This
 *   module is isomorphic — no React, no DOM — so server-side agents can use
 *   it to emit blocks without pulling the renderer.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * A single device entry inside a `RoomOverview` payload.
 *
 * - `deviceId` — stable id used when emitting `toggle_device` /
 *   `set_device_level`.
 * - `label` — human-readable name shown on the cell (e.g. "Plafonnier").
 * - `kind` — coarse device category driving default iconography.
 * - `power` — current on/off state, bound to the cell's `Switch`.
 * - `level` — optional 0..100 dim/position value; presence enables the
 *   cell's `Slider` (lights with dimmer, blinds with position).
 * - `icon` — optional emoji or icon hint overriding the `kind` default.
 *
 * @example
 * ```ts
 * const dimmer: v.InferOutput<typeof RoomDeviceSchema> = {
 *   deviceId: 'light-salon-ceiling',
 *   label: 'Plafonnier',
 *   kind: 'light',
 *   power: true,
 *   level: 40,
 *   icon: '💡',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const RoomDeviceSchema = v.object({
  deviceId: v.string(),
  label: v.string(),
  kind: v.picklist(['light', 'plug', 'blind', 'switch']),
  power: v.boolean(),
  level: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100))),
  icon: v.optional(v.string()),
});

/**
 * Payload of a `RoomOverview` canvas block: a room label plus every device
 * in that room. Rendered as a grid of toggleable cells so the user can see
 * and control the whole room at a glance ("what's on in the salon?").
 *
 * @example
 * ```ts
 * const payload: v.InferOutput<typeof RoomOverviewPayloadSchema> = {
 *   roomId: 'salon',
 *   roomName: 'Salon',
 *   devices: [
 *     { deviceId: 'light-ceiling', label: 'Plafonnier', kind: 'light', power: true, level: 40 },
 *     { deviceId: 'plug-tv', label: 'TV', kind: 'plug', power: false },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const RoomOverviewPayloadSchema = v.object({
  roomId: v.string(),
  roomName: v.string(),
  devices: v.array(RoomDeviceSchema),
});

/**
 * Inferred payload type for the `RoomOverview` widget. Widgets cast their
 * incoming `payload: unknown` to this type after the catalog has already
 * parsed it against `RoomOverviewPayloadSchema`.
 *
 * @example
 * ```ts
 * const p = props.payload as RoomOverviewPayload;
 * console.log(p.roomName, p.devices.length);
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type RoomOverviewPayload = v.InferOutput<
  typeof RoomOverviewPayloadSchema
>;

/**
 * Payload of a `toggle_device` event emitted when the user flips a cell's
 * `Switch`. The agent applies `power` to the identified device.
 *
 * @example
 * ```ts
 * emit('toggle_device', { deviceId: 'light-ceiling', power: false });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ToggleDeviceActionSchema = v.object({
  deviceId: v.string(),
  power: v.boolean(),
});

/**
 * Payload of a `set_device_level` event emitted when the user drags a
 * cell's `Slider`. `level` is clamped to 0..100 at the boundary.
 *
 * @example
 * ```ts
 * emit('set_device_level', { deviceId: 'light-ceiling', level: 75 });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SetDeviceLevelActionSchema = v.object({
  deviceId: v.string(),
  level: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
});

/**
 * Action vocabulary for the `RoomOverview` widget — registered with the
 * catalog so `validateEvent` can route incoming events to the right schema.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'RoomOverview',
 *   schema: RoomOverviewPayloadSchema,
 *   actions: RoomOverviewActions,
 *   surface: 'household',
 *   defaultLifetime: 'ephemeral',
 *   component: RoomOverview,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const RoomOverviewActions = {
  toggle_device: ToggleDeviceActionSchema,
  set_device_level: SetDeviceLevelActionSchema,
} as const;
