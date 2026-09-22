/**
 * ObjectAttackedEvent — 对象被攻击事件。
 *
 * 由 game/event/ObjectAttackedEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class ObjectAttackedEvent {
  /** 被攻击的目标对象。 */
  readonly target: any;
  /** 攻击者对象。 */
  readonly attacker: any;
  /** 是否为附带（误伤/溅射）伤害。 */
  readonly incidental: boolean;
  readonly type: number;

  constructor(target: any, attacker: any, incidental: boolean) {
    this.target = target;
    this.attacker = attacker;
    this.incidental = incidental;
    this.type = EventType.ObjectAttacked;
  }
}
