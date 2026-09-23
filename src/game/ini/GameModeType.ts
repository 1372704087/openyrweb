/**
 * GameModeType — 多人游戏模式类型（mp mode 段名 → 枚举的映射键）。
 *
 * GameModes 解析时用段落名（如 "Battle"、"FreeForAll"）反查本枚举，
 * 查不到则回落 Battle。
 *
 * 由 game/ini/GameModeType.ts.js 重写为 TS（行为完全一致，枚举值脚本
 * 提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum GameModeType {
  /** 战役式对战（默认回落档）。 */
  Battle = 0,
  /** 手动编组对战。 */
  ManBattle = 1,
  /** 自由混战。 */
  FreeForAll = 2,
  /** 不洁联盟（尤里内战等）。 */
  Unholy = 3,
  /** 合作任务。 */
  Cooperative = 4,
}
