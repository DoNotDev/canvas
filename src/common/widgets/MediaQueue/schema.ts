// packages/canvas/src/common/widgets/MediaQueue/schema.ts

/**
 * @fileoverview MediaQueue widget schemas
 * @description Valibot schemas + TypeScript types for the `MediaQueue`
 *   household canvas widget. Defines the render payload (the up-next track
 *   list bound to a queue id) and the action vocabulary the renderer may
 *   emit back to the agent (`remove`, `reorder`, `play_now`).
 *
 *   These schemas are consumed by the canvas catalog to validate agent
 *   payloads at the trust boundary before rendering, and to validate user
 *   events before forwarding them to the agent. The agent owns the queue
 *   state — the widget only surfaces user intent.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

import { ProxiedImageUrlSchema } from '../../schemas';

/**
 * A single queued track. `coverUrl` and `durationSec` are optional because
 * some providers (local files, podcasts) do not expose artwork or an
 * accurate duration at queue-build time.
 *
 * @example
 * ```ts
 * const item: v.InferOutput<typeof MediaQueueItemSchema> = {
 *   itemId: 'spotify:track:4cOdK2wGLETKBW3PvgPWqT',
 *   title: 'Never Gonna Give You Up',
 *   artist: 'Rick Astley',
 *   durationSec: 213,
 *   coverUrl: '/proxy/cover/4cOdK2wGLETKBW3PvgPWqT.jpg',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MediaQueueItemSchema = v.object({
  itemId: v.string(),
  title: v.string(),
  artist: v.string(),
  durationSec: v.optional(v.number()),
  coverUrl: v.optional(ProxiedImageUrlSchema),
});

/**
 * Payload describing the ordered up-next track list for a queue.
 *
 * Household-scope widget: any authenticated member sees the same queue.
 * Order is authoritative — index 0 is "next to play". The agent is the
 * sole writer; the widget emits intents only.
 *
 * @example
 * ```ts
 * const payload: MediaQueuePayload = {
 *   queueId: 'salon:main',
 *   items: [
 *     { itemId: 't1', title: 'Levitating', artist: 'Dua Lipa', durationSec: 203 },
 *     { itemId: 't2', title: 'Blinding Lights', artist: 'The Weeknd', durationSec: 200 },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MediaQueuePayloadSchema = v.object({
  queueId: v.string(),
  items: v.array(MediaQueueItemSchema),
});

/**
 * Inferred render payload for the `MediaQueue` widget.
 *
 * @example
 * ```ts
 * function render(p: MediaQueuePayload) { return p.items.length; }
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type MediaQueuePayload = v.InferOutput<typeof MediaQueuePayloadSchema>;

/**
 * Action schema — user removed a queued item.
 *
 * @example
 * ```ts
 * emit('remove', { itemId: 't2' });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const RemoveItemActionSchema = v.object({
  itemId: v.string(),
});

/**
 * Action schema — user reordered the queue by moving a row from
 * `fromIndex` to `toIndex`. Both indices are non-negative integers into
 * `items`. The agent is the source of truth for bounds — the widget does
 * not clamp.
 *
 * @example
 * ```ts
 * emit('reorder', { fromIndex: 3, toIndex: 2 });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ReorderActionSchema = v.object({
  fromIndex: v.pipe(v.number(), v.integer(), v.minValue(0)),
  toIndex: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

/**
 * Action schema — user jumped straight to a queued track ("play now"),
 * skipping whatever is currently playing. The agent decides whether to
 * keep the rest of the queue behind it or flush it.
 *
 * @example
 * ```ts
 * emit('play_now', { itemId: 't5' });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const PlayNowActionSchema = v.object({
  itemId: v.string(),
});

/**
 * Action vocabulary for `MediaQueue`. Consumed by `registerWidget` and
 * used by the catalog to validate inbound events before forwarding them
 * to the agent.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'MediaQueue',
 *   schema: MediaQueuePayloadSchema,
 *   actions: MediaQueueActions,
 *   surface: 'household',
 *   defaultLifetime: 'session',
 *   component: MediaQueue,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MediaQueueActions = {
  remove: RemoveItemActionSchema,
  reorder: ReorderActionSchema,
  play_now: PlayNowActionSchema,
} as const;
