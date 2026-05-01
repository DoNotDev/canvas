// packages/canvas/src/common/widgets/Checklist/index.tsx

/**
 * @fileoverview Checklist canvas widget
 * @description Household-surface widget rendering a shared shopping list or
 *   family to-do list. Each row exposes a `Checkbox` to toggle completion,
 *   the item text (with optional note), and a remove button. A trailing
 *   add button lets the user append a new item.
 *
 *   The component never mutates the list directly — every interaction
 *   emits a catalog-validated action back to the agent via the `emit` prop
 *   supplied by `CanvasHost`.
 *
 *   Self-registers with the canvas catalog at module import time so the
 *   `widgets/index.ts` barrel only has to add `import './Checklist';`.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Button, Card, Checkbox, Stack, Text } from '@donotdev/components';
import { useTranslation } from '@donotdev/core';

import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

import {
  ChecklistActions,
  ChecklistPayloadSchema,
  type ChecklistPayload,
} from './schema';

/**
 * Placeholder text emitted by the add affordance. Widgets avoid controlled
 * inputs in v1, so tapping "Add" emits a non-empty placeholder. The agent
 * is expected to re-render the payload with a meaningful item (or the app
 * layer can wrap this widget with an inline editor later).
 */
const ADD_ITEM_PLACEHOLDER = '(new item)';

/**
 * Checklist — titled, ordered list of toggleable items with per-row
 * remove buttons and a trailing add button.
 *
 * Payload is validated by the catalog before the component mounts, so the
 * cast to `ChecklistPayload` is safe. An empty `items` array renders a
 * muted "no items yet" line instead of collapsing to an empty card list.
 *
 * @example
 * ```tsx
 * <Checklist
 *   payload={{
 *     listId: 'shopping:weekly',
 *     title: 'Groceries',
 *     items: [
 *       { itemId: 'i1', text: 'Milk', done: false, note: '2 L' },
 *       { itemId: 'i2', text: 'Bread', done: true },
 *     ],
 *   }}
 *   emit={(action, payload) => ws.send({ action, payload })}
 * />
 * ```
 *
 * @param {CanvasWidgetProps} props - Canvas host props (validated payload + emit).
 * @returns {JSX.Element} The rendered checklist.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const Checklist: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const data = payload as ChecklistPayload;
  const { t } = useTranslation('dndev');

  return (
    <Stack direction="column" gap="medium">
      <Text as="h2" level="h2">
        {data.title}
      </Text>

      {data.items.length === 0 ? (
        <Text variant="muted">{t('canvas.checklist.noItems')}</Text>
      ) : (
        <Stack direction="column" gap="tight">
          {data.items.map((item) => (
            <Card key={item.itemId}>
              <Stack
                direction="row"
                gap="medium"
                align="center"
                justify="between"
              >
                <Stack direction="row" gap="medium" align="center">
                  <Checkbox
                    defaultChecked={item.done}
                    variant="success"
                    aria-label={t('canvas.checklist.toggleAria', {
                      text: item.text,
                    })}
                    onCheckedChange={(next) =>
                      emit('toggle', {
                        listId: data.listId,
                        itemId: item.itemId,
                        done: next === true,
                      })
                    }
                  />
                  <Stack direction="column" gap="none">
                    <Text as="span" variant={item.done ? 'muted' : undefined}>
                      {item.text}
                    </Text>
                    {item.note ? (
                      <Text variant="muted" level="caption">
                        {item.note}
                      </Text>
                    ) : null}
                  </Stack>
                </Stack>

                <Button
                  variant="ghost"
                  icon="X"
                  display="compact"
                  aria-label={t('canvas.checklist.removeAria', {
                    text: item.text,
                  })}
                  onClick={() =>
                    emit('remove', {
                      listId: data.listId,
                      itemId: item.itemId,
                    })
                  }
                >
                  {t('canvas.checklist.remove')}
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <Button
        variant="secondary"
        icon="Plus"
        onClick={() =>
          emit('add', {
            listId: data.listId,
            text: ADD_ITEM_PLACEHOLDER,
          })
        }
      >
        {t('canvas.checklist.addItem')}
      </Button>
    </Stack>
  );
};

registerWidget({
  kind: 'Checklist',
  schema: ChecklistPayloadSchema,
  actions: ChecklistActions,
  surface: 'household',
  defaultLifetime: 'persistent',
  component: Checklist,
});
