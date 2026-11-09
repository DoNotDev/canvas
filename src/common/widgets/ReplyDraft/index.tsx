// packages/canvas/src/common/widgets/ReplyDraft/index.tsx

/**
 * @fileoverview ReplyDraft canvas widget
 * @description Private-surface human-in-the-loop mail-reply composer.
 *   The agent drafts a reply (recipients, subject, body, optional
 *   warning); the user reviews, optionally edits the body, then either
 *   approves (blesses without sending), sends (commits), or cancels
 *   (discards).
 *
 *   Uncontrolled: the textarea holds its own DOM value — React state is
 *   not the source of truth. The agent's SSOT copy of the body is
 *   synced on blur via an `edit` event carrying
 *   `event.currentTarget.value`. This matches the framework rule
 *   "uncontrolled DOM for inputs, React state only at submit time".
 *
 *   Registered on the `private` surface with a `session` default
 *   lifetime — a reply draft survives across turns within a chat
 *   session but is not persisted.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC, FocusEvent } from 'react';

import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Stack,
  Text,
  Textarea,
} from '@donotdev/components';

import {
  ReplyDraftActions,
  ReplyDraftPayloadSchema,
  type ReplyDraftPayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/** Lucide icon shown on the Card header. */
const DRAFT_ICON = 'MailPlus';

/**
 * Minimum rows for the textarea. The agent may hand us a one-line body
 * or a multi-paragraph one — fix a comfortable floor so the affordance
 * always reads as "edit this", never as "fill this in".
 */
const TEXTAREA_ROWS = 8;

/**
 * ReplyDraft canvas widget component.
 *
 * The `payload` prop is typed as `unknown` at the framework level; the
 * catalog has already validated it against
 * {@link ReplyDraftPayloadSchema} before this component renders, so the
 * local cast is sound.
 *
 * Visual contract:
 * - `Card` with a `MailPlus` icon, the subject as title, and the joined
 *   recipient list as subtitle.
 * - Optional `Alert` (`warning` variant) when the agent flags a risk.
 * - Uncontrolled `Textarea` pre-filled via `defaultValue={body}`. On
 *   blur, emits `edit` with the current buffer so the agent's SSOT
 *   copy of the body stays in sync.
 * - `ButtonGroup` with Approve (emits `approve`), Send (primary, emits
 *   `send`), Cancel (outline, emits `cancel`).
 *
 * Emits:
 * - `approve` with `{ draftId }` — user blesses the text without sending.
 * - `edit` with `{ draftId, body }` — textarea blur; carries the full
 *   current buffer.
 * - `send` with `{ draftId }` — user commits; agent hands off to mail
 *   provider.
 * - `cancel` with `{ draftId }` — user discards the draft.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ReplyDraft: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const draft = payload as ReplyDraftPayload;
  const subtitle = `To: ${draft.to.join(', ')}`;

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>): void => {
    emit('edit', {
      draftId: draft.draftId,
      body: event.currentTarget.value,
    });
  };

  return (
    <Card elevated icon={DRAFT_ICON} title={draft.subject} subtitle={subtitle}>
      <Stack direction="column">
        {draft.warning ? (
          <Alert
            variant="warning"
            title="Review before sending"
            description={draft.warning}
          />
        ) : null}
        <Textarea
          aria-label="Reply body"
          defaultValue={draft.body}
          rows={TEXTAREA_ROWS}
          onBlur={handleBlur}
        />
        <ButtonGroup
          aria-label={`${draft.subject} reply actions`}
          variant="outline"
        >
          <Button
            variant="secondary"
            icon="Check"
            onClick={() => emit('approve', { draftId: draft.draftId })}
          >
            Approve
          </Button>
          <Button
            variant="primary"
            icon="Send"
            onClick={() => emit('send', { draftId: draft.draftId })}
          >
            Send
          </Button>
          <Button
            variant="outline"
            icon="X"
            onClick={() => emit('cancel', { draftId: draft.draftId })}
          >
            Cancel
          </Button>
        </ButtonGroup>
        <Text as="p" level="small" variant="muted">
          Nothing is sent until you press Send.
        </Text>
      </Stack>
    </Card>
  );
};

registerWidget({
  kind: 'ReplyDraft',
  schema: ReplyDraftPayloadSchema,
  actions: ReplyDraftActions,
  surface: 'private',
  defaultLifetime: 'session',
  component: ReplyDraft,
});
