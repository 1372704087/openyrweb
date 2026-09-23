/**
 * Lighting — 战区/地图照明计算（ambient、tile light、tint、level）。
 *
 * 由 engine/Lighting.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { LightingType } from "engine/type/LightingType"; // 已转换
import { MapLighting } from "data/map/MapLighting"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 环境光源（订阅 ambient 变化）。 */
export interface AmbientSourceLike {
  onChange: {
    subscribe(fn: (lighting: any) => void): void;
    unsubscribe(fn: (lighting: any) => void): void;
  };
  getAmbient(): any;
}

/** Tile 点光源。 */
export interface TileLightLike {
  red: number;
  green: number;
  blue: number;
  intensity: number;
}

// 复用的临时向量（与孪生模块级 a 相同，避免每次 compute 分配）
const tmpTint: any = new (THREE as any).Vector3();

/**
 * 照明管理器。
 * 维护 baseAmbient / 可选 ambientOverride / 按 tile 索引的光源集合，
 * 并提供 compute* 系列着色标量与向量。
 */
export class Lighting {
  /** 变更事件（asEvent 包装） */
  get onChange(): any {
    return this._onChange.asEvent();
  }

  /** 生效的环境光：override 优先，否则 baseAmbient */
  get mapLighting(): any {
    return this.ambientOverride ?? this.baseAmbient;
  }

  /** 基础环境光 */
  baseAmbient: any;
  /** 可选环境光覆盖（applyAmbientOverride 写入） */
  ambientOverride?: any;
  /** tile 索引 → 点光源集合 */
  tileLights: Map<number, Set<TileLightLike>>;
  /** 订阅清理器 */
  disposables: any;
  /** 内部事件分发器 */
  _onChange: any;

  /**
   * @param t - 可选环境光源：订阅其 onChange 同步到 baseAmbient
   */
  constructor(t?: AmbientSourceLike) {
    this.baseAmbient = new MapLighting();
    this.tileLights = new Map();
    this.disposables = new CompositeDisposable();
    this._onChange = new EventDispatcher();
    if (t) {
      this.baseAmbient.copy(t.getAmbient());
      const e = (e: any) => {
        this.baseAmbient.copy(e);
        this._onChange.dispatch(this, undefined);
      };
      t.onChange.subscribe(e);
      this.disposables.add(() => t.onChange.unsubscribe(e));
    }
  }

  /**
   * 强制派发变更事件。
   * @param e - 附加参数（原样传给 dispatch 第二参）
   */
  forceUpdate(e?: any): void {
    this._onChange.dispatch(this, e);
  }

  /**
   * 应用环境光覆盖并派发变更。
   * @param e - 覆盖用的 MapLighting
   */
  applyAmbientOverride(e: any): void {
    this.ambientOverride = e;
    this._onChange.dispatch(this, undefined);
  }

  /** 取 baseAmbient 的拷贝。 */
  getBaseAmbient(): any {
    return new MapLighting().copy(this.baseAmbient);
  }

  /**
   * 向指定 tile 添加点光源。
   * @param e - tile 索引（与孪生 number 键一致；若调用方传对象则保持原样）
   * @param t - 光源
   */
  addTileLight(e: any, t: TileLightLike): void {
    if (!this.tileLights.has(e)) {
      this.tileLights.set(e, new Set());
    }
    this.tileLights.get(e)!.add(t);
  }

  /**
   * 从指定 tile 移除点光源；集合空则删除键。
   * @param e - tile 索引
   * @param t - 光源
   */
  removeTileLight(e: any, t: TileLightLike): void {
    const i = this.tileLights.get(e);
    if (i) {
      i.delete(t);
      if (!i.size) {
        this.tileLights.delete(e);
      }
    }
  }

  /**
   * 计算完整着色向量（tint + tile tint）×（ambient+ground+level+tileIntensity）。
   * LightingType.None 时返回 (1,1,1)。
   * @param e - 照明类型
   * @param t - 含 z（tile 高度）的位置
   * @param i - 高度附加（默认 0）
   */
  compute(e: LightingType, t: { z: number }, i: number = 0): any {
    if (e === LightingType.None) {
      return new (THREE as any).Vector3(1, 1, 1);
    }
    return this.computeTint(e)
      .add(this.computeTileTint(t as any, e, tmpTint))
      .multiplyScalar(
        this.mapLighting.ambient +
          this.mapLighting.ground +
          this.computeLevel(e, t.z + i) +
          this.computeTileLightIntensity(t as any),
      );
  }

  /**
   * 仅 level + tile 点光强度（不含 ambient/tint）。
   * @param e - 照明类型
   * @param t - 含 z 的位置
   * @param i - 高度附加（默认 0）
   */
  computeNoAmbient(e: LightingType, t: { z: number }, i: number = 0): number {
    return this.computeLevel(e, t.z + i) + this.computeTileLightIntensity(t as any);
  }

  /**
   * 层高照明贡献。
   * @param e - 照明类型
   * @param t - 高度（tile 高度 + 附加）
   */
  computeLevel(e: LightingType, t: number): number {
    return e >= LightingType.Level ? this.mapLighting.level * (t - 1) : 0;
  }

  /**
   * 全局 tint（Full 或 forceTint 时用红绿蓝，否则 1,1,1）。
   * @param e - 照明类型
   */
  computeTint(e: LightingType): any {
    let t = 1;
    let i = 1;
    let r = 1;
    if (e >= LightingType.Full || this.mapLighting.forceTint) {
      t = this.mapLighting.red;
      i = this.mapLighting.green;
      r = this.mapLighting.blue;
    }
    return new (THREE as any).Vector3(t, i, r);
  }

  /**
   * 叠加指定 tile 上所有光源的 RGB（仅 Full 及以上生效）。
   * @param e - tile 索引
   * @param t - 照明类型
   * @param i - 写入的目标向量（默认新建 Vector3）
   */
  computeTileTint(e: any, t: LightingType, i: any = new (THREE as any).Vector3()): any {
    let r = 0;
    let s = 0;
    let a = 0;
    if (t >= LightingType.Full) {
      const n = this.tileLights.get(e);
      if (n?.size) {
        for (const o of n) {
          r += o.red;
          s += o.green;
          a += o.blue;
        }
      }
    }
    return i.set(r, s, a);
  }

  /**
   * 指定 tile 上所有光源 intensity 之和。
   * @param e - tile 索引
   */
  computeTileLightIntensity(e: any): number {
    let t = 0;
    const i = this.tileLights.get(e);
    if (i?.size) {
      for (const r of i) {
        t += r.intensity;
      }
    }
    return t;
  }

  /** ambient + ground 基础强度。 */
  getAmbientIntensity(): number {
    return this.mapLighting.ambient + this.mapLighting.ground;
  }

  /** 释放订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
