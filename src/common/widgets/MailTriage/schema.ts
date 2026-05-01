// packages/canvas/src/common/widgets/MailTriage/schema.ts

/**
 * @fileoverview MailTriage widget schemas
 * @description Valibot schemas + TypeScript types for the `MailTriage`
 *   private-surface canvas widget. Defines the render payload (an
 *   inbox-like table of email rows bound to an optional folder name) and
 *   the per-row action vocabulary the renderer emits back to the agent
 *   (`archive`, `reply`, `flag`, `open`).
 *
 *   These schemas are consumed by the canvas catalog to validate agent
 *   payloads at the trust boundary before rendering, and to validate user
 *   events before forwarding them to the agent. The agent owns the mail
 *   store — the widget only surfaces user intent.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

import { ProxiedImageUrlSchema } from '../../schemas';

/**
 * A single mail row shown in the triage table. `senderAvatarUrl` and
 * `flags` are optional because most incoming mail has neither a
 * box-resolved avatar nor prior annotations. `receivedISO` is a string
 * (not `v.isoDate()`): the schema only locks wire shape, and the renderer
 * formats locally.
 *
 * Supported flag keys are intentionally narrow — they mirror the visual
 * badges the widget can render. The agent is free to ignore the list and
 * emit `flag` events whose vocabulary only includes `important` and
 * `starred` (see `FlagMailActionSchema`), since `attachment` and
 * `calendar` are agent-observed facts rather than user-togglable states.
 *
 * @example
 * ```ts
 * const row: v.InferOutput<typeof MailRowSchema> = {
 *   rowId: 'msg-42',
 *   subject: 'Re: Canvas spec review',
 *   sender: 'So Hee Park',
 *   senderAvatarUrl: '/proxy/avatar/sohee.jpg',
 *   snippet: 'Left a few comments on the lifecycle section…',
 *   receivedISO: '2026-04-15T09:12:00.000Z',
 *   unread: true,
 *   flags: ['important', 'attachment'],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MailRowSchema = v.object({
  rowId: v.string(),
  subject: v.string(),
  sender: v.string(),
  senderAvatarUrl: v.optional(ProxiedImageUrlSchema),
  snippet: v.string(),
  receivedISO: v.string(),
  unread: v.boolean(),
  flags: v.optional(
    v.array(v.picklist(['important', 'starred', 'attachment', 'calendar']))
  ),
});

/**
 * Payload describing a folder-scoped list of mail rows.
 *
 * Private-surface widget: always member-authenticated, never rendered on
 * shared speaker profiles. `folder` is optional — absent means "the
 * default inbox view the agent selected"; present carries the folder
 * label the agent is showing (e.g. `"Inbox"`, `"Flagged"`).
 *
 * @example
 * ```ts
 * const payload: MailTriagePayload = {
 *   folder: 'Inbox',
 *   rows: [
 *     {
 *       rowId: 'msg-42',
 *       subject: 'Re: Canvas spec review',
 *       sender: 'So Hee Park',
 *       snippet: 'Left a few comments on the lifecycle section…',
 *       receivedISO: '2026-04-15T09:12:00.000Z',
 *       unread: true,
 *       flags: ['important'],
 *     },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MailTriagePayloadSchema = v.object({
  folder: v.optional(v.string()),
  rows: v.array(MailRowSchema),
});

/**
 * Inferred render payload for the `MailTriage` widget.
 *
 * @example
 * ```ts
 * function render(p: MailTriagePayload) { return p.rows.length; }
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type MailTriagePayload = v.InferOutput<typeof MailTriagePayloadSchema>;

/**
 * Action schema — user archived a mail row.
 *
 * @example
 * ```ts
 * emit('archive', { rowId: 'msg-42' });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ArchiveMailActionSchema = v.object({
  rowId: v.string(),
});

/**
 * Action schema — user asked to reply to a mail row. The widget does NOT
 * carry draft text; the agent reacts by pushing a `ReplyDraft` widget on
 * the next turn.
 *
 * @example
 * ```ts
 * emit('reply', { rowId: 'msg-42' });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ReplyMailActionSchema = v.object({
  rowId: v.string(),
});

/**
 * Action schema — user toggled a flag on a mail row. Restricted to the
 * two user-togglable flags (`important`, `starred`); the broader row-flag
 * vocabulary (`attachment`, `calendar`) is agent-observed and not
 * user-settable.
 *
 * @example
 * ```ts
 * emit('flag', { rowId: 'msg-42', flag: 'important' });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const FlagMailActionSchema = v.object({
  rowId: v.string(),
  flag: v.picklist(['important', 'starred']),
});

/**
 * Action schema — user asked to open a mail row (expand into a
 * `MailThread` view). The agent responds by rendering the thread as a
 * follow-up canvas block.
 *
 * @example
 * ```ts
 * emit('open', { rowId: 'msg-42' });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const OpenMailActionSchema = v.object({
  rowId: v.string(),
});

/**
 * Action vocabulary for `MailTriage`. Consumed by `registerWidget` and
 * used by the catalog to validate inbound events before forwarding them
 * to the agent.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'MailTriage',
 *   schema: MailTriagePayloadSchema,
 *   actions: MailTriageActions,
 *   surface: 'private',
 *   defaultLifetime: 'session',
 *   component: MailTriage,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MailTriageActions = {
  archive: ArchiveMailActionSchema,
  reply: ReplyMailActionSchema,
  flag: FlagMailActionSchema,
  open: OpenMailActionSchema,
} as const;
