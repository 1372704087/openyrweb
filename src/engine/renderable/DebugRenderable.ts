/**
 * DebugRenderable — 调试盒体渲染体（棋盘纹理 + 可选 BatchedMesh）。
 *
 * 由 engine/renderable/DebugRenderable.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as PaletteModule from "data/Palette"; // 孪生
import * as DebugUtilsModule from "engine/gfx/DebugUtils"; // 孪生
import * as TextureUtilsModule from "engine/gfx/TextureUtils"; // 孪生
import * as PaletteBasicMaterialModule from "engine/gfx/material/PaletteBasicMaterial"; // 孪生
// 孪生 deps 含 "three"；运行时与全局 THREE 同源，此处走全局避免缺 ambient 模块声明
import * as BatchedMeshModule from "engine/gfx/batch/BatchedMesh"; // 孪生

declare const THREE: any;

const Palette = (PaletteModule as any).Palette as any;
const DebugUtils = (DebugUtilsModule as any).DebugUtils as any;
const TextureUtils = (TextureUtilsModule as any).TextureUtils as any;
const PaletteBasicMaterial = (PaletteBasicMaterialModule as any)
  .PaletteBasicMaterial as any;
const BatchedMesh = (BatchedMeshModule as any).BatchedMesh as any;
const BatchMode = (BatchedMeshModule as any).BatchMode as any;

/** foundation 矩形。 */
export interface Foundation {
  width: number;
  height: number;
}

/**
 * 调试盒渲染体。
 * 几何按 foundation×height 缓存；材质按 uuid 引用计数缓存；
 * setBatched(true) 时用 BatchedMesh + 多调色板纹理。
 */
export class DebugRenderable {
  /** 棋盘纹理静态缓存。 */
  private static checkerboardTex?: any;
  /** 几何静态缓存：cacheKey → BufferGeometry。 */
  private static geometryCache = new Map<string, any>();
  /** 材质静态缓存：uuid → { material, usages }。 */
  private static materialCache = new Map<
    string,
    { material: any; usages: number }
  >();

  batchPalettes: any[] = [];
  useMeshBatching = false;
  opacity = 1;
  private materialCacheKey?: string;
  private mesh?: any;

  /**
   * 获取（或创建）索引棋盘纹理。
   * 起始 idx = Palette.REMAP_START_IDX - 1。
   */
  static getOrCreateTexture(): any {
    let e = DebugRenderable.checkerboardTex;
    if (!e) {
      e = DebugUtils.createIndexedCheckerTex(
        Palette.REMAP_START_IDX - 1,
        Palette.REMAP_START_IDX,
      );
      DebugRenderable.checkerboardTex = e;
    }
    return e;
  }

  /** 释放棋盘纹理与全部缓存几何。 */
  static clearCaches(): void {
    DebugRenderable.checkerboardTex?.dispose();
    DebugRenderable.geometryCache.forEach((e) => e.dispose());
    DebugRenderable.geometryCache.clear();
  }

  /**
   * @param foundation - 底面矩形
   * @param height - 高度
   * @param palette - 主调色板
   * @param options - 可选（centerFoundation 等）
   */
  constructor(
    private foundation: Foundation,
    private height: number,
    private palette: any,
    private options?: { centerFoundation?: boolean },
  ) {
    (this.foundation = foundation),
      (this.height = height),
      (this.palette = palette),
      (this.options = options),
      (this.batchPalettes = []),
      (this.useMeshBatching = false),
      (this.opacity = 1);
  }

  /**
   * 按调色板 uuid 引用计数取/建材质。
   * @param e - 调色板（须有 uuid）
   * @returns 材质实例
   */
  useMaterial(e: any): any {
    this.materialCacheKey = e.uuid;
    const cached = DebugRenderable.materialCache.get(this.materialCacheKey);
    let i;
    if (cached) {
      (i = cached.material), cached.usages++;
    } else {
      i = new PaletteBasicMaterial({
        map: DebugRenderable.getOrCreateTexture(),
        palette: e,
        alphaTest: 0.05,
        paletteCount: this.batchPalettes.length,
        flatShading: true,
        transparent: true,
      });
      DebugRenderable.materialCache.set(this.materialCacheKey, {
        material: i,
        usages: 1,
      });
    }
    return i;
  }

