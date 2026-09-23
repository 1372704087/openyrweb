/**
 * LightningStormFx — 闪电风暴离子云期间的环境光覆盖。
 * 首帧复制 ionLighting；游戏秒超过 duration 且云动画全部结束时 done。
 *
 * 由 engine/gfx/lighting/LightningStormFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { LightingFx, LightingFxUpdateResult } from "engine/gfx/lighting/LightingFx"; // 孪生
import { MapLighting } from "data/map/MapLighting"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 等待中的云动画最小形状。 */
export interface CloudAnimLike {
  isAnimFinished(): boolean;
}

/** LightningStormFx。 */
export class LightningStormFx extends LightingFx {
  cloudAnims: CloudAnimLike[] = [];

  constructor(
    public readonly durationGameSeconds: number,
    public readonly ionLighting: MapLighting,
  ) {
    super();
  }

  /** 登记需等待的云动画（update 的 done 条件之一）。 */
  waitForCloudAnim(anim: CloudAnimLike): void {
    this.cloudAnims.push(anim);
  }

  update(nowMs: number, gameSpeed: number): LightingFxUpdateResult {
    let updated = false;
    let done = false;
    if (nowMs === this.startTime) {
      this.mapLighting.copy(this.ionLighting);
      updated = true;
    }
    if (
      ((nowMs - (this.startTime as number)) / 1000) * gameSpeed > this.durationGameSeconds &&
      !this.cloudAnims.some((a) => !a.isAnimFinished())
    ) {
      done = true;
    }
    return { done, updated };
  }
}
