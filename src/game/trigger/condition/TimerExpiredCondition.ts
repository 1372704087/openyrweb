/**
 * TimerExpiredCondition — 任务倒计时到期。
 *
 * 事件 MissionTimerExpired：本帧事件批中存在 TimerExpire 即为 true。
 *
 * 由 game/trigger/condition/TimerExpiredCondition.ts.js 重写为 TS。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class TimerExpiredCondition extends TriggerCondition {
  check(_game: any, events: any[]): boolean {
    return events.some((ev) => ev.type === EventType.TimerExpire);
  }
}
