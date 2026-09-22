/**
 * ObjectLiftOffEvent — 对象起飞（升空）事件。
 *
 * 由 game/event/ObjectLiftOffEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class ObjectLiftOffEvent {
  /** 起飞的游戏对象。 */
  readonly gameObject: any;
  readonly type: number;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.type = EventType.ObjectLiftOff;
  }
}
