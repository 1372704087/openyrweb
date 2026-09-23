/**
 * WolGameReport — WoL 对局结果报告（Base64 JSON 解码）+ 结果枚举。
 *
 * 由 network/WolGameReport.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - WolGameReportResult：Win=0 / Loss=1 / Draw=2（数值+反向映射与孪生一致）。
 * - 构造接收 Base64 串，Base64.decode 后 JSON.parse，再赋 gameId/players/duration。
 * - 构造器直接 return this（与孪生工厂写法一致）。
 * - 调用方：WolConnection.handleGameReport、ScoreTable（读 players[].resultType/points）。
 */

import { Base64 } from "util/Base64"; // 已转换

/** 对局结果。 */
export enum WolGameReportResult {
  /** 胜。 */
  Win = 0,
  /** 负。 */
  Loss = 1,
  /** 平。 */
  Draw = 2,
}

/** 报告中单名玩家的结果行。 */
export interface WolGameReportPlayer {
  /** 玩家名。 */
  name?: string;
  /** 本局结果。 */
  resultType?: WolGameReportResult;
  /** 天梯积分变化（可选）。 */
  points?: { value?: number; gain?: number };
  /** 其余协议字段。 */
  [key: string]: unknown;
}

/** 对局报告解码后的 JSON 形状。 */
interface WolGameReportJson {
  gameId?: string;
  players?: WolGameReportPlayer[];
  duration?: number;
}

/** Base64 编码的对局结果报告。 */
export class WolGameReport {
  /** 对局 id。 */
  gameId: string | undefined;
  /** 各玩家结果。 */
  players: WolGameReportPlayer[] | undefined;
  /** 对局时长（秒，协议原样）。 */
  duration: number | undefined;

  constructor(encoded: string) {
    const data = JSON.parse(Base64.decode(encoded)) as WolGameReportJson;
    this.gameId = data.gameId;
    this.players = data.players;
    this.duration = data.duration;
    return this;
  }
}
