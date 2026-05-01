# @donotdev/canvas

Agent-facing UI widget catalog for DoNotDev.

The agent decides per-turn whether to respond with text, audio, a canvas, or
a combination. Canvas widgets are drawn **exclusively from an allowlisted
catalog** built on `@donotdev/components`. No free-form HTML, no eval,
no third-party URLs.

## What's in this package

- **Base schemas** (valibot): `CanvasBlockSchema`, `CanvasEventSchema`,
  `CanvasLifetimeSchema`, `CanvasWidgetMetadataSchema`.
- **Catalog registry**: `registerWidget`, `getWidget`, `listWidgets`,
  `validateBlock`, `validateEvent`.
- **CanvasHost** React component — consumes `CanvasBlock[]`, emits
  `CanvasEvent`s.

Widgets themselves register into the catalog via side-effect imports from
`src/common/widgets/index.ts`. v1 ships the scaffold; widgets land in later
waves.

## Spec

See `/data/ws/gontrand/docs/superpowers/specs/2026-04-15-canvas-spec.md` for
the full design contract (two contracts, lifecycle, update model, security
model).

## Installation

```bash
bun add @donotdev/canvas
```

## Usage

```tsx
import { CanvasHost } from '@donotdev/canvas';

<CanvasHost blocks={blocks} onEvent={handleEvent} />;
```
