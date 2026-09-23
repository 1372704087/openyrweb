/**
 * LightingDirector — 每帧驱动已登记 LightingFx：启动时拷贝 base ambient，
 * 按 priority 降序应用最高优先级效果，效果耗尽后恢复 undefined override。
 *
 * 由 engine/gfx/lighting/LightingDirector.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** MapLighting 最小形状。 */
export interface MapLightingLike {
  copy(source: any): void;
}

/** Lighting 最小形状（base ambient + override）。 */
export interface LightingLike {
  getBaseAmbient(): MapLightingLike;
  applyAmbientOverride(override: MapLightingLike | undefined): void;
}

/** 特技最小形状。 */
export interface LightingFxLike {
  priority: number;
  isRunning: boolean;
  startTime?: number;
  mapLighting: MapLightingLike;
  update(nowMs: number, gameSpeed: number): { done: boolean; updated?: boolean };
}

/** Renderer 最小形状。 */
export interface RendererLike {
  onFrame: {
    subscribe(fn: (nowMs: number) => void): void;
    unsubscribe(fn: (nowMs: number) => void): void;
  };
}

/** GameSpeed 最小形状。 */
export interface GameSpeedLike {
  value: number;
}

/** LightingDirector。 */
export class LightingDirector {
  effects: LightingFxLike[] = [];
  onFrame: (nowMs: number) => void;

  constructor(
    public readonly lighting: LightingLike,
    public readonly renderer: RendererLike,
    public readonly gameSpeed: GameSpeedLike,
  ) {
    this.onFrame = (nowMs: number) => {
      if (this.effects.length) {
        let topRemoved = false;
        this.effects.slice().forEach((fx, idx) => {
          if (!fx.isRunning) {
            fx.isRunning = true;
            fx.startTime = nowMs;
            fx.mapLighting.copy(this.lighting.getBaseAmbient());
          }
          const result = fx.update(nowMs, this.gameSpeed.value);
          if (result.done) {
            this.effects.splice(this.effects.indexOf(fx), 1);
            if (idx === 0) topRemoved = true;
          }
          if (idx === 0 && result.updated) this.lighting.applyAmbientOverride(fx.mapLighting);
        });
        if (this.effects.length) {
          if (topRemoved) this.lighting.applyAmbientOverride(this.effects[0].mapLighting);
        } else {
          this.lighting.applyAmbientOverride(undefined);
        }
      }
    };
  }

  /** 挂到 renderer 的 onFrame。 */
  init(): void {
    this.renderer.onFrame.subscribe(this.onFrame);
  }

  /** 登记特技并按 priority 降序排序（priority 大者在前，优先占用 override）。 */
  addEffect(fx: LightingFxLike): void {
    this.effects.push(fx);
    this.effects.sort((a, b) => b.priority - a.priority);
  }

  dispose(): void {
    this.renderer.onFrame.unsubscribe(this.onFrame);
  }
}
