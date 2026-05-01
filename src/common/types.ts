// packages/canvas/src/common/types.ts

/**
 * @fileoverview Canvas UI-side types
 * @description Isomorphic types (WidgetDef, CanvasSurface, etc.) come from
 *   @donotdev/core. The React-typed `RegisteredWidget` stays here because it
 *   references `ComponentType` — UI-only.
 *
 * @version 0.1.0
 * @since 0.1.0
 */

import type { ComponentType } from 'react';

import type {
  AnyValibotSchema,
  CanvasWidgetProps,
  WidgetDef,
} from '@donotdev/core';

export type {
  AnyValibotSchema,
  CanvasSurface,
  CanvasWidgetProps,
  WidgetDef,
  CanvasLifetime,
} from '@donotdev/core';

/**
 * A widget as it lives in the registry — definition plus its React
 * component. The non-React `RegisteredWidgetBase` lives in core’s schema layer
 * so validators don’t pull React types.
 */
export interface RegisteredWidget<
  Kind extends string = string,
  PayloadSchema extends AnyValibotSchema = AnyValibotSchema,
  Actions extends Record<string, AnyValibotSchema> = Record<
    string,
    AnyValibotSchema
  >,
> extends WidgetDef<Kind, PayloadSchema, Actions> {
  readonly component: ComponentType<CanvasWidgetProps>;
}
