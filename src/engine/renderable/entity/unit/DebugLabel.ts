/**
 * DebugLabel — Canvas 文字调试标签（Sprite 贴图，多行文本）。
 *
 * create3DObject 按 color 计算对比前景色并绘制纹理；无深度测试常显。
 *
 * 由 engine/renderable/entity/unit/DebugLabel.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import * as CanvasUtilsModule from "engine/gfx/CanvasUtils"; // 孪生
import { Coords } from "game/Coords"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const SpriteUtils: any = (SpriteUtilsModule as any).SpriteUtils;
const CanvasUtils: any = (CanvasUtilsModule as any).CanvasUtils;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 调试文字标签。 */
export class DebugLabel {
  /** 多行文本。 */
  text: string;
  /** 背景色/主色（hex 或 css 色串）。 */
  color: any;
  /** 相机（Sprite 对齐）。 */
  camera: any;
  /** 文字网格。 */
  mesh?: any;
  /** 文字纹理。 */
  texture?: any;

  /**
   * @param text - 文本（可含 \n）
   * @param color - 颜色
   * @param camera - 相机
   */
  constructor(text: string, color: any, camera: any) {
    this.text = text;
    this.color = color;
    this.camera = camera;
  }

  /** 取 3D 对象。 */
  get3DObject(): any {
    return this.mesh;
  }

  /** 惰性创建纹理与网格。 */
  create3DObject(): void {
    if (!this.mesh) {
      const color = new (THREE as any).Color(this.color);
      const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
      const outline = 0.5 < luminance ? "black" : "white";
      this.texture = this.createTexture(this.text, "#" + color.getHexString(), outline);
      this.mesh = this.createMesh(this.texture);
    }
  }

  /**
   * 由纹理创建 Sprite 网格。
   * @param texture - 已就绪纹理
   */
  createMesh(texture: any): any {
    const geometry = SpriteUtils.createSpriteGeometry({
      texture,
      camera: this.camera,
      align: { x: 0, y: -1 },
      offset: { x: 0, y: Coords.ISO_TILE_SIZE / 4 },
      scale: Coords.ISO_WORLD_SCALE,
    });
    const material = new (THREE as any).MeshBasicMaterial({
      map: texture,
      side: (THREE as any).DoubleSide,
      transparent: true,
      depthTest: false,
      flatShading: true,
    });
    const mesh = new (THREE as any).Mesh(geometry, material);
    mesh.matrixAutoUpdate = false;
    return mesh;
  }

  /**
   * 多行 Canvas 绘字并生成纹理（+1px 描边余量）。
   * @param text - 文本
   * @param color - 填充色 CSS
   * @param outline - 描边色 CSS
   */
  createTexture(text: string, color: string, outline: string): any {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 0;
    const ctx = canvas.getContext("2d")!;
    let y = 0;
    for (const line of text.split("\n")) {
      const size = CanvasUtils.drawText(ctx, line, 0, y, {
        color,
        outlineColor: outline,
        outlineWidth: 2,
        fontFamily: "'Fira Sans Condensed', 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', 'Source Han Sans SC', 'WenQuanYi Micro Hei', Arial, sans-serif",
        fontSize: 10,
        fontWeight: "400",
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 3,
        paddingRight: 3,
        autoEnlargeCanvas: true,
      });
      y += size.height;
    }
    const w = canvas.width;
    const h = canvas.height;
    const image = ctx.getImageData(0, 0, w, h);
    canvas.width += 1;
    canvas.height += 1;
    ctx.putImageData(image, 1, 1);
    const texture = new (THREE as any).Texture(canvas);
    texture.minFilter = (THREE as any).NearestFilter;
    texture.magFilter = (THREE as any).NearestFilter;
    texture.needsUpdate = true;
    texture.flipY = true;
    return texture;
  }

  /** 标签无逐帧逻辑。 */
  update(): void {}

  /** 释放纹理与网格资源。 */
  dispose(): void {
    this.texture?.dispose();
    this.mesh?.material?.dispose();
    this.mesh?.geometry.dispose();
  }
}
