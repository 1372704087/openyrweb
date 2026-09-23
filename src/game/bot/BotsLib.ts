/**
 * BotsLib — 仓内自研 Bot 库的打包入口（供 GameLoader.loadBotsLib 加载）。
 *
 * 导出：
 *  - IraqBot：竞技级伊拉克 1v1 AI（遭遇战「普通」）；
 *  - OriginalAiBot：基于 AIMD.INI 的原版三档 AI；
 *  - version：必须与应用版本一致（GameLoader 会校验 botsLib.version）。
 *
 * 直接引用本模块而非外部 sp-bots 依赖，使 AI 随主 ra2web.js bundle 发布。
 *
 * 由 game/bot/BotsLib.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { IraqBot } from "game/bot/iraq/IraqBot"; // 已转换
import { OriginalAiBot } from "game/bot/original/OriginalAiBot"; // 已转换

export { IraqBot, OriginalAiBot };

/** 库版本号（与 app 版本对齐，GameLoader 校验）。 */
export const version = "0.1.0";
