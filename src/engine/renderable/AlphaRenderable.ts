/**
 * AlphaRenderable — 带 alpha 调色板的 SHP 渲染体（自定义 blending 顶层）。
 *
 * 由 engine/renderable/AlphaRenderable.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as PaletteModule from "data/Palette"; // 孪生
import * as ShpBuilderModule from "engine/renderable/builder/ShpBuilder"; // 孪生
import * as ColorModule from "util/Color"; // 孪生
import * as CoordsModule from "game/Coords"; // 孪生

const Palette = (PaletteModule as any).Palette as any;
const ShpBuilder = (ShpBuilderModule as any).ShpBuilder as any;
const Color = (ColorModule as any).Color as any;
const Coords = (CoordsModule as any).Coords as any;

declare const THREE: any;

/** SHP 文件最小形状。 */
export interface ShpFileLike {
  width: number;
  height: number;
  numImages: number;
}

/** 相机引用（仅透传给 ShpBuilder）。 */
export type CameraLike = any;

/** 绘制偏移。 */
export interface DrawOffset {
  x: number;
  y: number;
}

/**
 * Alpha SHP 渲染体。
 * 使用自定义调色板（>127 线性映射为亮度 ramp），渲染时关闭深度测试、
 * 开启 DstColor×One 乘法 blending，renderOrder 固定 999995。
 */
export class AlphaRenderable {
  /** 惰性创建的 alpha 调色板（静态缓存）。 */
  private static alphaPalette?: any;

  shpSize?: { width: number; height: number };
  private builder?: any;
  private object3d?: any;
  visible: boolean;
  drawOffset: DrawOffset;

  /**
   * 获取（或创建）alpha 调色板：
   * 前 128 档为 0，之后 t>127 → 2*(t-127) 的灰度 ramp。
   */
  static getOrCreateAlphaPalette(): any {
    let i = AlphaRenderable.alphaPalette;
    if (!i) {
      i = new Palette(new Array(768).fill(0));
      const e: any[] = [];
      for (let t = 0; t < 256; t++) {
        const r = t > 127 ? 2 * (t - 127) : 0;
        e.push(new Color(r, r, r));
      }
      (i.setColors(e), (AlphaRenderable.alphaPalette = i));
    }
    return i;
  }

  /**
   * @param shpFile - SHP 源
   * @param camera - 相机
   * @param drawOffset - 绘制偏移（浅拷贝）
   */
  constructor(
    private shpFile: ShpFileLike,
    private camera: CameraLike,
    drawOffset: DrawOffset,
  ) {
    (this.shpFile = shpFile),
      (this.camera = camera),
      (this.visible = true),
      (this.drawOffset = { ...drawOffset });
  }

  /**
   * 设置可见性（已有 Object3D 时同步）。
   * @param e - 新可见性
   */
  setVisible(e: boolean): void {
    (this.visible = e);
    if (this.object3d) this.object3d.visible = e;
  }

  /**
   * 设置 SHP 显示尺寸（透传 builder）。
   * @param e - 尺寸
   */
  setSize(e: { width: number; height: number }): void {
    (this.shpSize = e), this.builder?.setSize(e);
  }

  /** 创建 Object3D（幂等）：alpha 调色板 + 自定义 blending。 */
  create3DObject(): void {
    if (!this.object3d) {
      const r = AlphaRenderable.getOrCreateAlphaPalette();
      const e = new ShpBuilder(
        this.shpFile,
        r,
        this.camera,
        Coords.ISO_WORLD_SCALE,
      );
      if (this.shpSize) e.setSize(this.shpSize);
      e.setFrame(0), e.setOffset(this.drawOffset);
      const t = e.build();
      (t.visible = this.visible), (t.renderOrder = 999995);
      const i = t.material;
      (i.depthTest = false),
        (i.depthWrite = true),
        (i.transparent = true),
        (i.blending = THREE.CustomBlending),
        (i.blendEquation = THREE.AddEquation),
        (i.blendSrc = THREE.DstColorFactor),
        (i.blendDst = THREE.OneFactor),
        (this.builder = e),
        (this.object3d = t);
    }
  }

  /** 读取已创建的 Object3D（未创建则为 undefined）。 */
  get3DObject(): any {
    return this.object3d;
  }

  /** 帧更新钩子（本类无逻辑，与孪生一致）。 */
  update(_e: number): void {}

  /** 释放 builder 资源。 */
  dispose(): void {
    this.builder?.dispose();
  }
}
