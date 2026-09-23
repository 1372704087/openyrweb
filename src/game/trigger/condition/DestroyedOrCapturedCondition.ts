/**
 * DestroyedOrCapturedCondition — 目标被摧毁或被占领。
 *
 * 事件 DestroyedOrCaptured：ObjectDestroy 或 ObjectOwnerChange，且目标
 * 是 targets 内的 techno。
 *
 * 由 game/trigger/condition/DestroyedOrCapturedCondition.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class DestroyedOrCapturedCondition extends TriggerCondition {
  check(_game: any, events: any[]): any[] {
    return events
      .filter((ev) => {
        if (ev.type !== EventType.ObjectDestroy && ev.type !== EventType.ObjectOwnerChange) {
          return false;
        }
        const target = ev.target;
        return !!target.isTechno() && this.targets.includes(target);
      })
      .map((ev) => ev.target);
  }
}
