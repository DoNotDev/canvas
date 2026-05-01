// packages/canvas/src/common/widgets/Timer/schema.ts

/**
 * @fileoverview Timer widget schemas
 * @description Valibot schemas + TypeScript types for the `Timer` household
 *   canvas widget. Defines the render payload (countdown state) and the
 *   action vocabulary (`pause`, `resume`, `reset`, `dismiss`) the renderer
 *   may emit back to the agent.
 *
 *   The widget is purely reactive — it never ticks on its own. The agent
 *   pushes payload updates with the new `remainingSec`; the widget renders
 *   whatever it receives.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Payload describing a single countdown timer: total duration, what is
 * still left, and the current lifecycle state.
 *
 * - `timerId` — opaque identifier the agent uses to correlate actions
 *   back to its timer backend.
 * - `label` — optional human-readable name ("Pasta", "Pomodoro", …).
 * - `durationSec` — total configured duration in seconds. Must be >= 0.
 * - `remainingSec` — seconds still left in the countdown. Must be >= 0
 *   and is expected to be <= `durationSec`; the agent is responsible for
 *   maintaining that invariant across ticks.
 * - `state` — lifecycle: `running` ticking down, `paused` frozen,
 *   `finished` at zero awaiting dismissal, `idle` not yet started.
 * - `startedAtISO` — optional ISO-8601 timestamp of the last start /
 *   resume. Useful for clients that wish to interpolate between agent
 *   ticks; the widget itself does not use it.
 *
 * @example
 * ```ts
 * const payload: TimerPayload = {
 *   timerId: 'tmr-pasta',
 *   label: 'Pasta',
 *   durationSec: 480,
 *   remainingSec: 325,
 *   state: 'running',
 *   startedAtISO: '2026-04-15T18:02:00.000Z',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const TimerPayloadSchema = v.object({
  timerId: v.string(),
  label: v.optional(v.string()),
  durationSec: v.pipe(v.number(), v.minValue(0)),
  remainingSec: v.pipe(v.number(), v.minValue(0)),
  state: v.picklist(['running', 'paused', 'finished', 'idle']),
  startedAtISO: v.optional(v.string()),
});

/**
 * Inferred render payload for the `Timer` widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type TimerPayload = v.InferOutput<typeof TimerPayloadSchema>;

/**
 * Action schema — user tapped "Pause" on a running timer.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const PauseTimerActionSchema = v.object({
  timerId: v.string(),
});

/**
 * Action schema — user tapped "Resume" on a paused timer.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ResumeTimerActionSchema = v.object({
  timerId: v.string(),
});

/**
 * Action schema — user tapped "Reset" to restore the timer to its full
 * `durationSec` and stop the countdown. The agent decides whether that
 * means `idle` or `paused`.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ResetTimerActionSchema = v.object({
  timerId: v.string(),
});

/**
 * Action schema — user tapped "Dismiss" on a finished timer to clear the
 * alert.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const DismissTimerActionSchema = v.object({
  timerId: v.string(),
});

/**
 * Action vocabulary for `Timer`. Consumed by `registerWidget` and used by
 * the catalog to validate inbound events before forwarding them to the
 * agent.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const TimerActions = {
  pause: PauseTimerActionSchema,
  resume: ResumeTimerActionSchema,
  reset: ResetTimerActionSchema,
  dismiss: DismissTimerActionSchema,
} as const;
