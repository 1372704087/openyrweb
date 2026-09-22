/**
 * CratePickupEvent — 拾取箱子（Crate）事件。
 *
 * 由 game/event/CratePickupEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class CratePickupEvent {
  /** 拾取到箱子的单位目标。 */
  readonly target: any;
  /** 拾取箱子的玩家。 */
  readonly player: any;
  /** 箱子来源对象。 */
  readonly source: any;
  /** 箱子所在格子坐标。 */
  readonly tile: any;
  readonly type: number;

  constructor(target: any, player: any, source: any, tile: any) {
    this.target = target;
    this.player = player;
    this.source = source;
    this.tile = tile;
    this.type = EventType.CratePickup;
  }
}
