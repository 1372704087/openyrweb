/**
 * wladderConfig — 天梯队列/天梯类型枚举、赛季常量与互转函数。
 *
 * 由 network/ladder/wladderConfig.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 关键语义（勿改）：字符串枚举值、season 常量、teamSizes 映射、以及
 * queue↔ladder 互转的 switch 分支与 throw 消息与孪生逐项一致。
 */

/** 当前赛季查询别名。 */
export const CURRENT_SEASON = "current";

/** 上一赛季查询别名。 */
export const PREV_SEASON = "prev";

/** 列表搜索最大条数。 */
export const MAX_LIST_SEARCH_COUNT = 50;

/** 天梯类型（进度条/rung 维度）。 */
export enum LadderType {
  /** 单挑 1v1 天梯。 */
  Solo1v1 = "1v1",
  /** 随机组队 2v2 天梯。 */
  Random2v2 = "2v2-random",
}

/** 天梯队列类型（匹配队列维度）。 */
export enum LadderQueueType {
  /** 单挑 1v1 队列。 */
  Solo1v1 = "1v1",
  /** 组队 2v2 队列。 */
  Team2v2 = "2v2",
}

/** 各队列类型的每队人数。 */
export const teamSizes: Map<LadderQueueType, number> = new Map([
  [LadderQueueType.Solo1v1, 1],
  [LadderQueueType.Team2v2, 2],
]);

/**
 * 队列类型 → 天梯类型。
 * @param queueType 队列类型
 * @returns 对应天梯类型
 * @throws 未处理的队列类型时抛 Error（消息与孪生一致）
 */
export function getLadderTypeForQueueType(
  queueType: LadderQueueType,
  _partySize?: any,
): LadderType {
  switch (queueType) {
    case LadderQueueType.Solo1v1:
      return LadderType.Solo1v1;
    case LadderQueueType.Team2v2:
      return LadderType.Random2v2;
    default:
      throw new Error(`Unhandled queue type "${queueType}"`);
  }
}

/**
 * 天梯类型 → 队列类型。
 * @param ladderType 天梯类型
 * @returns 对应队列类型
 * @throws 未处理的天梯类型时抛 Error（消息与孪生一致）
 */
export function getQueueTypeForLadderType(ladderType: LadderType): LadderQueueType {
  switch (ladderType) {
    case LadderType.Solo1v1:
      return LadderQueueType.Solo1v1;
    case LadderType.Random2v2:
      return LadderQueueType.Team2v2;
    default:
      throw new Error(`Unhandled ladder type "${ladderType}"`);
  }
}
