// packages/canvas/src/common/widgets/MediaQueue/index.tsx

/**
 * @fileoverview MediaQueue canvas widget
 * @description Household-surface widget rendering the up-next track list
 *   for a queue. Each row shows optional cover art (`Avatar`), title +
 *   artist (`Text`) and three action buttons: play-now, move-up,
 *   move-down, and remove. Self-registers with the canvas catalog at
 *   module import time so `widgets/index.ts` only has to add the
 *   `import './MediaQueue';` line.
 *
 *   The component never mutates the queue directly — every user
 *   interaction emits a catalog-validated action back to the agent via
 *   the `emit` prop supplied by `CanvasHost`. Reorder is expressed as
 *   `{ fromIndex, toIndex }`; v1 uses up/down buttons (no DnD).
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Avatar, Button, Card, Stack, Text } from '@donotdev/components';

import {
  MediaQueueActions,
  MediaQueuePayloadSchema,
  type MediaQueuePayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * Initials fallback for `Avatar` when an item has no `coverUrl`. Uses
 * the first letter of the title + first letter of the artist so the
 * placeholder reads as "track-ish" rather than as a user avatar.
 */
function coverFallback(title: string, artist: string): string {
  const t = title.trim().charAt(0).toUpperCase();
  const a = artist.trim().charAt(0).toUpperCase();
  return `${t}${a}` || '?';
}

/**
 * MediaQueue — ordered up-next track list with per-row controls.
 *
 * Payload is validated by the catalog before the component mounts, so the
 * cast to `MediaQueuePayload` is safe. The queue is rendered as a
 * vertical `Stack` of `Card` rows (rather than `List`, whose item model
 * is text-oriented and does not fit the per-row action buttons required
 * here). An empty `items` array renders a muted "queue is empty" line.
 *
 * @example
 * ```tsx
 * <MediaQueue
 *   payload={{
 *     queueId: 'salon:main',
 *     items: [
 *       { itemId: 't1', title: 'Levitating', artist: 'Dua Lipa' },
 *       { itemId: 't2', title: 'Blinding Lights', artist: 'The Weeknd' },
 *     ],
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @param {CanvasWidgetProps} props - Canvas host props (validated payload + emit).
 * @returns {JSX.Element} The rendered queue.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MediaQueue: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const data = payload as MediaQueuePayload;
  const total = data.items.length;

  if (total === 0) {
    return (
      <Card elevated>
        <Text variant="muted">Queue is empty.</Text>
      </Card>
    );
  }

  return (
    <Card elevated>
      <Stack direction="column" gap="tight">
        {data.items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === total - 1;
          return (
            <Card key={item.itemId}>
              <Stack direction="row" gap="medium" align="center">
                <Avatar
                  src={item.coverUrl}
                  fallback={coverFallback(item.title, item.artist)}
                  alt={item.title}
                />
                <Stack direction="column" gap="none">
                  <Text as="h4" level="h4">
                    {item.title}
                  </Text>
                  <Text variant="muted">{item.artist}</Text>
                </Stack>
                <Stack direction="row" gap="tight" justify="end" align="center">
                  <Button
                    variant="primary"
                    icon="Play"
                    display="compact"
                    aria-label={`Play ${item.title} now`}
                    onClick={() => emit('play_now', { itemId: item.itemId })}
                  >
                    Play now
                  </Button>
                  <Button
                    variant="ghost"
                    icon="ChevronUp"
                    display="compact"
                    disabled={isFirst}
                    aria-label={`Move ${item.title} up`}
                    onClick={() =>
                      emit('reorder', {
                        fromIndex: index,
                        toIndex: index - 1,
                      })
                    }
                  >
                    Move up
                  </Button>
                  <Button
                    variant="ghost"
                    icon="ChevronDown"
                    display="compact"
                    disabled={isLast}
                    aria-label={`Move ${item.title} down`}
                    onClick={() =>
                      emit('reorder', {
                        fromIndex: index,
                        toIndex: index + 1,
                      })
                    }
                  >
                    Move down
                  </Button>
                  <Button
                    variant="ghost"
                    icon="X"
                    display="compact"
                    aria-label={`Remove ${item.title} from queue`}
                    onClick={() => emit('remove', { itemId: item.itemId })}
                  >
                    Remove
                  </Button>
                </Stack>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </Card>
  );
};

registerWidget({
  kind: 'MediaQueue',
  schema: MediaQueuePayloadSchema,
  actions: MediaQueueActions,
  surface: 'household',
  defaultLifetime: 'session',
  component: MediaQueue,
});
