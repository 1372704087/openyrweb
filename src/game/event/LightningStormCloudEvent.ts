/**
 * LightningStormCloudEvent — 闪电风暴落雷（云层）事件。
 *
 * 闪电风暴进入落雷阶段时，每道落雷/云层位置派发一次，供
 * SuperWeaponFxHandler 等渲染闪电特效。
 *
 * 由 game/event/LightningStormCloudEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class LightningStormCloudEvent {
  /** 落雷的世界坐标位置（非吸附到格心）。 */
  readonly position: any;
  readonly type: number;

  constructor(position: any) {
    this.position = position;
    this.type = EventType.LightningStormCloud;
  }
}
