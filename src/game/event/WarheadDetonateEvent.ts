/**
 * WarheadDetonateEvent — 弹头引爆事件（爆炸特效与音效触发点）。
 *
 * 由 game/event/WarheadDetonateEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 主要消费方：WarheadDetonateFxHandler。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class WarheadDetonateEvent {
  /** 引爆目标（命中对象或 null 表示纯地面爆炸）。 */
  readonly target: any;
  /** 引爆世界坐标。 */
  readonly position: any;
  /** 引爆动画资源（爆炸特效）。 */
  readonly explodeAnim: any;
  /** 是否为闪电风暴落雷引爆（区分普通弹头）。 */
  readonly isLightningStrike: boolean;
  readonly type: number;

  constructor(
    target: any,
    position: any,
    explodeAnim: any,
    isLightningStrike: boolean,
  ) {
    this.target = target;
    this.position = position;
    this.explodeAnim = explodeAnim;
    this.isLightningStrike = isLightningStrike;
    this.type = EventType.WarheadDetonate;
  }
}
