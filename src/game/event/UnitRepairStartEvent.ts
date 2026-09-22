/**
 * UnitRepairStartEvent — 单位开始维修事件。
 *
 * 单位进入维修流程（驶入维修厂或获得维修标记）时派发，
 * HUD 与维修逻辑据此切换状态（完成时走 UnitRepairFinishEvent）。
 *
 * 由 game/event/UnitRepairStartEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class UnitRepairStartEvent {
  /** 开始维修的单位目标。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.UnitRepairStart;
  }
}
