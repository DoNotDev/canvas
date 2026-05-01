// packages/canvas/src/common/index.ts

/**
 * @fileoverview Canvas isomorphic surface
 * @description Re-exports schemas, catalog API, and types usable from both
 *   browser and server. Keep server-side agents able to validate without
 *   pulling React.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

export {
  CanvasBlockSchema,
  CanvasEventSchema,
  CanvasLifetimeSchema,
  CanvasWidgetMetadataSchema,
  ProxiedImageUrlSchema,
  type CanvasBlock,
  type CanvasEvent,
  type CanvasLifetime,
  type CanvasWidgetMetadata,
} from './schemas';

export {
  registerWidget,
  getWidget,
  listWidgets,
  validateBlock,
  validateEvent,
  type CanvasCallerAccess,
  type ValidateBlockOptions,
  type ValidateResult,
} from './catalog';

export type {
  AnyValibotSchema,
  CanvasSurface,
  CanvasWidgetProps,
  RegisteredWidget,
  WidgetDef,
} from './types';
