// packages/canvas/src/common/widgets/Checklist/schema.ts

/**
 * @fileoverview Checklist widget schemas
 * @description Valibot schemas + TypeScript types for the `Checklist`
 *   household canvas widget. Defines the render payload (a titled list of
 *   done/not-done items) and the action vocabulary (`toggle`, `remove`,
 *   `add`) the renderer may emit back to the agent.
 *
 *   These schemas are consumed by the canvas catalog to validate agent
 *   payloads at the trust boundary before rendering, and to validate user
 *   events before forwarding them to the agent.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * One item inside a `Checklist` payload.
 *
 * - `itemId` — opaque identifier the agent uses to correlate items back to
 *   its list backend (shopping list entry, to-do row, etc.).
 * - `text` — human-readable item text.
 * - `done` — completion flag.
 * - `note` — optional free-text annotation shown under the main text
 *   (quantity, brand, priority, etc.).
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ChecklistItemSchema = v.object({
  itemId: v.string(),
  text: v.string(),
  done: v.boolean(),
  note: v.optional(v.string()),
});

/**
 * Parsed shape of a single checklist item.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ChecklistItem = v.InferOutput<typeof ChecklistItemSchema>;

/**
 * Payload describing a full checklist: list identity, title, and the
 * ordered items.
 *
 * Ordering is the agent's responsibility — the renderer displays items in
 * the order supplied and never re-sorts.
 *
 * @example
 * ```ts
 * const payload: ChecklistPayload = {
 *   listId: 'shopping:weekly',
 *   title: 'Groceries',
 *   items: [
 *     { itemId: 'i1', text: 'Milk', done: false, note: '2 L' },
 *     { itemId: 'i2', text: 'Bread', done: true },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ChecklistPayloadSchema = v.object({
  listId: v.string(),
  title: v.string(),
  items: v.array(ChecklistItemSchema),
});

/**
 * Inferred render payload for the `Checklist` widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ChecklistPayload = v.InferOutput<typeof ChecklistPayloadSchema>;

/**
 * Action schema — user toggled an item's checkbox. `done` is the NEW
 * value the user requested (not a toggle-delta).
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ToggleItemActionSchema = v.object({
  listId: v.string(),
  itemId: v.string(),
  done: v.boolean(),
});

/**
 * Action schema — user removed an item from the list.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const RemoveItemActionSchema = v.object({
  listId: v.string(),
  itemId: v.string(),
});

/**
 * Action schema — user added a new item. `text` is the requested item
 * text (minimum 1 character). The agent mints the real `itemId` when it
 * re-renders the list.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const AddItemActionSchema = v.object({
  listId: v.string(),
  text: v.pipe(v.string(), v.minLength(1)),
});

/**
 * Action vocabulary for `Checklist`. Consumed by `registerWidget` and
 * used by the catalog to validate inbound events before forwarding them
 * to the agent.
 *
 * @example
 * ```ts
 * registerWidget({
 *   kind: 'Checklist',
 *   schema: ChecklistPayloadSchema,
 *   actions: ChecklistActions,
 *   surface: 'household',
 *   defaultLifetime: 'persistent',
 *   component: Checklist,
 * });
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ChecklistActions = {
  toggle: ToggleItemActionSchema,
  remove: RemoveItemActionSchema,
  add: AddItemActionSchema,
} as const;
