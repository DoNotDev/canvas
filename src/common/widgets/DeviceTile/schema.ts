// packages/canvas/src/common/widgets/DeviceTile/schema.ts

/**
 * @fileoverview DeviceTile widget schemas
 * @description Valibot payload + action schemas for the `DeviceTile` canvas
 *   widget. One tile controls a single smart-home endpoint (light, plug,
 *   blind, switch). Toggles emit `set_power`; dimmer / blind-position
 *   changes emit `set_level`.
 *
 *   Schemas live next to the component so the catalog entry, the agent-side
 *   validator, and the renderer all consume a single source of truth.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Payload schema for a `DeviceTile` block.
 *
 * - `deviceId` — opaque identifier the agent uses to correlate events back
 *   to its device registry.
 * - `label` — human-readable name shown on the tile (e.g. "Salon lamp").
 * - `kind` — narrow device category, drives default icon + copy.
 * - `power` — current on/off state rendered by the `Switch`.
 * - `level` — optional 0..100 value shown as a `Slider`. Omit for devices
 *   without a dimmer / position (pure on/off plugs, simple switches).
 * - `icon` — optional icon hint (lucide icon name or image URL). The tile
 *   forwards it to `Card`'s `icon` prop, which accepts any `IconType`.
 *
 * @example
 * ```ts
 * const payload: DeviceTilePayload = {
 *   deviceId: 'light-salon',
 *   label: 'Salon lamp',
 *   kind: 'light',
 *   power: true,
 *   level: 40,
 *   icon: 'Lightbulb',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const DeviceTilePayloadSchema = v.object({
  deviceId: v.string(),
  label: v.string(),
  kind: v.picklist(['light', 'plug', 'blind', 'switch']),
  power: v.boolean(),
  level: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100))),
  icon: v.optional(v.string()),
});

/**
 * Parsed payload for a `DeviceTile` block.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type DeviceTilePayload = v.InferOutput<typeof DeviceTilePayloadSchema>;

/**
 * Action payload schema for `set_power`: user toggled the device on/off.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SetPowerActionSchema = v.object({
  deviceId: v.string(),
  power: v.boolean(),
});

/**
 * Action payload schema for `set_level`: user moved the dimmer / blind
 * position slider. `level` is a 0..100 percentage.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SetLevelActionSchema = v.object({
  deviceId: v.string(),
  level: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
});

/**
 * Action vocabulary for the `DeviceTile` widget, indexed by action name.
 * Consumed by the catalog's `validateEvent` to accept only these actions.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const DeviceTileActions = {
  set_power: SetPowerActionSchema,
  set_level: SetLevelActionSchema,
} as const;
