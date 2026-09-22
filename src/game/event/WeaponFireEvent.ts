/**
 * WeaponFireEvent — 武器开火事件。
 *
 * 由 game/event/WeaponFireEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class WeaponFireEvent {
  /** 开火的武器引用。 */
  readonly weapon: any;
  /** 开火的游戏对象（发射者）。 */
  readonly gameObject: any;
  readonly type: number;

  constructor(weapon: any, gameObject: any) {
    this.weapon = weapon;
    this.gameObject = gameObject;
    this.type = EventType.WeaponFire;
  }
}
