// packages/canvas/src/common/widgets/BrainCard/index.tsx

/**
 * @fileoverview BrainCard canvas widget
 * @description Private-surface preview of a single 2nd-brain (personal
 *   knowledge) entry. Renders the entry's title, an optional creation
 *   date, a snippet, and the current tag list, and exposes Pin/Unpin
 *   and Archive affordances.
 *
 *   Uncontrolled: the widget never mutates the payload locally. Every
 *   interaction emits an action and the agent is the single source of
 *   truth — a fresh payload comes back on the next turn. Tag editing is
 *   deferred to the agent in v1 (no inline tag editor); the `edit_tags`
 *   action schema exists so an agent-driven editor can still round-trip
 *   through the canvas channel.
 *
 *   Registered on the `private` surface with an `ephemeral` default
 *   lifetime — a preview lives only until the turn resolves.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Button, ButtonGroup, Card, Tag, Text } from '@donotdev/components';

import {
  BrainCardActions,
  BrainCardPayloadSchema,
  type BrainCardPayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * Format an ISO-8601 timestamp as a short UTC date (`YYYY-MM-DD`).
 *
 * Falls back to the raw input if the value can't be parsed — keeps the
 * widget resilient to unexpected agent input without silently hiding
 * data.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function formatCreatedDate(createdISO: string): string {
  const d = new Date(createdISO);
  if (Number.isNaN(d.getTime())) return createdISO;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * BrainCard canvas widget component.
 *
 * The `payload` prop is typed as `unknown` at the framework level; the
 * catalog has already validated it against
 * {@link BrainCardPayloadSchema} before this component renders, so the
 * local cast is sound.
 *
 * Visual contract:
 * - `Card` with the entry title and, when present, a muted `createdISO`
 *   subtitle.
 * - Body: the snippet rendered as a paragraph of `Text`, followed by a
 *   row of `Tag` components (one per tag) when tags are non-empty.
 * - Footer: `ButtonGroup` with Pin/Unpin (toggled by `pinned`, emits
 *   `pin` with the flipped boolean) and Archive (emits `archive`).
 *
 * Emits:
 * - `pin` with `{ entryId, pinned: !payload.pinned }` — user toggled
 *   pinned state.
 * - `archive` with `{ entryId }` — user archived the entry.
 * - `edit_tags` is declared in the action vocabulary but not wired to
 *   a UI control in v1; the agent drives tag edits.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const BrainCard: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  // why: payload is valibot-validated against this widget's schema (validateBlock) before render
  const entry = payload as BrainCardPayload;
  const subtitle = entry.createdISO
    ? formatCreatedDate(entry.createdISO)
    : undefined;
  const isPinned = entry.pinned === true;
  const hasTags = entry.tags.length > 0;

  return (
    <Card
      elevated
      title={entry.title}
      subtitle={subtitle}
      icon={isPinned ? 'Pin' : 'Brain'}
    >
      <Text as="p">{entry.snippet}</Text>

      {hasTags ? (
        <Text as="div">
          {entry.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Text>
      ) : null}

      <ButtonGroup
        aria-label={`${entry.title} entry actions`}
        variant="outline"
      >
        <Button
          variant={isPinned ? 'outline' : 'primary'}
          icon={isPinned ? 'PinOff' : 'Pin'}
          onClick={() =>
            emit('pin', { entryId: entry.entryId, pinned: !isPinned })
          }
        >
          {isPinned ? 'Unpin' : 'Pin'}
        </Button>
        <Button
          variant="outline"
          icon="Archive"
          onClick={() => emit('archive', { entryId: entry.entryId })}
        >
          Archive
        </Button>
      </ButtonGroup>
    </Card>
  );
};

registerWidget({
  kind: 'BrainCard',
  schema: BrainCardPayloadSchema,
  actions: BrainCardActions,
  surface: 'private',
  defaultLifetime: 'ephemeral',
  component: BrainCard,
});
