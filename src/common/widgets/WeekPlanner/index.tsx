// packages/canvas/src/common/widgets/WeekPlanner/index.tsx

/**
 * @fileoverview WeekPlanner canvas widget
 * @description Household-surface 7-day planner. Renders a `Grid` of seven
 *   day columns derived from `weekStartISO`, each column listing the slots
 *   assigned to that day sorted by hour.
 *
 *   Interaction model:
 *   - Tap a busy slot carrying an `eventId` → emit `open_event`.
 *   - Tap a free slot → emit `select_slot`.
 *
 *   The payload is the single source of truth. The widget holds no React
 *   state; the agent re-sends an updated payload after each event.
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { FC } from 'react';

import { Button, Card, Grid, Text } from '@donotdev/components';

import { registerWidget } from '../../catalog';
import type { CanvasWidgetProps } from '../../types';
import {
  WeekPlannerActions,
  WeekPlannerPayloadSchema,
  type WeekPlannerPayload,
} from './schema';

/** Short weekday labels in display order starting from Monday = 1. */
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Derive the 7 ISO `YYYY-MM-DD` strings for the week that starts at
 * `weekStartISO`. Uses UTC arithmetic so days never drift across DST.
 *
 * Invalid `weekStartISO` (non-parseable) yields a 7-element array of empty
 * strings — the widget will render empty columns rather than throwing.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function deriveWeek(weekStartISO: string): readonly string[] {
  const base = new Date(`${weekStartISO}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) {
    return ['', '', '', '', '', '', ''];
  }
  const days: string[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const d = new Date(base.getTime());
    d.setUTCDate(d.getUTCDate() + offset);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/**
 * Human-readable day header for a column: `Mon 13` style. Falls back to
 * the raw ISO string if the date can't be parsed.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function formatDayHeader(dateISO: string): string {
  if (!dateISO) return '';
  const d = new Date(`${dateISO}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return dateISO;
  return `${DAY_LABELS[d.getUTCDay()]} ${d.getUTCDate()}`;
}

/**
 * Format an hour-of-day as `HH:00` for cell labels.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * WeekPlanner canvas widget component.
 *
 * Renders a 7-column `Grid` of day columns. Each column is a `Card`
 * containing the day header and one small `Button` per slot of that day,
 * sorted ascending by hour. Busy slots render as `primary`; free slots as
 * `outline`. Tap handlers dispatch the correct action based on slot state.
 *
 * The `payload` prop is typed as `unknown`; the catalog has already
 * validated it against `WeekPlannerPayloadSchema` before render, so the
 * local cast is sound.
 *
 * @component
 * @example
 * ```tsx
 * <WeekPlanner
 *   payload={{
 *     weekStartISO: '2026-04-13',
 *     hourRange: { start: 8, end: 20 },
 *     slots: [
 *       { dateISO: '2026-04-14', hour: 9,  busy: true, label: 'Standup', eventId: 'evt-1' },
 *       { dateISO: '2026-04-16', hour: 18, busy: true, label: 'Dentist', eventId: 'evt-2' },
 *     ],
 *   }}
 *   emit={(action, payload) => console.log(action, payload)}
 * />
 * ```
 *
 * @param {CanvasWidgetProps} props - Canvas host props (validated payload + emit).
 * @returns {JSX.Element} The rendered week grid.
 *
 * @version 0.0.1
 * @since 0.0.1
 */
export const WeekPlanner: FC<CanvasWidgetProps> = (props) => {
  const payload = props.payload as WeekPlannerPayload;
  const { emit } = props;
  const { weekStartISO, slots, hourRange } = payload;

  const days = deriveWeek(weekStartISO);
  const dayIndex = new Map<string, WeekPlannerPayload['slots']>();
  for (const day of days) {
    dayIndex.set(day, []);
  }
  for (const slot of slots) {
    if (
      hourRange &&
      (slot.hour < hourRange.start || slot.hour >= hourRange.end)
    ) {
      continue;
    }
    const bucket = dayIndex.get(slot.dateISO);
    if (bucket) {
      bucket.push(slot);
    }
  }
  for (const bucket of dayIndex.values()) {
    bucket.sort((a, b) => a.hour - b.hour);
  }

  return (
    <Grid cols={[1, 2, 4, 7]} gap="tight">
      {days.map((dateISO, index) => {
        const daySlots = dayIndex.get(dateISO) ?? [];
        const header = formatDayHeader(dateISO) || `Day ${index + 1}`;
        return (
          <Card key={dateISO || `col-${index}`} title={header}>
            {daySlots.length === 0 ? (
              <Text variant="muted" as="p">
                Free
              </Text>
            ) : (
              daySlots.map((slot) => {
                const isBusy = slot.busy === true;
                const canOpen = isBusy && slot.eventId !== undefined;
                const label = slot.label
                  ? `${formatHour(slot.hour)} ${slot.label}`
                  : formatHour(slot.hour);
                return (
                  <Button
                    key={`${slot.dateISO}-${slot.hour}`}
                    variant={isBusy ? 'primary' : 'outline'}
                    fullWidth
                    aria-label={`${header} ${label}`}
                    onClick={() => {
                      if (canOpen) {
                        emit('open_event', { eventId: slot.eventId as string });
                      } else {
                        emit('select_slot', {
                          dateISO: slot.dateISO,
                          hour: slot.hour,
                        });
                      }
                    }}
                  >
                    {label}
                  </Button>
                );
              })
            )}
          </Card>
        );
      })}
    </Grid>
  );
};

registerWidget({
  kind: 'WeekPlanner',
  schema: WeekPlannerPayloadSchema,
  actions: WeekPlannerActions,
  surface: 'household',
  defaultLifetime: 'session',
  component: WeekPlanner,
});
