/**
 * BuildingRepairFullEvent — 建筑维修至满血事件。
 *
 * 由 game/event/BuildingRepairFullEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class BuildingRepairFullEvent {
  /** 维修至满血的建筑目标。 */
  readonly target: any;
  /** 触发维修的来源（如维修厂或玩家指令）。 */
  readonly source: any;
  readonly type: number;

  constructor(target: any, source: any) {
    this.target = target;
    this.source = source;
    this.type = EventType.BuildingRepairFull;
  }
}
