// packages/canvas/src/client/index.ts

/**
 * @fileoverview Canvas browser-only surface
 * @description Re-exports the React host component. Anything that touches
 *   the DOM or React lives here; schemas and catalog are in `../common`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

export { CanvasHost, type CanvasHostProps } from './CanvasHost';
