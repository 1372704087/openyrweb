/**
 * DebugText — HUD 调试多行文本（canvas 纹理，30Hz 刷新）。
 *
 * 由 gui/screen/game/component/hud/DebugText.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import * as CanvasUtilsModule from "engine/gfx/CanvasUtils"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiObject: any = (UiObjectModule as any).UiObject;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const SpriteUtils: any = (SpriteUtilsModule as any).SpriteUtils;
const CanvasUtils: any = (CanvasUtilsModule as any).CanvasUtils;

/** HUD 调试文本组件。 */
export class DebugText extends UiComponent {
  /** 2d 上下文。 */
  ctx: CanvasRenderingContext2D;
  /** 纹理。 */
  texture: any;
  /** mesh。 */
  mesh: any;
  /** 上次刷新时间。 */
  lastUpdate: number | undefined;
  /** 上次文本。 */
  lastText: string | undefined;

  /**
   * 创建根对象与 canvas 纹理 mesh。
   */
  createUiObject(): any {
    const obj = new UiObject(new THREE.Object3D(), new HtmlContainer());
    obj.setPosition(this.props.x || 0, this.props.y || 0);
    const width = this.props.width;
    const height = this.props.height;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.texture = this.createTexture(canvas);
    this.mesh = this.createMesh(width, height);
    return obj;
  }

  /**
   * 像素对齐纹理。
   * @param canvas 源 canvas
   */
  createTexture(canvas: HTMLCanvasElement): any {
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.flipY = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }

  /**
   * 矩形 mesh。
   * @param width 宽
   * @param height 高
   */
  createMesh(width: number, height: number): any {
    const geometry = SpriteUtils.createRectGeometry(width, height);
    SpriteUtils.addRectUvs(
      geometry,
      { x: 0, y: 0, width, height },
      { width, height },
    );
    geometry.translate(width / 2, height / 2, 0);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    return mesh;
  }

  /** 挂 mesh 子节点。 */
  defineChildren(): any {
    return jsx("mesh", { zIndex: this.props.zIndex }, this.mesh);
  }

  /**
   * 30Hz 拉取 text/visible。
   * @param now 帧时间
   */
  onFrame(now: number): void {
    if (this.lastUpdate && now - this.lastUpdate < 1e3 / 30) return;
    this.lastUpdate = now;
    const text = this.props.text.value;
    if (this.props.visible.value !== this.getUiObject().isVisible()) {
      this.getUiObject().setVisible(this.props.visible.value);
    }
    if (this.lastText !== text) {
      this.lastText = text;
      const lines = text.split(/\r?\n/g);
      this.drawLines(lines);
    }
  }

  /**
   * 清空并绘制全部行。
   * @param lines 文本行
   */
  drawLines(lines: string[]): void {
    this.ctx.clearRect(0, 0, this.props.width, this.props.height);
    const wrapWidth = Math.floor((110 * this.props.width) / 600);
    let y = 0;
    for (const line of lines) {
      for (const part of this.wrapText(line, wrapWidth)) {
        y += this.drawLine(part, this.props.color, y);
      }
    }
    this.texture.needsUpdate = true;
  }

  /**
   * 绘一行。
   * @param text 文本
   * @param color 颜色
   * @param y 起始 y
   */
  drawLine(text: string, color: any, y: number): number {
    const font = {
      fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
      fontSize: 12,
      fontWeight: "400",
      paddingTop: 6,
      height: 20,
    };
    const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
    const outline = luminance > 0.5 ? "black" : "white";
    return CanvasUtils.drawText(this.ctx, text, 0, y, {
      color: "#" + color.getHexString(),
      outlineColor: outline,
      outlineWidth: 2,
      ...font,
      paddingLeft: 4,
      paddingRight: 4,
    }).height;
  }

  /**
   * 按宽度在空格处折行。
   * @param text 源行
   * @param maxWidth 最大字符宽
   */
  wrapText(text: string, maxWidth: number): string[] {
    const parts: string[] = [];
    let rest = text;
    while (rest.length > maxWidth) {
      let cut = rest.slice(0, maxWidth).search(/\s[^\s]*$/);
      if ((cut !== -1 && cut !== 0) || cut === -1) {
        if (cut === -1 || cut === 0) cut = Math.min(rest.length, maxWidth);
      } else {
        cut = Math.min(rest.length, maxWidth);
      }
      parts.push(rest.substr(0, cut));
      rest = rest.slice(cut);
    }
    if (rest.length) parts.push(rest);
    return parts;
  }

  /** 释放几何/材质/纹理。 */
  onDispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.texture.dispose();
  }
}
