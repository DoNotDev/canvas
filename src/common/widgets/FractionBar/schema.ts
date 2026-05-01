// packages/canvas/src/common/widgets/FractionBar/schema.ts

/**
 * @fileoverview FractionBar widget schemas
 * @description Valibot schemas + TypeScript types for the `FractionBar`
 *   private-surface (kid / homework) canvas widget. Defines the render
 *   payload (a prompt plus a bar of `denominator` equal parts with
 *   `numerator` shaded) and the action vocabulary
 *   (`set_numerator`, `set_denominator`, `submit`) the renderer may emit
 *   back to the agent.
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
 * Payload describing a single fraction-manipulator bar.
 *
 * - `barId` — opaque identifier the agent uses to correlate actions back
 *   to its homework / exercise backend.
 * - `prompt` — human-readable instruction ("Show 3/4", "What is a half?").
 * - `numerator` — integer count of shaded parts. Must be >= 0 and is
 *   expected to be <= `denominator`; the agent owns that invariant.
 * - `denominator` — integer count of equal parts the bar is divided into.
 *   Must be in `[1, 12]` — 12 is the rendering ceiling for a single bar.
 * - `maxDenominator` — optional upper bound the user can raise the
 *   denominator to via the `+` control. When omitted the widget uses 12.
 *   Must be in `[2, 12]`.
 *
 * @example
 * ```ts
 * const payload: FractionBarPayload = {
 *   barId: 'hw-frac-001',
 *   prompt: 'Show 3/4',
 *   numerator: 2,
 *   denominator: 4,
 *   maxDenominator: 8,
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const FractionBarPayloadSchema = v.object({
  barId: v.string(),
  prompt: v.string(),
  numerator: v.pipe(v.number(), v.integer(), v.minValue(0)),
  denominator: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)),
  maxDenominator: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(2), v.maxValue(12))
  ),
});

/**
 * Inferred render payload for the `FractionBar` widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type FractionBarPayload = v.InferOutput<typeof FractionBarPayloadSchema>;

/**
 * Action schema — user requested a new numerator (tap on a bar cell or
 * on the numerator +/- controls). `numerator` is the NEW absolute value
 * (not a delta). The agent is responsible for clamping to the current
 * denominator before re-rendering.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SetNumeratorActionSchema = v.object({
  barId: v.string(),
  numerator: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

/**
 * Action schema — user requested a new denominator (tap on denominator
 * +/- controls). `denominator` is the NEW absolute value (not a delta).
 * The agent is responsible for clamping to `[1, maxDenominator]` and for
 * deciding whether to preserve or rescale the numerator.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SetDenominatorActionSchema = v.object({
  barId: v.string(),
  denominator: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

/**
 * Action schema — user tapped "Submit" to assert the current
 * `numerator / denominator` matches the prompt. Carries both values so
 * the agent can grade without re-reading its state.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SubmitFractionActionSchema = v.object({
  barId: v.string(),
  numerator: v.pipe(v.number(), v.integer(), v.minValue(0)),
  denominator: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

/**
 * Action vocabulary for `FractionBar`. Consumed by `registerWidget` and
 * used by the catalog to validate inbound events before forwarding them
 * to the agent.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'FractionBar',
 *   schema: FractionBarPayloadSchema,
 *   actions: FractionBarActions,
 *   surface: 'private',
 *   defaultLifetime: 'session',
 *   component: FractionBar,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const FractionBarActions = {
  set_numerator: SetNumeratorActionSchema,
  set_denominator: SetDenominatorActionSchema,
  submit: SubmitFractionActionSchema,
} as const;
