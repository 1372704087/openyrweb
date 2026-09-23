/**
 * FlhCoords — 武器开火口 FLH（Forward/Lateral/Vertical）三维偏移。
 *
 * 构造时若传入长度为 3 的数组则立即 fromArray；否则三分量均为 0。
 * FLH 用于弹道/枪口相对对象朝向的发射点偏移。
 *
 * 由 game/art/FlhCoords.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** FLH 偏移向量。 */
export class FlhCoords {
  /** 前向。 */
  forward: any;
  /** 侧向。 */
  lateral: any;
  /** 垂直。 */
  vertical: any;

  /**
   * @param arr - 可选 [forward, lateral, vertical]；仅当 length===3 时应用
   */
  constructor(arr?: any) {
    this.forward = 0;
    this.lateral = 0;
    this.vertical = 0;
    if (arr && arr.length === 3) this.fromArray(arr);
  }

  /** 按 [forward, lateral, vertical] 覆盖三分量并返回 this。 */
  fromArray(arr: any): this {
    this.forward = arr[0];
    this.lateral = arr[1];
    this.vertical = arr[2];
    return this;
  }

  /** 拷贝当前三分量为新实例。 */
  clone(): any {
    return new FlhCoords([this.forward, this.lateral, this.vertical]);
  }
}
