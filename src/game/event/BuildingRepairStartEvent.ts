/**
 * BuildingRepairStartEvent — 建筑开始修复事件（进入修复状态）。
 *
 * 由 game/event/BuildingRepairStartEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class BuildingRepairStartEvent {
  /** 开始修复的建筑目标。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.BuildingRepairStart;
  }
}
