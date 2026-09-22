/**
 * TriggerEventType — 触发器事件（条件）类型枚举。
 *
 * 由 data/map/trigger/TriggerEventType.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 涵盖 RA2 原版 + Yuri's Revenge 扩展的所有事件类型；枚举值对应原版 INI
 * 地图文件中 [Events] 节的 EventType 数字 ID。TriggerConditionFactory
 * 按这些数值 switch 到对应条件类。
 *
 * 数值稳定性：与孪生枚举值逐值一致，勿重排或重编号。
 */
export enum TriggerEventType {
  // ========== RA2 原版事件类型 (0-57) ==========
  /** 0: 无事件(永不触发) */
  NoEvent = 0,
  /** 1: 被指定方进入 */
  EnteredBy = 1,
  /** 2: 被间谍渗透 */
  SpiedBy = 2,
  /** 3: 被窃取资金 */
  ThievedBy = 3,
  /** 4: 被玩家发现 */
  DiscoveredByPlayer = 4,
  /** 5: 阵营被发现 */
  HouseDiscovered = 5,
  /** 6: 被任意攻击 */
  AttackedByAny = 6,
  /** 7: 被任意摧毁 */
  DestroyedByAny = 7,
  /** 8: 任意事件(始终触发) */
  AnyEvent = 8,
  /** 9: 摧毁所有单位 */
  DestroyedAllUnits = 9,
  /** 10: 摧毁所有建筑 */
  DestroyedAllBuildings = 10,
  /** 11: 摧毁所有(单位+建筑) */
  DestroyedAll = 11,
  /** 12: 资金超过 */
  CreditsExceed = 12,
  /** 13: 经过时间 */
  ElapsedTime = 13,
  /** 14: 任务计时器到期 */
  MissionTimerExpired = 14,
  /** 15: 摧毁指定建筑数 */
  DestroyedBuildings = 15,
  /** 16: 摧毁指定单位数 */
  DestroyedUnits = 16,
  /** 17: 无工厂剩余 */
  NoFactoriesLeft = 17,
  /** 18: 平民撤离 */
  CiviliansEvacuated = 18,
  /** 19: 建造建筑 */
  BuildBuilding = 19,
  /** 20: 建造单位(车辆) */
  BuildUnit = 20,
  /** 21: 建造步兵 */
  BuildInfantry = 21,
  /** 22: 建造飞行器 */
  BuildAircraft = 22,
  /** 23: 队伍进入区域 */
  TeamInZone = 23,
  /** 24: 科技建筑被占领 */
  TechBuildingCaptured = 24,
  /** 25: 穿越水平线 */
  CrossesHorizontalLine = 25,
  /** 26: 穿越垂直线 */
  CrossesVerticalLine = 26,
  /** 27: 全局变量已设置 */
  GlobalIsSet = 27,
  /** 28: 全局变量已清除 */
  GlobalIsCleared = 28,
  /** 29: 被摧毁或占领 */
  DestroyedOrCaptured = 29,
  /** 30: 低电力 */
  LowPower = 30,
  /** 31: 桥梁被摧毁 */
  DestroyedBridge = 31,
  /** 32: 建筑存在 */
  BuildingExists = 32,
  /** 33: 被玩家选中 */
  SelectedByPlayer = 33,
  /** 34: 接近路径点 */
  ComesNearWaypoint = 34,
  /** 35: 敌人在区域内 */
  EnemyInZone = 35,
  /** 36: 局部变量已设置 */
  LocalIsSet = 36,
  /** 37: 局部变量已清除 */
  LocalIsCleared = 37,
  /** 38: 首次受伤(战斗单位) */
  FirstDamagedCombat = 38,
  /** 39: 半血(战斗单位) */
  HalfHealthCombat = 39,
  /** 40: 四分之一血(战斗单位) */
  QuarterHealthCombat = 40,
  /** 41: 首次受伤(任意) */
  FirstDamagedAny = 41,
  /** 42: 半血(任意) */
  HalfHealthAny = 42,
  /** 43: 四分之一血(任意) */
  QuarterHealthAny = 43,
  /** 44: 被指定阵营攻击 */
  AttackedByHouse = 44,
  /** 45: 环境光低于 */
  AmbientLightBelow = 45,
  /** 46: 环境光高于 */
  AmbientLightAbove = 46,
  /** 47: 场景经过时间 */
  ElapsedScenarioTime = 47,
  /** 48: 被摧毁/占领/渗透 */
  DestroyedOrCapturedOrInfiltrated = 48,
  /** 49: 拾取指定箱子 */
  PickupCrate = 49,
  /** 50: 拾取任意箱子 */
  PickupCrateAny = 50,
  /** 51: 随机延迟 */
  RandomDelay = 51,
  /** 52: 资金低于 */
  CreditsBelow = 52,
  /** 53: 间谍以阵营身份进入 */
  SpyEnteringAsHouse = 53,
  /** 54: 间谍以步兵身份进入 */
  SpyEnteringAsInfantry = 54,
  /** 55: 摧毁所有海军 */
  DestroyedAllUnitsNaval = 55,
  /** 56: 摧毁所有陆军 */
  DestroyedAllUnitsLand = 56,
  /** 57: 建筑不存在 */
  BuildingNotExists = 57,
}
