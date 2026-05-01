// packages/canvas/src/common/widgets/MemoryCard/schema.ts

/**
 * @fileoverview MemoryCard widget schemas
 * @description Valibot contracts for the MemoryCard canvas widget. A
 *   MemoryCard surfaces a proposed memory the agent wants to save to the
 *   household's 2nd-brain / preferences store ("Flora is allergic to
 *   penicillin"). The user confirms or rejects before anything is
 *   persisted — human-in-the-loop gate on long-term state.
 *
 *   Schemas here are the trust boundary between agent-produced render
 *   payloads / user-produced action events and the renderer. Anything
 *   that does not parse here never reaches the component.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Render payload for the MemoryCard widget.
 *
 * Describes a single proposed memory that has NOT yet been written to the
 * 2nd-brain / preferences store. `memoryId` is stable across updates so
 * the agent can refine the proposal (e.g., adjust tags) without tearing
 * down the widget.
 *
 * - `memoryId` — stable id echoed back in every action.
 * - `subject` — short human identifier of who/what the memory is about
 *   (e.g., "Flora", "Household", "Marceau's bedroom").
 * - `statement` — the fact to remember, in plain language
 *   (e.g., "Is allergic to penicillin.").
 * - `scope` — storage scope: `household` (shared), `member` (a single
 *   member's private brain), `kid` (a kid profile).
 * - `tags` — optional free-text tags for retrieval.
 * - `source` — optional human-readable provenance hint
 *   (e.g., "Mentioned by Rodolphe on 2026-04-15").
 *
 * @example
 * ```ts
 * const payload: MemoryCardPayload = {
 *   memoryId: 'mem-2026-04-15-flora-penicillin',
 *   subject: 'Flora',
 *   statement: 'Is allergic to penicillin.',
 *   scope: 'kid',
 *   tags: ['health', 'allergy', 'medication'],
 *   source: 'Mentioned by Rodolphe on 2026-04-15',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MemoryCardPayloadSchema = v.object({
  memoryId: v.string(),
  subject: v.string(),
  statement: v.string(),
  scope: v.picklist(['household', 'member', 'kid']),
  tags: v.optional(v.array(v.string())),
  source: v.optional(v.string()),
});

/**
 * Validated render payload for the MemoryCard widget. Widgets cast the
 * framework-level `unknown` payload to this type — the catalog has
 * already parsed it against {@link MemoryCardPayloadSchema}.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type MemoryCardPayload = v.InferOutput<typeof MemoryCardPayloadSchema>;

/**
 * Event payload emitted when the user confirms the proposed memory. The
 * agent is expected to write it to the 2nd-brain / preferences store on
 * receipt.
 *
 * @example
 * ```ts
 * emit('confirm', { memoryId: payload.memoryId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ConfirmMemoryActionSchema = v.object({
  memoryId: v.string(),
});

/**
 * Event payload emitted when the user rejects the proposed memory. The
 * agent is expected to drop the proposal and not write anything. The
 * optional `reason` is free-text feedback the agent can use to refine
 * future proposals; v1 UI emits no reason.
 *
 * @example
 * ```ts
 * emit('reject', { memoryId: payload.memoryId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const RejectMemoryActionSchema = v.object({
  memoryId: v.string(),
  reason: v.optional(v.string()),
});

/**
 * Action vocabulary for the MemoryCard widget — the map registered with
 * the catalog so `validateEvent` can check each incoming user action
 * against the right per-action schema.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'MemoryCard',
 *   schema: MemoryCardPayloadSchema,
 *   actions: MemoryCardActions,
 *   surface: 'household',
 *   defaultLifetime: 'ephemeral',
 *   component: MemoryCard,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const MemoryCardActions = {
  confirm: ConfirmMemoryActionSchema,
  reject: RejectMemoryActionSchema,
} as const;
