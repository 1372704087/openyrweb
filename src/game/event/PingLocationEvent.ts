/**
 * PingLocationEvent — 小地图/战场位置标记（Ping）事件。
 *
 * 由 game/event/PingLocationEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class PingLocationEvent {
  /** 标记的格子坐标。 */
  readonly tile: any;
  /** 发起标记的玩家。 */
  readonly player: any;
  readonly type: number;

  constructor(tile: any, player: any) {
    this.tile = tile;
    this.player = player;
    this.type = EventType.PingLocation;
  }
}
