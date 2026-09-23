/**
 * WLadderService — WOL 天梯 HTTP 客户端（seasons / listsearch / rungsearch）。
 *
 * 由 network/ladder/WLadderService.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 关键语义（勿改）：
 * - 未 setUrl 时各请求 throw "No ladder URL is set"。
 * - URL 路径拼接、CURRENT_SEASON/PREV_SEASON 静态属性、POST body 形状与孪生一致。
 */

import * as wladderConfig from "network/ladder/wladderConfig"; // 孪生
import { HttpRequest } from "network/HttpRequest"; // 孪生
import type { WolConfig } from "network/WolConfig"; // 类型（clientSku 来源）

/** 天梯接口 JSON（形状由服务端决定，与孪生 fetchJson 返回一致）。 */
export type LadderJson = unknown;

/** 天梯 HTTP 服务。 */
export class WLadderService {
  /** 当前赛季别名（孪生静态属性，来自 wladderConfig）。 */
  static readonly CURRENT_SEASON = wladderConfig.CURRENT_SEASON;
  /** 上一赛季别名。 */
  static readonly PREV_SEASON = wladderConfig.PREV_SEASON;

  private wolConfig: WolConfig;
  private url?: string;

  /**
   * @param wolConfig 提供 clientSku 的 WOL 配置
   */
  constructor(wolConfig: WolConfig) {
    this.wolConfig = wolConfig;
  }

  /**
   * 设置天梯 API 基址。
   * @param url 基址
   */
  setUrl(url: string): void {
    this.url = url;
  }

  /** 当前基址（未设置时为 undefined）。 */
  getUrl(): string | undefined {
    return this.url;
  }

  /**
   * 获取赛季列表。
   * @param init 可选 fetch init（孪生透传）
   */
  async getSeasons(init?: RequestInit): Promise<LadderJson> {
    if (!this.url) throw new Error("No ladder URL is set");
    const sku = this.wolConfig.getClientSku();
    return await new HttpRequest().fetchJson(this.url + "/" + sku, init as never);
  }

  /**
   * 获取单个赛季详情。
   * @param season 赛季 id
   * @param locale 区域参数
   * @param init 可选 fetch init
   */
  async getSeason(season: string, locale: string, init?: RequestInit): Promise<LadderJson> {
    if (!this.url) throw new Error("No ladder URL is set");
    const sku = this.wolConfig.getClientSku();
    return await new HttpRequest().fetchJson(this.url + `/${sku}/${season}?locale=` + locale, init as never);
  }

  /**
   * 按玩家名列表搜索（POST listsearch）。
   * @param players 玩家名数组
   * @param init 可选 fetch init
   * @param ladderType 天梯类型，默认 Solo1v1
   * @param season 赛季别名，默认 CURRENT_SEASON
   * @param locale 可选 locale（写入 JSON body）
   */
  async listSearch(
    players: string[],
    init?: RequestInit,
    ladderType: wladderConfig.LadderType = wladderConfig.LadderType.Solo1v1,
    season: string = WLadderService.CURRENT_SEASON,
    locale?: string,
  ): Promise<LadderJson> {
    if (!this.url) throw new Error("No ladder URL is set");
    const sku = this.wolConfig.getClientSku();
    return await new HttpRequest().fetchJson(this.url + `/${sku}/${ladderType}/${season}/listsearch`, init as never, {
      method: "POST",
      body: JSON.stringify({ players, locale }),
    });
  }

  /**
   * 按台阶/rung 范围拉取列表（POST rungsearch）。
   * @param start 起始索引
   * @param count 条数
   * @param ladderType 天梯类型
   * @param season 赛季别名
   * @param ladderId 天梯 id（body.ladderId）
   * @param init 可选 fetch init
   */
  async rungSearch(
    start: number,
    count: number,
    ladderType: string,
    season: string,
    ladderId: string | number,
    init?: RequestInit,
  ): Promise<LadderJson> {
    if (!this.url) throw new Error("No ladder URL is set");
    const sku = this.wolConfig.getClientSku();
    return await new HttpRequest().fetchJson(this.url + `/${sku}/${ladderType}/${season}/rungsearch`, init as never, {
      method: "POST",
      body: JSON.stringify({ ladderId, start, count }),
    });
  }
}
