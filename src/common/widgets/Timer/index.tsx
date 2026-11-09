// packages/canvas/src/common/widgets/Timer/index.tsx

/**
 * @fileoverview Timer canvas widget
 * @description Household-surface widget rendering a countdown timer —
 *   optional label, a `Progress` ring showing elapsed share of the
 *   duration, the remaining time in big `MM:SS` numerals, and a row of
 *   lifecycle control buttons (pause / resume / reset / dismiss).
 *
 *   The widget is purely reactive: it never ticks on its own. The agent
 *   owns the clock and pushes payload updates with a new `remainingSec`;
 *   the widget re-renders whatever it receives. User taps on the control
 *   buttons emit `pause` / `resume` / `reset` / `dismiss` back through
 *   the catalog-validated `emit` prop.
 *
 *   Self-registers with the canvas catalog at module import time so the
 *   `widgets/index.ts` barrel only has to add `import './Timer';`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Button, Progress, Stack, Text } from '@donotdev/components';

import { TimerActions, TimerPayloadSchema, type TimerPayload } from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * Format a non-negative seconds count as a zero-padded `MM:SS` string.
 *
 * The spec's formatter is inlined here rather than extracted to a shared
 * util because it is widget-local (no other canvas widget needs a
 * seconds-to-`MM:SS` formatter). Fractional seconds are floored — the
 * widget is a clock, not a stopwatch.
 */
function formatMMSS(remainingSec: number): string {
  const total = Math.max(0, Math.floor(remainingSec));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/**
 * Compute the `Progress` value (0-100) for a countdown.
 *
 * The `Progress` component treats 100 as "full bar", so we map elapsed
 * time to the value: 0 when the timer has just started, 100 when it has
 * run out. A zero-duration timer is treated as "finished" (100) to avoid
 * a divide-by-zero and keep the visual monotonic.
 *
 * Remaining time is clamped into `[0, durationSec]` to stay robust
 * against out-of-range payloads (the schema only enforces `>= 0`).
 */
function progressPercent(durationSec: number, remainingSec: number): number {
  if (durationSec <= 0) return 100;
  const clampedRemaining = Math.min(Math.max(remainingSec, 0), durationSec);
  const elapsed = durationSec - clampedRemaining;
  return (elapsed / durationSec) * 100;
}

/**
 * Map the timer lifecycle state to the `Progress` colour variant.
 *
 * - `finished` → `success` (goal reached)
 * - `paused`   → `warning` (user attention)
 * - everything else → `default`
 */
function progressVariantFor(
  state: TimerPayload['state']
): 'default' | 'success' | 'warning' {
  switch (state) {
    case 'finished':
      return 'success';
    case 'paused':
      return 'warning';
    case 'running':
    case 'idle':
      return 'default';
  }
}

/**
 * Timer — label, progress bar, big numeric countdown, and lifecycle
 * controls.
 *
 * Payload is validated by the catalog before the component mounts, so
 * the cast to `TimerPayload` is safe. The widget does not hold any
 * internal ticking state; re-renders are driven entirely by incoming
 * payload updates.
 *
 * @example
 * ```tsx
 * <Timer
 *   payload={{
 *     timerId: 'tmr-pasta',
 *     label: 'Pasta',
 *     durationSec: 480,
 *     remainingSec: 325,
 *     state: 'running',
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const Timer: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const data = payload as TimerPayload;

  const handlePause = (): void => {
    emit('pause', { timerId: data.timerId });
  };

  const handleResume = (): void => {
    emit('resume', { timerId: data.timerId });
  };

  const handleReset = (): void => {
    emit('reset', { timerId: data.timerId });
  };

  const handleDismiss = (): void => {
    emit('dismiss', { timerId: data.timerId });
  };

  return (
    <Stack direction="column" gap="medium" align="stretch">
      {data.label ? (
        <Text as="h3" level="h3">
          {data.label}
        </Text>
      ) : null}

      <Progress
        value={progressPercent(data.durationSec, data.remainingSec)}
        variant={progressVariantFor(data.state)}
      />

      <Text as="span" level="h1" aria-live="polite">
        {formatMMSS(data.remainingSec)}
      </Text>

      <Stack direction="row" gap="tight" align="center">
        {data.state === 'running' ? (
          <Button variant="secondary" icon="Pause" onClick={handlePause}>
            Pause
          </Button>
        ) : null}

        {data.state === 'paused' ? (
          <Button variant="primary" icon="Play" onClick={handleResume}>
            Resume
          </Button>
        ) : null}

        <Button variant="ghost" icon="RotateCcw" onClick={handleReset}>
          Reset
        </Button>

        {data.state === 'finished' ? (
          <Button variant="primary" icon="Check" onClick={handleDismiss}>
            Dismiss
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
};

registerWidget({
  kind: 'Timer',
  schema: TimerPayloadSchema,
  actions: TimerActions,
  surface: 'household',
  defaultLifetime: 'session',
  component: Timer,
});
