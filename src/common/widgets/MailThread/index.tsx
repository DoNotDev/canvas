// packages/canvas/src/common/widgets/MailThread/index.tsx

/**
 * @fileoverview MailThread canvas widget
 * @description Private-surface widget rendering the expanded view of a
 *   single email thread — subject heading followed by a vertical stack of
 *   message cards (sender + avatar + timestamp + body), and a trailing
 *   action bar with Reply (primary), Forward (outline), Archive
 *   (outline).
 *
 *   The component never calls the mail backend directly — every user
 *   interaction emits a catalog-validated action back to the agent via
 *   the `emit` prop supplied by `CanvasHost`. Quoted messages render as
 *   `Blockquote` to visually distinguish inline prior-message quotes.
 *
 *   Registered on the `private` surface with an `ephemeral` default
 *   lifetime — a thread view lives only until the turn resolves or the
 *   user navigates away.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import {
  Avatar,
  Blockquote,
  Button,
  ButtonGroup,
  Card,
  Stack,
  Text,
} from '@donotdev/components';

import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';
import {
  MailThreadActions,
  MailThreadPayloadSchema,
  type MailMessage,
  type MailThreadPayload,
} from './schema';

/**
 * Compute a two-letter initials fallback for the `Avatar` of a sender
 * when `senderAvatarUrl` is absent. Uses the first letter of the first
 * two whitespace-separated tokens so "So Hee" becomes "SH" and
 * "so.hee@example.com" becomes "S".
 */
function senderInitials(sender: string): string {
  const tokens = sender.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '?';
  const first = tokens[0]!.charAt(0).toUpperCase();
  const second = tokens[1]?.charAt(0).toUpperCase() ?? '';
  return `${first}${second}` || '?';
}

/**
 * Format an ISO-8601 timestamp via `toLocaleString()`. Falls back to the
 * raw ISO string when the input is not parseable — the schema only
 * guarantees `sentISO` is a string.
 */
function formatSentAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

/**
 * Render a single message row — avatar + (sender / timestamp) + body.
 * Extracted for readability; not exported.
 */
const MessageRow: FC<{ message: MailMessage }> = ({ message }) => {
  const initials = senderInitials(message.sender);
  const sentAt = formatSentAt(message.sentISO);

  return (
    <Card>
      <Stack direction="row" gap="medium" align="start">
        <Avatar
          src={message.senderAvatarUrl}
          fallback={initials}
          alt={message.sender}
        />
        <Stack direction="column" gap="tight">
          <Stack direction="row" gap="tight" align="center">
            <Text as="span" variant="primary">
              {message.sender}
            </Text>
            <Text as="span" variant="muted" level="caption">
              {sentAt}
            </Text>
          </Stack>

          {message.quoted ? (
            <Blockquote>{message.body}</Blockquote>
          ) : (
            <Text as="p">{message.body}</Text>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

/**
 * MailThread — subject heading, a vertical stack of message cards, and a
 * trailing action bar.
 *
 * Payload is validated by the catalog before the component mounts, so the
 * cast to `MailThreadPayload` is safe. Empty `messages` arrays render
 * just the subject + action bar (no empty-state placeholder — the
 * existence of a thread implies at least one message upstream).
 *
 * Emits:
 * - `reply` with `{ threadId }` — user wants to reply.
 * - `forward` with `{ threadId }` — user wants to forward.
 * - `archive` with `{ threadId }` — user wants to archive the thread.
 *
 * @example
 * ```tsx
 * <MailThread
 *   payload={{
 *     threadId: 'thr-1',
 *     subject: 'Dinner reservation confirmed',
 *     messages: [
 *       {
 *         messageId: 'msg-1',
 *         sender: 'Le Baratin',
 *         sentISO: '2026-04-15T18:04:00+02:00',
 *         body: 'Your table for 2 on Saturday at 19:30 is confirmed.',
 *       },
 *     ],
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MailThread: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const thread = payload as MailThreadPayload;

  return (
    <Stack direction="column" gap="medium">
      <Text as="h2" level="h2">
        {thread.subject}
      </Text>

      <Stack direction="column" gap="tight">
        {thread.messages.map((message) => (
          <MessageRow key={message.messageId} message={message} />
        ))}
      </Stack>

      <ButtonGroup
        aria-label={`${thread.subject} thread actions`}
        variant="outline"
      >
        <Button
          variant="primary"
          icon="Reply"
          onClick={() => emit('reply', { threadId: thread.threadId })}
        >
          Reply
        </Button>
        <Button
          variant="outline"
          icon="Forward"
          onClick={() => emit('forward', { threadId: thread.threadId })}
        >
          Forward
        </Button>
        <Button
          variant="outline"
          icon="Archive"
          onClick={() => emit('archive', { threadId: thread.threadId })}
        >
          Archive
        </Button>
      </ButtonGroup>
    </Stack>
  );
};

registerWidget({
  kind: 'MailThread',
  schema: MailThreadPayloadSchema,
  actions: MailThreadActions,
  surface: 'private',
  defaultLifetime: 'ephemeral',
  component: MailThread,
});
