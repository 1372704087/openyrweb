/**
 * Tooltip — 世界/UI 悬停提示框（canvas 文本 + 黑底描边）。
 *
 * 由 gui/screen/game/worldInteraction/Tooltip.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { UiObject } from "gui/UiObject"; // 已转换
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import * as CanvasUtilsModule from "engine/gfx/CanvasUtils"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const SpriteUtils: any = SpriteUtilsModule as any;
const CanvasUtils: any = CanvasUtilsModule as any;

/** 悬停 Tooltip。 */
export class Tooltip extends UiObject {
  /** 文本。 */
  text: string;
  /** 颜色。 */
  color: string;
  /** 指针。 */
  pointer: any;
  /** 视口。 */
  viewport: any;
  /** 纹理。 */
  texture: any;
  /** mesh。 */
  mesh: any;

  /**
   * @param text 多行文本
   * @param color 颜色
   * @param pointer 指针
   * @param viewport 视口
   */
  constructor(text: string, color: string, pointer: any, viewport: any) {
    super(new THREE.Object3D());
    this.text = text;
    this.color = color;
    this.pointer = pointer;
    this.viewport = viewport;
  }

  /** 懒创建 mesh 并按指针定位。 */
  create3DObject(): void {
    if (!this.mesh) {
      const root = this.get3DObject();
      this.texture = this.createTexture(this.text, this.color);
      const size = {
        width: this.texture.image.width,
        height: this.texture.image.height,
      };
      const mesh = (this.mesh = this.createMesh(this.texture, size.width, size.height));
      const pos = this.computePosition(this.pointer, this.viewport, size);
      mesh.position.x = pos.x;
      mesh.position.y = pos.y;
      root.add(mesh);
      mesh.updateMatrix();
    }
    super.create3DObject();
  }

  /**
   * 矩形 mesh（矩阵手动更新）。
   * @param texture 纹理
   * @param width 宽
   * @param height 高
   */
  createMesh(texture: any, width: number, height: number): any {
    const geometry = SpriteUtils.createRectGeometry(width, height);
    SpriteUtils.addRectUvs(geometry, { x: 0, y: 0, width, height }, { width, height });
    geometry.translate(width / 2, height / 2, 0);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.matrixAutoUpdate = false;
    mesh.frustumCulled = false;
    return mesh;
  }

  /**
   * 多行 canvas 纹理 + 1px 边框。
   * @param text 文本
   * @param color 色
   */
  createTexture(text: string, color: string): any {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 0;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let y = 0;
    for (const line of text.split("\n")) {
      const metrics = CanvasUtils.drawText(ctx, line, 0, y, {
        color,
        fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
        fontSize: 14,
        fontWeight: "500",
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 2,
        paddingRight: 4,
        autoEnlargeCanvas: true,
      });
      y += metrics.height;
    }
    const w = canvas.width;
    const h = canvas.height;
    const image = ctx.getImageData(0, 0, w, h);
    canvas.width += 1;
    canvas.height += 1;
    ctx.putImageData(image, 1, 1);
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
    ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
    const texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.flipY = false;
    return texture;
  }

  /**
   * 靠近指针，越界则翻到左侧/上侧。
   * @param pointer 指针
   * @param viewport 视口
   * @param size 尺寸
   */
  computePosition(pointer: any, viewport: any, size: { width: number; height: number }): any {
    const pos = { ...pointer.getPosition() };
    if (pos.x + 20 + size.width > viewport.x + viewport.width) {
      pos.x -= 20 + size.width;
    } else {
      pos.x += 20;
    }
    // 与孪生一致：纵向比较使用了 viewport.x（而非 y）
    if (pos.y + 20 + size.height > viewport.x + viewport.height) {
      pos.y -= 20 + size.height;
    } else {
      pos.y += 20;
    }
    return pos;
  }

  /** 释放纹理与 mesh。 */
  destroy(): void {
    super.destroy();
    this.texture?.dispose();
    if (this.mesh) {
      this.mesh.material.dispose();
      this.mesh.geometry.dispose();
    }
  }
}
