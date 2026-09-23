/**
 * VxlNonBatchedBuilder — 非批量 VXL：每 section 一个 Mesh，共享 Phong 材质。
 *
 * 由 engine/renderable/builder/VxlNonBatchedBuilder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as TextureUtilsModule from "engine/gfx/TextureUtils"; // 孪生
import * as VxlBuilderModule from "engine/renderable/builder/VxlBuilder"; // 孪生
import * as PalettePhongMaterialModule from "engine/gfx/material/PalettePhongMaterial"; // 孪生

const TextureUtils = (TextureUtilsModule as any).TextureUtils as any;
const VxlBuilder = (VxlBuilderModule as any).VxlBuilder as any;
const PalettePhongMaterial = (PalettePhongMaterialModule as any)
  .PalettePhongMaterial as any;

declare const THREE: any;

/** VXL 文件最小形状。 */
export interface VxlFileLike {
  sections: any[];
}

/** HVA 文件最小形状（可选）。 */
export interface HvaFileLike {
  sections: any[];
}

/**
 * 非批量 VXL 构建器。
 * createVxlMeshes 为每个 section 建 THREE.Mesh，共用一份 PalettePhongMaterial。
 */
export class VxlNonBatchedBuilder extends VxlBuilder {
  protected vxlFile: VxlFileLike;
  protected hvaFile?: HvaFileLike;
  protected palette: any;
  protected vxlGeometryPool: any;
  clippingPlanes: any[] = [];
  castShadow = true;
  protected material?: any;
  protected extraLight?: any;
  protected lightDir?: any;

  /**
   * @param vxlFile - VXL 源
   * @param hvaFile - 可选 HVA
   * @param palette - 调色板
   * @param vxlGeometryPool - 几何池
   * @param camera - 相机
   */
  constructor(
    vxlFile: VxlFileLike,
    hvaFile: HvaFileLike | undefined,
    palette: any,
    vxlGeometryPool: any,
    camera: any,
  ) {
    super(camera);
    (this.vxlFile = vxlFile),
      (this.hvaFile = hvaFile),
      (this.palette = palette),
      (this.vxlGeometryPool = vxlGeometryPool),
      (this.clippingPlanes = []),
      (this.castShadow = true);
  }

  /** 创建 section → Mesh 映射（共享材质）。 */
  protected createVxlMeshes(): Map<string, any> {
    const palTex = TextureUtils.textureFromPalette(this.palette);
    const n = (this.material = new PalettePhongMaterial({
      palette: palTex,
      vertexColors: THREE.VertexColors,
    }));
    if (this.extraLight) n.extraLight = this.extraLight;
    n.clippingPlanes = this.clippingPlanes;
    const t = this.vxlFile.sections;
    const o = new Map<string, any>();
    t.forEach((e, idx) => {
      const geom = this.vxlGeometryPool.get(e);
      const r = new THREE.Mesh(geom, n);
      let m = e.transfMatrix;
      const hvaSec = this.hvaFile?.sections[idx];
      if (hvaSec) m = e.scaleHvaMatrix(hvaSec.getMatrix(0));
      (r.applyMatrix(m), o.set(e.name, r), (r.castShadow = this.castShadow));
    });
    return o;
  }

  /**
   * 热更新调色板纹理。
   * @param e - 新调色板
   */
  setPalette(e: any): void {
    this.palette = e;
    if (this.object) {
      this.material.palette = TextureUtils.textureFromPalette(e);
    }
  }

  /**
   * 设置额外光照。
   * @param e - 强度
   */
  setExtraLight(e: any): void {
    (this.extraLight = e);
    if (this.object) this.material.extraLight = e;
  }

  /**
   * 设置体素光照方向。
   * @param e - 方向向量
   */
  setVxlLightDir(e: any): void {
    (this.lightDir = e);
    if (this.object) this.material.lightDir = e;
  }

  /**
   * 开关投影。
   * @param t - 是否 castShadow
   */
  setShadow(t: boolean): void {
    (this.castShadow = t);
    this.sections?.forEach((e) => (e.castShadow = t));
  }

  /**
   * 设置裁剪面。
   * @param e - 平面数组
   */
  setClippingPlanes(e: any[]): void {
    (this.clippingPlanes = e);
    if (this.object) this.material.clippingPlanes = e;
  }

  /**
   * 设置不透明度（<1 自动 transparent）。
   * @param e - 0..1
   */
  setOpacity(e: number): void {
    (this.material.transparent = e < 1), (this.material.opacity = e);
  }

  /** 释放共享材质。 */
  dispose(): void {
    if (this.object) this.material.dispose();
  }
}
