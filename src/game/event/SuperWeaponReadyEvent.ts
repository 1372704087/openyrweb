/**
 * SuperWeaponReadyEvent — 超级武器充能完毕事件。
 *
 * 超级武器充能到可用状态时派发，侧边栏据此亮起图标并可播报 EVA。
 *
 * 由 game/event/SuperWeaponReadyEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class SuperWeaponReadyEvent {
  /** 充能完毕的超级武器所属建筑/武器对象。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.SuperWeaponReady;
  }
}
