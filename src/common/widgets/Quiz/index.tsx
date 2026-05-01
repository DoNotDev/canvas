// packages/canvas/src/common/widgets/Quiz/index.tsx

/**
 * @fileoverview Quiz canvas widget
 * @description Private-surface widget rendering a single turn of a
 *   multi-turn quiz — a progress bar ("N of M"), a question, a set of
 *   radio choices, and (optionally) a Skip button.
 *
 *   Uncontrolled: the widget never mutates the payload locally. Selecting
 *   a choice immediately emits the `answer` action with the opaque
 *   `choiceId`; the agent is the single source of truth and drives the
 *   next turn by pushing a fresh payload. No `defaultValue` — every turn
 *   starts with nothing selected so the kid actively commits to an answer.
 *
 *   Self-registers with the canvas catalog at module import time so the
 *   `widgets/index.ts` barrel only has to add `import './Quiz';`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import {
  Button,
  Card,
  Progress,
  RadioGroup,
  Stack,
  Text,
} from '@donotdev/components';

import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

import { QuizActions, QuizPayloadSchema, type QuizPayload } from './schema';

/**
 * Compute the `Progress` value (0-100) for a quiz run.
 *
 * Turn indices are zero-based, so we render `(turnIndex + 1) / turnCount`
 * as a percentage — turn 0 of 5 shows 20% (starting the first turn), turn
 * 4 of 5 shows 100% (last turn in progress). A `turnCount` of 0 would be
 * invalid per schema but defended here to avoid divide-by-zero.
 */
function progressPercent(turnIndex: number, turnCount: number): number {
  if (turnCount <= 0) return 0;
  return ((turnIndex + 1) / turnCount) * 100;
}

/**
 * Quiz — progress bar with "N of M" caption, question card, radio
 * choices, and an optional Skip button.
 *
 * Payload is validated by the catalog before the component mounts, so the
 * cast to `QuizPayload` is safe. The `RadioGroup` is uncontrolled (no
 * `value`, no `defaultValue`); `onValueChange` fires on every selection
 * and emits `answer` back to the agent with the raw `choiceId`.
 *
 * @example
 * ```tsx
 * <Quiz
 *   payload={{
 *     quizId: 'quiz-fractions-2026-04-15',
 *     turnIndex: 2,
 *     turnCount: 5,
 *     question: 'Quelle fraction est la plus grande ?',
 *     choices: [
 *       { choiceId: 'c1', label: '1/2' },
 *       { choiceId: 'c2', label: '2/3' },
 *       { choiceId: 'c3', label: '3/4' },
 *     ],
 *     allowSkip: true,
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @param {CanvasWidgetProps} props - Canvas host props (validated payload + emit).
 * @returns {JSX.Element} The rendered quiz turn.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const Quiz: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const data = payload as QuizPayload;

  const items = data.choices.map((choice) => ({
    value: choice.choiceId,
    label: choice.label,
  }));

  return (
    <Stack direction="column" gap="medium" align="stretch">
      <Stack direction="column" gap="tight" align="stretch">
        <Progress
          value={progressPercent(data.turnIndex, data.turnCount)}
          variant="accent"
        />
        <Text variant="muted" level="caption">
          {`${data.turnIndex + 1} of ${data.turnCount}`}
        </Text>
      </Stack>

      <Card>
        <Stack direction="column" gap="medium" align="stretch">
          <Text as="h2" level="h2">
            {data.question}
          </Text>

          <RadioGroup
            items={items}
            onValueChange={(choiceId) =>
              emit('answer', { quizId: data.quizId, choiceId })
            }
          />
        </Stack>
      </Card>

      {data.allowSkip === true ? (
        <Button
          variant="ghost"
          icon="SkipForward"
          onClick={() => emit('skip', { quizId: data.quizId })}
        >
          Skip
        </Button>
      ) : null}
    </Stack>
  );
};

registerWidget({
  kind: 'Quiz',
  schema: QuizPayloadSchema,
  actions: QuizActions,
  surface: 'private',
  defaultLifetime: 'session',
  component: Quiz,
});
