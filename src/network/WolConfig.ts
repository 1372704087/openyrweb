/**
 * WolConfig — WoL 客户端类型 / SKU / 快速匹配频道配置。
 *
 * 由 network/WolConfig.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 导出常量：MATCH_BOT_NAME、MIN/MAX_USERNAME_LEN、MIN/MAX_PASS_LEN、
 *   MAX_MAP_TRANSFER_BYTES；以及 ClientType 枚举与 WolConfig 类。
 * - 模块级私有：GLOBAL_CHANNEL_PASS("zotclot9")，经 getGlobalChannelPass() 暴露。
 * - allClientSettings 为静态 Map：Cdral2 → { sku:16640, channelType:45, qmChanIds }。
 * - qmChanIds：Solo1v1→50、Team2v2→51（依赖 ladder/wladderConfig.LadderQueueType）。
 * - factory(clientType) 未配置时抛 Unhandled client type。
 * - skuToClientType 按 sku 反查，未命中返回 undefined。
 */

import { LadderQueueType } from "network/ladder/wladderConfig"; // 已转换

/** 快速匹配机器人昵称。 */
export const MATCH_BOT_NAME = "matchbot";
/** 用户名最小长度。 */
export const MIN_USERNAME_LEN = 2;
/** 用户名最大长度。 */
export const MAX_USERNAME_LEN = 15;
/** 密码最小长度。 */
export const MIN_PASS_LEN = 8;
/** 密码最大长度。 */
export const MAX_PASS_LEN = 128;
/** 地图传输字节上限（2 MiB）。 */
export const MAX_MAP_TRANSFER_BYTES = 2097152;

/** 模块级：全局频道密码（未单独导出，与孪生一致）。 */
const GLOBAL_CHANNEL_PASS = "zotclot9";

/** 客户端类型。 */
export enum ClientType {
  /** C&C 红警 2 / YR 客户端（Cdral2）。 */
  Cdral2 = 0,
}

/** 单客户端类型的静态配置。 */
export interface ClientSettings {
  /** 客户端 SKU（HTTP 路径与 cvers 用）。 */
  sku: number;
  /** 频道类型。 */
  channelType: number;
  /** 各排位队列对应的快速匹配频道 id。 */
  qmChanIds: Map<LadderQueueType, number>;
}

/** WoL 客户端配置实例。 */
export class WolConfig {
  /** 本实例客户端类型。 */
  clientType: ClientType;
  /** 对应静态配置。 */
  clientSettings: ClientSettings;

  /** 全部已配置客户端类型（静态表，与孪生初始化一致）。 */
  static allClientSettings = new Map<ClientType, ClientSettings>().set(ClientType.Cdral2, {
    sku: 16640,
    channelType: 45,
    qmChanIds: new Map<LadderQueueType, number>()
      .set(LadderQueueType.Solo1v1, 50)
      .set(LadderQueueType.Team2v2, 51),
  });

  /** 按 SKU 反查客户端类型（未命中返回 undefined）。 */
  static skuToClientType(sku: number): ClientType | undefined {
    return [...WolConfig.allClientSettings.entries()].find(([, settings]) => settings.sku === sku)?.[0];
  }

  /** 工厂：按客户端类型取配置并实例化；未配置则抛错。 */
  static factory(clientType: ClientType): WolConfig {
    const settings = WolConfig.allClientSettings.get(clientType);
    if (!settings) throw new Error(`Unhandled client type "${ClientType[clientType]}"`);
    return new this(clientType, settings);
  }

  constructor(clientType: ClientType, clientSettings: ClientSettings) {
    this.clientType = clientType;
    this.clientSettings = clientSettings;
  }

  /** 客户端 SKU。 */
  getClientSku(): number {
    return this.clientSettings.sku;
  }

  /** 频道类型。 */
  getClientChannelType(): number {
    return this.clientSettings.channelType;
  }

  /** 全局频道密码（模块级常量）。 */
  getGlobalChannelPass(): string {
    return GLOBAL_CHANNEL_PASS;
  }

  /** 快速匹配机器人昵称。 */
  getQuickMatchBotName(): string {
    return MATCH_BOT_NAME;
  }

  /** 全部快速匹配频道 id 列表。 */
  getAllQuickMatchChannelIds(): number[] {
    return [...this.clientSettings.qmChanIds.values()];
  }

  /** 指定排位队列的快速匹配频道 id；未配置则抛错。 */
  getQuickMatchChannelId(queueType: LadderQueueType): number {
    const id = this.clientSettings.qmChanIds.get(queueType);
    if (id === undefined)
      throw new Error(
        `Client type ${this.clientType} doesn't have a configured channel for ladder=` + queueType,
      );
    return id;
  }
}
