// === OpenYRWeb: 触发器"未实现"类型注册表 (TriggerSupport) ===
// 记录已加入枚举、但引擎尚未实现真实逻辑的事件/动作类型。
//   - 占位事件 -> NoEventCondition（永不触发，安全默认，避免触发器开局误触发）
//   - 占位动作 -> NoActionExecutor（无操作）
// 地图导入时依据本表，对仍使用未实现类型的触发器给出"不受支持"提示，
// 避免静默导入后任务目标全部失效而玩家毫无察觉。
// deps: []

System.register("data/map/trigger/TriggerSupport", [], function (t, e) {
  "use strict";
  return {
    setters: [],
    execute: function () {
      t("TriggerSupport", {
        // 未实现的事件类型（占位 NoEventCondition，永不触发）
        placeholderEventTypes: new Set([
          3, // ThievedBy: 被窃取资金（无资金窃取事件）
          4, // DiscoveredByPlayer: 被玩家发现（无逐玩家视野事件）
          5, // HouseDiscovered: 阵营被发现（同上）
          18, // CiviliansEvacuated: 平民撤离（无平民撤离判定）
          23, // TeamInZone: 队伍进入区域（无作战小队管理器）
          33, // SelectedByPlayer: 被玩家选中（无选择事件钩子）
        ]),
        // 未实现的动作类型（占位 NoActionExecutor，无操作）
        placeholderActionTypes: new Set([
          74, // FlashTeam: 雷达闪烁队伍（无队伍管理器，需团队位置）
          75, // ReinforceTeam: 增援队伍（需作战小队/路径系统）
          76, // CreateTeam: 创建队伍（需作战小队管理器）
          77, // DestroyTeam: 销毁队伍（同上）
          78, // GenericFacing: 设置朝向（需队伍上下文）
          79, // GenericTimer: 通用计时器
          82, // PlayMovie: 播放影片
          84, // ChronoWarp: 超时空传送
          86, // UnloadAll: 卸载所有运输工具（需逐单位卸载调度）
          87, // SabotageUnit: 破坏单位
          88, // ChangeDifficulty: 更改难度
          91, // PlayBink: 播放 Bink 视频
          92, // ShowTutorial: 显示教程
          93, // ResetTutorial: 重置教程
          94, // EndTutorial: 结束教程
          96, // PreferredTarget: 设置优先目标（需 AI 目标系统）
          106, // TimerShow: 显示计时器（无可见性标志）
          107, // TimerHide: 隐藏计时器（同上）
          114, // ChronoshiftAt: 超时空传送至位置
          115, // ChronoWarpAt: 时间扭曲至位置
          117, // PsychicRevealAt: 心灵探测至位置
          118, // GeneticMutatorAt: 基因突变至位置
        ]),
      });
    },
  };
});
