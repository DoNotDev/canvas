// packages/canvas/src/common/widgets/WeekPlanner/schema.ts

/**
 * @fileoverview WeekPlanner widget schemas
 * @description Valibot contracts for the `WeekPlanner` canvas widget. The
 *   agent emits a week starting at `weekStartISO` together with a list of
 *   hour-granular slots describing what is busy and what is free. Tapping a
 *   slot emits either `select_slot` (free cell) or `open_event` (busy cell
 *   that carries an `eventId`).
 *
 *   Schemas are the trust boundary between agent-produced payloads /
 *   user-produced events and the renderer. Invalid shapes never reach the
 *   component.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * A single cell within a `WeekPlanner` payload — one hour on one day.
 *
 * - `dateISO` — ISO `YYYY-MM-DD` of the day column this slot belongs to.
 * - `hour` — 0..23 hour-of-day the slot anchors on.
 * - `label` — optional short description shown on the cell (e.g. the event
 *   title for a busy slot). The widget does not synthesize one.
 * - `busy` — optional flag marking the slot as taken. Defaults to free.
 * - `eventId` — optional stable id of the underlying event. Presence +
 *   `busy: true` promotes the cell to an `open_event` emitter instead of a
 *   `select_slot` emitter.
 *
 * @example
 * ```ts
 * const slot: v.InferOutput<typeof WeekSlotSchema> = {
 *   dateISO: '2026-04-16',
 *   hour: 14,
 *   label: 'Dentist',
 *   busy: true,
 *   eventId: 'evt-7821',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const WeekSlotSchema = v.object({
  dateISO: v.string(),
  hour: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(23)),
  label: v.optional(v.string()),
  busy: v.optional(v.boolean()),
  eventId: v.optional(v.string()),
});

/**
 * Payload of a `WeekPlanner` canvas block.
 *
 * - `weekStartISO` — ISO `YYYY-MM-DD` of the first day column. The widget
 *   derives the remaining 6 day columns by adding 1..6 days.
 * - `slots` — flat list of `WeekSlotSchema` entries. Slots whose `dateISO`
 *   falls outside the 7-day window are ignored by the renderer.
 * - `hourRange` — optional `[start, end)` hour window bounding the rows of
 *   each day column. Omitted → the widget shows every hour that appears in
 *   `slots` (or a compact empty state when `slots` is empty).
 *
 * @example
 * ```ts
 * const payload: WeekPlannerPayload = {
 *   weekStartISO: '2026-04-13',
 *   hourRange: { start: 8, end: 20 },
 *   slots: [
 *     { dateISO: '2026-04-14', hour: 9,  busy: true,  label: 'Standup',   eventId: 'evt-1' },
 *     { dateISO: '2026-04-14', hour: 14, busy: false, label: 'Available'                    },
 *     { dateISO: '2026-04-16', hour: 18, busy: true,  label: 'Dentist',   eventId: 'evt-2' },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const WeekPlannerPayloadSchema = v.object({
  weekStartISO: v.string(),
  slots: v.array(WeekSlotSchema),
  hourRange: v.optional(
    v.object({
      start: v.pipe(v.number(), v.integer()),
      end: v.pipe(v.number(), v.integer()),
    })
  ),
});

/**
 * Inferred payload type for the `WeekPlanner` widget. Widgets cast their
 * incoming `payload: unknown` to this type after the catalog has already
 * parsed it against `WeekPlannerPayloadSchema`.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type WeekPlannerPayload = v.InferOutput<typeof WeekPlannerPayloadSchema>;

/**
 * Payload of a `select_slot` event emitted when the user taps an empty
 * (non-busy, no `eventId`) cell. The agent uses it to propose creating a
 * new block at that coordinate.
 *
 * @example
 * ```ts
 * emit('select_slot', { dateISO: '2026-04-16', hour: 10 });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SelectSlotActionSchema = v.object({
  dateISO: v.string(),
  hour: v.pipe(v.number(), v.integer()),
});

/**
 * Payload of an `open_event` event emitted when the user taps a busy cell
 * that carries an `eventId`. The agent uses it to surface the event's
 * detail / handoff the follow-up turn.
 *
 * @example
 * ```ts
 * emit('open_event', { eventId: 'evt-7821' });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const OpenEventActionSchema = v.object({
  eventId: v.string(),
});

/**
 * Action vocabulary for the `WeekPlanner` widget — registered with the
 * catalog so `validateEvent` can route incoming events to the right schema.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'WeekPlanner',
 *   schema: WeekPlannerPayloadSchema,
 *   actions: WeekPlannerActions,
 *   surface: 'household',
 *   defaultLifetime: 'session',
 *   component: WeekPlanner,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const WeekPlannerActions = {
  select_slot: SelectSlotActionSchema,
  open_event: OpenEventActionSchema,
} as const;
