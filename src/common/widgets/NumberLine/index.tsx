// packages/canvas/src/common/widgets/NumberLine/index.tsx

/**
 * @fileoverview NumberLine canvas widget
 * @description Private-surface kid homework helper — renders a prompt
 *   inside a `Card`, a draggable `Slider` bound to the payload's
 *   `[min, max]` range, optional informational `targets` shown as small
 *   `Text` labels in a `Grid` below the slider, and a Submit `Button`
 *   that freezes the current marker position as the kid's answer.
 *
 *   The slider is uncontrolled: `defaultValue={[value]}` on mount, and
 *   the latest dragged value lives in a `useRef` updated inside
 *   `onValueCommit`. This is the one place where a local ref is
 *   justified — Submit needs the newest value without forcing a
 *   re-render on every tick.
 *
 *   Self-registers with the canvas catalog at module import time so the
 *   `widgets/index.ts` barrel only has to add `import './NumberLine';`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useRef, type ReactElement } from 'react';

import { Button, Card, Grid, Slider, Text } from '@donotdev/components';

import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

import {
  NumberLineActions,
  NumberLinePayloadSchema,
  type NumberLinePayload,
} from './schema';

/**
 * `NumberLine` widget component.
 *
 * The catalog guarantees `props.payload` has already been validated
 * against `NumberLinePayloadSchema` before the widget is mounted, so
 * the payload is cast directly.
 *
 * Emits:
 * - `set_value` with `{ lineId, value }` on slider commit (drag end).
 * - `submit` with `{ lineId, value }` when the kid taps "Submit", using
 *   the newest ref-tracked slider value.
 *
 * Targets render as a `Grid` of equal columns below the slider, each
 * cell a muted `Text` label. Hidden when `targets` is empty or
 * `showTicks === false`.
 *
 * @example
 * ```tsx
 * <NumberLine
 *   payload={{
 *     lineId: 'flora-addition-1',
 *     prompt: 'Show me 3 + 4',
 *     min: 0,
 *     max: 10,
 *     step: 1,
 *     value: 0,
 *     targets: [7],
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export function NumberLine(props: CanvasWidgetProps): ReactElement {
  const payload = props.payload as NumberLinePayload;
  const { lineId, prompt, min, max, step, value, targets, showTicks } = payload;

  // Uncontrolled slider: local ref holds the latest committed value so
  // Submit can send the newest answer without React state / re-renders.
  const latestValue = useRef<number>(value);

  const handleValueCommit = (next: number[]): void => {
    const nextValue = next[0];
    if (nextValue === undefined) return;
    latestValue.current = nextValue;
    props.emit('set_value', { lineId, value: nextValue });
  };

  const handleSubmit = (): void => {
    props.emit('submit', { lineId, value: latestValue.current });
  };

  const hasTargets = Array.isArray(targets) && targets.length > 0;
  const ticksVisible = hasTargets && showTicks !== false;

  return (
    <Card elevated title={prompt}>
      <Slider
        defaultValue={[value]}
        min={min}
        max={max}
        step={step}
        onValueCommit={handleValueCommit}
        aria-label={prompt}
      />

      {ticksVisible ? (
        <Grid cols={targets.length} gap="tight" aria-hidden="true">
          {targets.map((target, index) => (
            <Text key={`${target}-${index}`} as="span" variant="muted">
              {target}
            </Text>
          ))}
        </Grid>
      ) : null}

      <Button variant="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Card>
  );
}

registerWidget({
  kind: 'NumberLine',
  schema: NumberLinePayloadSchema,
  actions: NumberLineActions,
  surface: 'private',
  defaultLifetime: 'session',
  component: NumberLine,
});
