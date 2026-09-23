/**
 * DominatorLightingFx — 心灵控制器发射时的红色环境光特技。
 * 序列：0–0.3s 淡入 → 0.3–5.3s 保持 → 5.3–6.8s 淡出 → 恢复原值。
 * 目标 green/blue=0.35（温和红，保持可玩性）。
 *
 * 由 engine/gfx/lighting/DominatorLightingFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { LightingFx, LightingFxPriority, LightingFxUpdateResult } from "engine/gfx/lighting/LightingFx"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

/** DominatorLightingFx。 */
export class DominatorLightingFx extends LightingFx {
  initialGreen?: number;
  initialBlue?: number;

  constructor() {
    super();
    this.priority = LightingFxPriority.High;
    this.phase = 0;
  }

  /** 0=进行中（构造占位，孪生字段）。 */
  phase: number;

  update(nowMs: number, gameSpeed: number): LightingFxUpdateResult {
    let updated = false;
    let done = false;
    if (this.initialGreen == null) this.initialGreen = (this.mapLighting as any).green;
    if (this.initialBlue == null) this.initialBlue = (this.mapLighting as any).blue;
    const target = 0.35;
    const elapsed = ((nowMs - (this.startTime as number)) / 1000) * gameSpeed;
    if (elapsed < 0.3) {
      const pct = elapsed / 0.3;
      (this.mapLighting as any).green = this.initialGreen + (target - this.initialGreen) * pct;
      (this.mapLighting as any).blue = this.initialBlue + (target - this.initialBlue) * pct;
      (this.mapLighting as any).forceTint = true;
      updated = true;
    } else if (elapsed < 5.3) {
      (this.mapLighting as any).green = target;
      (this.mapLighting as any).blue = target;
      (this.mapLighting as any).forceTint = true;
      updated = true;
    } else if (elapsed < 6.8) {
      const pct = (elapsed - 5.3) / 1.5;
      (this.mapLighting as any).green = target + (this.initialGreen - target) * pct;
      (this.mapLighting as any).blue = target + (this.initialBlue - target) * pct;
      updated = true;
    } else {
      (this.mapLighting as any).green = this.initialGreen;
      (this.mapLighting as any).blue = this.initialBlue;
      (this.mapLighting as any).forceTint = false;
      done = true;
    }
    return { done, updated };
  }
}
