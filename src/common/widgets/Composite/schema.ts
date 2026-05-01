// packages/canvas/src/common/widgets/Composite/schema.ts

/**
 * @fileoverview Composite widget schemas
 * @description Valibot schemas for the Composite canvas widget — a
 *   meta-surface container that nests 2-3 existing catalog widgets side by
 *   side or stacked (e.g., a `DaySchedule` + a `WeatherCard` in a single
 *   agent reply).
 *
 *   The payload carries an array of child slots. Each slot is deliberately
 *   shallow at this schema layer: we trust the catalog's own
 *   `validateBlock` path at render time to type-check every child's payload
 *   against its registered widget schema. Embedding one schema inside the
 *   other would lock child validation into the parent's parse phase and
 *   break late registration ordering.
 *
 *   Composite itself is a pure container — it emits no actions. When a
 *   child widget emits, the Composite component tags the event payload
 *   with the child's `id` so the agent can demultiplex which sub-block
 *   produced it. That means `CompositeActions` stays intentionally empty:
 *   the catalog's `validateEvent` will reject any event directly aimed at
 *   the Composite wrapper.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * A single child slot inside a Composite block.
 *
 * - `id` — stable identifier scoped to this Composite. Echoed back on every
 *   event so the agent can tell which child emitted.
 * - `kind` — the catalog kind of the nested widget. Resolved at render time
 *   via `getWidget(kind)`; unknown kinds render nothing and log a warning.
 * - `payload` — opaque at this layer; validated by the resolved widget's
 *   own schema when the child mounts.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const CompositeChildSchema = v.object({
  id: v.string(),
  kind: v.string(),
  payload: v.unknown(),
});

/**
 * Validated child slot inside a Composite block.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type CompositeChild = v.InferOutput<typeof CompositeChildSchema>;

/**
 * Render payload for the Composite widget.
 *
 * - `layout` — how the children are arranged:
 *   - `row` — horizontal flex stack (`Stack direction="row"`).
 *   - `column` — vertical flex stack (`Stack direction="column"`).
 *   - `grid` — CSS grid (`Grid cols={cols ?? children.length}`).
 * - `children` — 1 to 3 child slots. The bounds are deliberate: more than
 *   three peers in a single reply creates visual noise and defeats the
 *   point of a focused canvas turn.
 * - `cols` — optional integer 1..3, honored when `layout === 'grid'`.
 *   Ignored for `row` / `column`. Defaults to `children.length` at render.
 *
 * @example
 * ```ts
 * const payload: CompositePayload = {
 *   layout: 'row',
 *   children: [
 *     { id: 'left', kind: 'DaySchedule', payload: { dateISO: '2026-04-15', events: [] } },
 *     { id: 'right', kind: 'WeatherCard', payload: { city: 'Paris', tempC: 12 } },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const CompositePayloadSchema = v.object({
  layout: v.picklist(['row', 'column', 'grid']),
  children: v.pipe(
    v.array(CompositeChildSchema),
    v.minLength(1),
    v.maxLength(3)
  ),
  cols: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(3))
  ),
});

/**
 * Validated render payload for the Composite widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type CompositePayload = v.InferOutput<typeof CompositePayloadSchema>;

/**
 * Action vocabulary for the Composite widget.
 *
 * Intentionally empty: Composite is a pure layout container. Children emit
 * their own events; the Composite component re-emits them through the host
 * `emit` with the child `id` attached so the agent can route. Keeping this
 * object typed as `{}` lets the catalog's `validateEvent` reject any event
 * addressed directly at the Composite wrapper with an "unknown action"
 * diagnostic.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const CompositeActions = {} as const;
