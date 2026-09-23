/**
 * MixinRulesType — 规则混入（Mixin）能力类型位。
 *
 * 由 Engine 在加载 rules 时收集，供后续行为开关（如禁止军犬咬死工程师）使用。
 *
 * 由 game/ini/MixinRulesType.ts.js 重写为 TS（行为完全一致，枚举值脚本
 * 提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum MixinRulesType {
  /** 军犬不再瞬间咬死工程师（受规则混入控制的行为差异）。 */
  NoDogEngiKills = 0,
}
