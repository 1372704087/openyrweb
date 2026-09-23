/**
 * RouteHelper — 对局 hash 路由（#/game/<base64>）的序列化辅助。
 *
 * getGameRoute：把对局参数 JSON → Base64 拼进 #/game/…；extractGameParams 反向解析。
 * 另有静态字段 modQueryStringName 供 URL 查询串读写活动 Mod 使用。
 *
 * 由 RouteHelper.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Base64 } from "util/Base64"; // 已转换

/** 对局路由中需要携带的参数子集（与孪生 JSON.stringify 字段一一对应）。 */
export interface GameRouteParams {
  gameId: number | string;
  gameTimestamp: number | string;
  gservUrl: string;
  playerName: string;
  gameOpts?: unknown;
  tournament?: unknown;
}

export class RouteHelper {
  /** URL 查询参数名：活动 Mod（`?mod=…`）。 */
  static modQueryStringName = "mod";

  /** 构造 `#/game/<Base64(JSON)>` 形式的 hash 路由。 */
  static getGameRoute(params: GameRouteParams): string {
    return (
      "#/game/" +
      Base64.encode(
        JSON.stringify({
          gameId: params.gameId,
          gameTimestamp: params.gameTimestamp,
          gservUrl: params.gservUrl,
          playerName: params.playerName,
          gameOpts: params.gameOpts,
          tournament: params.tournament,
        }),
      )
    );
  }

  /** 从 Base64 段还原对局参数对象（解析失败会抛 JSON 异常，与孪生一致）。 */
  static extractGameParams(encoded: string): GameRouteParams {
    return JSON.parse(Base64.decode(encoded));
  }
}
