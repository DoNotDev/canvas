// packages/canvas/src/common/widgets/DaySchedule/index.tsx

/**
 * @fileoverview DaySchedule canvas widget
 * @description Household-surface widget rendering today's events as a
 *   time-anchored stack — a date heading followed by a vertical stack of
 *   event cards. Each card shows the time range, title, optional location,
 *   a `Badge` for the event kind, and a "done" toggle affordance.
 *
 *   The component never calls the calendar backend directly — card clicks
 *   emit `open_event` and the done-toggle emits `mark_done`, both routed
 *   through the catalog-validated `emit` prop supplied by `CanvasHost`.
 *
 *   Self-registers with the canvas catalog at module import time so the
 *   `widgets/index.ts` barrel only has to add `import './DaySchedule';`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC, MouseEvent } from 'react';

import { Badge, Button, Card, Stack, Text } from '@donotdev/components';

import {
  DayScheduleActions,
  DaySchedulePayloadSchema,
  type DaySchedulePayload,
  type ScheduleEvent,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * Map an event `kind` to a `Badge` variant.
 *
 * Kept deliberately narrow: no user-facing copy here, just visual mapping.
 * The kind's own string doubles as the badge label (capitalised in the
 * renderer).
 */
function badgeVariantFor(
  kind: ScheduleEvent['kind']
): 'primary' | 'secondary' | 'accent' | 'warning' | 'muted' {
  switch (kind) {
    case 'meeting':
      return 'primary';
    case 'personal':
      return 'secondary';
    case 'kid':
      return 'accent';
    case 'errand':
      return 'warning';
    case 'other':
      return 'muted';
  }
}

/**
 * Format an ISO timestamp as a 2-digit hour:minute label using the
 * runtime's default locale. Invalid timestamps fall back to the raw
 * string — the schema only guarantees `startISO` is a string.
 */
function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format the date heading shown above the event stack. Falls back to the
 * raw `dateISO` when the string is not a parseable date.
 */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Capitalise the first letter of a string. Used for badge labels.
 */
function capitalise(value: string): string {
  return value.length === 0
    ? value
    : `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

/**
 * Build the time-range label — `"09:00 – 09:15"` with an en-dash, or just
 * the start time when no `endISO` is supplied.
 */
function timeRangeLabel(event: ScheduleEvent): string {
  const start = formatTime(event.startISO);
  if (!event.endISO) return start;
  return `${start} \u2013 ${formatTime(event.endISO)}`;
}

/**
 * DaySchedule — the date heading + a vertical stack of event cards.
 *
 * Payload is validated by the catalog before the component mounts, so the
 * cast to `DaySchedulePayload` is safe. The empty-events case renders a
 * muted "no events" line instead of collapsing to an empty card list.
 *
 * @example
 * ```tsx
 * <DaySchedule
 *   payload={{
 *     dateISO: '2026-04-15',
 *     events: [
 *       {
 *         eventId: 'evt-1',
 *         title: 'Stand-up',
 *         startISO: '2026-04-15T09:00:00.000Z',
 *         endISO: '2026-04-15T09:15:00.000Z',
 *         kind: 'meeting',
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
export const DaySchedule: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  // why: payload is valibot-validated against this widget's schema (validateBlock) before render
  const data = payload as DaySchedulePayload;

  return (
    <Stack direction="column" gap="medium">
      <Text as="h2" level="h2">
        {formatDate(data.dateISO)}
      </Text>

      {data.events.length === 0 ? (
        <Text variant="muted">No events scheduled.</Text>
      ) : (
        <Stack direction="column" gap="tight">
          {data.events.map((event) => {
            const handleOpen = (): void => {
              emit('open_event', { eventId: event.eventId });
            };

            const handleToggleDone = (
              e: MouseEvent<HTMLButtonElement>
            ): void => {
              // Prevent the card's click handler from also firing.
              e.stopPropagation();
              emit('mark_done', {
                eventId: event.eventId,
                done: !event.done,
              });
            };

            return (
              <Card key={event.eventId} onClick={handleOpen} clickable>
                <Stack
                  direction="row"
                  gap="medium"
                  align="center"
                  justify="between"
                >
                  <Stack direction="column" gap="tight">
                    <Stack direction="row" gap="tight" align="center">
                      <Text as="span" variant="muted" level="caption">
                        {timeRangeLabel(event)}
                      </Text>
                      <Badge as="span" variant={badgeVariantFor(event.kind)}>
                        {capitalise(event.kind)}
                      </Badge>
                    </Stack>

                    <Text as="h3" level="h3">
                      {event.title}
                    </Text>

                    {event.location ? (
                      <Text variant="muted" level="caption">
                        {event.location}
                      </Text>
                    ) : null}
                  </Stack>

                  <Button
                    variant={event.done ? 'primary' : 'ghost'}
                    icon={event.done ? 'CheckCircle2' : 'Circle'}
                    onClick={handleToggleDone}
                    aria-label={
                      event.done ? 'Mark as not done' : 'Mark as done'
                    }
                    aria-pressed={event.done ?? false}
                  >
                    {event.done ? 'Done' : 'Mark done'}
                  </Button>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

registerWidget({
  kind: 'DaySchedule',
  schema: DaySchedulePayloadSchema,
  actions: DayScheduleActions,
  surface: 'household',
  defaultLifetime: 'persistent',
  component: DaySchedule,
});
