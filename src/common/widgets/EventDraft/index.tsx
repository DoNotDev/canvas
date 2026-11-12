// packages/canvas/src/common/widgets/EventDraft/index.tsx

/**
 * @fileoverview EventDraft canvas widget
 * @description Household-surface human-in-the-loop calendar widget. The
 *   agent proposes an event (title, start, end, optional location /
 *   attendees / description) and the user confirms, cancels, or requests
 *   an edit flow before the event is actually committed to the calendar.
 *
 *   Uncontrolled: this widget never mutates the draft locally. Every
 *   interaction emits an action and the agent is the source of truth —
 *   on `edit`, the agent re-renders the block (v1 carries an empty
 *   `changes` patch; a future iteration can wire an inline editor).
 *
 *   Registered on the `household` surface with an `ephemeral` default
 *   lifetime — a draft lives only until the turn resolves.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC, ReactNode } from 'react';

import {
  Button,
  ButtonGroup,
  Card,
  DescriptionList,
  Text,
  type DescriptionItem,
} from '@donotdev/components';

import {
  EventDraftActions,
  EventDraftPayloadSchema,
  type EventDraftPayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/** Lucide icon shown on the Card header. */
const DRAFT_ICON = 'CalendarPlus';

/**
 * Format an ISO-8601 date-time string for display via `toLocaleString()`.
 * Falls back to the raw ISO input if parsing fails — fail loud rather
 * than silently swallow an invalid draft.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function formatISO(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

/**
 * Build the DescriptionList rows for a draft, skipping fields that are
 * absent or empty. Keeps the widget dense — no "—" placeholders for
 * missing optional fields.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function buildItems(payload: EventDraftPayload): DescriptionItem[] {
  const items: DescriptionItem[] = [
    { label: 'Start', value: formatISO(payload.startISO) },
    { label: 'End', value: formatISO(payload.endISO) },
  ];
  if (payload.location) {
    items.push({ label: 'Location', value: payload.location });
  }
  if (payload.attendees && payload.attendees.length > 0) {
    items.push({ label: 'Attendees', value: payload.attendees.join(', ') });
  }
  if (payload.description) {
    items.push({
      label: 'Description',
      value: payload.description satisfies ReactNode,
    });
  }
  return items;
}

/**
 * EventDraft canvas widget component.
 *
 * The `payload` prop is typed as `unknown` at the framework level; the
 * catalog has already validated it against
 * {@link EventDraftPayloadSchema} before this component renders, so the
 * local cast is sound.
 *
 * Visual contract:
 * - `Card` with a `CalendarPlus` icon, the draft's title, and an
 *   optional subtitle hinting the target calendar.
 * - `DescriptionList` of start / end / location / attendees /
 *   description (empty fields skipped).
 * - `ButtonGroup` with Confirm (primary), Edit (outline), Cancel
 *   (outline). Edit emits an empty `changes` patch in v1 — the agent
 *   drives the editable flow.
 *
 * Emits:
 * - `confirm` with `{ draftId }` — user accepts the draft as-is.
 * - `cancel` with `{ draftId }` — user rejects the draft.
 * - `edit` with `{ draftId, changes: {} }` — user asks for an edit
 *   flow; agent responds with a new turn.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const EventDraft: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  // why: payload is valibot-validated against this widget's schema (validateBlock) before render
  const draft = payload as EventDraftPayload;
  const items = buildItems(draft);
  const subtitle = draft.calendarId
    ? `Proposed \u00B7 ${draft.calendarId}`
    : 'Proposed event';

  return (
    <Card elevated icon={DRAFT_ICON} title={draft.title} subtitle={subtitle}>
      <DescriptionList items={items} orientation="horizontal" />
      <ButtonGroup
        aria-label={`${draft.title} draft actions`}
        variant="outline"
      >
        <Button
          variant="primary"
          icon="Check"
          onClick={() => emit('confirm', { draftId: draft.draftId })}
        >
          Confirm
        </Button>
        <Button
          variant="outline"
          icon="Pencil"
          onClick={() => emit('edit', { draftId: draft.draftId, changes: {} })}
        >
          Edit
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
        Nothing is written to your calendar until you confirm.
      </Text>
    </Card>
  );
};

registerWidget({
  kind: 'EventDraft',
  schema: EventDraftPayloadSchema,
  actions: EventDraftActions,
  surface: 'household',
  defaultLifetime: 'ephemeral',
  component: EventDraft,
});
