/**
 * UiText — 离屏 canvas 文本贴图网格（UiComponent）。
 *
 * defineChildren 挂 intrinsic mesh；setValue/setTextAlign 重绘纹理；
 * onDispose 释放 geometry/material/texture。
 *
 * 由 gui/component/UiText.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生（本批内一并转换）
import { UiObject } from "gui/UiObject"; // 孪生（本批内一并转换）
import { UiComponent } from "gui/jsx/UiComponent"; // 孪生（本批内一并转换）
import { HtmlContainer } from "gui/HtmlContainer"; // 孪生（本批内一并转换）
import { SpriteUtils } from "engine/gfx/SpriteUtils"; // 已转换
import { CanvasUtils } from "engine/gfx/CanvasUtils"; // 已转换

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生导出 new SpriteUtils() 实例；TS 编译导出 class。按运行时形态取单例方法面。
const spriteUtils: any =
  typeof SpriteUtils === "function" ? new (SpriteUtils as any)() : SpriteUtils;

/** 文本 UI 组件。 */
export class UiText extends UiComponent {
  /** 当前文本。 */
  value: any;
  /** 对齐。 */
  textAlign: any;
  /** 离屏 ctx。 */
  ctx?: any;
  /** 文本纹理。 */
  texture?: any;
  /** 文本 mesh。 */
  mesh?: any;

  constructor(props: any) {
    super(props);
    this.value = this.props.value;
    this.textAlign = this.props.textAlign;
  }

  /** 建 UiObject 并准备 canvas/texture/mesh。 */
  createUiObject(): any {
    const obj = new UiObject(new THREE.Object3D(), new HtmlContainer());
    obj.setPosition(this.props.x || 0, this.props.y || 0);
    const w = this.props.width;
    const h = this.props.height;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.texture = this.createTexture(canvas);
    this.updateTexture(this.value, this.textAlign, this.props.textColor);
    this.mesh = this.createMesh(w, h);
    return obj;
  }

  /**
   * 创建 Nearest 纹理。
   * @param canvas - 源画布
   */
  createTexture(canvas: any): any {
    const tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    tex.flipY = false;
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }

  /**
   * 创建矩形网格。
   * @param width - 宽
   * @param height - 高
   */
  createMesh(width: number, height: number): any {
    const geo = spriteUtils.createRectGeometry(width, height);
    spriteUtils.addRectUvs(geo, { x: 0, y: 0, width, height }, { width, height });
    geo.translate(width / 2, height / 2, 0);
    const mat = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    return mesh;
  }

  /** 子节点：mesh intrinsic。 */
  defineChildren(): any {
    return jsx("mesh", { zIndex: this.props.zIndex, onClick: this.props.onClick }, this.mesh);
  }

  /**
   * 重绘纹理文本。
   * @param value - 文本
   * @param align - 对齐
   * @param color - 颜色
   */
  updateTexture(value: any, align: any, color?: any): void {
    this.ctx.clearRect(0, 0, this.props.width, this.props.height);
    CanvasUtils.drawText(this.ctx, value, 0, 0, {
      color,
      fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
      fontSize: 12,
      fontWeight: "500",
      paddingTop: 6,
      textAlign: align ?? "center",
      width: this.props.width,
      height: this.props.height,
    });
    this.texture.needsUpdate = true;
  }

  /**
   * 改文本（变化才重绘）。
   * @param value - 新文本
   */
  setValue(value: any): void {
    if (this.value !== value) {
      this.value = value;
      this.updateTexture(value, this.textAlign, this.props.textColor);
    }
  }

  /**
   * 改对齐（变化才重绘）。
   * @param align - 对齐
   */
  setTextAlign(align: any): void {
    if (align !== this.textAlign) {
      this.textAlign = align;
      this.updateTexture(this.value, align, this.props.textColor);
    }
  }

  /** 释放 GPU 资源。 */
  onDispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.texture.dispose();
  }
}
