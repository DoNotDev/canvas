// packages/canvas/src/common/catalog.ts

/**
 * @fileoverview Canvas catalog — typed wrappers over core canvas schemas
 * @description The widget registry and validators are owned by
 *   @donotdev/core (isomorphic, React-free). This file re-exports them
 *   and adds React-typed variants that narrow `RegisteredWidgetBase` →
 *   `RegisteredWidget` so call sites in canvas components don't need casts.
 *
 * @version 0.1.1
 * @since 0.1.0
 */

import {
  validateBlock as validateBlockBase,
  getWidget as getWidgetBase,
} from '@donotdev/core';

export { registerWidget, listWidgets, validateEvent } from '@donotdev/core';

export type { ValidateResult } from '@donotdev/core';

export type { CanvasCallerAccess, ValidateBlockOptions } from '@donotdev/core';

import type { RegisteredWidget } from './types';
import type { CanvasBlock } from './schemas';

type ValidateBlockOptions = Parameters<typeof validateBlockBase>[1];

/**
 * Canvas-typed validate result: `widget` is narrowed to `RegisteredWidget`
 * (carries a React `ComponentType`) instead of `RegisteredWidgetBase`.
 *
 * @version 0.1.1
 * @since 0.1.1
 */
export type ValidateBlockResult =
  | {
      readonly ok: true;
      readonly value: CanvasBlock;
      readonly widget: RegisteredWidget;
    }
  | { readonly ok: false; readonly reason: string };

/**
 * Typed wrapper around core `validateBlock`.
 * Narrows `widget` from `RegisteredWidgetBase` to `RegisteredWidget` so
 * canvas components can call `widget.component` without casts.
 *
 * Sound because widgets are only registered via canvas's `registerWidget`,
 * which requires a full `RegisteredWidget` including a React `ComponentType`.
 * `RegisteredWidgetBase.component: unknown` is the schemas layer's React-free
 * escape hatch — the canvas layer re-tightens it here.
 *
 * @version 0.1.1
 * @since 0.1.1
 */
export function validateBlock(
  block: unknown,
  options?: ValidateBlockOptions
): ValidateBlockResult {
  const result = validateBlockBase(block, options);
  if (!result.ok) return result;
  return {
    ok: true,
    value: result.value as CanvasBlock,
    widget: result.widget as RegisteredWidget,
  };
}

/**
 * Typed wrapper around core `getWidget`.
 * Returns `RegisteredWidget` (React-typed) instead of `RegisteredWidgetBase`.
 *
 * @version 0.1.1
 * @since 0.1.1
 */
export function getWidget(kind: string): RegisteredWidget | undefined {
  return getWidgetBase(kind) as RegisteredWidget | undefined;
}
