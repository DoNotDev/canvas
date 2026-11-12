// packages/canvas/src/common/widgets/MailTriage/index.tsx

/**
 * @fileoverview MailTriage canvas widget
 * @description Private-surface widget rendering an inbox-like table of
 *   email rows with per-row actions (archive, reply, flag, open). The
 *   Sender column pairs an `Avatar` with the sender name; the Subject
 *   column stacks the subject above a muted snippet and any flag badges;
 *   the Received column shows a locale-formatted time; the Actions column
 *   hosts four `ActionButton`s.
 *
 *   The component never mutates the mailbox directly — every user
 *   interaction emits a catalog-validated action back to the agent via
 *   the `emit` prop supplied by `CanvasHost`. `ActionButton` is used
 *   (rather than raw `Button`) so each click shows a brief busy state
 *   while the event is dispatched — important for touch surfaces where
 *   double-taps would otherwise double-emit archive/reply.
 *
 *   Self-registers with the canvas catalog at module import time so the
 *   `widgets/index.ts` barrel only has to add `import './MailTriage';`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC, ReactElement } from 'react';

import {
  ActionButton,
  Avatar,
  Badge,
  DataTable,
  Stack,
  Text,
  type BadgeVariant,
  type TableColumn,
} from '@donotdev/components';
import { useTranslation } from '@donotdev/core';

import {
  MailTriageActions,
  MailTriagePayloadSchema,
  type MailTriagePayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/** A flag value carried by `MailRow.flags`. */
type MailFlag = 'important' | 'starred' | 'attachment' | 'calendar';

/** A single row as consumed by the renderer (inferred off the payload). */
type MailRow = MailTriagePayload['rows'][number];

/**
 * Map a mail flag to a `Badge` variant. Kept deliberately narrow so the
 * badge palette lines up with the rest of the catalog (meeting = primary,
 * warning for high-signal flags, muted for agent-observed metadata).
 */
function badgeVariantFor(flag: MailFlag): BadgeVariant {
  switch (flag) {
    case 'important':
      return 'warning';
    case 'starred':
      return 'accent';
    case 'attachment':
      return 'muted';
    case 'calendar':
      return 'primary';
  }
}

/**
 * Compute initials for the sender avatar fallback. Uses the first letter
 * of the first two whitespace-separated words so `"So Hee Park"` ->
 * `"SH"`, `"alerts@github.com"` -> `"A"`.
 */
function senderInitials(sender: string): string {
  const parts = sender.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.charAt(0).toUpperCase() ?? '';
  const second = parts[1]?.charAt(0).toUpperCase() ?? '';
  return `${first}${second}` || '?';
}

/**
 * Format an ISO timestamp as a short locale time label. Falls back to
 * the raw string when the value is not parseable — the schema only
 * guarantees `receivedISO` is a string.
 */
