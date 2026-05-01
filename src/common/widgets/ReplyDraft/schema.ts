// packages/canvas/src/common/widgets/ReplyDraft/schema.ts

/**
 * @fileoverview ReplyDraft widget schemas
 * @description Valibot contracts for the ReplyDraft canvas widget. A
 *   ReplyDraft is an agent-composed email reply that the user reviews,
 *   optionally edits, then approves, sends, or cancels before anything
 *   leaves the outbox. The widget is a human-in-the-loop gate between
 *   the agent's proposed text and the mail provider.
 *
 *   Schemas here are the trust boundary between agent-produced render
 *   payloads / user-produced action events and the renderer. Anything
 *   that does not parse here never reaches the component.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Render payload for the ReplyDraft widget.
 *
 * Describes a single proposed email reply that has NOT yet been sent.
 * `draftId` is stable across updates so the agent can refine an existing
 * draft without re-rendering a new block (e.g., after the user blurs the
 * textarea and emits an `edit` carrying the current buffer, the agent
 * can re-render the same `draftId` with an updated `body` or `warning`).
 *
 * - `draftId` — stable id echoed back in every action.
 * - `threadId` — optional mail thread id the reply belongs to. Purely
 *   informational for the renderer; the agent owns the provider-side
 *   mapping.
 * - `to` — recipients, one string per address (not parsed / resolved).
 * - `subject` — subject line shown above the body.
 * - `body` — the draft body. Rendered as `defaultValue` on the textarea
 *   (uncontrolled — React state is not the source of truth).
 * - `warning` — optional agent-flagged risk ("this reply mentions a
 *   price commitment"). When present, shown in an `Alert`.
 *
 * @example
 * ```ts
 * const payload: ReplyDraftPayload = {
 *   draftId: 'draft-2026-04-15-acme-quote',
 *   threadId: 'thread-acme-quote-001',
 *   to: ['buyer@acme.example'],
 *   subject: 'Re: Q2 quote',
 *   body: 'Hi Jamie,\n\nHappy to confirm the Q2 quote at 12,000 EUR.',
 *   warning: 'This reply mentions a price commitment (12,000 EUR).',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ReplyDraftPayloadSchema = v.object({
  draftId: v.string(),
  threadId: v.optional(v.string()),
  to: v.array(v.string()),
  subject: v.string(),
  body: v.string(),
  warning: v.optional(v.string()),
});

/**
 * Validated render payload for the ReplyDraft widget. Widgets cast the
 * framework-level `unknown` payload to this type — the catalog has
 * already parsed it against {@link ReplyDraftPayloadSchema}.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ReplyDraftPayload = v.InferOutput<typeof ReplyDraftPayloadSchema>;

/**
 * Event payload emitted when the user approves the draft. "Approve"
 * means the human has blessed the text but NOT asked for it to be sent
 * — the agent records human approval and waits for a subsequent `send`
 * (or drops the draft on the next turn).
 *
 * @example
 * ```ts
 * emit('approve', { draftId: payload.draftId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ApproveDraftActionSchema = v.object({
  draftId: v.string(),
});

/**
 * Event payload emitted when the textarea blurs with a body that may
 * have been edited by the user. Carries the full current buffer — the
 * agent overwrites its SSOT copy of the body with this value so any
 * subsequent re-render reflects the human's edits.
 *
 * The widget never holds edit state in React; blur is the only moment
 * the agent learns about user changes.
 *
 * @example
 * ```ts
 * emit('edit', {
 *   draftId: payload.draftId,
 *   body: event.currentTarget.value,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const EditDraftActionSchema = v.object({
  draftId: v.string(),
  body: v.string(),
});

/**
 * Event payload emitted when the user commits to sending the draft.
 * The agent is expected to hand the current draft body off to the mail
 * provider.
 *
 * @example
 * ```ts
 * emit('send', { draftId: payload.draftId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SendDraftActionSchema = v.object({
  draftId: v.string(),
});

/**
 * Event payload emitted when the user discards the draft. The agent
 * is expected to drop the draft and not send anything.
 *
 * @example
 * ```ts
 * emit('cancel', { draftId: payload.draftId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const CancelDraftActionSchema = v.object({
  draftId: v.string(),
});

/**
 * Action vocabulary for the ReplyDraft widget — the map registered with
 * the catalog so `validateEvent` can check each incoming user action
 * against the right per-action schema.
 *
 * - `approve` — human-blessed, not yet sent.
 * - `edit` — textarea blur; carries the full current body.
 * - `send` — commit and hand off to the mail provider.
 * - `cancel` — discard the draft.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'ReplyDraft',
 *   schema: ReplyDraftPayloadSchema,
 *   actions: ReplyDraftActions,
 *   surface: 'private',
 *   defaultLifetime: 'session',
 *   component: ReplyDraft,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ReplyDraftActions = {
  approve: ApproveDraftActionSchema,
  edit: EditDraftActionSchema,
  send: SendDraftActionSchema,
  cancel: CancelDraftActionSchema,
} as const;
