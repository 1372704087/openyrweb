/**
 * JsxRenderer — 内置 intrinsic 渲染器表（sprite/sprite-batch/container/mesh）。
 *
 * 注册 onClick 等 DOM 事件到 UiObject；getImage/getPalette 缺失抛错；
 * render 调 renderJsx；sprite 支持 canvas 多图或 SHP 单图。
 *
 * 由 gui/jsx/JsxRenderer.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { renderJsx } from "gui/jsx/jsx"; // 孪生（本批内一并转换）
import { UiObjectSprite } from "gui/UiObjectSprite"; // 孪生（本批内一并转换）
import { UiObject } from "gui/UiObject"; // 孪生（本批内一并转换）
import { HtmlContainer } from "gui/HtmlContainer"; // 孪生（本批内一并转换）
import { CanvasSpriteBuilder } from "engine/renderable/builder/CanvasSpriteBuilder"; // 已转换
import { ShpSpriteBatch } from "gui/ShpSpriteBatch"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 是否 canvas 多图 props（有 images 字段）。 */
const hasImages = (props: any): boolean => !!props.images;

/** JSX intrinsic 渲染器。 */
export class JsxRenderer {
  /** 图像名 → 位图。 */
  images: Map<string, any>;
  /** 调色板名 → 调色板。 */
  palettes: Map<string, any>;
  /** 相机。 */
  camera: any;
  /** 可选指针事件总线（ctor 第四参）。 */
  pointerEvents?: any;
  /** intrinsic 名 → 渲染函数。 */
  jsxIntrinsicRenderers: Record<string, (props: any) => { obj?: any; children?: any[] }>;

  /**
   * @param images - 图像表
   * @param palettes - 调色板表
   * @param camera - 相机
   * @param pointerEvents - 可选 PointerEvents
   */
  constructor(images: Map<string, any>, palettes: Map<string, any>, camera: any, pointerEvents?: any) {
    this.images = images;
    this.palettes = palettes;
    this.camera = camera;
    this.pointerEvents = pointerEvents;
    this.jsxIntrinsicRenderers = {
      sprite: (props: any) => {
        let sprite: any;
        if (hasImages(props)) {
          const builder = new CanvasSpriteBuilder(props.images, this.camera);
          builder.setAlign(props.alignX ?? 0, props.alignY ?? 0);
          sprite = new UiObjectSprite(builder);
        } else {
          const shp = typeof props.image === "string" ? this.getImage(props.image) : props.image;
          const palette = typeof props.palette === "string" ? this.getPalette(props.palette) : props.palette;
          sprite = UiObjectSprite.fromShpFile(shp, palette, this.camera);
        }
        if (pointerEvents) sprite.setPointerEvents(pointerEvents);
        this.setupListeners(sprite, props);
        if (props.onFrame) sprite.onFrame.subscribe(props.onFrame);
        sprite.setPosition(props.x || 0, props.y || 0);
        if (props.frame !== undefined) sprite.setFrame(props.frame);
        if (props.animationRunner) sprite.setAnimationRunner(props.animationRunner);
        if (props.hidden) sprite.setVisible(false);
        if (props.zIndex) sprite.setZIndex(props.zIndex);
        if (props.opacity !== undefined) sprite.setOpacity(props.opacity);
        if (props.transparent !== undefined) sprite.setTransparent(props.transparent);
        if (props.tooltip !== undefined) sprite.setTooltip(props.tooltip);
        return { obj: sprite };
      },
      "sprite-batch": (props: any) => {
        let nodes: any[] = [];
        if (props.children) {
          nodes = Array.isArray(props.children) ? props.children.flat() : [props.children];
        }
        const rest: any[] = [];
        const staticProps: any[] = [];
        for (const child of nodes) {
          if (child.type === "sprite" && child.props.static && !hasImages(child.props)) {
            staticProps.push(child.props);
          } else {
            rest.push(child);
          }
        }
        return {
          obj: new ShpSpriteBatch(
            staticProps,
            (name: string) => this.getImage(name),
            (name: string) => this.getPalette(name),
            this.camera,
          ),
          children: [...rest],
        };
      },
      container: (props: any) => {
        const obj = new UiObject(new THREE.Object3D(), new HtmlContainer());
        if (pointerEvents) obj.setPointerEvents(pointerEvents);
        this.setupListeners(obj, props);
        if (props.onFrame) obj.onFrame.subscribe(props.onFrame);
        if (props.hidden) obj.setVisible(false);
        if (props.zIndex) obj.setZIndex(props.zIndex);
        obj.setPosition(props.x || 0, props.y || 0);
        obj.getHtmlContainer()?.setSize(props.width || 0, props.height || 0);
        return { obj };
      },
      mesh: (props: any) => {
        const obj = new UiObject(props.children);
        if (pointerEvents) obj.setPointerEvents(pointerEvents);
        this.setupListeners(obj, props);
        obj.setPosition(props.x || 0, props.y || 0);
        if (props.zIndex) obj.setZIndex(props.zIndex);
        if (props.hidden) obj.setVisible(false);
        return { obj };
      },
    };
  }

  /**
   * 将 onClick 等 props 挂到 UiObject。
   * @param obj - 目标
   * @param props - JSX props
   */
  setupListeners(obj: any, props: any): void {
    const map: Record<string, string> = {
      click: "onClick",
      dblclick: "onDoubleClick",
      mousedown: "onMouseDown",
      mouseenter: "onMouseEnter",
      mouseleave: "onMouseLeave",
      mouseout: "onMouseOut",
      mouseover: "onMouseOver",
      mouseup: "onMouseUp",
      mousemove: "onMouseMove",
      wheel: "onWheel",
    };
    Object.keys(map).forEach((ev) => {
      const cb = props[map[ev]];
      if (cb) obj.addEventListener(ev, cb);
    });
  }

  /**
   * 替换相机。
   * @param camera - 相机
   */
  setCamera(camera: any): void {
    this.camera = camera;
  }

  /**
   * 按名取图像（缺失抛错）。
   * @param name - 键名
   */
  getImage(name: string): any {
    const img = this.images.get(name);
    if (!img) throw new Error(`Missing image "${name}"`);
    return img;
  }

  /**
   * 按名取调色板（缺失抛错）。
   * @param name - 键名
   */
  getPalette(name: string): any {
    const pal = this.palettes.get(name);
    if (!pal) throw new Error(`Missing palette "${name}"`);
    return pal;
  }

  /**
   * 渲染 JSX 树。
   * @param node - 根节点
   */
  render(node: any): any[] {
    return renderJsx(node, this.jsxIntrinsicRenderers);
  }
}
