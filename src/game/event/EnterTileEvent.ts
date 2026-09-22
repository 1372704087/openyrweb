/**
 * EnterTileEvent — 进入地图格事件。
 *
 * 单位踏入新格子时派发；触发器"进入区域"条件、地形效果等据此响应。
 *
 * 由 game/event/EnterTileEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class EnterTileEvent {
  /** 进入该格的目标对象。 */
  readonly target: any;
  /** 进入动作的来源（移动任务发起方等）。 */
  readonly source: any;
  readonly type: number;

  constructor(target: any, source: any) {
    this.target = target;
    this.source = source;
    this.type = EventType.EnterTile;
  }
}
