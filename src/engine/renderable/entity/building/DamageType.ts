/**
 * DamageType — 建筑损伤状态枚举（正常/黄血/红血/摧毁）。
 *
 * 由 engine/renderable/entity/building/DamageType.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum DamageType {
  /** 正常（未受损）。 */
  NORMAL = 0,
  /** 黄血（受损阈值一档）。 */
  CONDITION_YELLOW = 1,
  /** 红血（受损阈值二档）。 */
  CONDITION_RED = 2,
  /** 已摧毁。 */
  DESTROYED = 3,
}
