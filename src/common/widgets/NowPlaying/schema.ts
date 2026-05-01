// packages/canvas/src/common/widgets/NowPlaying/schema.ts

/**
 * @fileoverview NowPlaying widget schemas
 * @description Valibot schemas + TypeScript types for the `NowPlaying`
 *   household canvas widget. Defines the render payload (current track,
 *   transport state, volume, position) and the action vocabulary the
 *   renderer may emit back to the agent (`play`, `pause`, `skip_next`,
 *   `skip_prev`, `set_volume`, `seek`).
 *
 *   These schemas are consumed by the canvas catalog to validate agent
 *   payloads at the trust boundary before rendering, and to validate user
 *   events before forwarding them to the agent.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

import { ProxiedImageUrlSchema } from '../../schemas';

/**
 * Payload describing the currently-playing track plus transport state.
 *
 * Household-scope widget: any authenticated member sees the same playback
 * context. Position and volume are numeric so the renderer can drive
 * progress + volume sliders without further parsing.
 *
 * @example
 * ```ts
 * const payload: NowPlayingPayload = {
 *   trackId: 'spotify:track:4cOdK2wGLETKBW3PvgPWqT',
 *   title: 'Never Gonna Give You Up',
 *   artist: 'Rick Astley',
 *   album: 'Whenever You Need Somebody',
 *   coverUrl: '/proxy/cover/4cOdK2wGLETKBW3PvgPWqT.jpg',
 *   positionSec: 42,
 *   durationSec: 213,
 *   volume: 65,
 *   playing: true,
 *   deviceId: 'salon-speaker',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NowPlayingPayloadSchema = v.object({
  trackId: v.string(),
  title: v.string(),
  artist: v.string(),
  album: v.optional(v.string()),
  coverUrl: v.optional(ProxiedImageUrlSchema),
  positionSec: v.number(),
  durationSec: v.number(),
  volume: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  playing: v.boolean(),
  deviceId: v.optional(v.string()),
});

/**
 * Inferred render payload for the `NowPlaying` widget.
 *
 * @example
 * ```ts
 * function render(p: NowPlayingPayload) { return p.title; }
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type NowPlayingPayload = v.InferOutput<typeof NowPlayingPayloadSchema>;

/**
 * Action schema — user pressed play on the displayed track.
 *
 * @example
 * ```ts
 * emit('play', { trackId: payload.trackId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NowPlayingPlaySchema = v.object({
  trackId: v.string(),
});

/**
 * Action schema — user pressed pause on the displayed track.
 *
 * @example
 * ```ts
 * emit('pause', { trackId: payload.trackId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NowPlayingPauseSchema = v.object({
  trackId: v.string(),
});

/**
 * Action schema — user requested the next track. Empty payload; the agent
 * owns the queue.
 *
 * @example
 * ```ts
 * emit('skip_next', {});
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NowPlayingSkipNextSchema = v.object({});

/**
 * Action schema — user requested the previous track. Empty payload.
 *
 * @example
 * ```ts
 * emit('skip_prev', {});
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NowPlayingSkipPrevSchema = v.object({});

/**
 * Action schema — user changed the volume. Clamped to 0..100 at the
 * schema layer; invalid values are rejected by `validateEvent`.
 *
 * @example
 * ```ts
 * emit('set_volume', { volume: 80 });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NowPlayingSetVolumeSchema = v.object({
  volume: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
});

/**
 * Action schema — user scrubbed the position slider to `positionSec`
 * seconds. The renderer does NOT clamp against `durationSec`; the agent
 * is the source of truth for track duration.
 *
 * @example
 * ```ts
 * emit('seek', { positionSec: 120 });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NowPlayingSeekSchema = v.object({
  positionSec: v.number(),
});

/**
 * Action vocabulary for `NowPlaying`. Consumed by `registerWidget` and
 * used by the catalog to validate inbound events before forwarding them
 * to the agent.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'NowPlaying',
 *   schema: NowPlayingPayloadSchema,
 *   actions: NowPlayingActions,
 *   surface: 'household',
 *   defaultLifetime: 'persistent',
 *   component: NowPlaying,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NowPlayingActions = {
  play: NowPlayingPlaySchema,
  pause: NowPlayingPauseSchema,
  skip_next: NowPlayingSkipNextSchema,
  skip_prev: NowPlayingSkipPrevSchema,
  set_volume: NowPlayingSetVolumeSchema,
  seek: NowPlayingSeekSchema,
} as const;
