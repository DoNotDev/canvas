// packages/canvas/src/common/widgets/WeatherCard/schema.ts

/**
 * @fileoverview WeatherCard widget schemas
 * @description Valibot schemas for the WeatherCard canvas widget — a
 *   read-only household-surface display of current weather conditions and
 *   optional hourly / daily forecasts for a single location.
 *
 *   The widget has no user actions — the agent is the sole source of
 *   truth; the canvas host simply re-renders when a fresh payload arrives.
 *   `WeatherCardActions` is intentionally an empty object so the catalog's
 *   `validateEvent` correctly rejects every incoming event as unknown.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * A single weather observation or forecast slot — either the current
 * reading, one hour of the hourly forecast, or one day of the daily
 * forecast. The semantic difference is carried by the array the slot
 * lives in (`current` / `hourly` / `daily`), not by the shape itself.
 *
 * `timeISO` is an ISO-8601 timestamp; for hourly slots it pinpoints the
 * hour, for daily slots it pinpoints the day (any consistent time of day).
 *
 * `condition` is a closed vocabulary so the renderer can map each value
 * to a lucide icon without defensive fallbacks.
 *
 * @example
 * ```ts
 * const slot: WeatherSlot = {
 *   timeISO: '2026-04-15T14:00:00Z',
 *   tempC: 18.4,
 *   condition: 'partly-cloudy',
 *   precipitationPct: 20,
 *   windKph: 12,
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const WeatherSlotSchema = v.object({
  timeISO: v.string(),
  tempC: v.number(),
  condition: v.picklist([
    'sunny',
    'cloudy',
    'rain',
    'snow',
    'storm',
    'fog',
    'clear-night',
    'partly-cloudy',
  ]),
  precipitationPct: v.optional(
    v.pipe(v.number(), v.minValue(0), v.maxValue(100))
  ),
  windKph: v.optional(v.number()),
});

/**
 * Inferred output type for a single `WeatherSlotSchema` parse.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type WeatherSlot = v.InferOutput<typeof WeatherSlotSchema>;

/**
 * Render payload for the WeatherCard widget.
 *
 * - `location` — human-readable place name (e.g. `"Paris, FR"`).
 * - `current` — the now-reading, always present.
 * - `hourly` — optional hour-by-hour forecast (typically next 12–24h).
 * - `daily` — optional day-by-day forecast (typically next 5–7 days).
 * - `unit` — display unit for temperatures. `'C'` (default) keeps
 *   payload values as-is; `'F'` converts at render time via
 *   `Math.round(c * 9/5 + 32)`. The schema always stores Celsius so the
 *   agent never has to branch on unit when building the payload.
 *
 * @example
 * ```ts
 * const payload: WeatherCardPayload = {
 *   location: 'Paris, FR',
 *   current: {
 *     timeISO: '2026-04-15T14:00:00Z',
 *     tempC: 18.4,
 *     condition: 'partly-cloudy',
 *     precipitationPct: 10,
 *     windKph: 12,
 *   },
 *   hourly: [
 *     { timeISO: '2026-04-15T15:00:00Z', tempC: 18.9, condition: 'partly-cloudy' },
 *     { timeISO: '2026-04-15T16:00:00Z', tempC: 19.2, condition: 'sunny' },
 *   ],
 *   daily: [
 *     { timeISO: '2026-04-16T12:00:00Z', tempC: 20, condition: 'sunny' },
 *     { timeISO: '2026-04-17T12:00:00Z', tempC: 16, condition: 'rain' },
 *   ],
 *   unit: 'C',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const WeatherCardPayloadSchema = v.object({
  location: v.string(),
  current: WeatherSlotSchema,
  hourly: v.optional(v.array(WeatherSlotSchema)),
  daily: v.optional(v.array(WeatherSlotSchema)),
  unit: v.optional(v.picklist(['C', 'F'])),
});

/**
 * Validated render payload for the WeatherCard widget.
 *
 * @example
 * ```ts
 * const payload = props.payload as WeatherCardPayload;
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type WeatherCardPayload = v.InferOutput<typeof WeatherCardPayloadSchema>;

/**
 * Action vocabulary for the WeatherCard widget.
 *
 * Intentionally empty: WeatherCard is read-only. The agent pushes fresh
 * payloads; the widget never emits. Keeping the object typed as `{}` (not
 * `Record<string, AnyValibotSchema>`) lets the catalog's `validateEvent`
 * reject every action with an "unknown action" diagnostic.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'WeatherCard',
 *   schema: WeatherCardPayloadSchema,
 *   actions: WeatherCardActions,
 *   surface: 'household',
 *   defaultLifetime: 'ephemeral',
 *   component: WeatherCard,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const WeatherCardActions = {} as const;
