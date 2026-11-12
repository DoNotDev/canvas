// packages/canvas/src/common/widgets/ProgressCanvas/index.tsx

/**
 * @fileoverview ProgressCanvas canvas widget
 * @description Meta-surface "working on it…" card the agent shows during a
 *   long tool call. Renders:
 *
 *   - A header combining a `Spinner` (only while `status === 'running'`) and
 *     the optional `title`.
 *   - A `Stack` body of tick rows; each row carries a state glyph
 *     (checkmark / X / dot), the tick text, and a muted timestamp.
 *   - A footer that is either a cancel `Button` (when the payload is
 *     `cancellable` AND still `running`) or a muted terminal-state label
 *     ("Succeeded" / "Failed" / "Cancelled").
 *
 *   Purely reactive: no internal state. The agent pushes payload updates
 *   with new ticks / new status; the widget re-renders whatever it
 *   receives. The user's only affordance is the Cancel button, which emits
 *   `cancel` back through the catalog-validated `emit` prop.
 *
 *   Self-registers with the canvas catalog at module import time so the
 *   `widgets/index.ts` barrel only needs to add `import './ProgressCanvas';`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC, ReactElement } from 'react';

import { Button, Card, Spinner, Stack, Text } from '@donotdev/components';

import {
  ProgressCanvasActions,
  ProgressCanvasPayloadSchema,
  type ProgressCanvasPayload,
  type ProgressTick,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * Glyph character for a tick's state column. Kept as plain Unicode so the
 * widget has zero icon-font dependency — the canvas surface already pulls
 * `Spinner` for the active indicator; per-row state is a single character.
 *
 * - `done`    → heavy checkmark
 * - `failed`  → heavy ballot X
 * - `pending` → middle dot (and anything omitted falls through to this)
 */
function glyphFor(state: ProgressTick['state']): string {
  switch (state) {
    case 'done':
      return '\u2713';
    case 'failed':
      return '\u2717';
    case 'pending':
    default:
      return '\u00B7';
  }
}

/**
 * Map a tick's state to a `Text` variant so colour conveys the same info
 * as the glyph. `done` reads as success-toned, `failed` as destructive,
 * everything else stays muted.
 */
function variantFor(
  state: ProgressTick['state']
): 'success' | 'destructive' | 'muted' {
  switch (state) {
    case 'done':
      return 'success';
    case 'failed':
      return 'destructive';
    case 'pending':
    default:
      return 'muted';
  }
}

/**
 * Format an ISO-8601 timestamp for the muted right-column marker. Falls
 * back to the raw string if `Date` rejects it — the schema only enforces
 * "is a string", so we stay robust against agent-side formatting drift.
 */
function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString();
}

/**
 * Human-readable label for a terminal task state, shown in the footer
 * when `status` is no longer `running`.
 */
function terminalLabel(
  status: Exclude<ProgressCanvasPayload['status'], 'running'>
): string {
  switch (status) {
    case 'success':
      return 'Succeeded';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
  }
}

/**
 * Render a single tick row — state glyph, tick text, muted timestamp.
 */
function TickRow({ tick }: { readonly tick: ProgressTick }): ReactElement {
  const variant = variantFor(tick.state);
  return (
    <Stack direction="row" gap="tight" align="center">
      <Text as="span" variant={variant} aria-hidden="true">
        {glyphFor(tick.state)}
      </Text>
      <Text as="span">{tick.text}</Text>
      <Text as="span" variant="muted">
        {formatTime(tick.at)}
      </Text>
    </Stack>
  );
}

/**
 * `ProgressCanvas` — agent-driven progress card with live tick log and an
 * optional cancel affordance.
 *
 * The catalog guarantees `props.payload` has already been validated
 * against `ProgressCanvasPayloadSchema` before mount, so the cast is
 * safe. No internal ticking or timers — the agent owns the clock.
 *
 * @example
 * ```tsx
 * <ProgressCanvas
 *   payload={{
 *     taskId: 'mail-triage-42',
 *     title: 'Triaging your mailbox',
 *     status: 'running',
 *     ticks: [
 *       { at: '2026-04-15T18:02:03Z', text: 'searched mailbox… 240 results', state: 'done' },
 *       { at: '2026-04-15T18:02:05Z', text: 'summarizing…', state: 'pending' },
 *     ],
 *     cancellable: true,
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ProgressCanvas: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  // why: payload is valibot-validated against this widget's schema (validateBlock) before render
  const data = payload as ProgressCanvasPayload;
  const isRunning = data.status === 'running';
  const showCancel = isRunning && data.cancellable === true;

  const handleCancel = (): void => {
    emit('cancel', { taskId: data.taskId });
  };

  const header = (
    <Stack direction="row" gap="tight" align="center">
      {isRunning ? <Spinner aria-label="Working" /> : null}
      {data.title ? (
        <Text as="h3" level="h3">
          {data.title}
        </Text>
      ) : null}
    </Stack>
  );

  const footer = showCancel ? (
    <Button variant="outline" onClick={handleCancel}>
      Cancel
    </Button>
  ) : data.status !== 'running' ? (
    <Text as="span" variant="muted">
      {terminalLabel(data.status)}
    </Text>
  ) : null;

  return (
    <Card title={header} footer={footer}>
      <Stack direction="column" gap="tight" align="stretch">
        {data.ticks.map((tick, index) => (
          <TickRow key={`${tick.at}-${index}`} tick={tick} />
        ))}
      </Stack>
    </Card>
  );
};

registerWidget({
  kind: 'ProgressCanvas',
  schema: ProgressCanvasPayloadSchema,
  actions: ProgressCanvasActions,
  surface: 'meta',
  defaultLifetime: 'ephemeral',
  component: ProgressCanvas,
});
