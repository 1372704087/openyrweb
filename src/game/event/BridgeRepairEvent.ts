/**
 * BridgeRepairEvent — 桥梁修复事件。
 *
 * 桥梁被修复（恢复通行）时派发；地图触发器与视觉/音效系统据此响应。
 *
 * 由 game/event/BridgeRepairEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class BridgeRepairEvent {
  /** 修复触发源（触发修复的对象或玩家侧来源）。 */
  readonly source: any;
  /** 被修复桥梁所在的地图格。 */
  readonly tile: any;
  readonly type: number;

  constructor(source: any, tile: any) {
    this.source = source;
    this.tile = tile;
    this.type = EventType.BridgeRepair;
  }
}
