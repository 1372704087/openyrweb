/**
 * TriggerSupport — 触发器「已枚举但未实现」类型注册表。
 *
 * 记录已加入枚举、但引擎尚未实现真实逻辑的事件/动作类型：
 *   - 占位事件 → NoEventCondition（永不触发，安全默认，避免触发器开局误触发）
 *   - 占位动作 → NoActionExecutor（无操作）
 * 地图导入时依据本表，对仍使用未实现类型的触发器给出「不支持」提示，
 * 避免静默导入后任务目标全部失效而玩家毫无察觉。
 *
 * 由 data/map/trigger/TriggerSupport.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export const TriggerSupport = {
  /** 未实现的事件类型（占位 NoEventCondition，永不触发）。 */
  placeholderEventTypes: new Set([
    3, // ThievedBy: 被窃取资金（无资金窃取事件）
    4, // DiscoveredByPlayer: 被玩家发现（无逐玩家视野事件）
    5, // HouseDiscovered: 阵营被发现（同上）
    18, // CiviliansEvacuated: 平民撤离（无平民撤离判定）
    23, // TeamInZone: 队伍进入区域（无作战小队管理器）
    33, // SelectedByPlayer: 被玩家选中（无选择事件钩子）
  ]),
  /**
   * 未实现的动作类型（占位 NoActionExecutor，无操作）。
   * 所有已枚举动作现均有执行器（SuperWeaponFx/ShroudFx/UnloadAll/Sabotage/
   * ChangeLighting/Misc 等），故此表已清空；Misc 类动作在触发时打 debug 日志。
   */
  placeholderActionTypes: new Set([]),
};
