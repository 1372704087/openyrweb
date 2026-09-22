/**
 * TriggerActionType — 触发器动作类型枚举。
 *
 * 由 data/map/trigger/TriggerActionType.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 涵盖 RA2 原版 + Yuri's Revenge 扩展的所有动作类型；枚举值对应原版 INI
 * 地图文件中 [Actions] 节的 ActionType 数字 ID。
 *
 * 数值稳定性：与孪生枚举值逐值一致，勿重排或重编号（tests/ts-parity.mjs
 * 会校验代表值与键数量）。
 *
 * 实现说明：孪生用双向赋值构建枚举对象；CreateTeam/DestroyTeam/PlayMovie
 * 在 RA2 段与 YR 段各出现一次——正向名称属性以最后一次赋值为准（YR 值），
 * 但较早的数字键反向映射仍保留。TypeScript enum 不允许重复成员名，故此处
 * 用与孪生同序的对象构建还原运行时键集合与双向映射。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/** 构建与孪生双向枚举一致的对象（name→value 与 value→name）。 */
function buildEnum(defs: ReadonlyArray<readonly [string, number]>): any {
  const e: any = {};
  for (const [name, value] of defs) {
    e[name] = value;
    e[value] = name;
  }
  return e;
}

export const TriggerActionType = buildEnum([
  // ========== RA2 原版动作类型 (0-73) ==========
  ["NoAction", 0], // 0: 无动作
  ["Win", 1], // 1: 胜利者是…
  ["Lose", 2], // 2: 失败者是…
  ["ProductionBegins", 3], // 3: 生产开始
  ["CreateTeam", 4], // 4: 建立小队
  ["DestroyTeam", 5], // 5: 摧毁小队
  ["AllToHunt", 6], // 6: 全部搜索
  ["CreateReinforcement", 7], // 7: 援军（小队）
  ["DropLZFlash", 8], // 8: 降落区闪动（路径点）
  ["FireSale", 9], // 9: 甩卖建筑
  ["PlayMovie", 10], // 10: 播放影片
  ["TextTrigger", 11], // 11: 显示文本
  ["DestroyTrigger", 12], // 12: 销毁触发器
  ["AutoCreate", 13], // 13: 自动生产开始
  ["ChangeHouse", 14], // 14: 更改所属方
  ["AllowWin", 15], // 15: 允许胜利
  ["RevealMap", 16], // 16: 揭示全图
  ["RevealAroundWaypoint", 17], // 17: 揭示路径点周围
  ["RevealAllUnits", 18], // 18: 显示路径点的单元区域
  ["PlaySoundFx", 19], // 19: 播放音效(全局)
  ["PlayMusic", 20], // 20: 播放音乐
  ["PlaySpeech", 21], // 21: 播放EVA语音
  ["ForceTrigger", 22], // 22: 强制触发
  ["TimerStart", 23], // 23: 启动计时器
  ["TimerStop", 24], // 24: 停止计时器
  ["TimerExtend", 25], // 25: 延长计时器
  ["TimerShorten", 26], // 26: 缩短计时器
  ["TimerSet", 27], // 27: 设置计时器
  ["GlobalSet", 28], // 28: 设置全局变量
  ["GlobalClear", 29], // 29: 清除全局变量
  ["BuildBase", 30], // 30: 自动建设基地
  ["ExtendShroud", 31], // 31: 逐单元延伸黑幕
  ["DestroyObject", 32], // 32: 销毁对象
  ["AddOneTimeSuperWeapon", 33], // 33: 添加一次性超武
  ["AddRepeatingSuperWeapon", 34], // 34: 添加重复超武
  ["AllChangeHouse", 36], // 36: 全部更改所属方
  ["Alliance", 37], // 37: 结盟
  ["Enemy", 38], // 38: 成为敌人
  ["ChangeViewLevel", 39], // 39: 更改视野等级
  ["ResizePlayerView", 40], // 40: 调整玩家视野
  ["PlayAnimAt", 41], // 41: 在位置播放动画
  ["DetonateWarhead", 42], // 42: 引爆弹头
  ["DisableUserInput", 46], // 46: 禁止用户输入
  ["EnableUserInput", 47], // 47: 允许用户输入
  ["MoveAndCenterView", 48], // 48: 移动并居中视野
  ["ZoomIn", 49], // 49: 放大视野
  ["ZoomOut", 50], // 50: 缩小视野
  ["ReshroudMap", 51], // 51: 重新迷雾
  ["ChangeLighting", 52], // 52: 更改照明状态
  ["EnableTrigger", 53], // 53: 启用触发器
  ["DisableTrigger", 54], // 54: 禁用触发器
  ["CreateRadarEvent", 55], // 55: 创建雷达事件
  ["LocalSet", 56], // 56: 设置局部变量
  ["LocalClear", 57], // 57: 清除局部变量
  ["MeteorStrike", 58], // 58: 流星雨在…
  ["SellBuilding", 60], // 60: 出售建筑
  ["TurnOffBuilding", 61], // 61: 关闭建筑电源
  ["TurnOnBuilding", 62], // 62: 开启建筑电源
  ["ApplyOneHundredDamage", 63], // 63: 造成100伤害
  ["FlashSmall", 64], // 64: 闪光（较小）
  ["FlashMedium", 65], // 65: 闪光（中等）
  ["FlashLarge", 66], // 66: 闪光（较大）
  ["DeclareWinning", 67], // 67: 宣告胜利
  ["DeclareLosing", 68], // 68: 宣告失败
  ["ForceEnd", 69], // 69: 强制结束游戏
  ["DestroyTag", 70], // 70: 销毁标签
  ["SetAmbientStep", 71], // 71: 设置环境光步进
  ["SetAmbientRate", 72], // 72: 设置环境光速率
  ["SetAmbientLight", 73], // 73: 设置环境光强度

  // ========== Yuri's Revenge 新增动作类型 (74-118) ==========
  // 这些动作类型在原版 RA2 中不存在，是 YR 资料片新增
  ["FlashTeam", 74], // 74: 雷达闪烁队伍
  ["ReinforceTeam", 75], // 75: 增援队伍(路径点)
  ["CreateTeam", 76], // 76: 创建队伍（覆盖正向名 CreateTeam → 76）
  ["DestroyTeam", 77], // 77: 销毁队伍（覆盖正向名 DestroyTeam → 77）
  ["GenericFacing", 78], // 78: 设置单位朝向
  ["GenericTimer", 79], // 79: 通用计时器
  ["DoShroud", 80], // 80: 制造迷雾(单元格)
  ["DoUnshroud", 81], // 81: 消除迷雾(单元格)
  ["PlayMovie", 82], // 82: 播放影片（覆盖正向名 PlayMovie → 82）
  ["TextNotification", 83], // 83: 文本通知
  ["ChronoWarp", 84], // 84: 超时空传送
  ["PlaySoundEffect", 85], // 85: 播放音效(全局-non-localized)
  ["UnloadAll", 86], // 86: 卸载所有运输工具
  ["SabotageUnit", 87], // 87: 破坏单位
  ["ChangeDifficulty", 88], // 88: 更改难度
  ["ChangeAlliance", 89], // 89: 更改联盟关系
  ["DisarmTrigger", 90], // 90: 解除触发器
  ["PlayBink", 91], // 91: 播放Bink视频
  ["ShowTutorial", 92], // 92: 显示教程
  ["ResetTutorial", 93], // 93: 重置教程
  ["EndTutorial", 94], // 94: 结束教程
  ["NukeStrike", 95], // 95: 核弹打击
  ["PreferredTarget", 96], // 96: 设置优先目标(YR)
  ["PlaySoundFxAt", 99], // 99: 在位置播放音效
  ["PlaySoundFxRandom", 100], // 100: 随机播放音效(RA2/YR)
  ["UnrevealAroundWaypoint", 101], // 101: 隐藏路径点周围
  ["LightningStrike", 102], // 102: 闪电风暴打击
  ["TimerText", 103], // 103: 计时器文本
  ["TimerPause", 104], // 104: 暂停计时器(YR)
  ["TimerResume", 105], // 105: 恢复计时器(YR)
  ["TimerShow", 106], // 106: 显示计时器(YR)
  ["TimerHide", 107], // 107: 隐藏计时器(YR)
  ["CreateCrate", 108], // 108: 创建箱子
  ["IronCurtainAt", 109], // 109: 铁幕效果
  ["EvictOccupiers", 111], // 111: 驱逐占领者
  ["ForceShieldAt", 112], // 112: 力场盾效果(YR)
  ["Cheer", 113], // 113: 欢呼
  ["ChronoshiftAt", 114], // 114: 超时空传送至位置(YR)
  ["ChronoWarpAt", 115], // 115: 时间扭曲至位置(YR)
  ["StopSoundsAt", 116], // 116: 停止位置音效
  ["PsychicRevealAt", 117], // 117: 心灵探测至位置(YR)
  ["GeneticMutatorAt", 118], // 118: 基因突变至位置(YR)

  // ========== YR 后续动作类型 (119-145) ==========
  // 参考临时源码 werhd.min.js 的 TriggerActionType 枚举（部分已由 DestroyAllExecutor 实现）
  ["DestroyAll", 119], // 119: 摧毁全部
  ["DestroyAllBuildings", 120], // 120: 摧毁全部建筑
  ["DestroyAllLandUnits", 121], // 121: 摧毁全部地面单位
  ["DestroyAllNavalUnits", 122], // 122: 摧毁全部海军单位
  ["MindControlBase", 123], // 123: 心灵控制基地
  ["RestoreMindControlledBase", 124], // 124: 恢复被心灵控制的基地
  ["CreateBuilding", 125], // 125: 创建建筑
  ["RestoreStartingUnits", 126], // 126: 恢复初始单位
  ["StartChronoScreenEffect", 127], // 127: 启动超时空屏幕效果
  ["TeleportAll", 128], // 128: 传送全部
  ["SetSuperWeaponCharge", 129], // 129: 设置超武充能
  ["RestoreStartingBuildings", 130], // 130: 恢复初始建筑
  ["FlashBuildingsOfType", 131], // 131: 闪烁指定类型建筑
  ["SuperWeaponSetRechargeTime", 132], // 132: 设置超武冷却时间
  ["SuperWeaponResetRechargeTime", 133], // 133: 重置超武冷却时间
  ["SuperWeaponReset", 134], // 134: 重置超武
  ["SetPreferredTargetCell", 135], // 135: 设置优先目标格
  ["ClearPreferredTargetCell", 136], // 136: 清除优先目标格
  ["SetBaseCenterCell", 137], // 137: 设置基地中心格
  ["ClearBaseCenterCell", 138], // 138: 清除基地中心格
  ["BlackoutRadar", 139], // 139: 雷达黑屏
  ["SetDefensiveTargetCell", 140], // 140: 设置防御目标格
  ["ClearDefensiveTargetCell", 141], // 141: 清除防御目标格
  ["RetintRed", 142], // 142: 红色滤镜
  ["RetintGreen", 143], // 143: 绿色滤镜
  ["RetintBlue", 144], // 144: 蓝色滤镜
  ["JumpCameraHome", 145], // 145: 镜头回基地
]);

/** 动作类型正/反向映射的常用成员（便于 TS 点访问）。 */
export type TriggerActionTypeMembers = {
  NoAction: number;
  Win: number;
  Lose: number;
  CreateTeam: number;
  DestroyTeam: number;
  PlayMovie: number;
  TextTrigger: number;
  DestroyTag: number;
  DisarmTrigger: number;
  GenericFacing: number;
  DoUnshroud: number;
  UnloadAll: number;
  PlaySoundFxAt: number;
  PlaySoundFxRandom: number;
  LightningStrike: number;
  PlayAnimAt: number;
  ReshroudMap: number;
  ResizePlayerView: number;
  TextTriggerYR: never;
  TimerSet: number;
  TimerStop: number;
  TurnOnBuilding: number;
  TurnOffBuilding: number;
  DeclareWinning: number;
  DeclareLosing: number;
  CreateBuilding: number;
  CreateCrate: number;
  BlackoutRadar: number;
  [key: string]: any;
};
