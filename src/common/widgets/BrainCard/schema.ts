// packages/canvas/src/common/widgets/BrainCard/schema.ts

/**
 * @fileoverview BrainCard widget schemas
 * @description Valibot contracts for the BrainCard canvas widget. A
 *   BrainCard previews a single 2nd-brain (personal knowledge) entry —
 *   title, snippet, tags — and exposes pin / archive / edit-tags actions.
 *
 *   Registered on the `private` surface: member-scoped content that must
 *   never leak to the household canvas. Schemas here are the trust
 *   boundary between agent-produced render payloads / user-produced
 *   action events and the renderer. Anything that does not parse here
 *   never reaches the component.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Render payload for the BrainCard widget.
 *
 * Describes a single 2nd-brain entry the agent wants the user to review.
 * `entryId` is stable across updates so the agent can refine the preview
 * (e.g., rewrite the snippet, adjust tags) without tearing down the
 * widget. The payload is the single source of truth — the widget never
 * mutates it locally; every user interaction emits an action and the
 * agent pushes a fresh payload in response.
 *
 * - `entryId` — stable id echoed back in every action.
 * - `title` — human-readable title of the entry.
 * - `snippet` — short excerpt or summary of the entry body.
 * - `tags` — current tag list (may be empty).
 * - `createdISO` — optional ISO-8601 creation timestamp for display.
 * - `pinned` — optional flag; when true the Pin button flips to Unpin.
 * - `archived` — optional flag; archived entries still render (the
 *   archive action is one-way in v1 and the agent decides whether to
 *   keep surfacing them).
 *
 * @example
 * ```ts
 * const payload: BrainCardPayload = {
 *   entryId: 'brain-2026-03-12-stoic-note',
 *   title: 'Marcus on morning routine',
 *   snippet: 'Begin the morning by saying to thyself, I shall meet with...',
 *   tags: ['philosophy', 'stoicism', 'morning'],
 *   createdISO: '2026-03-12T07:15:00Z',
 *   pinned: true,
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const BrainCardPayloadSchema = v.object({
  entryId: v.string(),
  title: v.string(),
  snippet: v.string(),
  tags: v.array(v.string()),
  createdISO: v.optional(v.string()),
  pinned: v.optional(v.boolean()),
  archived: v.optional(v.boolean()),
});

/**
 * Validated render payload for the BrainCard widget. Widgets cast the
 * framework-level `unknown` payload to this type — the catalog has
 * already parsed it against {@link BrainCardPayloadSchema}.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type BrainCardPayload = v.InferOutput<typeof BrainCardPayloadSchema>;

/**
 * Event payload emitted when the user pins or unpins the entry.
 *
 * `pinned` carries the *intended* new state (the flipped boolean), not
 * the current state — the agent should persist it verbatim rather than
 * toggling server-side.
 *
 * @example
 * ```ts
 * emit('pin', { entryId: payload.entryId, pinned: !payload.pinned });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const PinBrainActionSchema = v.object({
  entryId: v.string(),
  pinned: v.boolean(),
});

/**
 * Event payload emitted when the user archives the entry. Archive is
 * one-way in v1; the agent decides whether to keep surfacing archived
 * entries in future turns.
 *
 * @example
 * ```ts
 * emit('archive', { entryId: payload.entryId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ArchiveBrainActionSchema = v.object({
  entryId: v.string(),
});

/**
 * Event payload emitted when the user edits the entry's tag list.
 *
 * The full replacement `tags` array is sent — the agent replaces the
 * stored list verbatim rather than diffing. v1 defers inline tag
 * editing to the agent (no editor in the widget); this schema exists
 * so an agent-driven tag editor can still round-trip through the
 * canvas action channel.
 *
 * @example
 * ```ts
 * emit('edit_tags', {
 *   entryId: payload.entryId,
 *   tags: ['philosophy', 'stoicism'],
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const EditTagsActionSchema = v.object({
  entryId: v.string(),
  tags: v.array(v.string()),
});

/**
 * Action vocabulary for the BrainCard widget — the map registered with
 * the catalog so `validateEvent` can check each incoming user action
 * against the right per-action schema.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'BrainCard',
 *   schema: BrainCardPayloadSchema,
 *   actions: BrainCardActions,
 *   surface: 'private',
 *   defaultLifetime: 'ephemeral',
 *   component: BrainCard,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const BrainCardActions = {
  pin: PinBrainActionSchema,
  archive: ArchiveBrainActionSchema,
  edit_tags: EditTagsActionSchema,
} as const;
