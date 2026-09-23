/**
 * WolGameTopic — 大厅游戏主题（topic）字段类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/gameopt/WolGameTopic.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 字段形状与 gameopt/Parser.parseTopic 返回对象一致（孪生 Parser.ts.js 逐字段构造）。
 */

/** 大厅游戏主题。 */
export interface WolGameTopic {
  /** 对局描述（已 Base64→utf16 解码，无则空串）。 */
  description: string;
  /** 模组哈希。 */
  modHash: number;
  /** 模组名（可选，已解码）。 */
  modName?: string;
  /** AI 玩家数。 */
  aiPlayers: number;
  /** 最大玩家数（topic 首字段第 3 字符的数值含义，孪生取 first[2]）。 */
  maxPlayers: number;
  /** 观察者数。 */
  observers: number;
  /** 是否可观察。 */
  observable: boolean;
  /** 地图文件名（经 FileNameEncoder 解码）。 */
  mapName: string;
}
