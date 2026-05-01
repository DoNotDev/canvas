// packages/canvas/src/common/widgets/ProgressCanvas/schema.ts

/**
 * @fileoverview ProgressCanvas widget schemas
 * @description Valibot schemas + TypeScript types for the `ProgressCanvas`
 *   meta canvas widget — the "working on it…" card an agent shows during a
 *   long tool call. Carries a rolling list of status ticks ("searched
 *   mailbox… 240 results", "summarizing…") and an optional cancel
 *   affordance.
 *
 *   Purely reactive: the widget renders whatever ticks the agent pushes.
 *   The agent owns progress semantics; the widget owns presentation and
 *   cancellation intent.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * One status tick — a single line in the running progress log.
 *
 * - `at` — ISO-8601 timestamp the tick was recorded at; the renderer shows
 *   it in muted text next to the tick content.
 * - `text` — human-readable status line ("searched mailbox… 240 results").
 * - `state` — optional per-tick state: `pending` (spinner-ish dot),
 *   `done` (checkmark), `failed` (X). Omit to treat as `done`.
 *
 * @example
 * ```ts
 * const tick: ProgressTick = {
 *   at: '2026-04-15T18:02:03.000Z',
 *   text: 'searched mailbox… 240 results',
 *   state: 'done',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ProgressTickSchema = v.object({
  at: v.string(),
  text: v.string(),
  state: v.optional(v.picklist(['pending', 'done', 'failed'])),
});

/**
 * Inferred type for a single progress tick.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ProgressTick = v.InferOutput<typeof ProgressTickSchema>;

/**
 * Render payload for the `ProgressCanvas` widget.
 *
 * - `taskId` — opaque identifier the agent uses to correlate a cancel
 *   event back to its running tool call.
 * - `title` — optional header text ("Triaging your mailbox").
 * - `status` — overall task state. `running` drives the spinner;
 *   terminal states (`success` / `failed` / `cancelled`) suppress the
 *   spinner and the cancel button, replacing the footer with a muted
 *   final-state label.
 * - `ticks` — ordered list of status lines; newest last.
 * - `cancellable` — when `true` and `status === 'running'`, a Cancel
 *   button is shown in the footer. Omit (or `false`) to forbid
 *   cancellation for this task.
 *
 * @example
 * ```ts
 * const payload: ProgressCanvasPayload = {
 *   taskId: 'mail-triage-42',
 *   title: 'Triaging your mailbox',
 *   status: 'running',
 *   ticks: [
 *     { at: '2026-04-15T18:02:03Z', text: 'searched mailbox… 240 results', state: 'done' },
 *     { at: '2026-04-15T18:02:05Z', text: 'summarizing…', state: 'pending' },
 *   ],
 *   cancellable: true,
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ProgressCanvasPayloadSchema = v.object({
  taskId: v.string(),
  title: v.optional(v.string()),
  status: v.picklist(['running', 'success', 'failed', 'cancelled']),
  ticks: v.array(ProgressTickSchema),
  cancellable: v.optional(v.boolean()),
});

/**
 * Validated render payload for the `ProgressCanvas` widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ProgressCanvasPayload = v.InferOutput<
  typeof ProgressCanvasPayloadSchema
>;

/**
 * Event payload emitted when the user taps Cancel on a running progress
 * card. The agent resolves `taskId` to its own running tool call and
 * aborts it.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const CancelProgressActionSchema = v.object({
  taskId: v.string(),
});

/**
 * Action vocabulary for `ProgressCanvas`. Registered with the catalog so
 * `validateEvent` can check incoming cancel events against this shape.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ProgressCanvasActions = {
  cancel: CancelProgressActionSchema,
} as const;
