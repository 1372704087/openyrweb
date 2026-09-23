/**
 * TimerExpiredCondition — 任务倒计时到期。
 *
 * 事件 MissionTimerExpired：本帧事件批中存在 TimerExpire 即为 true。
 *
 * 由 game/trigger/condition/TimerExpiredCondition.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class TimerExpiredCondition extends TriggerCondition {
  check(_game: any, events: any[]): boolean {
    return events.some((ev) => ev.type === EventType.TimerExpire);
  }
}
