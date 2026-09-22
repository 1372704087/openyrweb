/**
 * PlayerDefeatedEvent — 玩家被击败事件（资产全损或被判定出局）。
 *
 * 由 game/event/PlayerDefeatedEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class PlayerDefeatedEvent {
  /** 被击败的玩家。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.PlayerDefeated;
  }
}
