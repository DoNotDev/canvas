// packages/canvas/src/common/widgets/ConceptExplainer/schema.ts

/**
 * @fileoverview ConceptExplainer widget schemas
 * @description Valibot contracts for the `ConceptExplainer` canvas widget —
 *   a private-surface stepper that walks the user through an ordered set of
 *   explanation steps at their own pace (homework, tutorials, onboarding,
 *   "explain this to me like I'm 12" flows).
 *
 *   These schemas are the trust boundary between agent-produced render
 *   payloads / user-produced action events and the renderer. Anything that
 *   does not parse here never reaches the component.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * One ordered step inside a {@link ConceptExplainerPayloadSchema}.
 *
 * - `stepId` — opaque identifier the agent uses to correlate the step back
 *   to its source material (lesson node, doc section, slide id). Echoed
 *   back on actions implicitly via the parent `conceptId`.
 * - `title` — short label shown in the stepper header.
 * - `body` — long-form explanation rendered in the card below the header
 *   when this step is active.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConceptStepSchema = v.object({
  stepId: v.string(),
  title: v.string(),
  body: v.string(),
});

/**
 * Validated shape of a single concept step.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ConceptStep = v.InferOutput<typeof ConceptStepSchema>;

/**
 * Render payload for the ConceptExplainer widget.
 *
 * The agent supplies the full ordered list of explanation steps up-front;
 * the widget reveals them one at a time under user control. `currentStepIndex`
 * is authoritative — the widget never drifts out of sync locally; every
 * Prev / Next interaction emits an action and the agent pushes an updated
 * payload back.
 *
 * - `conceptId` — stable identifier echoed back in every action.
 * - `title` — human-readable concept title shown above the stepper.
 * - `steps` — ordered explanation steps (minimum one).
 * - `currentStepIndex` — 0-based index of the currently revealed step.
 *
 * @example
 * ```ts
 * const payload: ConceptExplainerPayload = {
 *   conceptId: 'math:fractions-addition',
 *   title: 'Adding fractions with different denominators',
 *   steps: [
 *     { stepId: 's1', title: 'Find a common denominator', body: 'We need both fractions to share the same bottom number...' },
 *     { stepId: 's2', title: 'Rewrite each fraction', body: 'Multiply top and bottom by the same factor...' },
 *     { stepId: 's3', title: 'Add the numerators', body: 'Once the denominators match, add only the top numbers...' },
 *   ],
 *   currentStepIndex: 0,
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConceptExplainerPayloadSchema = v.object({
  conceptId: v.string(),
  title: v.string(),
  steps: v.pipe(v.array(ConceptStepSchema), v.minLength(1)),
  currentStepIndex: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

/**
 * Validated render payload for the ConceptExplainer widget. Widgets cast
 * the framework-level `unknown` payload to this type — the catalog has
 * already parsed it against {@link ConceptExplainerPayloadSchema}.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ConceptExplainerPayload = v.InferOutput<
  typeof ConceptExplainerPayloadSchema
>;

/**
 * Event payload emitted when the user asks to advance to the next step.
 * The agent is authoritative over `currentStepIndex` — the widget sends
 * the `conceptId` only and the agent decides how to update the payload
 * (usually by incrementing the index).
 *
 * @example
 * ```ts
 * emit('next_step', { conceptId: payload.conceptId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NextStepActionSchema = v.object({
  conceptId: v.string(),
});

/**
 * Event payload emitted when the user asks to go back to the previous
 * step. The widget disables the Prev button at index 0, so the agent will
 * only ever receive this when a decrement is safe.
 *
 * @example
 * ```ts
 * emit('prev_step', { conceptId: payload.conceptId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const PrevStepActionSchema = v.object({
  conceptId: v.string(),
});

/**
 * Event payload emitted when the user confirms the explanation is
 * complete (Done button on the final step). The agent typically closes
 * the widget or follows up with a comprehension check.
 *
 * @example
 * ```ts
 * emit('done', { conceptId: payload.conceptId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const DoneActionSchema = v.object({
  conceptId: v.string(),
});

/**
 * Action vocabulary for the ConceptExplainer widget — the map registered
 * with the catalog so `validateEvent` can check each incoming user action
 * against the right per-action schema.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'ConceptExplainer',
 *   schema: ConceptExplainerPayloadSchema,
 *   actions: ConceptExplainerActions,
 *   surface: 'private',
 *   defaultLifetime: 'session',
 *   component: ConceptExplainer,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConceptExplainerActions = {
  next_step: NextStepActionSchema,
  prev_step: PrevStepActionSchema,
  done: DoneActionSchema,
} as const;
