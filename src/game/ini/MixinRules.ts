/**
 * MixinRules — 从规则开关收集本局启用的 Mixin 类型列表。
 *
 * 目前仅识别 noDogEngiKills（军犬不咬死工程师）。Engine 加载 rules 后
 * 调用 getTypes(rules) 得到应启用的 MixinRulesType 集合。
 *
 * 由 game/ini/MixinRules.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
import { MixinRulesType } from "game/ini/MixinRulesType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class MixinRules {
  /**
   * 按规则对象收集应启用的 Mixin 类型。
   * @param rules 带布尔开关的规则对象（至少可读 noDogEngiKills）
   */
  static getTypes(rules: any): MixinRulesType[] {
    const types: MixinRulesType[] = [];
    if (rules.noDogEngiKills) types.push(MixinRulesType.NoDogEngiKills);
    return types;
  }
}
