/**
 * ShipSubmergeChangeEvent — 船只下潜/上浮状态变化事件。
 *
 * 潜艇等可潜水单位切换下潜与上浮状态时派发，供渲染层切换
 * 可见性/贴花与声呐相关逻辑响应。
 *
 * 由 game/event/ShipSubmergeChangeEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class ShipSubmergeChangeEvent {
  /** 状态切换的目标舰船。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.ShipSubmergeChange;
  }
}