  /** 引用计数释放当前材质（count==1 时 dispose）。 */
  freeMaterial(): void {
    if (!this.materialCacheKey)
      throw new Error("Material cache key not set");
    const e = DebugRenderable.materialCache.get(this.materialCacheKey);
    if (e) {
      if (e.usages === 1) {
        (DebugRenderable.materialCache.delete(this.materialCacheKey),
          e.material.dispose());
      } else {
        e.usages--;
      }
    }
  }

  /** 几何缓存键：width_height_height。 */
  getGeometryCacheKey(): string {
    return (
      this.foundation.width +
      "_" +
      this.foundation.height +
      "_" +
      this.height
    );
  }

  /**
   * 开关批量（必须在 build 之前）。
   * @param e - 是否批量
   */
  setBatched(e: boolean): void {
    if (this.mesh)
      throw new Error("Batching can only be set before calling build()");
    this.useMeshBatching = e;
  }

  /**
   * 在 batchPalettes 中按 hash 查找索引。
   * @param t - 目标调色板
   */
  getBatchPaletteIndex(t: any): number {
    const e = this.batchPalettes.findIndex((e) => e.hash === t.hash);
    if (e === -1)
      throw new Error(
        "Provided palette not found in the list of batch palettes. Call setBatchPalettes first.",
      );
    return e;
  }

  /**
   * 设置当前调色板（mesh 已存在时热更新）。
   * @param t - 新调色板
   */
  setPalette(t: any): void {
    this.palette = t;
    if (this.mesh) {
      if (this.useMeshBatching) {
        const i = this.getBatchPaletteIndex(t);
        this.mesh.setPaletteIndex(i);
      } else {
        const i = TextureUtils.textureFromPalette(t);
        this.mesh.material.palette = i;
      }
    }
  }

  /**
   * 设置批量调色板列表（必须先于 3DObject 创建）。
   * @param e - 调色板数组
   */
  setBatchPalettes(e: any[]): void {
    if (!this.useMeshBatching)
      throw new Error("Can't use multiple palettes when not batching");
    if (this.mesh)
      throw new Error("Palettes must be set before creating 3DObject");
    this.batchPalettes = e;
  }

  /**
   * 设置不透明度（变化时热更新）。
   * @param e - 0..1
   */
  setOpacity(e: number): void {
    if (this.opacity !== e) {
      (this.opacity = e, this.updateOpacity());
    }
  }

  /** 把 opacity 写入 mesh / material。 */
  updateOpacity(): void {
    if (this.mesh) {
      if (this.useMeshBatching) {
        this.mesh.setOpacity(this.opacity);
      } else {
        this.mesh.material.opacity = this.opacity;
      }
    }
  }

  /** 创建 mesh（幂等）：缓存几何 + 单/批量材质分支。 */
  create3DObject(): void {
    if (!this.mesh) {
      const key = this.getGeometryCacheKey();
      let geom = DebugRenderable.geometryCache.get(key);
      if (!geom) {
        geom = DebugUtils.createBoxGeometry(
          this.foundation,
          this.height,
          this.options?.centerFoundation,
        );
        DebugRenderable.geometryCache.set(key, geom);
      }
      let mesh;
      let palTex;
      if (this.useMeshBatching) {
        palTex = TextureUtils.textureFromPalettes(this.batchPalettes);
        const mat = this.useMaterial(palTex);
        mesh = new BatchedMesh(geom, mat, BatchMode.Merging);
        mesh.castShadow = false;
      } else {
        palTex = TextureUtils.textureFromPalette(this.palette);
        const map = DebugRenderable.getOrCreateTexture();
        const mat = new PaletteBasicMaterial({
          palette: palTex,
          map,
          alphaTest: 0.05,
          transparent: true,
        });
        mesh = new THREE.Mesh(geom, mat);
      }
      mesh.matrixAutoUpdate = false;
      this.mesh = mesh;
      this.setPalette(this.palette);
      this.updateOpacity();
    }
  }

  /** 读取 mesh。 */
  get3DObject(): any {
    return this.mesh;
  }

  /** 帧更新钩子（无逻辑）。 */
  update(_e: number): void {}

  /** 释放 mesh（批量走 freeMaterial，否则直接 dispose 材质）。 */
  dispose(): void {
    if (this.mesh) {
      if (this.useMeshBatching) this.freeMaterial();
      else this.mesh.material.dispose();
      this.mesh = void 0;
    }
  }
}
