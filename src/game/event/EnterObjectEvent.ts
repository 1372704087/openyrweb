/**
 * EnterObjectEvent — 单位进入另一对象事件（进驻建筑、进维修厂等）。
 *
 * 由 game/event/EnterObjectEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 主要消费方：EnteredByCondition 等地图触发器条件。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class EnterObjectEvent {
  /** 被进入的目标对象（建筑、维修厂、运输载具等）。 */
  readonly target: any;
  /** 执行进入的来源单位。 */
  readonly source: any;
  readonly type: number;

  constructor(target: any, source: any) {
    this.target = target;
    this.source = source;
    this.type = EventType.EnterObject;
  }
}
