/**
 * PointerSprite — 指针光标条带精灵（UiObject + 离屏 canvas 逐帧 blit）。
 *
 * fromShpFile 由 SHP 转 canvas 条带；setFrame 越界抛 RangeError；
 * update 按 AnimationRunner 推进；create3DObject 建 alpha canvas 并挂到 HtmlContainer。
 *
 * 由 gui/PointerSprite.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { UiObject } from "gui/UiObject"; // 孪生（本批内一并转换）
import { ImageUtils } from "engine/gfx/ImageUtils"; // 已转换
import { HtmlContainer } from "gui/HtmlContainer"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 指针光标精灵。 */
export class PointerSprite extends UiObject {
  /** HTML 层 z-index。 */
  static HTML_ZINDEX = 100;

  /**
   * 由 SHP 文件创建。
   * @param shpFile - SHP
   * @param palette - 调色板
   */
  static fromShpFile(shpFile: any, palette: any): any {
    return new (this as any)(
      ImageUtils.convertShpToCanvas(shpFile, palette),
      { width: shpFile.width, height: shpFile.height },
      shpFile.numImages,
    );
  }

  /** 条带位图（横向多帧）。 */
  images: any;
  /** 单帧尺寸。 */
  size: { width: number; height: number };
  /** 总帧数。 */
  frameCount: number;
  /** 当前帧索引。 */
  currentFrame = 0;
  /** 可选动画驱动。 */
  animationRunner?: any;
  /** 2D 绘制上下文（create3DObject 创建）。 */
  targetContext?: any;

  /**
   * @param images - 条带
   * @param size - 单帧尺寸
   * @param frameCount - 帧数
   */
  constructor(images: any, size: { width: number; height: number }, frameCount: number) {
    super(new THREE.Object3D(), new HtmlContainer());
    this.images = images;
    this.size = size;
    this.frameCount = frameCount;
    this.currentFrame = 0;
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
  getSize(): { width: number; height: number } {
    return this.size;
  }

  /**
   * 切帧（相同值跳过；越界抛 RangeError）。
   * @param frame - 帧索引
   */
  setFrame(frame: number): void {
    if (frame !== this.currentFrame) {
      if (frame < 0 || this.frameCount <= frame) {
        throw new RangeError(`Pointer frame index out of bounds (index=${frame}, length=${this.frameCount})`);
      }
      this.currentFrame = frame;
      this.drawFrame(frame);
    }
  }

  /**
   * 从条带 blit 一帧到离屏 canvas。
   * @param frame - 帧索引
   */
  drawFrame(frame: number): void {
    if (this.targetContext) {
      this.targetContext.clearRect(0, 0, this.size.width, this.size.height);
      this.targetContext.drawImage(
        this.images,
        frame * this.size.width,
        0,
        this.size.width,
        this.size.height,
        0,
        0,
        this.size.width,
        this.size.height,
      );
    }
  }

  /** 当前帧。 */
  getFrame(): number {
    return this.currentFrame;
  }

  /** 总帧数。 */
  getFrameCount(): number {
    return this.frameCount;
  }

  /** 建 3D 对象并初始化绘制上下文。 */
  create3DObject(): void {
    super.create3DObject();
    if (!this.targetContext) {
      const canvas = document.createElement("canvas");
      const container = this.getHtmlContainer();
      container.setTranslateMode(true);
      const host = container.getElement();
      host.appendChild(canvas);
      host.style.zIndex = "" + PointerSprite.HTML_ZINDEX;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) throw new Error("Couldn't create pointer canvas context");
      this.targetContext = ctx;
      this.drawFrame(this.currentFrame);
    }
  }

  /** 销毁（透传父类）。 */
  destroy(): void {
    super.destroy();
  }
}
