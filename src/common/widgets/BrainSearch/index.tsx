// packages/canvas/src/common/widgets/BrainSearch/index.tsx

/**
 * @fileoverview BrainSearch canvas widget
 * @description Private-surface, tag-first 2nd-brain search results
 *   widget. Renders the active query, a strip of tag filter chips the
 *   user can toggle to narrow the set, and a stack of matching entries.
 *
 *   Uncontrolled: this widget never mutates the payload locally. Every
 *   interaction emits an action and the agent is the source of truth.
 *   Toggling a tag chip emits `filter_tag`; clicking a result row emits
 *   `open`. The agent re-queries and pushes an updated payload.
 *
 *   Registered on the `private` surface with an `ephemeral` default
 *   lifetime — a search result set lives only until the turn resolves.
 *
 *   Note: this widget renders result rows inline as simplified `Card`s
 *   rather than delegating to a sibling `BrainCard` widget — the two
 *   are built in parallel and must stay independent.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Card, Stack, Tag, Text } from '@donotdev/components';
import { useTranslation } from '@donotdev/core';

import {
  BrainSearchActions,
  BrainSearchPayloadSchema,
  type BrainResult,
  type BrainSearchPayload,
} from './schema';
import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';

/**
 * Renders a single result row as a clickable `Card` with title, snippet,
 * and a small tag strip. Inline helper — kept local so BrainSearch stays
 * self-contained and does not reach into a sibling widget directory.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
const ResultRow: FC<{
  readonly result: BrainResult;
  readonly onOpen: (entryId: string) => void;
}> = ({ result, onOpen }) => (
  <Card
    clickable
    onClick={() => onOpen(result.entryId)}
    title={result.title}
    subtitle={result.snippet}
    footer={
      result.tags.length > 0 ? (
        <Stack direction="row" gap="tight" wrap="wrap">
          {result.tags.map((tag) => (
            <Tag key={tag} size="sm" variant="outline">
              {tag}
            </Tag>
          ))}
        </Stack>
      ) : undefined
    }
  />
);

/**
 * BrainSearch canvas widget component.
 *
 * The `payload` prop is typed as `unknown` at the framework level; the
 * catalog has already validated it against
 * {@link BrainSearchPayloadSchema} before this component renders, so the
 * local cast is sound.
 *
 * Visual contract:
 * - `Text` header showing the query and the result count.
 * - Row of tag filter chips (`Tag`). Active tags render with the
 *   `accent` variant; inactive tags render with `outline`. Clicking a
 *   chip emits `filter_tag` with the inverted `active` flag.
 * - `Stack` of result `Card`s. Clicking a card emits `open` with the
 *   result's `entryId`.
 * - Empty `results` → muted "No matches." line (no fallback logic).
 *
 * Emits:
 * - `open` with `{ entryId }` — user wants the full entry opened.
 * - `filter_tag` with `{ tag, active }` — user toggled a filter chip.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const BrainSearch: FC<CanvasWidgetProps> = ({ payload, emit }) => {
  const search = payload as BrainSearchPayload;
  const resultCount = search.results.length;
  const { t } = useTranslation('dndev');
  const activeSet = new Set(search.activeTags);

  const handleOpen = (entryId: string): void => {
    emit('open', { entryId });
  };

  const handleToggleTag = (tag: string): void => {
    emit('filter_tag', { tag, active: !activeSet.has(tag) });
  };

  return (
    <Stack gap="medium">
      <Text as="p">
        <Text as="span" variant="muted">
          {t('canvas.brainSearch.resultsFor')}
        </Text>
        <Text as="span" variant="primary">
          {search.query}
        </Text>
        <Text as="span" variant="muted">
          {` \u00B7 ${resultCount} ${t(resultCount === 1 ? 'canvas.brainSearch.match' : 'canvas.brainSearch.matches')}`}
        </Text>
      </Text>

      {search.availableTags.length > 0 ? (
        <Stack
          direction="row"
          gap="tight"
          wrap="wrap"
          aria-label={t('canvas.brainSearch.tagFiltersLabel')}
        >
          {search.availableTags.map((tag) => {
            const isActive = activeSet.has(tag);
            return (
              <Tag
                key={tag}
                interactive
                size="sm"
                variant={isActive ? 'accent' : 'outline'}
                onClick={() => handleToggleTag(tag)}
              >
                {tag}
              </Tag>
            );
          })}
        </Stack>
      ) : null}

      {resultCount === 0 ? (
        <Text as="p" variant="muted">
          {t('canvas.brainSearch.noMatches')}
        </Text>
      ) : (
        <Stack gap="tight">
          {search.results.map((result) => (
            <ResultRow
              key={result.entryId}
              result={result}
              onOpen={handleOpen}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

registerWidget({
  kind: 'BrainSearch',
  schema: BrainSearchPayloadSchema,
  actions: BrainSearchActions,
  surface: 'private',
  defaultLifetime: 'ephemeral',
  component: BrainSearch,
});
