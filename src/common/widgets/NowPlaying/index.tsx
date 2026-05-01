// packages/canvas/src/common/widgets/NowPlaying/index.tsx

/**
 * @fileoverview NowPlaying canvas widget
 * @description Household-surface widget rendering the currently-playing
 *   track plus transport controls (prev / play-pause / next), a scrub
 *   slider (position), and a volume slider. Self-registers with the
 *   canvas catalog at module import time so `widgets/index.ts` only has
 *   to add the `import './NowPlaying';` line.
 *
 *   The component never calls the media backend directly — every user
 *   interaction emits a catalog-validated action back to the agent via
 *   the `emit` prop supplied by `CanvasHost`. The agent decides what to
 *   do with it (policy check, tool call, state update).
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';
import {
  Avatar,
  Button,
  Card,
  Slider,
  Stack,
  Text,
} from '@donotdev/components';

import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';
import {
  NowPlayingActions,
  NowPlayingPayloadSchema,
  type NowPlayingPayload,
} from './schema';

/**
 * Initials fallback for `Avatar` when `coverUrl` is absent. Uses the
 * first letter of the title + first letter of the artist so the
 * placeholder reads as "track-ish" rather than as a user avatar.
 */
function coverFallback(payload: NowPlayingPayload): string {
  const t = payload.title.trim().charAt(0).toUpperCase();
  const a = payload.artist.trim().charAt(0).toUpperCase();
  return `${t}${a}` || '?';
}

/**
 * NowPlaying — current track + transport + volume + scrub.
 *
 * Payload is validated by the catalog before the component mounts, so the
 * cast to `NowPlayingPayload` is safe. Sliders are uncontrolled: they
 * render from the latest server-sent payload and emit on every commit.
 * Debouncing lives upstream (agent side), not in the widget.
 *
 * @example
 * ```tsx
 * <NowPlaying
 *   payload={{
 *     trackId: 'abc',
 *     title: 'Levitating',
 *     artist: 'Dua Lipa',
 *     positionSec: 12,
 *     durationSec: 203,
 *     volume: 60,
 *     playing: true,
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NowPlaying: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const data = payload as NowPlayingPayload;

  const onSeek = (values: number[]): void => {
    const next = values[0];
    if (typeof next !== 'number') return;
    emit('seek', { positionSec: next });
  };

  const onVolume = (values: number[]): void => {
    const next = values[0];
    if (typeof next !== 'number') return;
    emit('set_volume', { volume: next });
  };

  const onPlayPause = (): void => {
    if (data.playing) {
      emit('pause', { trackId: data.trackId });
    } else {
      emit('play', { trackId: data.trackId });
    }
  };

  const onPrev = (): void => emit('skip_prev', {});
  const onNext = (): void => emit('skip_next', {});

  return (
    <Card elevated>
      <Stack direction="column" gap="medium">
        <Stack direction="row" gap="medium" align="center">
          <Avatar
            src={data.coverUrl}
            fallback={coverFallback(data)}
            alt={data.album ?? data.title}
          />
          <Stack direction="column" gap="tight">
            <Text as="h3" level="h3">
              {data.title}
            </Text>
            <Text variant="muted">{data.artist}</Text>
            {data.album ? (
              <Text variant="muted" level="caption">
                {data.album}
              </Text>
            ) : null}
          </Stack>
        </Stack>

        <Slider
          defaultValue={[data.positionSec]}
          min={0}
          max={data.durationSec}
          step={1}
          onValueChange={onSeek}
          aria-label="Track position"
        />

        <Stack direction="row" gap="tight" justify="center" align="center">
          <Button variant="ghost" icon="SkipBack" onClick={onPrev}>
            Previous
          </Button>
          <Button
            variant="primary"
            icon={data.playing ? 'Pause' : 'Play'}
            onClick={onPlayPause}
          >
            {data.playing ? 'Pause' : 'Play'}
          </Button>
          <Button variant="ghost" icon="SkipForward" onClick={onNext}>
            Next
          </Button>
        </Stack>

        <Slider
          defaultValue={[data.volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={onVolume}
          showValue
          aria-label="Volume"
        />
      </Stack>
    </Card>
  );
};

registerWidget({
  kind: 'NowPlaying',
  schema: NowPlayingPayloadSchema,
  actions: NowPlayingActions,
  surface: 'household',
  defaultLifetime: 'persistent',
  component: NowPlaying,
});
