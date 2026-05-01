// packages/canvas/src/client/CanvasHost/index.tsx

/**
 * @fileoverview CanvasHost React component
 * @description Renders a stream of validated canvas blocks and relays user
 *   interactions back to the agent as events. Sits anywhere in the PWA
 *   (chat response lane, dashboard strip).
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { createElement, type ReactElement } from 'react';

import { validateBlock, validateEvent } from '../../common/catalog';
import type { CanvasBlock, CanvasEvent } from '../../common/schemas';

// Side-effect import: triggers widget self-registration. Barrel is empty in
// v1; widgets are added in later waves.
import '../../common/widgets';

/**
 * Props for `CanvasHost`.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export interface CanvasHostProps {
  /** Blocks emitted by the agent for the current turn (plus any pinned). */
  readonly blocks: readonly CanvasBlock[];
  /**
   * Called when a widget emits an interaction that has been parsed by
   * `validateEvent` against the widget's action vocabulary. Events that
   * reference an unknown action or fail the action's payload schema are
   * dropped (spec: "User actions flow through the same policy layer as
   * voice and text") and never reach this callback.
   */
  readonly onEvent: (event: CanvasEvent) => void;
}

/**
 * Mount point for agent-rendered canvas widgets.
 *
 * For every block:
 * - Validates envelope + payload against the catalog. Invalid blocks are
 *   dropped with a `console.warn` — the spec mandates "drop, log to admin
 *   audit" on kind/schema failures and never rendering untrusted content.
 * - Renders the registered widget component with a bound `emit` callback.
 *
 * The outer host element is a plain `<div>` — framework-package code is
 * exempt from the apps-convention "no native HTML" rule, and introducing a
 * `Stack` dependency on `@donotdev/components` at the top level would force
 * every consumer to pay for the styled layer even when embedding in their
 * own shell.
 *
 * @example
 * ```tsx
 * <CanvasHost
 *   blocks={turn.canvasBlocks}
 *   onEvent={(e) => agent.emit(e)}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export function CanvasHost({ blocks, onEvent }: CanvasHostProps): ReactElement {
  return (
    <div className="donotdev-canvas-host" data-donotdev-canvas-host="">
      {blocks.map((block) => renderBlock(block, onEvent))}
    </div>
  );
}

function renderBlock(
  block: CanvasBlock,
  onEvent: (event: CanvasEvent) => void
): ReactElement | null {
  const result = validateBlock(block);
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.warn(`[canvas] dropped block "${block.id}": ${result.reason}`);
    return null;
  }
  const { value, widget } = result;
  const emit = (action: string, payload: unknown): void => {
    const eventResult = validateEvent(
      { widgetId: value.id, action, payload },
      widget.kind
    );
    if (!eventResult.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        `[canvas] dropped event from "${value.id}" (${widget.kind}.${action}): ${eventResult.reason}`
      );
      return;
    }
    onEvent(eventResult.value);
  };
  return createElement(widget.component, {
    key: value.id,
    payload: value.payload,
    emit,
  });
}
