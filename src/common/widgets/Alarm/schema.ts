// packages/canvas/src/common/widgets/Alarm/schema.ts

/**
 * @fileoverview Alarm widget schemas
 * @description Valibot schemas for the `Alarm` canvas widget — an at-time
 *   reminder card that surfaces when an alarm triggers. Lives in the
 *   `household` surface with `persistent` default lifetime so the card
 *   stays on the dashboard until the member dismisses it.
 *
 *   Payload validation is enforced by the catalog boundary
 *   (`validateBlock`). Action payloads are enforced by `validateEvent`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Render payload for the `Alarm` widget.
 *
 * - `alarmId` — opaque identifier the agent uses to correlate events back
 *   to its alarm registry.
 * - `label` — human-readable reminder text (e.g. "Wake up", "Take meds").
 * - `triggerISO` — ISO-8601 timestamp the alarm is scheduled for; the
 *   renderer formats it via `toLocaleTimeString()` for the display.
 * - `state` — lifecycle state; `dismissed` suppresses the action buttons
 *   and shows a muted marker instead.
 * - `sound` — optional sound identifier the agent hints at (purely
 *   informational at the widget level; playback is the host's concern).
 *
 * @example
 * ```ts
 * const payload: AlarmPayload = {
 *   alarmId: 'wake-up-weekdays',
 *   label: 'Wake up',
 *   triggerISO: '2026-04-15T06:30:00.000Z',
 *   state: 'ringing',
 *   sound: 'chime',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const AlarmPayloadSchema = v.object({
  alarmId: v.string(),
  label: v.string(),
  triggerISO: v.string(),
  state: v.picklist(['pending', 'ringing', 'snoozed', 'dismissed']),
  sound: v.optional(v.string()),
});

/**
 * Validated render payload for the `Alarm` widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type AlarmPayload = v.InferOutput<typeof AlarmPayloadSchema>;

/**
 * Event payload emitted when the user dismisses the alarm.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const DismissAlarmActionSchema = v.object({
  alarmId: v.string(),
});

/**
 * Event payload emitted when the user snoozes the alarm. `minutes` is the
 * requested snooze duration, clamped to a sane 1..60 window.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SnoozeAlarmActionSchema = v.object({
  alarmId: v.string(),
  minutes: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(60)),
});

/**
 * Action vocabulary for the `Alarm` widget — the map registered with the
 * catalog so `validateEvent` can check each incoming user action against
 * the right per-action schema.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const AlarmActions = {
  dismiss: DismissAlarmActionSchema,
  snooze: SnoozeAlarmActionSchema,
} as const;
