// packages/canvas/src/common/widgets/ConflictResolver/schema.ts

/**
 * @fileoverview ConflictResolver widget schemas
 * @description Valibot contracts for the ConflictResolver canvas widget.
 *   A ConflictResolver surfaces two (or more) calendar events that overlap
 *   on the same slot — "you have two things on Tuesday 14h" — and lets the
 *   user pick one to keep or reschedule one of them.
 *
 *   These schemas are the trust boundary between the agent-produced payload
 *   / user-produced event and the renderer. Anything that does not parse
 *   here never reaches the component.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * A single conflicting event in a `ConflictResolver` payload.
 *
 * - `eventId` — stable identifier echoed back in the emitted actions.
 * - `title` — human-readable event title shown on the card.
 * - `startISO` / `endISO` — ISO-8601 timestamps bracketing the event.
 * - `location` — optional free-text location (e.g. "Salon", "Zoom").
 * - `importance` — optional hint used by the agent to nudge the user
 *   toward keeping the more important event. Purely decorative; the
 *   decision remains with the user.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConflictEventSchema = v.object({
  eventId: v.string(),
  title: v.string(),
  startISO: v.string(),
  endISO: v.string(),
  location: v.optional(v.string()),
  importance: v.optional(v.picklist(['low', 'normal', 'high'])),
});

/**
 * Payload for a `ConflictResolver` canvas block.
 *
 * - `conflictId` — stable identifier for the conflict, echoed back in every
 *   action so the agent can correlate the resolution with the original
 *   detection.
 * - `message` — optional framing text shown above the event cards
 *   (e.g. "You have two things on Tuesday at 14:00 — pick one.").
 * - `events` — two or more conflicting events. At least two entries are
 *   required for the widget to make sense (there is no conflict with one).
 *
 * @example
 * ```ts
 * const payload: ConflictResolverPayload = {
 *   conflictId: 'conflict-tue-1400',
 *   message: 'You have two things on Tuesday at 14:00 — pick one.',
 *   events: [
 *     {
 *       eventId: 'evt-dentist',
 *       title: 'Dentist appointment',
 *       startISO: '2026-04-21T14:00:00+02:00',
 *       endISO: '2026-04-21T15:00:00+02:00',
 *       location: 'Dr. Martin, Paris 11e',
 *       importance: 'high',
 *     },
 *     {
 *       eventId: 'evt-standup',
 *       title: 'Team standup',
 *       startISO: '2026-04-21T14:00:00+02:00',
 *       endISO: '2026-04-21T14:30:00+02:00',
 *       location: 'Zoom',
 *       importance: 'normal',
 *     },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConflictResolverPayloadSchema = v.object({
  conflictId: v.string(),
  message: v.optional(v.string()),
  events: v.pipe(v.array(ConflictEventSchema), v.minLength(2)),
});

/**
 * Inferred TypeScript type for a validated `ConflictResolver` payload.
 * Widgets cast the `CanvasWidgetProps['payload']` (typed `unknown`) to
 * this type — the catalog guarantees the shape has already been parsed.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ConflictResolverPayload = v.InferOutput<
  typeof ConflictResolverPayloadSchema
>;

/**
 * Schema for the payload of the `pick` action emitted when the user
 * chooses to keep one of the conflicting events (implicitly dropping
 * the other).
 *
 * - `conflictId` — echoes the payload's conflictId.
 * - `eventId` — id of the event the user chose to keep.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const PickEventActionSchema = v.object({
  conflictId: v.string(),
  eventId: v.string(),
});

/**
 * Schema for the payload of the `reschedule` action emitted when the
 * user asks to move one of the conflicting events to a new start time.
 *
 * - `conflictId` — echoes the payload's conflictId.
 * - `eventId` — id of the event to reschedule.
 * - `newStartISO` — ISO-8601 timestamp for the new start time.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const RescheduleEventActionSchema = v.object({
  conflictId: v.string(),
  eventId: v.string(),
  newStartISO: v.string(),
});

/**
 * Action vocabulary for the `ConflictResolver` widget. Keyed by action
 * name, with each value validating that action's event payload.
 *
 * - `pick` — keep the named event (implicit drop of the siblings).
 * - `reschedule` — move the named event to `newStartISO`.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConflictResolverActions = {
  pick: PickEventActionSchema,
  reschedule: RescheduleEventActionSchema,
} as const;
