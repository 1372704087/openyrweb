/**
 * GameOpts — 联机/遭遇战对局选项相关的公共判定与 AI 难度枚举。
 *
 * - isHumanPlayerInfo：判断槽位信息是否为人类玩家（含 "name" 字段即视为人类）。
 * - AiDifficulty：八档 AI 难度；*_Ori 为原版三档，Easy/Medium/Brutal 为
 *   本仓扩展档（custom-ai 已移除，Easy_Custom / Medium_Custom 仍保留在
 *   枚举中供序列化兼容）。
 *
 * 由 game/gameopts/GameOpts.ts.js 重写为 TS（行为完全一致，枚举值脚本提取
 * 自原文件）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */

/** 判定对局槽位信息是否为人类玩家（以是否存在 name 字段为准）。 */
export function isHumanPlayerInfo(info: any): boolean {
  return "name" in info;
}

/** AI 难度枚举（含原版与扩展档）。 */
export enum AiDifficulty {
  /** 扩展：困难。 */
  Brutal = 0,
  /** 扩展：中等。 */
  Medium = 1,
  /** 扩展：简单。 */
  Easy = 2,
  /** 原版：困难。 */
  Brutal_Ori = 3,
  /** 原版：中等。 */
  Medium_Ori = 4,
  /** 原版：简单。 */
  Easy_Ori = 5,
  /** 自定义AI（已从 UI 移除，枚举值保留）。 */
  Easy_Custom = 6,
  /** 自定义AI（已从 UI 移除，枚举值保留）。 */
  Medium_Custom = 7,
}
