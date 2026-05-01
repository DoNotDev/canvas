// packages/canvas/src/common/widgets/TextBlock/index.tsx

/**
 * @fileoverview TextBlock canvas widget
 * @description Meta-surface, display-only prose widget. Used when the
 *   agent wants to render plain-text prose as a peer widget alongside
 *   other canvas blocks (mixed canvas + text reply).
 *
 *   Renders a `Card` with an optional title; body paragraphs are split on
 *   `\n` and rendered as one `Text as="p"` per paragraph. The `emphasis`
 *   payload field maps to the body `Text`'s `variant` (`muted` /
 *   `primary`) — `normal` leaves the variant undefined.
 *
 *   SECURITY: the renderer NEVER interprets HTML or markdown. No
 *   `dangerouslySetInnerHTML`, no markdown parser. Text is text. Period.
 *
 *   Registers itself with the canvas catalog at module load. No user
 *   actions — the widget never emits; the agent is the sole source of
 *   truth and pushes fresh payloads when the prose changes.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Card, Text } from '@donotdev/components';

import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';
import {
  TextBlockActions,
  TextBlockPayloadSchema,
  type TextBlockPayload,
} from './schema';

/**
 * Map the payload's `emphasis` to the body `Text`'s `variant` prop.
 *
 * `normal` (and undefined) return `undefined` so `Text` falls back to its
 * default visual treatment. `muted` and `important` map to the documented
 * `Text` variants `muted` and `primary` respectively.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function emphasisToVariant(
  emphasis: TextBlockPayload['emphasis']
): 'muted' | 'primary' | undefined {
  if (emphasis === 'muted') return 'muted';
  if (emphasis === 'important') return 'primary';
  return undefined;
}

/**
 * TextBlock — prose peer widget for mixed canvas + text agent replies.
 *
 * Layout:
 * - Outer `Card` titled with the optional `title`.
 * - Body is the `text` payload split on `\n`; each non-empty paragraph
 *   renders as its own `Text as="p"`, preserving the author's line breaks
 *   without interpreting any markup.
 *
 * Payload is validated by the catalog before the component mounts, so the
 * cast to `TextBlockPayload` is sound.
 *
 * @example
 * ```tsx
 * <TextBlock
 *   payload={{
 *     title: 'Summary',
 *     text: 'Turned off the kitchen lights.\nLocked the front door.',
 *     emphasis: 'normal',
 *   }}
 *   emit={() => {}}
 * />
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const TextBlock: FC<CanvasWidgetProps> = (props) => {
  const payload = props.payload as TextBlockPayload;
  const { text, title, emphasis } = payload;

  const variant = emphasisToVariant(emphasis);
  const paragraphs = text.split('\n');

  return (
    <Card title={title}>
      {paragraphs.map((paragraph, index) => (
        <Text
          /* Index-keyed because paragraphs are positional and the whole
             payload is replaced on every agent push — no reorder risk. */
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          as="p"
          variant={variant}
        >
          {paragraph}
        </Text>
      ))}
    </Card>
  );
};

registerWidget({
  kind: 'TextBlock',
  schema: TextBlockPayloadSchema,
  actions: TextBlockActions,
  surface: 'meta',
  defaultLifetime: 'ephemeral',
  component: TextBlock,
});
