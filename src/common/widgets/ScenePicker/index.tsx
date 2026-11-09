// packages/canvas/src/common/widgets/ScenePicker/index.tsx

/**
 * @fileoverview ScenePicker canvas widget
 * @description Renders a small set of household scenes as a grouped row
 *   of buttons. Tapping a button emits the `activate` action with the
 *   tapped scene's id. A scene flagged `active: true` is visually
 *   highlighted (primary variant) to show the current state.
 *
 *   Registered on the `household` surface with an `ephemeral` default
 *   lifetime — scene pickers appear in response to a turn and vanish
 *   with it unless the agent opts into a longer lifetime.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Button, ButtonGroup, Text } from '@donotdev/components';

import {
  ScenePickerActions,
  ScenePickerPayloadSchema,
  type ScenePickerPayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * ScenePicker canvas widget component.
 *
 * The `payload` prop is typed as `unknown` at the framework level; the
 * catalog has already validated it against `ScenePickerPayloadSchema`
 * before this component renders, so the local cast is sound.
 *
 * Visual contract:
 * - Optional `title` renders as an h4-level `Text` above the group.
 * - Scenes render as an `outline` `ButtonGroup`, with any scene whose
 *   `active` flag is true rendered as a `primary` button to stand out.
 * - Each button emits `activate` with `{ sceneId }` on tap.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const ScenePicker: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const { title, scenes } = payload as ScenePickerPayload;

  return (
    <>
      {title ? <Text as="h4">{title}</Text> : null}
      <ButtonGroup
        aria-label={title ?? 'Scenes'}
        variant="outline"
        items={scenes.map((scene) => ({
          key: scene.sceneId,
          label: scene.label,
          icon: scene.icon,
          variant: scene.active ? 'primary' : 'outline',
          onClick: () => emit('activate', { sceneId: scene.sceneId }),
        }))}
      />
    </>
  );
};

registerWidget({
  kind: 'ScenePicker',
  schema: ScenePickerPayloadSchema,
  actions: ScenePickerActions,
  surface: 'household',
  defaultLifetime: 'ephemeral',
  component: ScenePicker,
});
