/**
 * ShadowRenderable — SHP 阴影渲染体（半帧阴影索引 + 半透明/polygonOffset）。
 *
 * 由 engine/renderable/ShadowRenderable.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as PaletteModule from "data/Palette"; // 孪生
import * as ShpBuilderModule from "engine/renderable/builder/ShpBuilder"; // 孪生
import * as CoordsModule from "game/Coords"; // 孪生
import * as IsoCoordsModule from "engine/IsoCoords"; // 孪生
import * as MapSurfaceModule from "engine/renderable/entity/map/MapSurface"; // 孪生

const Palette = (PaletteModule as any).Palette as any;
const ShpBuilder = (ShpBuilderModule as any).ShpBuilder as any;
const Coords = (CoordsModule as any).Coords as any;
const IsoCoords = (IsoCoordsModule as any).IsoCoords as any;
const MapSurface = (MapSurfaceModule as any).MapSurface as any;
// MAGIC_OFFSET 是模块级导出（孪生 setter 收整模块 o.MAGIC_OFFSET），不是类静态
const MAGIC_OFFSET: number = (MapSurfaceModule as any).MAGIC_OFFSET;

/** SHP 文件最小形状。 */
export interface ShpFileLike {
  width: number;
  height: number;
  numImages: number;
  getImage(index: number): { imageData: ArrayLike<number> };
}

/** 绘制偏移。 */
export interface DrawOffset {
  x: number;
  y: number;
}

/**
 * 阴影 SHP 渲染体。
 * 阴影帧位于 SHP 后半段（frame = numImages/2 + base），
 * 不可见时整体隐藏；opacity 0.5 + polygonOffset 下沉避免 z-fight。
 */
export class ShadowRenderable {
  /** 全局惰性阴影调色板（全 0 灰度）。 */
  private static shadowPalette?: any;

  shpSize?: { width: number; height: number };
  private builder?: any;
  private object3d?: any;
  baseFrameNo = 0;
  frameOffset = 0;
  visible: boolean;
  useBatching: boolean;
  drawOffset: DrawOffset;

  /**
   * 获取（或创建）阴影调色板（768 全 0）。
   */
  static getOrCreateShadowPalette(): any {
    let e = ShadowRenderable.shadowPalette;
    if (!e) {
      e = new Palette(new Array(768).fill(0));
      ShadowRenderable.shadowPalette = e;
    }
    return e;
  }

  /**
   * @param shpFile - SHP 源
   * @param camera - 相机
   * @param drawOffset - 绘制偏移（浅拷贝）
   * @param shadowHeightTileAdjust - 阴影高度 tile 修正（默认 0）
   */
  constructor(
    private shpFile: ShpFileLike,
    private camera: any,
    drawOffset: DrawOffset,
    private shadowHeightTileAdjust: number = 0,
  ) {
    (this.shpFile = shpFile),
      (this.camera = camera),
      (this.shadowHeightTileAdjust = shadowHeightTileAdjust),
      (this.baseFrameNo = 0),
      (this.frameOffset = 0),
      (this.visible = true),
      (this.useBatching = false),
      (this.drawOffset = { ...drawOffset });
  }

  /**
   * 设置可见性：还需当前阴影帧有效且含阴影数据才真正显示。
   * @param e - 新可见性
   */
  setVisible(e: boolean): void {
    (this.visible = e);
    if (this.object3d) {
      const t = this.computeShadowFrameNo(this.baseFrameNo);
      this.object3d.visible =
        e && t >= 0 && this.frameHasShadowData(t);
    }
  }

  /**
   * 设置显示尺寸（透传 builder）。
   * @param e - 尺寸
   */
  setSize(e: { width: number; height: number }): void {
    (this.shpSize = e), this.builder?.setSize(e);
  }

  /**
   * 开关 mesh batching（透传 builder）。
   * @param e - 是否批量
   */
  setBatched(e: boolean): void {
    (this.useBatching = e), this.builder?.setBatched(e);
  }

  /**
   * 设置基础帧并同步 builder / 可见性。
   * 阴影帧无效（<0）时强制隐藏。
   * @param e - 基础帧号
   */
  setBaseFrame(e: number): void {
    (this.baseFrameNo = e);
    if (this.builder) {
      const t = this.computeShadowFrameNo(e);
      if (t >= 0) {
        (this.builder.setFrame(t),
          (this.object3d.visible =
            this.visible && this.frameHasShadowData(t)));
      } else {
        this.object3d.visible = false;
      }
    }
  }

  /**
   * 设置帧偏移（透传 builder）。
   * @param e - 帧偏移
   */
  setFrameOffset(e: number): void {
    (this.frameOffset = e);
    if (this.builder) this.builder.setFrameOffset(e);
  }

  /**
   * 由基础帧推算阴影帧号：
   * frame = numImages/2 + e；须为整数且 < numImages，否则 -1。
   * @param e - 基础帧号
   */
  computeShadowFrameNo(e: number): number {
    const t = this.shpFile.numImages / 2 + e;
    return Number.isInteger(t) && t < this.shpFile.numImages ? t : -1;
  }

  /** 创建 Object3D（幂等）：阴影帧 + opacity 0.5 + polygonOffset。 */
  create3DObject(): void {
    if (!this.object3d) {
      let i = ShadowRenderable.getOrCreateShadowPalette();
      const e = new ShpBuilder(
        this.shpFile,
        i,
        this.camera,
        Coords.ISO_WORLD_SCALE,
      );
      if (this.shpSize) e.setSize(this.shpSize);
      e.setFrameOffset(this.frameOffset);
      e.setBatched(this.useBatching);
      if (this.useBatching) e.setBatchPalettes([i]);
      e.flat = true;
      const r = this.computeShadowFrameNo(this.baseFrameNo);
      e.setFrame(Math.max(0, r));
      if (this.shadowHeightTileAdjust) {
        i = IsoCoords.tileHeightToScreen(this.shadowHeightTileAdjust);
        this.drawOffset.y += -i;
      }
      e.setOffset(this.drawOffset);
      e.setOpacity(0.5);
      const t = e.build();
      if (this.shadowHeightTileAdjust) {
        (t.position.y += Coords.tileHeightToWorld(
          -this.shadowHeightTileAdjust,
        ),
          t.updateMatrix());
      }
      (t.visible = this.visible && r >= 0 && this.frameHasShadowData(r),
        (t.position.y += MAGIC_OFFSET / 5),
        (t.material.polygonOffset = true),
        (t.material.polygonOffsetFactor = -1),
        (t.material.polygonOffsetUnits = -1),
        t.updateMatrix(),
        (this.builder = e),
        (this.object3d = t));
    }
  }

  /**
   * 该帧是否含非空阴影像素。
   * @param e - 帧号（已含 frameOffset 加成前的基础索引）
   */
  frameHasShadowData(e: number): boolean {
    return (
      e >= 0 &&
      !!this.shpFile.getImage(this.frameOffset + e).imageData.length
    );
  }

  /** 读取已创建的 Object3D。 */
  get3DObject(): any {
    return this.object3d;
  }

  /** 帧更新钩子（无逻辑）。 */
  update(_e: number): void {}

  /** 释放 builder。 */
  dispose(): void {
    this.builder?.dispose();
  }
}
