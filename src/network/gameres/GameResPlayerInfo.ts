/**
 * GameResPlayerInfo — 战报（GameRes）单名玩家统计类型。
 *
 * 由 network/gameres/GameResPlayerInfo.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 孪生导出的是空 class（class {}），运行时可 new，无字段/方法。
 * - 实际字段在 GameRes.fromGame 中以对象字面量写入 this.players（结构类型兼容）。
 * - 此处把 fromGame 写入的字段补到类上作为类型标注，保持空类实例化语义。
 */

/** 战报中单名玩家的统计字段（由 GameRes.fromGame 填充）。 */
export class GameResPlayerInfo {
  /** 建造建筑数。 */
  buildingsBuilt?: number;
  /** 俘获建筑数。 */
  buildingsCaptured?: number;
  /** 摧毁建筑数。 */
  buildingsKilled?: number;
  /** 剩余建筑数。 */
  buildingsLeft?: number;
  /** 颜色序号（协议原样，2*index+1）。 */
  color?: number;
  /** 拾取箱子数。 */
  cratesFound?: number;
  /** 结束时资金。 */
  endCredits?: number;
  /** 资金增益。 */
  creditsGained?: number;
  /** 建造步兵数。 */
  infantryBuilt?: number;
  /** 歼灭步兵数。 */
  infantryKilled?: number;
  /** 剩余步兵数。 */
  infantryLeft?: number;
  /** 是否因断线丢失连接。 */
  lostConnection?: boolean;
  /** 玩家名。 */
  name?: string;
  /** 建造飞机数。 */
  planesBuilt?: number;
  /** 摧毁飞机数。 */
  planesKilled?: number;
  /** 剩余飞机数。 */
  planesLeft?: number;
  /** 建造车辆数。 */
  unitsBuilt?: number;
  /** 摧毁车辆数。 */
  unitsKilled?: number;
  /** 剩余车辆数。 */
  unitsLeft?: number;
  /** 完成状态（战报 completionStatus 字段）。 */
  completionStatus?: unknown;
  /** 国家 id。 */
  country?: number;
  /** 阵营（side）。 */
  side?: unknown;
  /** 队伍 id。 */
  team?: number;
  /** 出生点序号。 */
  startPos?: number;
}
