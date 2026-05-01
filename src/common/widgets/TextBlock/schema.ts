// packages/canvas/src/common/widgets/TextBlock/schema.ts

/**
 * @fileoverview TextBlock widget schemas
 * @description Valibot schemas for the TextBlock canvas widget — a
 *   meta-surface display-only block used when the agent wants to render
 *   PROSE as a peer alongside other canvas widgets (mixed canvas + text
 *   reply). Content is plain text; the renderer never interprets HTML or
 *   markdown — strings in, strings out.
 *
 *   The widget has no user actions: `TextBlockActions` is intentionally an
 *   empty object so the catalog's `validateEvent` correctly rejects every
 *   incoming event as unknown. The agent is the sole source of truth and
 *   pushes fresh payloads when the prose changes.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as v from 'valibot';

/**
 * Render payload for the TextBlock widget.
 *
 * - `text` — the prose to render. Plain text only; `\n` delimits paragraphs
 *   at render time. No HTML, no markdown, no rich text — the renderer
 *   treats the string verbatim.
 * - `title` — optional heading shown above the prose.
 * - `emphasis` — optional visual tone for the body text:
 *   - `normal` (default) — standard body text.
 *   - `muted` — de-emphasised, for ancillary notes.
 *   - `important` — highlighted, for answers the user should notice.
 *
 * @example
 * ```ts
 * const payload: TextBlockPayload = {
 *   title: 'Summary',
 *   text: 'Turned the kitchen lights off.\nLocked the front door.',
 *   emphasis: 'normal',
 * };
 * ```
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const TextBlockPayloadSchema = v.object({
  text: v.string(),
  title: v.optional(v.string()),
  emphasis: v.optional(v.picklist(['normal', 'muted', 'important'])),
});

/**
 * Validated render payload for the TextBlock widget.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export type TextBlockPayload = v.InferOutput<typeof TextBlockPayloadSchema>;

/**
 * Action vocabulary for the TextBlock widget.
 *
 * Intentionally empty: TextBlock is display-only. The agent pushes fresh
 * payloads; the widget never emits. Keeping the object typed as `{}` (not
 * `Record<string, AnyValibotSchema>`) lets the catalog's `validateEvent`
 * reject every action with an "unknown action" diagnostic.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const TextBlockActions = {} as const;
