// packages/canvas/src/common/widgets/NumberLine/schema.ts

/**
 * @fileoverview NumberLine widget schemas
 * @description Valibot schemas + TypeScript types for the `NumberLine`
 *   private-surface canvas widget — a kid-facing math helper where the
 *   child drags a marker along a number line to answer a prompt
 *   ("where does 7 go?", "show me 3+4").
 *
 *   Payload describes the line (min, max, optional step) and the current
 *   marker position (`value`). Optional `targets` are informational
 *   markers rendered below the line (the right answers, visible hints,
 *   etc.). The widget is purely reactive — the agent owns the state and
 *   pushes payload updates; user interactions are emitted back as
 *   `set_value` (on slider commit) and `submit` (on explicit confirm).
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Render payload for the `NumberLine` widget.
 *
 * - `lineId` — opaque identifier the agent uses to correlate actions back
 *   to its homework session / exercise backend.
 * - `prompt` — human-readable question shown as the card title
 *   ("Where does 7 go?", "Show me 3 + 4").
 * - `min` / `max` — inclusive bounds of the number line.
 * - `step` — optional snap step; when omitted the slider moves
 *   continuously (Radix default).
 * - `value` — current marker position. Used as the slider's
 *   `defaultValue` — the slider is uncontrolled inside the widget so the
 *   kid's in-flight drag is never interrupted by a re-render.
 * - `targets` — optional informational markers rendered under the line.
 *   Non-interactive — purely visual hints (e.g. the correct answer once
 *   revealed, or a set of "landmarks" like 0, 5, 10).
 * - `showTicks` — optional flag toggling the target row. Defaults to
 *   `true` when `targets` is non-empty; explicit `false` suppresses them.
 *
 * @example
 * ```ts
 * const payload: NumberLinePayload = {
 *   lineId: 'flora-addition-1',
 *   prompt: 'Show me 3 + 4',
 *   min: 0,
 *   max: 10,
 *   step: 1,
 *   value: 0,
 *   targets: [7],
 *   showTicks: true,
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NumberLinePayloadSchema = v.object({
  lineId: v.string(),
  prompt: v.string(),
  min: v.number(),
  max: v.number(),
  step: v.optional(v.number()),
  value: v.number(),
  targets: v.optional(v.array(v.number())),
  showTicks: v.optional(v.boolean()),
});

/**
 * Inferred render payload for the `NumberLine` widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type NumberLinePayload = v.InferOutput<typeof NumberLinePayloadSchema>;

/**
 * Action schema — user released the slider on a new position. Emitted
 * on `onValueCommit` (drag end), not `onValueChange`, so the agent is
 * not spammed during a drag.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SetValueActionSchema = v.object({
  lineId: v.string(),
  value: v.number(),
});

/**
 * Action schema — user tapped "Submit" to confirm the current marker
 * position as their answer.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SubmitActionSchema = v.object({
  lineId: v.string(),
  value: v.number(),
});

/**
 * Action vocabulary for `NumberLine`. Consumed by `registerWidget` and
 * used by the catalog to validate inbound events before forwarding them
 * to the agent.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const NumberLineActions = {
  set_value: SetValueActionSchema,
  submit: SubmitActionSchema,
} as const;
