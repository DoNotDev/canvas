// packages/canvas/src/common/widgets/ConflictResolver/index.tsx

/**
 * @fileoverview ConflictResolver canvas widget
 * @description Renders a calendar conflict — two or more events overlapping
 *   on the same slot — as a vertical stack of event cards. Each card shows
 *   the event's title, time range, optional location and importance hint,
 *   plus two actions: "Keep this" (emits `pick`) and "Reschedule +1h"
 *   (emits `reschedule` with `newStartISO` set to the event's current
 *   `endISO`, i.e. shifted by the event's own duration).
 *
 *   Registered on the `household` surface with an `ephemeral` default
 *   lifetime — conflict resolvers appear in response to a turn and vanish
 *   with it unless the agent opts into a longer lifetime.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Button, ButtonGroup, Card, Stack, Text } from '@donotdev/components';

import {
  ConflictResolverActions,
  ConflictResolverPayloadSchema,
  type ConflictResolverPayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * Map an event's optional `importance` hint to a `Text` theme variant for
 * the small inline badge rendered on each card.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
const IMPORTANCE_VARIANT = {
  low: 'muted',
  normal: 'primary',
  high: 'destructive',
} as const;

/**
 * Human-readable label for the importance badge. Widget-internal copy —
 * product-facing strings live in `message` on the payload.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
const IMPORTANCE_LABEL = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
} as const;

/**
 * Format an ISO-8601 range as a compact `start – end` string using the
 * runtime's default locale. Falls back to the raw ISO strings when either
 * bound is unparseable (the schema only guarantees they are strings, not
 * valid dates).
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function formatRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startISO} \u2013 ${endISO}`;
  }
  const fmt = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const timeOnly = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${fmt.format(start)} \u2013 ${timeOnly.format(end)}`;
}

/**
 * ConflictResolver canvas widget component.
 *
 * The `payload` prop is typed as `unknown` at the framework level; the
 * catalog has already validated it against `ConflictResolverPayloadSchema`
 * before this component renders, so the local cast is sound.
 *
 * Visual contract:
 * - Optional `message` renders as a paragraph above the event cards.
 * - Each event renders as a `Card` (title, subtitle = time range) with
 *   body holding location (if set) and an importance badge (if set), and
 *   a `ButtonGroup` of two actions: "Keep this" and "Reschedule +1h".
 * - "Reschedule +1h" emits `newStartISO = event.endISO`, shifting the
 *   event by its own duration — the spec's canonical quick-reschedule.
 *
 * @component
 * @example
 * ```tsx
 * <ConflictResolver
 *   payload={{
 *     conflictId: 'conflict-tue-1400',
 *     message: 'You have two things on Tuesday at 14:00 — pick one.',
 *     events: [
 *       {
 *         eventId: 'evt-dentist',
 *         title: 'Dentist appointment',
 *         startISO: '2026-04-21T14:00:00+02:00',
 *         endISO: '2026-04-21T15:00:00+02:00',
 *         importance: 'high',
 *       },
 *       {
 *         eventId: 'evt-standup',
 *         title: 'Team standup',
 *         startISO: '2026-04-21T14:00:00+02:00',
 *         endISO: '2026-04-21T14:30:00+02:00',
 *       },
 *     ],
 *   }}
 *   emit={(action, payload) => console.log(action, payload)}
 * />
 * ```
 *
 * @param {CanvasWidgetProps} props - Canvas host props (validated payload + emit).
 * @returns {JSX.Element} The rendered conflict resolver.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConflictResolver: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  // why: payload is valibot-validated against this widget's schema (validateBlock) before render
  const { conflictId, message, events } = payload as ConflictResolverPayload;

  return (
    <Stack gap="medium">
      {message ? <Text as="p">{message}</Text> : null}
      <Stack gap="medium">
        {events.map((event) => (
          <Card
            key={event.eventId}
            title={event.title}
            subtitle={formatRange(event.startISO, event.endISO)}
          >
            <Stack gap="tight">
              {event.location ? (
                <Text variant="muted">{event.location}</Text>
              ) : null}
              {event.importance ? (
                <Text as="span" variant={IMPORTANCE_VARIANT[event.importance]}>
                  {IMPORTANCE_LABEL[event.importance]}
                </Text>
              ) : null}
              <ButtonGroup
                aria-label={`Resolve ${event.title}`}
                variant="outline"
              >
                <Button
                  variant="primary"
                  onClick={() =>
                    emit('pick', { conflictId, eventId: event.eventId })
                  }
                >
                  Keep this
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    emit('reschedule', {
                      conflictId,
                      eventId: event.eventId,
                      newStartISO: event.endISO,
                    })
                  }
                >
                  Reschedule +1h
                </Button>
              </ButtonGroup>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

registerWidget({
  kind: 'ConflictResolver',
  schema: ConflictResolverPayloadSchema,
  actions: ConflictResolverActions,
  surface: 'household',
  defaultLifetime: 'ephemeral',
  component: ConflictResolver,
});
