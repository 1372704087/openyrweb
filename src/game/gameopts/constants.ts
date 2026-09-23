/**
 * constants — 对局选项/槽位里的哨兵 ID 与 UI 文案键。
 *
 * 各 ID 的约定值与原版 GameOpt 序列化保持一致：
 *  - RANDOM_* = -2：随机（国家/颜色/出生点）；
 *  - OBS_COUNTRY_ID = -3：观察者国家（颜色仍用 -2）；
 *  - NO_TEAM_ID = -2：无队伍。
 *
 * aiUiNames 将 AiDifficulty 映射到本地化键；custom-ai 已移除原先
 * Brutal / Easy_Custom / Medium_Custom 三个「自定义AI」名字，它们不再
 * 出现在 AI 选项列表里。显示层对未登记的难度有兜底（见 SoundHandler /
 * DiploForm / ScoreTable）。
 *
 * 由 game/gameopts/constants.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { AiDifficulty } from "game/gameopts/GameOpts"; // 已转换

/** 随机国家 ID。 */
export const RANDOM_COUNTRY_ID = -2;
/** 随机颜色 ID。 */
export const RANDOM_COLOR_ID = -2;
/** 随机出生点 ID。 */
export const RANDOM_START_POS = -2;
/** 无队伍 ID。 */
export const NO_TEAM_ID = -2;
/** 观察者国家 ID。 */
export const OBS_COUNTRY_ID = -3;
/** 观察者颜色 ID。 */
export const OBS_COLOR_ID = -2;
/** 随机国家的内部显示名。 */
export const RANDOM_COUNTRY_NAME = "Random";
/** 观察者的内部显示名。 */
export const OBS_COUNTRY_NAME = "Observer";

/** AI 难度 → 本地化 UI 名键（未登记的难度由显示层兜底）。 */
export const aiUiNames = new Map<AiDifficulty, string>()
  .set(AiDifficulty.Easy_Ori, "GUI:AIEasy")
  .set(AiDifficulty.Medium_Ori, "GUI:AINormal")
  .set(AiDifficulty.Brutal_Ori, "GUI:AIHard")
  .set(AiDifficulty.Easy, "GUI:AIDummy")
  .set(AiDifficulty.Medium, "NOSTR:伊拉克AI");

/** AI 难度 → 悬浮提示（当前为空表，预留扩展）。 */
export const aiUiTooltips = new Map<AiDifficulty, string>();

/** 随机国家侧栏 UI 名键。 */
export const RANDOM_COUNTRY_UI_NAME = "GUI:RandomEx";
/** 随机国家侧栏 tooltip 键。 */
export const RANDOM_COUNTRY_UI_TOOLTIP = "STT:PlayerSideRandom";
/** 观察者侧栏 UI 名键。 */
export const OBS_COUNTRY_UI_NAME = "GUI:Observer";
/** 观察者侧栏 tooltip 键。 */
export const OBS_COUNTRY_UI_TOOLTIP = "STT:PlayerSideObserver";
/** 随机颜色内部名（空串表示未指定）。 */
export const RANDOM_COLOR_NAME = "";
