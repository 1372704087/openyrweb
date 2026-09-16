/**
 * ExtensionHooks — 扩展可挂接的引擎钩子点定义（对应 YRpp 的 detour 点）。
 *
 * 每个钩子是一次引擎主动调用扩展的机会；扩展在 ExtensionDefinition.hooks
 * 里声明处理函数，ExtensionHost 按优先级顺序派发。
 *
 * 钩子分两类：
 *  - 数据钩子（applyToRules）：init 期一次性，改写 rules INI；
 *  - 运行时钩子（matchStart/onTick/objectSpawn/…）：对局期间按事件触发。
 *
 * 每个钩子收到 `ExtensionHookContext & XxxPayload`：
 *  - ExtensionHookContext 提供 isFeatureEnabled / ini（命名空间写入器）等辅助；
 *  - XxxPayload 提供该钩子特有的业务字段（game / object / unit / …）。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExtensionHookContext } from "extensions/ExtensionContext";

/** 对局开始：Game 构造完成后、第一帧 update 前。 */
export interface MatchStartPayload {
  game: any;
  rulesIni: any;
}

/** 对局结束：Game.end() 触发。 */
export interface MatchEndPayload {
  game: any;
}

/** 每逻辑 tick。注意热路径——只在有扩展声明了 onTick 时才派发。 */
export interface TickPayload {
  game: any;
  tick: number;
}

/** 对象加入世界（spawnObject 成功后）。 */
export interface ObjectSpawnPayload {
  game: any;
  object: any;
}

/** 对象移出世界（removeObject / destroy）。 */
export interface ObjectRemovePayload {
  game: any;
  object: any;
}

/** 工厂产出单位。 */
export interface UnitProducePayload {
  game: any;
  unit: any;
}

/** 弹头引爆。 */
export interface WarheadDetonatePayload {
  game: any;
  warhead: any;
  target?: any;
  techno?: any;
}

/** 全部运行时钩子的处理函数签名集合。 */
export interface ExtensionRuntimeHooks {
  /** 对局开始。 */
  onMatchStart?(ctx: ExtensionHookContext & MatchStartPayload): void;
  /** 对局结束。 */
  onMatchEnd?(ctx: ExtensionHookContext & MatchEndPayload): void;
  /** 每逻辑 tick（热路径，务必轻量）。 */
  onTick?(ctx: ExtensionHookContext & TickPayload): void;
  /** 对象生成。 */
  onObjectSpawn?(ctx: ExtensionHookContext & ObjectSpawnPayload): void;
  /** 对象移除。 */
  onObjectRemove?(ctx: ExtensionHookContext & ObjectRemovePayload): void;
  /** 单位出厂。 */
  onUnitProduce?(ctx: ExtensionHookContext & UnitProducePayload): void;
  /** 弹头引爆。 */
  onWarheadDetonate?(ctx: ExtensionHookContext & WarheadDetonatePayload): void;
}

/** 钩子名列表（派发侧遍历用）。 */
export const RUNTIME_HOOK_NAMES = [
  "onMatchStart",
  "onMatchEnd",
  "onTick",
  "onObjectSpawn",
  "onObjectRemove",
  "onUnitProduce",
  "onWarheadDetonate",
] as const;

export type RuntimeHookName = (typeof RUNTIME_HOOK_NAMES)[number];
