/**
 * ShpRenderable — SHP 主渲染体（可组合阴影与 Z-shape 修正层）。
 *
 * 由 engine/renderable/ShpRenderable.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as ShpBuilderModule from "engine/renderable/builder/ShpBuilder"; // 孪生
import * as ShadowRenderableModule from "engine/renderable/ShadowRenderable"; // 孪生
import * as CoordsModule from "game/Coords"; // 孪生

const ShpBuilder = (ShpBuilderModule as any).ShpBuilder as any;
const ShadowRenderable = (ShadowRenderableModule as any)
  .ShadowRenderable as any;
const Coords = (CoordsModule as any).Coords as any;

declare const THREE: any;

/** SHP 文件最小形状。 */
export interface ShpFileLike {
  width: number;
  height: number;
  numImages: number;
}

/**
 * SHP 渲染体。
 * factory 组装主 builder，可选阴影层与 flat 的 Z-shape 修正层；
 * 有子层时外层用 Object3D 包裹并关闭 matrixAutoUpdate。
 */
export class ShpRenderable {
  private target?: any;
  private shapeMesh?: any;
  private shadowMesh?: any;

  /**
   * 工厂：按开关组装 builder / 阴影 / Z-shape 修正。
   * @param shpFile - SHP 源
   * @param palette - 主调色板
   * @param camera - 相机
   * @param drawOffset - 绘制偏移
   * @param withShadow - 是否创建 ShadowRenderable
   * @param shadowHeightTileAdjust - 阴影高度修正（默认 0）
   * @param depth - 是否深度绘制（默认 false）
   * @param depthOffset - 深度偏移（默认 0）
   * @param withZShapeFix - 是否创建 flat 修正层（默认 false）
   */
  static factory(
    shpFile: ShpFileLike,
    palette: any,
    camera: any,
    drawOffset: any,
    withShadow: boolean = false,
    shadowHeightTileAdjust: number = 0,
    depth: boolean = false,
    depthOffset: number = 0,
    withZShapeFix: boolean = false,
  ): ShpRenderable {
    const c = withShadow
      ? new ShadowRenderable(shpFile, camera, drawOffset, shadowHeightTileAdjust)
      : void 0;
    const h = Coords.ISO_WORLD_SCALE;
    const u = new ShpBuilder(shpFile, palette, camera, h, depth, depthOffset);
    u.setOffset(drawOffset);
    let d;
    if (withZShapeFix) {
      d = new ShpBuilder(shpFile, palette, camera, h, depth, depthOffset);
      d.setOffset(drawOffset);
      d.flat = true;
    }
    return new this(u, c, d);
  }

  /**
   * @param builder - 主 SHP builder
   * @param shadowRenderable - 可选阴影层
   * @param zShapeFixBuilder - 可选 Z-shape 修正 builder
   */
  constructor(
    public builder: any,
    public shadowRenderable?: any,
    public zShapeFixBuilder?: any,
  ) {
    (this.builder = builder),
      (this.shadowRenderable = shadowRenderable),
      (this.zShapeFixBuilder = zShapeFixBuilder);
  }

  /** 读取聚合后的根 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /**
   * 开关批量（透传主/阴影/修正层）。
   * @param e - 是否批量
   */
  setBatched(e: boolean): void {
    (this.builder.setBatched(e),
      this.zShapeFixBuilder?.setBatched(e),
      this.shadowRenderable?.setBatched(e));
  }

  /**
   * 设置批量调色板（主/修正层）。
   * @param e - 调色板数组
   */
  setBatchPalettes(e: any[]): void {
    (this.builder.setBatchPalettes(e), this.zShapeFixBuilder?.setBatchPalettes(e));
  }

  /**
   * 设置显示尺寸（三层同步）。
   * @param e - 尺寸
   */
  setSize(e: { width: number; height: number }): void {
    (this.builder.setSize(e),
      this.zShapeFixBuilder?.setSize(e),
      this.shadowRenderable?.setSize(e));
  }

  /** 主 builder 的 flat 标志。 */
  getFlat(): boolean {
    return this.builder.flat;
  }

  /**
   * 设置主 builder flat。
   * @param e - flat 值
   */
  setFlat(e: boolean): void {
    this.builder.flat = e;
  }

  /**
   * 切帧（帧号变化才透传三层）。
   * @param e - 帧号
   */
  setFrame(e: number): void {
    if (this.builder.getFrame() !== e) {
      (this.builder.setFrame(e),
        this.zShapeFixBuilder?.setFrame(e),
        this.shadowRenderable?.setBaseFrame(e));
    }
  }

  /**
   * 设置帧偏移（三层同步）。
   * @param e - 帧偏移
   */
  setFrameOffset(e: number): void {
    (this.builder.setFrameOffset(e),
      this.zShapeFixBuilder?.setFrameOffset(e),
      this.shadowRenderable?.setFrameOffset(e));
  }

  /**
   * 设置调色板（主/修正层）。
   * @param e - 调色板
   */
  setPalette(e: any): void {
    (this.builder.setPalette(e), this.zShapeFixBuilder?.setPalette(e));
  }

  /**
   * 设置额外光照强度。
   * @param e - 强度
   */
  setExtraLight(e: any): void {
    (this.builder.setExtraLight(e), this.zShapeFixBuilder?.setExtraLight(e));
  }

  /**
   * 设置不透明度。
   * @param e - 0..1
   */
  setOpacity(e: number): void {
    (this.builder.setOpacity(e), this.zShapeFixBuilder?.setOpacity(e));
  }

  /**
   * 强制透明开关。
   * @param e - 是否强制透明
   */
  setForceTransparent(e: boolean): void {
    (this.builder.setForceTransparent(e),
      this.zShapeFixBuilder?.setForceTransparent(e));
  }

  /**
   * 有效帧数：有阴影层时为 builder.frameCount / 2（前半主帧 / 后半阴影帧）。
   */
  get frameCount(): number {
    return this.shadowRenderable
      ? this.builder.frameCount / 2
      : this.builder.frameCount;
  }

  /** 主形状 mesh。 */
  getShapeMesh(): any {
    return this.shapeMesh;
  }

  /** 阴影 mesh。 */
  getShadowMesh(): any {
    return this.shadowMesh;
  }

  /**
   * 控制阴影层可见性。
   * @param e - 是否显示阴影
   */
  setShadowVisible(e: boolean): void {
    this.shadowRenderable?.setVisible(e);
  }

  /** 创建聚合 Object3D（幂等）：主 mesh + 可选阴影/修正子层。 */
  create3DObject(): void {
    if (!this.target) {
      const i = (this.shapeMesh = this.builder.build());
      if (this.shadowRenderable || this.zShapeFixBuilder) {
        const e = new THREE.Object3D();
        (e.matrixAutoUpdate = false, e.add(i));
        let t;
        if (this.shadowRenderable) {
          (this.shadowRenderable.create3DObject(),
            (t = this.shadowMesh = this.shadowRenderable.get3DObject()),
            e.add(t));
        }
        if (this.zShapeFixBuilder) {
          t = this.zShapeFixBuilder.build();
          e.add(t);
        }
        this.target = e;
      } else {
        this.target = i;
      }
    }
  }

  /** 帧更新钩子（无逻辑）。 */
  update(_e: number): void {}

  /** 释放三层 builder。 */
  dispose(): void {
    (this.builder.dispose(),
      this.zShapeFixBuilder?.dispose(),
      this.shadowRenderable?.dispose());
  }
}
