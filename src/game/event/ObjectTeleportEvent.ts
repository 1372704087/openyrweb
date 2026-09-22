/**
 * ObjectTeleportEvent — 对象被超时空传送事件。
 *
 * 由 game/event/ObjectTeleportEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 主要消费方：ChronoFxHandler（负责传送前后特效）。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class ObjectTeleportEvent {
  /** 被传送的对象。 */
  readonly target: any;
  /** 是否为超时空传送（chrono shift）而非普通位移。 */
  readonly isChronoshift: boolean;
  /** 传送前所在地块（供特效/回溯）。 */
  readonly prevTile: any;
  readonly type: number;

  constructor(target: any, isChronoshift: boolean, prevTile: any) {
    this.target = target;
    this.isChronoshift = isChronoshift;
    this.prevTile = prevTile;
    this.type = EventType.ObjectTeleport;
  }
}
