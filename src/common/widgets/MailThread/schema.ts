// packages/canvas/src/common/widgets/MailThread/schema.ts

/**
 * @fileoverview MailThread widget schemas
 * @description Valibot contracts for the MailThread canvas widget. A
 *   MailThread is the expanded view of a single email conversation — an
 *   ordered sequence of messages (sender, body, timestamp) with reply,
 *   forward and archive affordances. Private surface, member-scoped.
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

import { ProxiedImageUrlSchema } from '../../schemas';

/**
 * A single message inside a MailThread.
 *
 * - `messageId` — stable id (provenance, not rendered).
 * - `sender` — free-text display name or address (e.g., "So Hee",
 *   "so.hee@example.com"). Not resolved here.
 * - `senderAvatarUrl` — optional avatar URL. `ProxiedImageUrlSchema`
 *   rejects anything that is not a `/proxy/...` path or an inline
 *   `data:image/...` URI; external CDNs are not reachable. When absent the
 *   renderer falls back to sender initials.
 * - `sentISO` — ISO-8601 timestamp shown via `toLocaleString()` in the
 *   user's locale.
 * - `body` — plain-text body. Rendered as `Text` by default, or as a
 *   `Blockquote` when `quoted` is true (e.g., for prior-message quotes
 *   inlined in a reply).
 * - `quoted` — when true the renderer wraps `body` in a `Blockquote` to
 *   visually distinguish quoted prior content from the current author's
 *   new text.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MailMessageSchema = v.object({
  messageId: v.string(),
  sender: v.string(),
  senderAvatarUrl: v.optional(ProxiedImageUrlSchema),
  sentISO: v.string(),
  body: v.string(),
  quoted: v.optional(v.boolean()),
});

/**
 * Validated message shape. Consumers cast individual messages to this type
 * after the parent payload has been parsed.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type MailMessage = v.InferOutput<typeof MailMessageSchema>;

/**
 * Render payload for the MailThread widget.
 *
 * Describes one expanded email conversation. `threadId` is stable across
 * updates so the agent can append a new message (e.g., a just-sent reply)
 * by re-rendering the same block without a teardown.
 *
 * - `threadId` — stable id echoed back in every action.
 * - `subject` — thread subject, rendered as the heading.
 * - `messages` — ordered list (oldest first). Empty lists are legal but
 *   render only the subject + actions.
 *
 * @example
 * ```ts
 * const payload: MailThreadPayload = {
 *   threadId: 'thr-2026-04-15-dinner',
 *   subject: 'Dinner reservation confirmed',
 *   messages: [
 *     {
 *       messageId: 'msg-1',
 *       sender: 'Le Baratin',
 *       sentISO: '2026-04-15T18:04:00+02:00',
 *       body: 'Your table for 2 on Saturday at 19:30 is confirmed.',
 *     },
 *     {
 *       messageId: 'msg-2',
 *       sender: 'Rodolphe',
 *       sentISO: '2026-04-15T18:10:00+02:00',
 *       body: '> Your table for 2 on Saturday at 19:30 is confirmed.',
 *       quoted: true,
 *     },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MailThreadPayloadSchema = v.object({
  threadId: v.string(),
  subject: v.string(),
  messages: v.array(MailMessageSchema),
});

/**
 * Validated render payload for the MailThread widget. Widgets cast the
 * framework-level `unknown` payload to this type — the catalog has
 * already parsed it against {@link MailThreadPayloadSchema}.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type MailThreadPayload = v.InferOutput<typeof MailThreadPayloadSchema>;

/**
 * Event payload emitted when the user taps "Reply". The agent is
 * expected to open a ReplyDraft flow (or equivalent) for the given
 * thread.
 *
 * @example
 * ```ts
 * emit('reply', { threadId: payload.threadId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ReplyThreadActionSchema = v.object({
  threadId: v.string(),
});

/**
 * Event payload emitted when the user taps "Archive". The agent is
 * expected to move the thread out of the active inbox.
 *
 * @example
 * ```ts
 * emit('archive', { threadId: payload.threadId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ArchiveThreadActionSchema = v.object({
  threadId: v.string(),
});

/**
 * Event payload emitted when the user taps "Forward". The agent is
 * expected to open a forwarding flow for the given thread.
 *
 * @example
 * ```ts
 * emit('forward', { threadId: payload.threadId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ForwardThreadActionSchema = v.object({
  threadId: v.string(),
});

/**
 * Action vocabulary for the MailThread widget — the map registered with
 * the catalog so `validateEvent` can check each incoming user action
 * against the right per-action schema.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'MailThread',
 *   schema: MailThreadPayloadSchema,
 *   actions: MailThreadActions,
 *   surface: 'private',
 *   defaultLifetime: 'ephemeral',
 *   component: MailThread,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MailThreadActions = {
  reply: ReplyThreadActionSchema,
  archive: ArchiveThreadActionSchema,
  forward: ForwardThreadActionSchema,
} as const;
