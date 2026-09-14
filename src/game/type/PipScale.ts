/**
 * PipScale — 对象头顶 pip 标记的刻度类别（显示哪一种进度点）。
 *
 * 由 game/type/PipScale.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum PipScale {
  /** 不显示 */
  None = 0,
  /** 载员数 */
  Passengers = 1,
  /** 弹药数 */
  Ammo = 2,
  /** 电量 */
  Power = 3,
  /** 矿石装载量 */
  Tiberium = 4,
  /** 心灵控制刻度：被控目标显示绿/红点 */
  MindControl = 5,
}
