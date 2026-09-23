/**
 * PlayerData — 玩家只读快照（type-only）。
 *
 * 由 GameApi.getPlayerData(name) 返回：身份/出生点/AI 标记、资金、
 * 电力与雷达状态；startLocation 取 map.getStartingLocations() 下标。
 *
 * 由 game/api/interface/PlayerData.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出）；本文件仅以
 * export interface 声明类型，export {} 保持与孪生一致的零运行时导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
/** 玩家数据（type-only，运行时无导出对象）。 */
export interface PlayerData {
  /** 玩家名。 */
  name: any;
  /** 国家规则。 */
  country: any;
  /** 出生点 Vector2（按 startLocation 下标取）。 */
  startLocation: any;
  /** 是否观察者。 */
  isObserver: any;
  /** 是否 AI。 */
  isAi: any;
  /** 是否参战方。 */
  isCombatant: any;
  /** 资金。 */
  credits: any;
  /** 电力汇总。 */
  power: {
    /** 总发电（getDisplayPower）。 */
    total: any;
    /** 总耗电。 */
    drain: any;
    /** 是否低电。 */
    isLowPower: any;
  };
  /** 雷达是否被禁用。 */
  radarDisabled: any;
}

export {};
