/**
 * SuppressionTrait — 步兵压制（suppressionTicks>0 期间卧倒，每 tick 递减）。
 *
 * 由 game/gameobject/trait/SuppressionTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SuppressionTrait {
  suppressionTicks: any;
  enabled: any;

  constructor() {
    this.suppressionTicks = 0;
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
  isSuppressed() {
    return this.enabled && 0 < this.suppressionTicks;
  }
  suppress() {
    if (this.enabled) this.suppressionTicks = 30;
  }
  [NotifyTickModule.NotifyTick.onTick]() {
    if (0 < this.suppressionTicks) this.suppressionTicks--;
  }
}
