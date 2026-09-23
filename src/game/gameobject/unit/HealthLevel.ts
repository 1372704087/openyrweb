/**
 * HealthLevel — 血条颜色档位（绿/黄/红）。
 *
 * 由 HealthTrait 按当前生命占比算出并驱动血条与状态色渲染。
 *
 * 由 game/gameobject/unit/HealthLevel.ts.js 重写为 TS（行为完全一致，
 * 枚举值脚本提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum HealthLevel {
  /** 健康（绿）。 */
  Green = 0,
  /** 受损（黄）。 */
  Yellow = 1,
  /** 重创（红）。 */
  Red = 2,
}
