/**
 * RaycastHelper — 场景射线拾取（指针 NDC 归一化 + Raycaster）。
 *
 * 由 engine/util/RaycastHelper.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */

/** 画布/窗口上的像素坐标。 */
export interface Point {
  x: number;
  y: number;
}

/** 视口矩形（与 scene.viewport 字段对齐）。 */
export interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 简化 scene 形状：射线拾取只需要 viewport 与 camera。 */
export interface RaycastScene {
  viewport: ViewportRect;
  camera: unknown;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RaycastHelper {
  readonly scene: RaycastScene;

  constructor(scene: RaycastScene) {
    this.scene = scene;
  }

  /**
   * 对 objects 做射线求交。
   * @param pointer - 屏幕像素坐标
   * @param objects - 参与检测的对象数组
   * @param recursive - 是否递归子节点（默认 false，与孪生 `!1` 一致）
   */
  intersect(pointer: Point, objects: any[], recursive: boolean = false): any[] {
    const raycaster = new (THREE as any).Raycaster();
    const ndc = this.normalizePointer(pointer, this.scene.viewport);
    raycaster.setFromCamera(ndc, this.scene.camera);
    return raycaster.intersectObjects(objects, recursive);
  }

  /** 像素坐标 → NDC [-1,1]（原点在视口左上角偏移之后）。 */
  normalizePointer(pointer: Point, viewport: ViewportRect): { x: number; y: number } {
    return {
      x: ((pointer.x - viewport.x) / viewport.width) * 2 - 1,
      y: 2 * -((pointer.y - viewport.y) / viewport.height) + 1,
    };
  }
}
