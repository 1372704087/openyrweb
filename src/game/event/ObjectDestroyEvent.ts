/**
 * ObjectDestroyEvent — 对象被摧毁事件。
 *
 * 由 game/event/ObjectDestroyEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class ObjectDestroyEvent {
  /** 被摧毁的目标对象。 */
  readonly target: any;
  /** 攻击者信息（可能是对象或记录）。 */
  readonly attackerInfo: any;
  /** 是否为附带（误伤/溅射）伤害致死。 */
  readonly incidental: boolean;
  readonly type: number;

  constructor(target: any, attackerInfo: any, incidental: boolean) {
    this.target = target;
    this.attackerInfo = attackerInfo;
    this.incidental = incidental;
    this.type = EventType.ObjectDestroy;
  }
}
