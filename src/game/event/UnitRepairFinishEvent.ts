/**
 * UnitRepairFinishEvent — 单位修复完成事件。
 *
 * 由 game/event/UnitRepairFinishEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class UnitRepairFinishEvent {
  /** 修复完成的单位。 */
  readonly target: any;
  /** 修复来源（维修厂、工程车等发起修理的对象）。 */
  readonly from: any;
  readonly type: number;

  constructor(target: any, from: any) {
    this.target = target;
    this.from = from;
    this.type = EventType.UnitRepairFinish;
  }
}
