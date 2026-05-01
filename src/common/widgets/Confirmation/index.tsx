// packages/canvas/src/common/widgets/Confirmation/index.tsx

/**
 * @fileoverview Confirmation canvas widget
 * @description Meta-surface "are you sure?" blocker. The agent emits this
 *   before running a destructive or otherwise consequential tool call
 *   ("send email", "archive 47 items", "delete calendar event"). Two
 *   actions: `confirm` (the agent proceeds with the pending tool call)
 *   and `cancel` (the agent drops it).
 *
 *   Implementation note: the framework's `AlertDialog` exposes a
 *   controlled `open` API but hardcodes its footer to a `ghost` Cancel +
 *   `accent` Confirm pair — it accepts no `children` / custom footer and
 *   cannot surface a `destructive` / `warning` Confirm button as the spec
 *   requires. Per the spec's explicit fallback clause, we render an
 *   `Alert` (tone mapped from `severity`) with a `ButtonGroup` footer
 *   whose Confirm button carries the severity-matched variant. This keeps
 *   the visual severity contract the spec locks in and still composes
 *   only from `@donotdev/components` atomics.
 *
 *   Uncontrolled: no internal React state. The agent owns lifecycle — a
 *   tap emits `confirm` / `cancel` and the next render reflects the
 *   agent's decision (widget typically unmounts after `ephemeral`
 *   expiry).
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import {
  Alert,
  Button,
  ButtonGroup,
  Text,
  type AlertVariant,
  type ButtonVariant,
} from '@donotdev/components';

import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

import {
  ConfirmationActions,
  ConfirmationPayloadSchema,
  type ConfirmationPayload,
} from './schema';

/**
 * Map the payload `severity` to the Confirm button's theme variant.
 * `destructive` + `warning` carry their own theme; anything else
 * (including the default `info`) renders as `primary`.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
const CONFIRM_VARIANT: Record<
  NonNullable<ConfirmationPayload['severity']>,
  ButtonVariant
> = {
  destructive: 'destructive',
  warning: 'warning',
  info: 'primary',
};

/**
 * Map the payload `severity` to the enclosing `Alert` variant. Kept in
 * sync with `CONFIRM_VARIANT` so the frame and the Confirm CTA share the
 * same tone.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
const ALERT_VARIANT: Record<
  NonNullable<ConfirmationPayload['severity']>,
  AlertVariant
> = {
  destructive: 'error',
  warning: 'warning',
  info: 'info',
};

/**
 * `Confirmation` widget component.
 *
 * The catalog guarantees `props.payload` has already been validated
 * against {@link ConfirmationPayloadSchema} before the widget is mounted,
 * so the payload is cast directly — no redundant re-parse in the render
 * path.
 *
 * Visual contract:
 * - `Alert` with a variant derived from `severity` (`destructive` ->
 *   `error`, `warning` -> `warning`, else `info`). Title is the payload
 *   `title`; description renders the `message` plus the action
 *   `ButtonGroup`.
 * - `ButtonGroup` footer: Cancel `Button` (`outline`, emits `cancel`,
 *   label = `cancelLabel ?? 'Cancel'`), Confirm `Button` (variant keyed
 *   off `severity` via `CONFIRM_VARIANT`, emits `confirm`, label =
 *   `confirmLabel ?? 'Confirm'`).
 *
 * Emits:
 * - `confirm` with `{ confirmationId }` — user approves the pending
 *   tool call.
 * - `cancel` with `{ confirmationId }` — user rejects the pending
 *   tool call.
 *
 * @example
 * ```tsx
 * <Confirmation
 *   payload={{
 *     confirmationId: 'send-email-42',
 *     title: 'Send this email?',
 *     message: 'This will send the draft to 3 recipients.',
 *     severity: 'warning',
 *   }}
 *   emit={(action, payload) => console.log(action, payload)}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const Confirmation: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const data = payload as ConfirmationPayload;
  const severity = data.severity ?? 'info';
  const confirmLabel = data.confirmLabel ?? 'Confirm';
  const cancelLabel = data.cancelLabel ?? 'Cancel';

  const description = (
    <>
      <Text as="p">{data.message}</Text>
      <ButtonGroup
        aria-label={`${data.title} confirmation actions`}
        variant="outline"
      >
        <Button
          variant="outline"
          onClick={() =>
            emit('cancel', { confirmationId: data.confirmationId })
          }
        >
          {cancelLabel}
        </Button>
        <Button
          variant={CONFIRM_VARIANT[severity]}
          onClick={() =>
            emit('confirm', { confirmationId: data.confirmationId })
          }
        >
          {confirmLabel}
        </Button>
      </ButtonGroup>
    </>
  );

  return (
    <Alert
      variant={ALERT_VARIANT[severity]}
      title={data.title}
      description={description}
    />
  );
};

registerWidget({
  kind: 'Confirmation',
  schema: ConfirmationPayloadSchema,
  actions: ConfirmationActions,
  surface: 'meta',
  defaultLifetime: 'ephemeral',
  component: Confirmation,
});
