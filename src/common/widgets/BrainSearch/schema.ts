// packages/canvas/src/common/widgets/BrainSearch/schema.ts

/**
 * @fileoverview BrainSearch widget schemas
 * @description Valibot contracts for the BrainSearch canvas widget. A
 *   BrainSearch renders a tag-first search result set over the member's
 *   2nd-brain — a list of matching entries plus a filter strip of tags
 *   the user can toggle to narrow the set further.
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
 * A single 2nd-brain entry returned by a BrainSearch query.
 *
 * - `entryId` — stable id of the brain entry; echoed back in `open` events.
 * - `title` — short human label for the entry.
 * - `snippet` — short preview of the entry body (plain text, framework escapes).
 * - `tags` — tags associated with the entry, used by the filter strip.
 * - `score` — optional relevance score in `[0, 1]` for ranking hints.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const BrainResultSchema = v.object({
  entryId: v.string(),
  title: v.string(),
  snippet: v.string(),
  tags: v.array(v.string()),
  score: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1))),
});

/**
 * Validated shape of a single BrainSearch result row.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type BrainResult = v.InferOutput<typeof BrainResultSchema>;

/**
 * Render payload for the BrainSearch widget.
 *
 * Describes the current state of a tag-first search over the member's
 * 2nd-brain. The widget is uncontrolled: it never mutates this payload
 * locally. Toggling a filter emits a `filter_tag` action and the agent
 * is expected to re-query and push an updated payload.
 *
 * - `query` — the free-text query string (displayed, not edited here).
 * - `activeTags` — tags currently constraining the result set.
 * - `availableTags` — tags offered as filter chips (superset of
 *   `activeTags`; inactive chips widen the filter when clicked).
 * - `results` — matching entries, already filtered by `activeTags`
 *   and ordered by the agent.
 *
 * @example
 * ```ts
 * const payload: BrainSearchPayload = {
 *   query: 'penicillin',
 *   activeTags: ['health'],
 *   availableTags: ['health', 'allergy', 'medication', 'kid'],
 *   results: [
 *     {
 *       entryId: 'mem-2026-04-15-flora-penicillin',
 *       title: 'Flora — penicillin allergy',
 *       snippet: 'Flora is allergic to penicillin.',
 *       tags: ['health', 'allergy', 'medication', 'kid'],
 *       score: 0.92,
 *     },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const BrainSearchPayloadSchema = v.object({
  query: v.string(),
  activeTags: v.array(v.string()),
  availableTags: v.array(v.string()),
  results: v.array(BrainResultSchema),
});

/**
 * Validated render payload for the BrainSearch widget. Widgets cast the
 * framework-level `unknown` payload to this type — the catalog has
 * already parsed it against {@link BrainSearchPayloadSchema}.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type BrainSearchPayload = v.InferOutput<typeof BrainSearchPayloadSchema>;

/**
 * Event payload emitted when the user clicks a result row to open the
 * full 2nd-brain entry.
 *
 * @example
 * ```ts
 * emit('open', { entryId: result.entryId });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const OpenEntryActionSchema = v.object({
  entryId: v.string(),
});

/**
 * Event payload emitted when the user toggles a tag filter chip.
 *
 * `active` is the NEW desired state after the toggle — `true` means the
 * user wants the tag added to `activeTags`, `false` means removed. The
 * agent applies the change and pushes an updated payload.
 *
 * @example
 * ```ts
 * const nextActive = !payload.activeTags.includes(tag);
 * emit('filter_tag', { tag, active: nextActive });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const FilterTagActionSchema = v.object({
  tag: v.string(),
  active: v.boolean(),
});

/**
 * Action vocabulary for the BrainSearch widget — the map registered with
 * the catalog so `validateEvent` can check each incoming user action
 * against the right per-action schema.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'BrainSearch',
 *   schema: BrainSearchPayloadSchema,
 *   actions: BrainSearchActions,
 *   surface: 'private',
 *   defaultLifetime: 'ephemeral',
 *   component: BrainSearch,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const BrainSearchActions = {
  open: OpenEntryActionSchema,
  filter_tag: FilterTagActionSchema,
} as const;
