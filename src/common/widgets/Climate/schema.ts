// packages/canvas/src/common/widgets/Climate/schema.ts

/**
 * @fileoverview Climate widget schemas
 * @description Valibot schemas for the Climate canvas widget — thermostat
 *   set point + current reading for a household zone. Lives in the
 *   `household` surface with `ephemeral` default lifetime.
 *
 *   Payload validation is enforced by the catalog boundary
 *   (`validateBlock`). Action payloads are enforced by `validateEvent`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Thermostat operating mode.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
const ClimateModeSchema = v.picklist(['heat', 'cool', 'auto', 'off']);

/**
 * Render payload for the Climate widget.
 *
 * Describes a single thermostat zone: its current reading, its target set
 * point, the allowed range, the current mode, and an optional humidity
 * reading (0-100%).
 *
 * @example
 * ```ts
 * const payload: ClimatePayload = {
 *   zoneId: 'salon',
 *   zoneName: 'Salon',
 *   currentTemp: 19.4,
 *   targetTemp: 21,
 *   unit: 'C',
 *   minTarget: 15,
 *   maxTarget: 28,
 *   mode: 'heat',
 *   humidity: 42,
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ClimatePayloadSchema = v.object({
  zoneId: v.string(),
  zoneName: v.string(),
  currentTemp: v.number(),
  targetTemp: v.number(),
  unit: v.picklist(['C', 'F']),
  minTarget: v.number(),
  maxTarget: v.number(),
  mode: ClimateModeSchema,
  humidity: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100))),
});

/**
 * Validated render payload for the Climate widget.
 *
 * @example
 * ```ts
 * const payload = props.payload as ClimatePayload;
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ClimatePayload = v.InferOutput<typeof ClimatePayloadSchema>;

/**
 * Event payload emitted when the user changes the target temperature.
 *
 * @example
 * ```ts
 * emit('set_target', { zoneId: 'salon', targetTemp: 22 });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SetTargetActionSchema = v.object({
  zoneId: v.string(),
  targetTemp: v.number(),
});

/**
 * Event payload emitted when the user switches the thermostat mode.
 *
 * @example
 * ```ts
 * emit('set_mode', { zoneId: 'salon', mode: 'cool' });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SetModeActionSchema = v.object({
  zoneId: v.string(),
  mode: ClimateModeSchema,
});

/**
 * Action vocabulary for the Climate widget — the map registered with the
 * catalog so `validateEvent` can check each incoming user action against
 * the right per-action schema.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'Climate',
 *   schema: ClimatePayloadSchema,
 *   actions: ClimateActions,
 *   surface: 'household',
 *   defaultLifetime: 'ephemeral',
 *   component: Climate,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ClimateActions = {
  set_target: SetTargetActionSchema,
  set_mode: SetModeActionSchema,
} as const;
