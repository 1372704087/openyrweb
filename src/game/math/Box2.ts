/**
 * Box2 — 确定性路径下的二维包围盒子类。
 *
 * 孪生仅 `class Box2 extends THREE.Box2 {}`，不追加成员；
 * 存在意义是类型/模块边界上与 game/math 对齐。
 *
 * 由 game/math/Box2.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const BaseBox2: any = (THREE as any).Box2;

export class Box2 extends BaseBox2 {
  /** 显式转发构造参数：extends any 时 TS 默认 0 参构造，调用方需 new Box2(min, max)。 */
  constructor(min?: { x: number; y: number }, max?: { x: number; y: number }) {
    super(min, max);
  }
}
