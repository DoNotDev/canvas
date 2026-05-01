// packages/canvas/src/common/widgets/EventDraft/schema.ts

/**
 * @fileoverview EventDraft widget schemas
 * @description Valibot contracts for the EventDraft canvas widget. An
 *   EventDraft is a proposed calendar event the agent shows the user for
 *   human-in-the-loop approval before it is actually written to the
 *   household calendar. The user can confirm, cancel, or request an edit
 *   flow.
 *
 *   Schemas here are the trust boundary between agent-produced payloads /
 *   user-produced events and the renderer. Anything that does not parse
 *   here never reaches the component.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Render payload for the EventDraft widget.
 *
 * Describes a single proposed calendar event that has NOT yet been
 * committed to any calendar. `draftId` is stable across updates so the
 * agent can refine an existing draft without re-rendering a new block.
 *
 * - `draftId` — stable id echoed back in every action.
 * - `title` — event title (e.g., "Dinner with So Hee").
 * - `startISO` / `endISO` — ISO-8601 date-time strings. Displayed with
 *   `toLocaleString()` so the user sees them in their locale.
 * - `location` — optional free-text location.
 * - `attendees` — optional list of free-text attendees (names or emails,
 *   not resolved here).
 * - `description` — optional free-text notes.
 * - `calendarId` — optional hint about which household calendar the
 *   event would be written to on confirm.
 *
 * @example
 * ```ts
 * const payload: EventDraftPayload = {
 *   draftId: 'draft-2026-04-15-dinner',
 *   title: 'Dinner with So Hee',
 *   startISO: '2026-04-18T19:30:00+02:00',
 *   endISO: '2026-04-18T21:30:00+02:00',
 *   location: 'Le Baratin, Paris 20e',
 *   attendees: ['Rodolphe', 'So Hee'],
 *   description: 'Reservation under Ambroise',
 *   calendarId: 'household',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const EventDraftPayloadSchema = v.object({
  draftId: v.string(),
  title: v.string(),
  startISO: v.string(),
  endISO: v.string(),
  location: v.optional(v.string()),
  attendees: v.optional(v.array(v.string())),
  description: v.optional(v.string()),
  calendarId: v.optional(v.string()),
});

/**
 * Validated render payload for the EventDraft widget. Widgets cast the
 * framework-level `unknown` payload to this type — the catalog has
 * already parsed it against {@link EventDraftPayloadSchema}.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type EventDraftPayload = v.InferOutput<typeof EventDraftPayloadSchema>;

/**
 * Event payload emitted when the user confirms the proposed event. The
 * agent is expected to write the event to the calendar on receipt.
 *
 * @example
 * ```ts
 * emit('confirm', { draftId: payload.draftId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConfirmEventDraftActionSchema = v.object({
  draftId: v.string(),
});

/**
 * Event payload emitted when the user cancels the proposed event. The
 * agent is expected to drop the draft and not write anything.
 *
 * @example
 * ```ts
 * emit('cancel', { draftId: payload.draftId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const CancelEventDraftActionSchema = v.object({
  draftId: v.string(),
});

/**
 * Event payload emitted when the user asks to edit the draft. The
 * renderer does NOT provide an inline form in v1 — it emits this event
 * with an empty `changes` object and the agent re-renders with an
 * editable flow (or a turn-level back-and-forth).
 *
 * `changes` is a partial patch: every field is optional. Empty object
 * means "open an edit affordance"; populated fields mean "apply this
 * patch to the draft".
 *
 * @example
 * ```ts
 * // v1 — widget emits an empty patch to request the edit flow.
 * emit('edit', { draftId: payload.draftId, changes: {} });
 *
 * // Future — a patch-style update.
 * emit('edit', {
 *   draftId: payload.draftId,
 *   changes: { startISO: '2026-04-18T20:00:00+02:00' },
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const EditEventDraftActionSchema = v.object({
  draftId: v.string(),
  changes: v.object({
    title: v.optional(v.string()),
    startISO: v.optional(v.string()),
    endISO: v.optional(v.string()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
  }),
});

/**
 * Action vocabulary for the EventDraft widget — the map registered with
 * the catalog so `validateEvent` can check each incoming user action
 * against the right per-action schema.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'EventDraft',
 *   schema: EventDraftPayloadSchema,
 *   actions: EventDraftActions,
 *   surface: 'household',
 *   defaultLifetime: 'ephemeral',
 *   component: EventDraft,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const EventDraftActions = {
  confirm: ConfirmEventDraftActionSchema,
  cancel: CancelEventDraftActionSchema,
  edit: EditEventDraftActionSchema,
} as const;
