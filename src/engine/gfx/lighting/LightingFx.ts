/**
 * LightingFx — 地图环境光特技基类 + LightingFxPriority 枚举。
 *
 * 由 engine/gfx/lighting/LightingFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { MapLighting } from "data/map/MapLighting"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 特技优先级：数值大者优先占用 ambient override。 */
export enum LightingFxPriority {
  Normal = 0,
  High = 1,
}

/** update 返回：done=可移除，updated=本帧改写了 mapLighting。 */
export interface LightingFxUpdateResult {
  done: boolean;
  updated?: boolean;
}

/** LightingFx 基类：持有独立 MapLighting 副本与优先级。 */
export class LightingFx {
  priority: number = LightingFxPriority.Normal;
  mapLighting: MapLighting = new MapLighting();
  isRunning: boolean = false;
  startTime?: number;

  /** 子类覆盖；基类直接 done。 */
  update(nowMs: number, gameSpeed: number): LightingFxUpdateResult {
    void nowMs;
    void gameSpeed;
    return { done: true };
  }
}
