// packages/canvas/src/common/widgets/ConceptExplainer/index.tsx

/**
 * @fileoverview ConceptExplainer canvas widget
 * @description Private-surface widget that walks the user through an ordered
 *   set of explanation steps at their own pace. Renders a `Stepper` header
 *   showing every step title with the active index highlighted, a `Card`
 *   below showing the current step's title + body, and Prev / Next / Done
 *   buttons.
 *
 *   The widget is fully agent-driven: `currentStepIndex` lives in the
 *   payload, not local state. Every user interaction emits a
 *   catalog-validated action back to the agent via the `emit` prop supplied
 *   by `CanvasHost`, and the agent pushes an updated payload in response.
 *
 *   Self-registers with the canvas catalog at module import time so the
 *   `widgets/index.ts` barrel only has to add `import './ConceptExplainer';`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import {
  Button,
  Card,
  Stack,
  Stepper,
  Text,
  type StepperStep,
} from '@donotdev/components';

import {
  ConceptExplainerActions,
  ConceptExplainerPayloadSchema,
  type ConceptExplainerPayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * ConceptExplainer — step-by-step concept reveal with Prev / Next / Done
 * controls.
 *
 * Payload is validated by the catalog before the component mounts, so the
 * cast to `ConceptExplainerPayload` is safe. `currentStepIndex` is clamped
 * to the last step when the agent sends an out-of-range value — the schema
 * already guards the lower bound.
 *
 * @example
 * ```tsx
 * <ConceptExplainer
 *   payload={{
 *     conceptId: 'math:fractions-addition',
 *     title: 'Adding fractions with different denominators',
 *     steps: [
 *       { stepId: 's1', title: 'Find a common denominator', body: '...' },
 *       { stepId: 's2', title: 'Rewrite each fraction', body: '...' },
 *       { stepId: 's3', title: 'Add the numerators', body: '...' },
 *     ],
 *     currentStepIndex: 1,
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @param {CanvasWidgetProps} props - Canvas host props (validated payload + emit).
 * @returns {JSX.Element} The rendered concept explainer.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConceptExplainer: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  // why: payload is valibot-validated against this widget's schema (validateBlock) before render
  const data = payload as ConceptExplainerPayload;

  const lastIndex = data.steps.length - 1;
  const activeIndex = Math.min(data.currentStepIndex, lastIndex);
  const activeStep = data.steps[activeIndex]!;
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === lastIndex;

  // Stepper only drives the header indicator here; the body lives in the Card
  // below so the reveal stays one step at a time regardless of Stepper's
  // internal layout. Empty content per step keeps the header purely visual.
  const stepperSteps: StepperStep[] = data.steps.map((step, index) => ({
    number: index + 1,
    title: step.title,
    content: null,
  }));

  return (
    <Stack direction="column" gap="medium">
      <Text as="h2" level="h2">
        {data.title}
      </Text>

      <Stepper steps={stepperSteps} activeStep={activeIndex} showStepNumbers />

      <Card title={activeStep.title}>
        <Text>{activeStep.body}</Text>
      </Card>

      <Stack direction="row" gap="medium" justify="between" align="center">
        <Button
          variant="secondary"
          icon="ChevronLeft"
          disabled={isFirst}
          onClick={() => emit('prev_step', { conceptId: data.conceptId })}
        >
          Previous
        </Button>

        {isLast ? (
          <Button
            variant="primary"
            icon="Check"
            onClick={() => emit('done', { conceptId: data.conceptId })}
          >
            Done
          </Button>
        ) : (
          <Button
            variant="primary"
            icon="ChevronRight"
            iconEnd
            onClick={() => emit('next_step', { conceptId: data.conceptId })}
          >
            Next
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

registerWidget({
  kind: 'ConceptExplainer',
  schema: ConceptExplainerPayloadSchema,
  actions: ConceptExplainerActions,
  surface: 'private',
  defaultLifetime: 'session',
  component: ConceptExplainer,
});
