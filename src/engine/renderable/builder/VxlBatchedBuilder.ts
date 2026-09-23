/**
 * VxlBatchedBuilder — 批量 VXL：BatchedMesh + 引用计数 Phong 材质缓存。
 *
 * 由 engine/renderable/builder/VxlBatchedBuilder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as TextureUtilsModule from "engine/gfx/TextureUtils"; // 孪生
import * as BatchedMeshModule from "engine/gfx/batch/BatchedMesh"; // 孪生
import * as VxlBuilderModule from "engine/renderable/builder/VxlBuilder"; // 孪生
import * as PalettePhongMaterialModule from "engine/gfx/material/PalettePhongMaterial"; // 孪生

const TextureUtils = (TextureUtilsModule as any).TextureUtils as any;
const BatchedMesh = (BatchedMeshModule as any).BatchedMesh as any;
const VxlBuilder = (VxlBuilderModule as any).VxlBuilder as any;
const PalettePhongMaterial = (PalettePhongMaterialModule as any)
  .PalettePhongMaterial as any;

declare const THREE: any;

/** VXL 文件最小形状。 */
export interface VxlFileLike {
  sections: any[];
}

/** HVA 文件最小形状。 */
export interface HvaFileLike {
  sections: any[];
}

/**
 * 批量 VXL 构建器。
 * 材质按「多调色板纹理 uuid」引用计数缓存；每 section 为 BatchedMesh。
 */
export class VxlBatchedBuilder extends VxlBuilder {
  /** 静态材质缓存：textureKey → { material, usages }。 */
  private static materialCache = new Map<
    any,
    { material: any; usages: number }
  >();

  protected vxlFile: VxlFileLike;
  protected hvaFile?: HvaFileLike;
  protected palettes: any[];
  protected palette: any;
  protected vxlGeometryPool: any;
  clippingPlanes: any[] = [];
  opacity = 1;
  castShadow = true;
  protected extraLight?: any;
  protected lightDir?: any;
  protected materialCacheKey?: any;

  /**
   * @param vxlFile - VXL 源
   * @param hvaFile - 可选 HVA
   * @param palettes - 全部可用调色板（多色 batch）
   * @param palette - 当前调色板
   * @param vxlGeometryPool - 几何池
   * @param camera - 相机
   */
  constructor(
    vxlFile: VxlFileLike,
    hvaFile: HvaFileLike | undefined,
    palettes: any[],
    palette: any,
    vxlGeometryPool: any,
    camera: any,
  ) {
    super(camera);
    (this.vxlFile = vxlFile),
      (this.hvaFile = hvaFile),
      (this.palettes = palettes),
      (this.palette = palette),
      (this.vxlGeometryPool = vxlGeometryPool),
      (this.clippingPlanes = []),
      (this.opacity = 1),
      (this.castShadow = true);
  }

  /** 创建 section → BatchedMesh 映射。 */
  protected createVxlMeshes(): Map<string, any> {
    const e = TextureUtils.textureFromPalettes(this.palettes);
    const n = this.useMaterial(e);
    this.materialCacheKey = e;
    const o = this.getPaletteIndex(this.palette);
    const t = this.vxlFile.sections;
    const l = new Map<string, any>();
    t.forEach((sec, idx) => {
      const geom = this.vxlGeometryPool.get(sec);
      const r = new BatchedMesh(geom, n);
      let m = sec.transfMatrix;
      const hvaSec = this.hvaFile?.sections[idx];
      if (hvaSec) m = sec.scaleHvaMatrix(hvaSec.getMatrix(0));
      (r.applyMatrix(m),
        l.set(sec.name, r),
        (r.castShadow = this.castShadow),
        r.setPaletteIndex(o));
      if (this.extraLight) r.setExtraLight(this.extraLight);
      (r.setOpacity(this.opacity), r.setClippingPlanes(this.clippingPlanes));
    });
    return l;
  }

  /**
   * 按多调色板纹理引用计数取/建材质。
   * @param e - textureFromPalettes 结果（作 cache key）
   */
  useMaterial(e: any): any {
    const t = VxlBatchedBuilder.materialCache.get(e);
    let i;
    if (t) {
      (i = t.material), t.usages++;
    } else {
      i = new PalettePhongMaterial({
        palette: e,
        paletteCount: this.palettes.length,
        vertexColors: THREE.VertexColors,
        transparent: true,
      });
      VxlBatchedBuilder.materialCache.set(e, { material: i, usages: 1 });
    }
    return i;
  }

  /** 引用计数释放当前材质。 */
  freeMaterial(): void {
    const e = VxlBatchedBuilder.materialCache.get(this.materialCacheKey);
    if (e) {
      if (e.usages === 1) {
        (VxlBatchedBuilder.materialCache.delete(this.materialCacheKey),
          e.material.dispose());
      } else {
        e.usages--;
      }
    }
  }

  /**
   * 在 palettes 中按 hash 找索引。
   * @param t - 目标调色板
   */
  getPaletteIndex(t: any): number {
    const e = this.palettes.findIndex((e) => e.hash === t.hash);
    if (e === -1)
      throw new Error(
        "Provided palette not found in the list of available palettes",
      );
    return e;
  }

  /**
   * 热更新当前调色板索引。
   * @param e - 新调色板
   */
  setPalette(e: any): void {
    this.palette = e;
    if (this.object) {
      const t = this.getPaletteIndex(e);
      this.sections!.forEach((sec) => sec.setPaletteIndex(t));
    }
  }

  /**
   * 设置额外光照（广播到各 section）。
   * @param t - 强度
   */
  setExtraLight(t: any): void {
    this.extraLight = t;
    if (this.object) this.sections!.forEach((sec) => sec.setExtraLight(t));
  }

  /**
   * 设置体素光照方向。
   * @param t - 方向
   */
  setVxlLightDir(t: any): void {
    this.lightDir = t;
    if (this.object) this.sections!.forEach((sec) => sec.setLightDir(t));
  }

  /**
   * 开关投影。
   * @param t - 是否 castShadow
   */
  setShadow(t: boolean): void {
    this.castShadow = t;
    this.sections?.forEach((sec) => {
      sec.castShadow = t;
    });
  }

  /**
   * 设置裁剪面。
   * @param t - 平面数组
   */
  setClippingPlanes(t: any[]): void {
    this.clippingPlanes = t;
    if (this.object) this.sections!.forEach((sec) => sec.setClippingPlanes(t));
  }

  /**
   * 设置不透明度。
   * @param t - 0..1
   */
  setOpacity(t: number): void {
    this.opacity = t;
    if (this.object) this.sections!.forEach((sec) => sec.setOpacity(t));
  }

  /** 释放材质引用并清空 object。 */
  dispose(): void {
    if (this.object) {
      (this.freeMaterial(), (this.object = void 0));
    }
  }
}
