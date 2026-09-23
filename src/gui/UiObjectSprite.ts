/**
 * UiObjectSprite — 由 ShpBuilder/Canvas 构建的 UiObject 精灵。
 *
 * fromShpFile 开启 batch；动画由 AnimationRunner 驱动切帧；
 * setTransparent/Opacity/LightMult 在未建 3D 对象时暂存，create3DObject 时回放。
 *
 * 由 gui/UiObjectSprite.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ShpBuilder } from "engine/renderable/builder/ShpBuilder"; // 已转换
import { UiObject } from "gui/UiObject"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 精灵 UiObject。 */
export class UiObjectSprite extends UiObject {
  /**
   * 由 SHP 创建 batched 精灵。
   * @param shpFile - SHP
   * @param palette - 调色板
   * @param camera - 相机
   */
  static fromShpFile(shpFile: any, palette: any, camera: any): any {
    const builder = new ShpBuilder(shpFile, palette, camera);
    builder.setBatched(true);
    builder.setBatchPalettes([palette]);
    builder.setOffset({ x: Math.floor(shpFile.width / 2), y: Math.floor(shpFile.height / 2) });
    return new (this as any)(builder);
  }

  /** 构建器。 */
  builder: any;
  /** 动画驱动。 */
  animationRunner?: any;
  /** 建 3D 前暂存的强制透明。 */
  initialTransparency?: boolean;
  /** 建 3D 前暂存的 opacity。 */
  initialOpacity?: number;
  /** 建 3D 前暂存的光照倍率。 */
  initialLightMult?: number;

  /**
   * @param builder - ShpBuilder 等
   */
  constructor(builder: any) {
    super();
    this.builder = builder;
  }

  /**
   * 设置动画驱动。
   * @param runner - SimpleRunner 等
   */
  setAnimationRunner(runner: any): void {
    this.animationRunner = runner;
  }

  /** 当前动画驱动。 */
  getAnimationRunner(): any {
    return this.animationRunner;
  }

  /**
   * 推进动画并可能切帧。
   * @param tick - 帧时钟
   */
  update(tick?: any): void {
    super.update(tick);
    if (this.animationRunner) {
      this.animationRunner.tick(tick);
      if (this.animationRunner.shouldUpdate()) {
        this.setFrame(this.animationRunner.getCurrentFrame());
      }
    }
  }

  /** 单帧尺寸。 */
  getSize(): any {
    return this.builder.getSize();
  }

  /**
   * 切帧。
   * @param frame - 帧索引
   */
  setFrame(frame: number): void {
    this.builder.setFrame(frame);
  }

  /** 当前帧。 */
  getFrame(): number {
    return this.builder.getFrame();
  }

  /** 总帧数。 */
  getFrameCount(): number {
    return this.builder.frameCount;
  }

  /**
   * 强制透明（未建对象则暂存）。
   * @param transparent - 是否透明
   */
  setTransparent(transparent: boolean): void {
    if (this.get3DObject()) this.builder.setForceTransparent(transparent);
    else this.initialTransparency = transparent;
  }

  /**
   * 不透明度（未建对象则暂存）。
   * @param opacity - 0..1
   */
  setOpacity(opacity: number): void {
    if (this.get3DObject()) this.builder.setOpacity(opacity);
    else this.initialOpacity = opacity;
  }

  /**
   * 额外光照倍率（未建对象则暂存）。
   * @param mult - 倍率
   */
  setLightMult(mult: number): void {
    if (this.get3DObject()) this.builder.setExtraLight(new THREE.Vector3().addScalar(-1 + mult));
    else this.initialLightMult = mult;
  }

  /** build 后回放暂存的透明/光照设置。 */
  create3DObject(): void {
    this.set3DObject(this.builder.build());
    super.create3DObject();
    if (this.initialTransparency !== undefined) this.builder.setForceTransparent(this.initialTransparency);
    if (this.initialOpacity !== undefined) this.builder.setOpacity(this.initialOpacity);
    if (this.initialLightMult !== undefined) {
      this.builder.setExtraLight(new THREE.Vector3().addScalar(this.initialLightMult));
    }
  }

  /** 销毁并 dispose builder。 */
  destroy(): void {
    super.destroy();
    this.builder.dispose();
  }
}
