/**
 * PlayerDroppedEvent — 玩家掉线/被移出对局事件。
 *
 * 联机对局中玩家连接中断或被移出时派发；可附带其资产是否已
 * 重新分配给队友等标记。
 *
 * 由 game/event/PlayerDroppedEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class PlayerDroppedEvent {
  /** 掉线/被移出的玩家。 */
  readonly target: any;
  /** 资产是否已重新分配（例如划归队友控制）。 */
  readonly assetsRedistributed: boolean;
  readonly type: number;

  constructor(target: any, assetsRedistributed: boolean) {
    this.target = target;
    this.assetsRedistributed = assetsRedistributed;
    this.type = EventType.PlayerDropped;
  }
}
