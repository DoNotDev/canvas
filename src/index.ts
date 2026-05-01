// packages/canvas/src/index.ts

/**
 * @fileoverview @donotdev/canvas — agent-facing widget catalog
 * @description Public entry point. Re-exports the isomorphic surface
 *   (schemas + catalog) and the browser-only host component. Server-side
 *   agents that only need validation can import from
 *   `@donotdev/canvas/common` once that subpath is added; v1 keeps a
 *   single entry.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

export * from './common';
export * from './client';
