/**
 * GameResGameInfo — 战报（GameRes）对局摘要类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/gameres/GameResGameInfo.ts.js 重写为 TS。孪生为 SystemJS
 * 空 execute，说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 字段形状与 gameres/GameRes.fromGame 写入的 this.game 对象一致
 * （孪生 GameRes.ts.js 中逐字段构造）。
 */

/** 对局摘要（战报 game 段）。 */
export interface GameResGameInfo {
  /** 对局 id。 */
  id: string;
  /** 开始时间戳（ms，协议原样）。 */
  startTime: number;
  /** 对局时长（秒）。 */
  duration: number;
  /** 速度档（与 gameSpeed 反转后的值）。 */
  speed: number;
  /** 人类玩家数。 */
  players: number;
  /** 地图名。 */
  mapName: string;
  /** 地图摘要。 */
  mapDigest: string;
  /** 单位数量设置。 */
  unitCount: number;
  /** 是否出现箱子。 */
  cratesAppear: boolean;
  /** 初始资金。 */
  credits: number;
  /** 是否锦标赛。 */
  tournament: boolean;
  /** 是否短局。 */
  shortGame: boolean;
  /** 是否允许超级武器。 */
  superWeapons: boolean;
  /** AI 玩家数。 */
  aiPlayers: number;
  /** 游戏模式。 */
  gameMode: number;
  /** 是否可从盟友处建造。 */
  buildOffAlly: boolean;
  /** MCV 是否可重新打包。 */
  mcvRepacks: boolean;
  /** 是否有可摧毁桥梁。 */
  destroyableBridges: boolean;
  /** 是否多工程师。 */
  multiEngineer: boolean;
  /** 狗是否不能杀工程师。 */
  noDogEngiKills: boolean;
  /** 是否即时占领。 */
  instantCapture: boolean;
  /** 是否延迟油井。 */
  delayedOils: boolean;
}
