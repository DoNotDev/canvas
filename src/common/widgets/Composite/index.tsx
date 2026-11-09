// packages/canvas/src/common/widgets/Composite/index.tsx

/**
 * @fileoverview Composite canvas widget
 * @description Meta-surface container that nests 2-3 existing catalog
 *   widgets side by side or stacked. Lets the agent render, for instance,
 *   a `DaySchedule` next to a `WeatherCard` in a single reply without
 *   inventing a bespoke combined widget.
 *
 *   Child widgets are resolved at render time via the catalog's
 *   `getWidget(kind)`. Because every widget self-registers on import and
 *   the `widgets/index.ts` barrel has already evaluated those side effects
 *   before any `CanvasHost` render, lookup is synchronous and deterministic
 *   — no ordering concerns.
 *
 *   Layout:
 *   - `row` / `column` → `Stack direction=...`.
 *   - `grid` → `Grid cols={cols ?? children.length}`.
 *
 *   Event fan-out: Composite does NOT emit its own actions (its
 *   `actions` vocabulary is empty). When a child emits, the Composite
 *   re-emits on the host `emit` with `childId` attached to the payload so
 *   the agent can demultiplex which nested block produced the event.
 *
 *   Self-registers with the canvas catalog at module import time so the
 *   `widgets/index.ts` barrel only has to add `import './Composite';`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Fragment, type FC, type ReactNode } from 'react';
import * as v from 'valibot';

import { Grid, Stack } from '@donotdev/components';

import {
  CompositeActions,
  CompositePayloadSchema,
  type CompositeChild,
  type CompositePayload,
} from './schema';
import { getWidget, registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * Render a single child slot by resolving its `kind` against the catalog
 * AND re-validating the child payload against that widget's payload schema.
 *
 * The outer `CanvasBlockSchema` parses `payload` as `v.unknown()`, and the
 * `CompositeChildSchema` does the same for each nested child — the catalog
 * is the single place where per-widget payload shapes are enforced.
 * Composite therefore MUST re-run the child's schema before mounting, or
 * an LLM-crafted malformed sub-payload can reach a component that trusts
 * the cast. Unknown kinds and payload mismatches both render nothing and
 * log — matches the `validateBlock` policy of failing closed.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function renderChild(
  child: CompositeChild,
  emit: CanvasWidgetProps['emit']
): ReactNode {
  const widget = getWidget(child.kind);
  if (!widget) {
    console.warn(
      `[canvas] Composite: unknown child kind "${child.kind}" — skipped.`
    );
    return null;
  }

  const parsed = v.safeParse(widget.schema, child.payload);
  if (!parsed.success) {
    console.warn(
      `[canvas] Composite: payload for child "${child.id}" (${child.kind}) rejected — skipped.`
    );
    return null;
  }

  const childEmit: CanvasWidgetProps['emit'] = (action, payload) => {
    // Tag the event with the child's id so the agent can demultiplex.
    // `payload` is `unknown` at the interface; spread only when it's an
    // object so we don't clobber primitives or arrays.
    const tagged =
      payload !== null && typeof payload === 'object' && !Array.isArray(payload)
        ? { ...(payload as Record<string, unknown>), childId: child.id }
        : { childId: child.id, value: payload };
    emit(action, tagged);
  };

  const Component = widget.component;
  return <Component payload={parsed.output} emit={childEmit} />;
}

/**
 * Composite — 1-3 catalog widgets rendered side by side or stacked.
 *
 * The Composite envelope is validated by the catalog before the component
 * mounts, so the cast to `CompositePayload` is sound. Each nested child's
 * payload is re-validated inside `renderChild` against the child widget's
 * own schema — the outer envelope only locks the wire shape, not per-kind
 * payloads.
 *
 * @example
 * ```tsx
 * <Composite
 *   payload={{
 *     layout: 'row',
 *     children: [
 *       { id: 'schedule', kind: 'DaySchedule', payload: { dateISO: '2026-04-15', events: [] } },
 *       { id: 'weather', kind: 'WeatherCard', payload: { city: 'Paris', tempC: 12 } },
 *     ],
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const Composite: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const data = payload as CompositePayload;
  const { layout, children, cols } = data;

  const rendered = children.map((child) => (
    <Fragment key={child.id}>{renderChild(child, emit)}</Fragment>
  ));

  if (layout === 'grid') {
    return <Grid cols={cols ?? children.length}>{rendered}</Grid>;
  }

  return (
    <Stack direction={layout} gap="medium">
      {rendered}
    </Stack>
  );
};

registerWidget({
  kind: 'Composite',
  schema: CompositePayloadSchema,
  actions: CompositeActions,
  surface: 'meta',
  defaultLifetime: 'ephemeral',
  component: Composite,
});
