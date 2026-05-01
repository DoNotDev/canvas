// packages/canvas/src/common/widgets/ScenePicker/schema.ts

/**
 * @fileoverview ScenePicker widget schemas
 * @description Valibot contracts for the ScenePicker canvas widget. A
 *   ScenePicker renders a small set of named household scenes (Movie,
 *   Dinner, Sleep, Wake, ...) as a group of buttons. Tapping a button
 *   activates the underlying scene.
 *
 *   These schemas are the trust boundary between the agent-produced
 *   payload / user-produced event and the renderer. Anything that does
 *   not parse here never reaches the component.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * A single scene entry within a `ScenePicker` payload.
 *
 * - `sceneId` — stable identifier the agent receives back in the
 *   `activate` event.
 * - `label` — human-readable name shown on the button.
 * - `icon` — optional Lucide icon name (resolved by `Button`'s icon
 *   prop which accepts a string).
 * - `active` — optional flag used purely for visual highlighting of the
 *   scene currently in effect. It does NOT gate interaction: the user
 *   can always re-activate an already-active scene.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const SceneSchema = v.object({
  sceneId: v.string(),
  label: v.string(),
  icon: v.optional(v.string()),
  active: v.optional(v.boolean()),
});

/**
 * Payload for a `ScenePicker` canvas block.
 *
 * - `title` — optional section heading rendered above the buttons.
 * - `scenes` — ordered list of selectable scenes.
 *
 * @example
 * ```ts
 * const payload: ScenePickerPayload = {
 *   title: 'Scenes',
 *   scenes: [
 *     { sceneId: 'movie', label: 'Movie', icon: 'Film', active: true },
 *     { sceneId: 'dinner', label: 'Dinner', icon: 'Utensils' },
 *     { sceneId: 'sleep', label: 'Sleep', icon: 'Moon' },
 *     { sceneId: 'wake', label: 'Wake', icon: 'Sun' },
 *   ],
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ScenePickerPayloadSchema = v.object({
  title: v.optional(v.string()),
  scenes: v.array(SceneSchema),
});

/**
 * Inferred TypeScript type for a validated `ScenePicker` payload. Widgets
 * cast the `CanvasWidgetProps['payload']` (typed `unknown`) to this type
 * — the catalog guarantees the shape has already been parsed.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type ScenePickerPayload = v.InferOutput<typeof ScenePickerPayloadSchema>;

/**
 * Schema for the payload of the `activate` action emitted when a user
 * taps a scene button. `sceneId` echoes the tapped scene's id verbatim.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ActivateSceneActionSchema = v.object({
  sceneId: v.string(),
});

/**
 * Action vocabulary for the `ScenePicker` widget. Keyed by action name,
 * with each value validating that action's event payload.
 *
 * Currently exposes a single action, `activate`, carrying `{ sceneId }`.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ScenePickerActions = {
  activate: ActivateSceneActionSchema,
} as const;
