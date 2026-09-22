/**
 * LightningStormManifestEvent — 闪电风暴显形（manifest）事件。
 *
 * 超级武器"闪电风暴"开始真正落地打击时派发（区别于云层移动的
 * LightningStormCloud），全屏特效与警报据此触发。
 *
 * 由 game/event/LightningStormManifestEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class LightningStormManifestEvent {
  /** 触发风暴的超级武器所属目标（建筑/玩家侧目标对象）。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.LightningStormManifest;
  }
}
