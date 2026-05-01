// packages/canvas/src/common/widgets/Confirmation/schema.ts

/**
 * @fileoverview Confirmation widget schemas
 * @description Valibot schemas for the `Confirmation` canvas widget — a
 *   generic "are you sure?" blocker surfaced before a destructive or
 *   otherwise consequential tool call ("send email", "archive 47 items",
 *   "delete calendar event").
 *
 *   Lives on the `meta` surface with an `ephemeral` default lifetime: the
 *   prompt exists only until the user confirms or cancels. Payload is
 *   validated by the catalog boundary (`validateBlock`); action payloads
 *   are validated by `validateEvent`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Render payload for the `Confirmation` widget.
 *
 * - `confirmationId` — opaque identifier the agent uses to correlate the
 *   user's response back to the pending tool call.
 * - `title` — short prompt shown as the dialog heading
 *   (e.g. "Send this email?").
 * - `message` — explanatory body shown below the title (e.g. "This will
 *   send the draft to 3 recipients.").
 * - `severity` — visual tone; drives the Confirm button's theme:
 *   `destructive` -> destructive, `warning` -> warning, `info` (default)
 *   -> primary. Informational from the agent's perspective.
 * - `confirmLabel` — optional override for the Confirm button label;
 *   defaults to `"Confirm"` at render time.
 * - `cancelLabel` — optional override for the Cancel button label;
 *   defaults to `"Cancel"` at render time.
 *
 * @example
 * ```ts
 * const payload: ConfirmationPayload = {
 *   confirmationId: 'archive-batch-2026-04-15',
 *   title: 'Archive 47 emails?',
 *   message: 'This will move 47 messages from Inbox to Archive.',
 *   severity: 'warning',
 *   confirmLabel: 'Archive all',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConfirmationPayloadSchema = v.object({
  confirmationId: v.string(),
  title: v.string(),
  message: v.string(),
  severity: v.optional(v.picklist(['info', 'warning', 'destructive'])),
  confirmLabel: v.optional(v.string()),
  cancelLabel: v.optional(v.string()),
});

/**
 * Validated render payload for the `Confirmation` widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ConfirmationPayload = v.InferOutput<
  typeof ConfirmationPayloadSchema
>;

/**
 * Event payload emitted when the user approves the pending tool call. The
 * `confirmationId` echoes the one the agent supplied on render so the
 * agent can resume the correct pending tool.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConfirmActionSchema = v.object({
  confirmationId: v.string(),
});

/**
 * Event payload emitted when the user cancels the pending tool call.
 * Carries only the `confirmationId`; the agent is expected to drop the
 * tool call silently.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const CancelActionSchema = v.object({
  confirmationId: v.string(),
});

/**
 * Action vocabulary for the `Confirmation` widget — the map registered
 * with the catalog so `validateEvent` can check each incoming user action
 * against the right per-action schema.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConfirmationActions = {
  confirm: ConfirmActionSchema,
  cancel: CancelActionSchema,
} as const;
