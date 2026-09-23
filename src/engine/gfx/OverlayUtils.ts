/**
 * OverlayUtils — 地面圆环线与文本 canvas 覆盖层构造。
 *
 * 由 engine/gfx/OverlayUtils.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CanvasUtils } from "engine/gfx/CanvasUtils"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** OverlayUtils 静态工具。 */
export class OverlayUtils {
  /** 水平地面圆（CircleGeometry 去掉中心扇→闭合折线），depthTest 关、renderOrder 极大。 */
  static createGroundCircle(radius: number, color: number): any {
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const circle = new THREE.CircleGeometry(radius, 64);
    // three r94 CircleGeometry.vertices：[center, v0..vn-1]；孪生 shift 去心、push 闭合
    circle.vertices.shift();
    circle.vertices.push(circle.vertices[0]);
    const line = new THREE.Line(circle, material);
    line.rotation.x = Math.PI / 2;
    line.renderOrder = 1e6;
    return line;
  }

  /** 用 drawText 画到新 canvas 上（autoEnlargeCanvas=true），返回 canvas。 */
  static createTextBox(text: string, options: any): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 0;
    const ctx = canvas.getContext("2d", {
      alpha: !options.backgroundColor || !!String(options.backgroundColor).match(/^rgba/),
    });
    CanvasUtils.drawText(ctx as CanvasRenderingContext2D, text, 0, 0, { ...options, autoEnlargeCanvas: true });
    return canvas;
  }
}
