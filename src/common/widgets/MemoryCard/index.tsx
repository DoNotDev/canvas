// packages/canvas/src/common/widgets/MemoryCard/index.tsx

/**
 * @fileoverview MemoryCard canvas widget
 * @description Household-surface human-in-the-loop memory widget. The
 *   agent proposes a fact it would like to persist to the 2nd-brain /
 *   preferences store ("Flora is allergic to penicillin") and the user
 *   confirms or rejects before anything is written.
 *
 *   Uncontrolled: this widget never mutates the proposal locally. Every
 *   interaction emits an action and the agent is the source of truth. A
 *   `reject` in v1 emits no `reason` — the agent can follow up in a
 *   subsequent turn to gather one if needed.
 *
 *   Registered on the `household` surface with an `ephemeral` default
 *   lifetime — a proposal lives only until the turn resolves.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Alert, Button, ButtonGroup, Text } from '@donotdev/components';

import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';
import {
  MemoryCardActions,
  MemoryCardPayloadSchema,
  type MemoryCardPayload,
} from './schema';

/**
 * Human-readable label for each storage scope. Keeps the body of the
 * alert dense and explicit about where the memory would land.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
const SCOPE_LABELS: Record<MemoryCardPayload['scope'], string> = {
  household: 'Household',
  member: 'Member',
  kid: 'Kid',
};

/**
 * MemoryCard canvas widget component.
 *
 * The `payload` prop is typed as `unknown` at the framework level; the
 * catalog has already validated it against
 * {@link MemoryCardPayloadSchema} before this component renders, so the
 * local cast is sound.
 *
 * Visual contract:
 * - `Alert` with the `info` variant, title "Remember this?" and a body
 *   containing the subject, the statement, a scope label, and — when
 *   present — tags and source provenance.
 * - `ButtonGroup` with Confirm (primary, emits `confirm`) and Reject
 *   (outline, emits `reject` with no reason).
 *
 * Emits:
 * - `confirm` with `{ memoryId }` — user accepts the memory.
 * - `reject` with `{ memoryId }` — user rejects the memory (no reason
 *   in v1).
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MemoryCard: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const memory = payload as MemoryCardPayload;
  const scopeLabel = SCOPE_LABELS[memory.scope];
  const hasTags = memory.tags !== undefined && memory.tags.length > 0;

  const description = (
    <>
      <Text as="p">
        <Text as="span" variant="primary">
          {memory.subject}
        </Text>
        {' \u2014 '}
        {memory.statement}
      </Text>
      <Text as="p" level="small" variant="muted">
        {`Scope: ${scopeLabel}`}
        {hasTags ? ` \u00B7 Tags: ${memory.tags!.join(', ')}` : ''}
      </Text>
      {memory.source ? (
        <Text as="p" level="small" variant="muted">
          {memory.source}
        </Text>
      ) : null}
      <ButtonGroup
        aria-label={`${memory.subject} memory actions`}
        variant="outline"
      >
        <Button
          variant="primary"
          icon="Check"
          onClick={() => emit('confirm', { memoryId: memory.memoryId })}
        >
          Confirm
        </Button>
        <Button
          variant="outline"
          icon="X"
          onClick={() => emit('reject', { memoryId: memory.memoryId })}
        >
          Reject
        </Button>
      </ButtonGroup>
    </>
  );

  return (
    <Alert variant="info" title="Remember this?" description={description} />
  );
};

registerWidget({
  kind: 'MemoryCard',
  schema: MemoryCardPayloadSchema,
  actions: MemoryCardActions,
  surface: 'household',
  defaultLifetime: 'ephemeral',
  component: MemoryCard,
});
