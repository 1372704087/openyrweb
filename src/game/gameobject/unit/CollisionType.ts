/** 碰撞类型。由 CollisionType.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum CollisionType {
  None = 0,
  Ground = 1,
  Wall = 2,
  Cliff = 3,
  OnBridge = 4,
  UnderBridge = 5,
  Shore = 6,
}
