/**
 * LoadInfoParser — 游戏加载进度（loadinfo）CSV 文本解析器。
 *
 * 由 network/gameopt/LoadInfoParser.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 关键语义（勿改）：每 5 个逗号分隔字段为一名玩家条目，
 * 顺序为 name, status, loadPercent, ping, lagAllowanceMillis。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 单名玩家的加载进度条目。 */
export interface LoadInfoEntry {
  /** 玩家名。 */
  name: string;
  /** 状态码（协议原样）。 */
  status: number;
  /** 加载完成百分比。 */
  loadPercent: number;
  /** 延迟数值。 */
  ping: number;
  /** 允许的滞后毫秒数。 */
  lagAllowanceMillis: number;
}

/** 加载进度解析器。 */
export class LoadInfoParser {
  /**
   * 解析逗号分隔的 loadinfo 文本。
   * @param text 原始 CSV 文本。
   * @returns 按 5 字段分组的玩家条目数组。
   */
  parse(text: string): LoadInfoEntry[] {
    const entries: LoadInfoEntry[] = [];
    const parts = text.split(",");
    for (let i = 0; i < parts.length / 5; ++i) {
      const entry: LoadInfoEntry = {
        name: parts[5 * i],
        status: Number(parts[5 * i + 1]),
        loadPercent: Number(parts[5 * i + 2]),
        ping: Number(parts[5 * i + 3]),
        lagAllowanceMillis: Number(parts[5 * i + 4]),
      };
      entries.push(entry);
    }
    return entries;
  }
}
