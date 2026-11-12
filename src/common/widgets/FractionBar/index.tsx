// packages/canvas/src/common/widgets/FractionBar/index.tsx

/**
 * @fileoverview FractionBar canvas widget
 * @description Private-surface (kid / homework) widget rendering a
 *   visual fraction manipulator — a bar divided into `denominator` equal
 *   cells, `numerator` of which are shaded. The kid can:
 *
 *   - Tap a cell to set the numerator to that cell's 1-based index.
 *   - Tap `+` / `-` buttons to bump the numerator inside `[0, denominator]`.
 *   - Tap `+` / `-` buttons to bump the denominator inside
 *     `[1, maxDenominator]` (default ceiling: 12, the payload hard cap).
 *   - Tap `Submit` to assert the current fraction matches the prompt.
 *
 *   The widget is purely reactive: it never mutates the payload locally.
 *   Every interaction emits a catalog-validated action back to the agent
 *   via the `emit` prop supplied by `CanvasHost`; the agent re-renders
 *   the payload with the new values.
 *
 *   Self-registers with the canvas catalog at module import time so the
 *   `widgets/index.ts` barrel only has to add `import './FractionBar';`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Button, Card, Grid, Text } from '@donotdev/components';

import {
  FractionBarActions,
  FractionBarPayloadSchema,
  type FractionBarPayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * Hard ceiling for the denominator. Matches
 * `FractionBarPayloadSchema.denominator.maxValue`. Used as the fallback
 * cap when the payload omits `maxDenominator`.
 */
const DENOMINATOR_CEILING = 12;

/**
 * Hard floor for the denominator. A fraction bar with zero parts is
 * nonsensical.
 */
const DENOMINATOR_FLOOR = 1;

/**
 * FractionBar — prompt, visual bar of `denominator` cells with
 * `numerator` shaded, +/- controls for both numerator and denominator,
 * a live `numerator/denominator` readout, and a Submit button.
 *
 * Payload is validated by the catalog before the component mounts, so
 * the cast to `FractionBarPayload` is safe. The widget does not hold
 * any local state — every tap emits an action and the agent re-renders.
 *
 * @example
 * ```tsx
 * <FractionBar
 *   payload={{
 *     barId: 'hw-frac-001',
 *     prompt: 'Show 3/4',
 *     numerator: 2,
 *     denominator: 4,
 *     maxDenominator: 8,
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @param {CanvasWidgetProps} props - Canvas host props (validated payload + emit).
 * @returns {JSX.Element} The rendered fraction bar.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const FractionBar: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  // why: payload is valibot-validated against this widget's schema (validateBlock) before render
  const data = payload as FractionBarPayload;

  const denominatorCap = data.maxDenominator ?? DENOMINATOR_CEILING;

  // Clamp display values defensively — the schema guarantees the ranges
  // are individually valid but does not enforce numerator <= denominator.
  const shadedCount = Math.min(Math.max(data.numerator, 0), data.denominator);

  const canDecNumerator = data.numerator > 0;
  const canIncNumerator = data.numerator < data.denominator;
  const canDecDenominator = data.denominator > DENOMINATOR_FLOOR;
  const canIncDenominator = data.denominator < denominatorCap;

  const cells = Array.from({ length: data.denominator }, (_, i) => i);

  return (
    <Card title={data.prompt}>
      <Grid cols={1} gap="medium">
        <Grid cols={data.denominator} gap="tight">
          {cells.map((index) => {
            const cellNumber = index + 1;
            const isShaded = cellNumber <= shadedCount;
            return (
              <Button
                key={index}
                variant={isShaded ? 'primary' : 'outline'}
                fullWidth
                aria-label={
                  isShaded
                    ? `Part ${cellNumber} of ${data.denominator}, shaded`
                    : `Part ${cellNumber} of ${data.denominator}, empty`
                }
                aria-pressed={isShaded}
                onClick={() =>
                  emit('set_numerator', {
                    barId: data.barId,
                    numerator: cellNumber,
                  })
                }
              >
                {' '}
              </Button>
            );
          })}
        </Grid>

        <Text as="p" level="h2" aria-live="polite">
          {`${data.numerator}/${data.denominator}`}
        </Text>

        <Grid cols={2} gap="medium">
          <Card title="Numerator">
            <Grid cols={2} gap="tight">
              <Button
                variant="secondary"
                icon="Minus"
                fullWidth
                disabled={!canDecNumerator}
                aria-label="Decrease numerator"
                onClick={() =>
                  emit('set_numerator', {
                    barId: data.barId,
                    numerator: data.numerator - 1,
                  })
                }
              >
                −
              </Button>
              <Button
                variant="secondary"
                icon="Plus"
                fullWidth
                disabled={!canIncNumerator}
                aria-label="Increase numerator"
                onClick={() =>
                  emit('set_numerator', {
                    barId: data.barId,
                    numerator: data.numerator + 1,
                  })
                }
              >
                +
              </Button>
            </Grid>
          </Card>

          <Card title="Denominator">
            <Grid cols={2} gap="tight">
              <Button
                variant="secondary"
                icon="Minus"
                fullWidth
                disabled={!canDecDenominator}
                aria-label="Decrease denominator"
                onClick={() =>
                  emit('set_denominator', {
                    barId: data.barId,
                    denominator: data.denominator - 1,
                  })
                }
              >
                −
              </Button>
              <Button
                variant="secondary"
                icon="Plus"
                fullWidth
                disabled={!canIncDenominator}
                aria-label="Increase denominator"
                onClick={() =>
                  emit('set_denominator', {
                    barId: data.barId,
                    denominator: data.denominator + 1,
                  })
                }
              >
                +
              </Button>
            </Grid>
          </Card>
        </Grid>

        <Button
          variant="primary"
          icon="Check"
          fullWidth
          onClick={() =>
            emit('submit', {
              barId: data.barId,
              numerator: data.numerator,
              denominator: data.denominator,
            })
          }
        >
          Submit
        </Button>
      </Grid>
    </Card>
  );
};

registerWidget({
  kind: 'FractionBar',
  schema: FractionBarPayloadSchema,
  actions: FractionBarActions,
  surface: 'private',
  defaultLifetime: 'session',
  component: FractionBar,
});
