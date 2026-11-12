// packages/canvas/src/common/widgets/Alarm/index.tsx

/**
 * @fileoverview Alarm canvas widget
 * @description Household-surface at-time reminder — renders a card with an
 *   alarm bell icon, the reminder label, and the trigger time. Two actions:
 *   `dismiss` (closes the alarm) and `snooze` (defers by 5 minutes). When
 *   the payload's `state` is `dismissed`, the widget suppresses the action
 *   buttons and shows a muted "Dismissed" marker instead.
 *
 *   Purely uncontrolled: no internal React state. The agent owns the
 *   lifecycle — a tap emits an event and the next render of the block
 *   reflects the new `state`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { ReactElement } from 'react';

import { Button, ButtonGroup, Card, Text } from '@donotdev/components';

import { AlarmActions, AlarmPayloadSchema, type AlarmPayload } from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/** Lucide icon name shown on the Card header. */
const ALARM_ICON = 'BellRing';

/** Default snooze duration (minutes) for the "Snooze 5m" button. */
const SNOOZE_MINUTES = 5;

/**
 * `Alarm` widget component.
 *
 * The catalog guarantees `props.payload` has already been validated against
 * `AlarmPayloadSchema` before the widget is mounted, so the payload is cast
 * directly — no redundant re-parse in the render path.
 *
 * Emits:
 * - `dismiss` with `{ alarmId }` when the user taps Dismiss.
 * - `snooze` with `{ alarmId, minutes: 5 }` when the user taps Snooze 5m.
 *
 * @example
 * ```tsx
 * <Alarm
 *   payload={{
 *     alarmId: 'wake-up',
 *     label: 'Wake up',
 *     triggerISO: '2026-04-15T06:30:00.000Z',
 *     state: 'ringing',
 *   }}
 *   emit={(action, payload) => console.log(action, payload)}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export function Alarm(props: CanvasWidgetProps): ReactElement {
  // why: payload is valibot-validated against this widget's schema (validateBlock) before render
  const payload = props.payload as AlarmPayload;
  const { alarmId, label, triggerISO, state } = payload;

  const triggerTime = new Date(triggerISO).toLocaleTimeString();
  const isDismissed = state === 'dismissed';

  const handleDismiss = (): void => {
    props.emit('dismiss', { alarmId });
  };

  const handleSnooze = (): void => {
    props.emit('snooze', { alarmId, minutes: SNOOZE_MINUTES });
  };

  return (
    <Card elevated icon={ALARM_ICON} title={label} subtitle={triggerTime}>
      {isDismissed ? (
        <Text as="span" variant="muted">
          Dismissed
        </Text>
      ) : (
        <ButtonGroup aria-label={`${label} alarm actions`} variant="outline">
          <Button variant="primary" onClick={handleDismiss}>
            Dismiss
          </Button>
          <Button variant="outline" onClick={handleSnooze}>
            Snooze 5m
          </Button>
        </ButtonGroup>
      )}
    </Card>
  );
}

registerWidget({
  kind: 'Alarm',
  schema: AlarmPayloadSchema,
  actions: AlarmActions,
  surface: 'household',
  defaultLifetime: 'persistent',
  component: Alarm,
});
