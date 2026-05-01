// packages/canvas/src/common/widgets/Quiz/schema.ts

/**
 * @fileoverview Quiz widget schemas
 * @description Valibot schemas + TypeScript types for the `Quiz` private
 *   canvas widget. Defines the render payload (one quiz turn: question,
 *   choices, progress across a multi-turn quiz) and the action vocabulary
 *   (`answer`, `skip`) the renderer may emit back to the agent.
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

/**
 * One answer choice inside a `Quiz` payload.
 *
 * - `choiceId` — opaque identifier the agent uses to correlate the selected
 *   answer back to its quiz backend.
 * - `label` — human-readable choice text as rendered next to the radio.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const QuizChoiceSchema = v.object({
  choiceId: v.string(),
  label: v.string(),
});

/**
 * Parsed shape of a single quiz choice.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type QuizChoice = v.InferOutput<typeof QuizChoiceSchema>;

/**
 * Payload describing a single quiz turn — question, the choices the user
 * picks from, and progress metadata for the multi-turn run.
 *
 * - `quizId` — opaque identifier the agent uses to correlate actions back
 *   to its quiz session (stable across the full run).
 * - `turnIndex` — zero-based index of the current turn. Must be a
 *   non-negative integer.
 * - `turnCount` — total number of turns in the run. Must be a positive
 *   integer. The agent is responsible for keeping `turnIndex < turnCount`.
 * - `question` — the prompt rendered above the choices.
 * - `choices` — at least two radio options the user picks from. Ordering
 *   is the agent's responsibility; the renderer displays them as given.
 * - `allowSkip` — when `true`, a Skip button is rendered that emits the
 *   `skip` action. Defaults to absent (no skip affordance).
 * - `mode` — optional quiz style hint (`socratic` for kids, `direct` for
 *   teens/adults). Reserved for future visual differentiation; the widget
 *   currently renders the same shell for both.
 *
 * @example
 * ```ts
 * const payload: QuizPayload = {
 *   quizId: 'quiz-fractions-2026-04-15',
 *   turnIndex: 2,
 *   turnCount: 5,
 *   question: 'Quelle fraction est la plus grande ?',
 *   choices: [
 *     { choiceId: 'c1', label: '1/2' },
 *     { choiceId: 'c2', label: '2/3' },
 *     { choiceId: 'c3', label: '3/4' },
 *   ],
 *   allowSkip: true,
 *   mode: 'socratic',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const QuizPayloadSchema = v.object({
  quizId: v.string(),
  turnIndex: v.pipe(v.number(), v.integer(), v.minValue(0)),
  turnCount: v.pipe(v.number(), v.integer(), v.minValue(1)),
  question: v.string(),
  choices: v.pipe(v.array(QuizChoiceSchema), v.minLength(2)),
  allowSkip: v.optional(v.boolean()),
  mode: v.optional(v.picklist(['socratic', 'direct'])),
});

/**
 * Inferred render payload for the `Quiz` widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type QuizPayload = v.InferOutput<typeof QuizPayloadSchema>;

/**
 * Action schema — user selected a choice on the current turn. `choiceId`
 * is the opaque identifier of the selected option; the agent resolves it
 * against its own quiz state to determine correctness.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const AnswerQuizActionSchema = v.object({
  quizId: v.string(),
  choiceId: v.string(),
});

/**
 * Action schema — user tapped Skip on a turn that allows skipping. The
 * agent decides whether to advance, re-ask, or abort.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SkipQuizActionSchema = v.object({
  quizId: v.string(),
});

/**
 * Action vocabulary for `Quiz`. Consumed by `registerWidget` and used by
 * the catalog to validate inbound events before forwarding them to the
 * agent.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const QuizActions = {
  answer: AnswerQuizActionSchema,
  skip: SkipQuizActionSchema,
} as const;
