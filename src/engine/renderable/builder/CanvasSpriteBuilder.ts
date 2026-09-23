/**
 * CanvasSpriteBuilder — Canvas 图像精灵构建器（静态图集缓存 + 按帧几何缓存）。
 *
 * 由 engine/renderable/builder/CanvasSpriteBuilder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import * as CanvasTextureAtlasModule from "engine/renderable/builder/CanvasTextureAtlas"; // 孪生

const SpriteUtils = (SpriteUtilsModule as any).SpriteUtils as any;
const CanvasTextureAtlas = (CanvasTextureAtlasModule as any)
  .CanvasTextureAtlas as any;

declare const THREE: any;

/** Canvas 图像数组。 */
export type CanvasImageList = any[];

/**
 * Canvas 精灵构建器。
 * images 静态图集缓存；frameGeometries 按帧复用；
 * setExtraLight 与孪生一致直接抛 Not implemented。
 */
export class CanvasSpriteBuilder {
  private static textureCache = new Map<CanvasImageList, any>();

  atlas?: any;
  private offset = { x: 0, y: 0 };
  private align = { x: 0, y: 0 };
  private opacity = 1;
  private forceTransparent = false;
  private frustumCulled = false;
  private frameGeometries = new Map<number, any>();
  private frameNo = 0;
  private mesh?: any;

  /** 清空静态图集缓存。 */
  static clearCaches(): void {
    CanvasSpriteBuilder.textureCache.clear();
  }

  /**
   * @param images - 帧图像数组
   * @param camera - 相机
   */
  constructor(
    private images: CanvasImageList,
    private camera: any,
  ) {
    (this.images = images),
      (this.camera = camera),
      (this.offset = { x: 0, y: 0 }),
      (this.align = { x: 0, y: 0 }),
      (this.opacity = 1),
      (this.forceTransparent = false),
      (this.frustumCulled = false),
      (this.frameGeometries = new Map()),
      this.setFrame(0);
  }

  /**
   * 设置偏移。
   * @param e - {x,y}
   */
  setOffset(e: { x: number; y: number }): void {
    this.offset = e;
  }

  /**
   * 设置对齐并重建当前帧几何。
   * @param e - align.x
   * @param t - align.y
   */
  setAlign(e: number, t: number): void {
    this.align = { x: e, y: t };
    if (this.mesh) {
      this.frameGeometries.get(this.frameNo)?.dispose();
      const i = SpriteUtils.createSpriteGeometry(this.getSpriteGeometryOptions());
      this.frameGeometries.set(this.frameNo, i);
      this.mesh.geometry = i;
    }
  }

  /** 从静态缓存取/建图集。 */
  private initTexture(): void {
    if (CanvasSpriteBuilder.textureCache.has(this.images)) {
      this.atlas = CanvasSpriteBuilder.textureCache.get(this.images);
    } else {
      const e = new CanvasTextureAtlas();
      e.pack(this.images);
      CanvasSpriteBuilder.textureCache.set(this.images, e);
      this.atlas = e;
    }
  }

  /** 当前帧几何选项（含 align/offset）。 */
  private getSpriteGeometryOptions(): any {
    const e = this.images[this.frameNo];
    const t = {
      x: -e.width / 2 - this.align.x * (e.width / 2) + this.offset.x,
      y: -e.height / 2 - this.align.y * (e.height / 2) + this.offset.y,
    };
    return {
      texture: this.atlas.getTexture(),
      textureArea: this.atlas.getImageRect(e),
      align: { x: 1, y: -1 },
      offset: t,
      camera: this.camera,
    };
  }

  /**
   * 切换帧（变化时取/建几何并挂到 mesh）。
   * @param t - 帧号
   */
  setFrame(t: number): void {
    if (this.frameNo === t) return;
    this.frameNo = t;
    if (!this.mesh) return;
    let e = this.frameGeometries.get(t);
    if (!e) {
      e = SpriteUtils.createSpriteGeometry(this.getSpriteGeometryOptions());
      this.frameGeometries.set(t, e);
    }
    this.mesh.geometry = e;
  }

  /** 当前帧号。 */
  getFrame(): number {
    return this.frameNo;
  }

  /** 当前帧像素尺寸。 */
  getSize(): { width: number; height: number } {
    return {
      width: this.images[this.frameNo].width,
      height: this.images[this.frameNo].height,
    };
  }

  /** 总帧数。 */
  get frameCount(): number {
    return this.images.length;
  }

  /**
   * 设置不透明度（整数部分变化且未 forceTransparent 时更新 transparent）。
   * @param e - 0..1
   */
  setOpacity(e: number): void {
    const t = this.opacity;
    if (t !== e) {
      this.opacity = e;
      if (this.mesh) this.mesh.material.opacity = e;
      if (
        Math.floor(t) !== Math.floor(e) &&
        !this.forceTransparent
      )
        this.updateTransparency();
    }
  }

  /**
   * 强制透明开关。
   * @param e - 是否强制
   */
  setForceTransparent(e: boolean): void {
    if (this.forceTransparent !== e) {
      (this.forceTransparent = e, this.updateTransparency());
    }
  }

  /** 重算 material.transparent。 */
  private updateTransparency(): void {
    if (this.mesh)
      this.mesh.material.transparent =
        this.forceTransparent || this.opacity < 1;
  }

  /** 与孪生一致：未实现。 */
  setExtraLight(_e: any): void {
    throw new Error("Not implemented");
  }

  /**
   * 设置视锥剔除。
   * @param e - 是否 cull
   */
  setFrustumCulled(e: boolean): void {
    this.frustumCulled = e;
    if (this.mesh) this.mesh.frustumCulled = e;
  }

  /** 创建 mesh（幂等）。 */
  build(): any {
    if (this.mesh) return this.mesh;
    this.initTexture();
    const e = SpriteUtils.createSpriteGeometry(this.getSpriteGeometryOptions());
    this.frameGeometries.set(this.frameNo, e);
    const t = new THREE.MeshBasicMaterial({
      map: this.atlas.getTexture(),
      flatShading: true,
      opacity: this.opacity,
      transparent: this.opacity < 1 || this.forceTransparent,
    });
    const i = new THREE.Mesh(e, t);
    (i.matrixAutoUpdate = false), (i.frustumCulled = this.frustumCulled);
    this.mesh = i;
    return i;
  }

  /** 释放帧几何与材质。 */
  dispose(): void {
    (this.frameGeometries.forEach((g) => g.dispose()),
      this.mesh?.material?.dispose());
  }
}
