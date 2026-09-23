/**
 * NukeLightingFx — 核弹闪光：0–0.3s ambient 上升 1.5，3.3s 起 0.5s 内回落。
 *
 * 由 engine/gfx/lighting/NukeLightingFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { LightingFx, LightingFxPriority, LightingFxUpdateResult } from "engine/gfx/lighting/LightingFx"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

/** NukeLightingFx。 */
export class NukeLightingFx extends LightingFx {
  initialAmbient?: number;

  constructor() {
    super();
    this.priority = LightingFxPriority.High;
  }

  update(nowMs: number, gameSpeed: number): LightingFxUpdateResult {
    let updated = false;
    let done = false;
    if (this.initialAmbient == null) this.initialAmbient = (this.mapLighting as any).ambient;
    let ambient: number | undefined;
    let elapsed = ((nowMs - (this.startTime as number)) / 1000) * gameSpeed;
    let t: number;
    if (elapsed >= 3.3) {
      elapsed -= 3.3;
      t = Math.min(1, elapsed / 0.5);
      ambient = this.initialAmbient + 1.5 * (1 - t);
      if (t === 1) done = true;
    } else if (elapsed < 0.3) {
      t = elapsed / 0.3;
      ambient = this.initialAmbient + 1.5 * t;
    }
    if (ambient !== undefined && (this.mapLighting as any).ambient !== ambient) {
      updated = true;
      (this.mapLighting as any).ambient = ambient;
    }
    return { done, updated };
  }
}
