// packages/canvas/src/common/schemas.ts

/**
 * @fileoverview Canvas schemas re-export
 * @description Schemas and canvas types ship from @donotdev/core (which
 *   re-exports @donotdev/schemas / @donotdev/types). This file keeps a stable
 *   path for widgets under ./widgets/*.
 *
 * @version 0.1.0
 * @since 0.1.0
 */

export {
  CanvasBlockSchema,
  CanvasEventSchema,
  CanvasLifetimeSchema,
  CanvasWidgetMetadataSchema,
  ProxiedImageUrlSchema,
} from '@donotdev/core';

export type {
  CanvasBlock,
  CanvasEvent,
  CanvasLifetime,
  CanvasWidgetMetadata,
} from '@donotdev/core';