function formatReceived(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Render the Sender cell: avatar + (optionally-bold) sender name. Unread
 * rows render the sender in the default text variant; read rows fade to
 * muted to mimic standard inbox affordances.
 */
function renderSenderCell(_: unknown, row: MailRow): ReactElement {
  return (
    <Stack direction="row" gap="medium" align="center">
      <Avatar
        src={row.senderAvatarUrl}
        fallback={senderInitials(row.sender)}
        alt={row.sender}
      />
      <Text as="span" variant={row.unread ? undefined : 'muted'}>
        {row.sender}
      </Text>
    </Stack>
  );
}

/**
 * Render the Subject cell: subject (heading variant), muted snippet
 * underneath, and flag badges if present. Agent-observed flags
 * (`attachment`, `calendar`) and user-togglable flags (`important`,
 * `starred`) all render here; only the latter two are user-settable via
 * the `flag` action.
 */
function renderSubjectCell(_: unknown, row: MailRow): ReactElement {
  return (
    <Stack direction="column" gap="none">
      <Stack direction="row" gap="tight" align="center">
        <Text as="span" variant={row.unread ? undefined : 'muted'}>
          {row.subject}
        </Text>
        {row.flags && row.flags.length > 0
          ? row.flags.map((flag) => (
              <Badge as="span" key={flag} variant={badgeVariantFor(flag)}>
                {flag}
              </Badge>
            ))
          : null}
      </Stack>
      <Text variant="muted" level="caption">
        {row.snippet}
      </Text>
    </Stack>
  );
}

/**
 * Render the Received cell: short locale time.
 */
function renderReceivedCell(_: unknown, row: MailRow): ReactElement {
  return (
    <Text as="span" variant="muted" level="caption">
      {formatReceived(row.receivedISO)}
    </Text>
  );
}

/**
 * MailTriage — inbox-like table with four per-row actions.
 *
 * Payload is validated by the catalog before the component mounts, so the
 * cast to `MailTriagePayload` is safe. The empty `rows` array renders a
 * muted "no messages" line. When `folder` is supplied it is rendered as
 * an H2 above the table so the user knows which view the agent selected.
 *
 * `ActionButton.action` expects a `Promise`; `emit` is synchronous
 * (fire-and-forget), so we wrap each call in `Promise.resolve(emit(...))`
 * — this still gives `ActionButton` its built-in double-click guard
 * without adding artificial latency.
 *
 * @example
 * ```tsx
 * <MailTriage
 *   payload={{
 *     folder: 'Inbox',
 *     rows: [
 *       {
 *         rowId: 'msg-42',
 *         subject: 'Re: Canvas spec review',
 *         sender: 'So Hee Park',
 *         snippet: 'Left a few comments on the lifecycle section…',
 *         receivedISO: '2026-04-15T09:12:00.000Z',
 *         unread: true,
 *         flags: ['important'],
 *       },
 *     ],
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @param {CanvasWidgetProps} props - Canvas host props (validated payload + emit).
 * @returns {ReactElement} The rendered triage table.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MailTriage: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  // why: payload is valibot-validated against this widget's schema (validateBlock) before render
  const data = payload as MailTriagePayload;
  const { t } = useTranslation('dndev');

  /**
   * Column definitions. `render` is declared per-column; the cell-render
   * helpers are module-scoped to avoid per-row closure allocation.
   */
  const columns: TableColumn<MailRow>[] = [
    {
      key: 'sender',
      title: t('canvas.mailTriage.columns.sender'),
      dataIndex: 'sender',
      render: renderSenderCell,
    },
    {
      key: 'subject',
      title: t('canvas.mailTriage.columns.subject'),
      dataIndex: 'subject',
      render: renderSubjectCell,
    },
    {
      key: 'received',
      title: t('canvas.mailTriage.columns.received'),
      dataIndex: 'receivedISO',
      align: 'end',
      render: renderReceivedCell,
    },
    {
      key: 'actions',
      title: t('canvas.mailTriage.columns.actions'),
      align: 'end',
      render: (_, row) => (
        <Stack direction="row" gap="tight" justify="end" align="center">
          <ActionButton
            variant="ghost"
            icon="Inbox"
            display="compact"
            aria-label={t('canvas.mailTriage.actions.archiveAria', {
              subject: row.subject,
            })}
            action={() =>
              Promise.resolve(emit('archive', { rowId: row.rowId }))
            }
          >
            {t('canvas.mailTriage.actions.archive')}
          </ActionButton>
          <ActionButton
            variant="ghost"
            icon="Reply"
            display="compact"
            aria-label={t('canvas.mailTriage.actions.replyAria', {
              subject: row.subject,
            })}
            action={() => Promise.resolve(emit('reply', { rowId: row.rowId }))}
          >
            {t('canvas.mailTriage.actions.reply')}
          </ActionButton>
          <ActionButton
            variant="ghost"
            icon="Star"
            display="compact"
            aria-label={t('canvas.mailTriage.actions.flagAria', {
              subject: row.subject,
            })}
            action={() =>
              Promise.resolve(
                emit('flag', { rowId: row.rowId, flag: 'starred' })
              )
            }
          >
            {t('canvas.mailTriage.actions.flag')}
          </ActionButton>
          <ActionButton
            variant="primary"
            icon="Mail"
            display="compact"
            aria-label={t('canvas.mailTriage.actions.openAria', {
              subject: row.subject,
            })}
            action={() => Promise.resolve(emit('open', { rowId: row.rowId }))}
          >
            {t('canvas.mailTriage.actions.open')}
          </ActionButton>
        </Stack>
      ),
    },
  ];

  return (
    <Stack direction="column" gap="medium">
      {data.folder ? (
        <Text as="h2" level="h2">
          {data.folder}
        </Text>
      ) : null}

      {data.rows.length === 0 ? (
        <Text variant="muted">{t('canvas.mailTriage.noMessages')}</Text>
      ) : (
        <DataTable<MailRow> data={data.rows} columns={columns} />
      )}
    </Stack>
  );
};

registerWidget({
  kind: 'MailTriage',
  schema: MailTriagePayloadSchema,
  actions: MailTriageActions,
  surface: 'private',
  defaultLifetime: 'session',
  component: MailTriage,
});
