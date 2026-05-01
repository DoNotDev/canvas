// packages/canvas/src/common/widgets/DaySchedule/schema.ts

/**
 * @fileoverview DaySchedule widget schemas
 * @description Valibot schemas + TypeScript types for the `DaySchedule`
 *   household canvas widget. Defines the render payload (ISO date + ordered
 *   list of events) and the action vocabulary (`open_event`, `mark_done`)
 *   the renderer may emit back to the agent.
 *
 *   These schemas are consumed by the canvas catalog to validate agent
 *   payloads at the trust boundary before rendering, and to validate user
 *   events before forwarding them to the agent.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * One event inside a `DaySchedule` payload.
 *
 * - `eventId` — opaque identifier the agent uses to correlate events back
 *   to its calendar backend.
 * - `title` — human-readable event name.
 * - `startISO` / `endISO` — ISO-8601 timestamps. `endISO` optional for
 *   instant reminders.
 * - `kind` — coarse category, drives the badge variant.
 * - `location` — optional free-text location.
 * - `done` — optional completion flag (drives the "done" affordance).
 *
 * @example
 * ```ts
 * const e: v.InferOutput<typeof ScheduleEventSchema> = {
 *   eventId: 'evt-42',
 *   title: 'Pick up Flora',
 *   startISO: '2026-04-15T16:30:00.000Z',
 *   kind: 'kid',
 *   done: false,
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ScheduleEventSchema = v.object({
  eventId: v.string(),
  title: v.string(),
  startISO: v.string(),
  endISO: v.optional(v.string()),
  kind: v.picklist(['meeting', 'personal', 'kid', 'errand', 'other']),
  location: v.optional(v.string()),
  done: v.optional(v.boolean()),
});

/**
 * Parsed shape of a single schedule event.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ScheduleEvent = v.InferOutput<typeof ScheduleEventSchema>;

/**
 * Payload describing a full day's schedule: the target ISO date plus the
 * ordered events for that day.
 *
 * Ordering is the agent's responsibility — the renderer displays events in
 * the order supplied and never re-sorts.
 *
 * @example
 * ```ts
 * const payload: DaySchedulePayload = {
 *   dateISO: '2026-04-15',
 *   events: [
 *     {
 *       eventId: 'evt-1',
 *       title: 'Stand-up',
 *       startISO: '2026-04-15T09:00:00.000Z',
 *       endISO: '2026-04-15T09:15:00.000Z',
 *       kind: 'meeting',
 *     },
 *     {
 *       eventId: 'evt-2',
 *       title: 'Pick up Flora',
 *       startISO: '2026-04-15T16:30:00.000Z',
 *       kind: 'kid',
 *       location: 'School',
 *       done: false,
 *     },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const DaySchedulePayloadSchema = v.object({
  dateISO: v.string(),
  events: v.array(ScheduleEventSchema),
});

/**
 * Inferred render payload for the `DaySchedule` widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type DaySchedulePayload = v.InferOutput<typeof DaySchedulePayloadSchema>;

/**
 * Action schema — user tapped an event card to open / view it.
 *
 * @example
 * ```ts
 * emit('open_event', { eventId: event.eventId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const OpenEventActionSchema = v.object({
  eventId: v.string(),
});

/**
 * Action schema — user toggled the "done" affordance on an event. `done`
 * is the NEW value the user requested (not a toggle-delta).
 *
 * @example
 * ```ts
 * emit('mark_done', { eventId: event.eventId, done: true });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MarkDoneActionSchema = v.object({
  eventId: v.string(),
  done: v.boolean(),
});

/**
 * Action vocabulary for `DaySchedule`. Consumed by `registerWidget` and
 * used by the catalog to validate inbound events before forwarding them
 * to the agent.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'DaySchedule',
 *   schema: DaySchedulePayloadSchema,
 *   actions: DayScheduleActions,
 *   surface: 'household',
 *   defaultLifetime: 'persistent',
 *   component: DaySchedule,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const DayScheduleActions = {
  open_event: OpenEventActionSchema,
  mark_done: MarkDoneActionSchema,
} as const;
