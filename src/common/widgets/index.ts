// packages/canvas/src/common/widgets/index.ts

/**
 * @fileoverview Canvas widget registration barrel
 * @description Widgets register themselves with the catalog via a
 *   side-effect-only module import. To add a new widget:
 *
 *   1. Create `./<WidgetName>/index.ts` that calls `registerWidget({...})`
 *      at module top level.
 *   2. Append `import './<WidgetName>';` below.
 *
 *   This file intentionally exports nothing. `CanvasHost` imports it once
 *   to trigger every registration, so every widget is in the catalog by
 *   the time the host renders its first block.
 *
 *   v1 scaffold — widgets land in waves (`DeviceTile`, `MailTriage`,
 *   `DaySchedule`, `Timer` first per spec).
 *
 * @version 0.0.1
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import './Alarm';
import './BrainCard';
import './BrainSearch';
import './Checklist';
import './Climate';
import './ConceptExplainer';
import './ConflictResolver';
import './Confirmation';
import './Composite';
import './DaySchedule';
import './DeviceTile';
import './EventDraft';
import './FractionBar';
import './MailThread';
import './MailTriage';
import './MediaQueue';
import './MemoryCard';
import './NowPlaying';
import './NumberLine';
import './ProgressCanvas';
import './Quiz';
import './ReplyDraft';
import './RoomOverview';
import './ScenePicker';
import './TextBlock';
import './Timer';
import './WeatherCard';
import './WeekPlanner';

export {};
