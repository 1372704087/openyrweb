// === 触发动作类型枚举 (TriggerActionType) ===
// 涵盖 RA2 原版 + Yuri's Revenge 扩展的所有动作类型
// 枚举值对应原版 INI 地图文件中 [Actions] 节的 ActionType 数字 ID
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/map/trigger/TriggerActionType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("TriggerActionType", (i = {})))[
        // ========== RA2 原版动作类型 (0-73) ==========
        (e.NoAction = 0)] = "NoAction"),                     // 0: 无动作
        (e[(e.Win = 1)] = "Win"),                            // 1: 胜利者是…
        (e[(e.Lose = 2)] = "Lose"),                          // 2: 失败者是…
        (e[(e.ProductionBegins = 3)] = "ProductionBegins"),  // 3: 生产开始
        (e[(e.CreateTeam = 4)] = "CreateTeam"),              // 4: 建立小队
        (e[(e.DestroyTeam = 5)] = "DestroyTeam"),            // 5: 摧毁小队
        (e[(e.AllToHunt = 6)] = "AllToHunt"),                // 6: 全部搜索
        (e[(e.CreateReinforcement = 7)] = "CreateReinforcement"), // 7: 援军（小队）
        (e[(e.DropLZFlash = 8)] = "DropLZFlash"),            // 8: 降落区闪动（路径点）
        (e[(e.FireSale = 9)] = "FireSale"),                 // 9: 甩卖建筑
        (e[(e.PlayMovie = 10)] = "PlayMovie"),               // 10: 播放影片
        (e[(e.TextTrigger = 11)] = "TextTrigger"),          // 11: 显示文本
        (e[(e.DestroyTrigger = 12)] = "DestroyTrigger"),    // 12: 销毁触发器
        (e[(e.AutoCreate = 13)] = "AutoCreate"),             // 13: 自动生产开始
        (e[(e.ChangeHouse = 14)] = "ChangeHouse"),          // 14: 更改所属方
        (e[(e.AllowWin = 15)] = "AllowWin"),                 // 15: 允许胜利
        (e[(e.RevealMap = 16)] = "RevealMap"),              // 16: 揭示全图
        (e[(e.RevealAroundWaypoint = 17)] = "RevealAroundWaypoint"), // 17: 揭示路径点周围
        (e[(e.RevealAllUnits = 18)] = "RevealAllUnits"),     // 18: 显示路径点的单元区域
        (e[(e.PlaySoundFx = 19)] = "PlaySoundFx"),          // 19: 播放音效(全局)
        (e[(e.PlayMusic = 20)] = "PlayMusic"),               // 20: 播放音乐
        (e[(e.PlaySpeech = 21)] = "PlaySpeech"),            // 21: 播放EVA语音
        (e[(e.ForceTrigger = 22)] = "ForceTrigger"),        // 22: 强制触发
        (e[(e.TimerStart = 23)] = "TimerStart"),            // 23: 启动计时器
        (e[(e.TimerStop = 24)] = "TimerStop"),              // 24: 停止计时器
        (e[(e.TimerExtend = 25)] = "TimerExtend"),          // 25: 延长计时器
        (e[(e.TimerShorten = 26)] = "TimerShorten"),        // 26: 缩短计时器
        (e[(e.TimerSet = 27)] = "TimerSet"),                // 27: 设置计时器
        (e[(e.GlobalSet = 28)] = "GlobalSet"),              // 28: 设置全局变量
        (e[(e.GlobalClear = 29)] = "GlobalClear"),           // 29: 清除全局变量
        (e[(e.BuildBase = 30)] = "BuildBase"),               // 30: 自动建设基地
        (e[(e.ExtendShroud = 31)] = "ExtendShroud"),         // 31: 逐单元延伸黑幕
        (e[(e.DestroyObject = 32)] = "DestroyObject"),      // 32: 销毁对象
        (e[(e.AddOneTimeSuperWeapon = 33)] = "AddOneTimeSuperWeapon"),   // 33: 添加一次性超武
        (e[(e.AddRepeatingSuperWeapon = 34)] = "AddRepeatingSuperWeapon"), // 34: 添加重复超武
        (e[(e.AllChangeHouse = 36)] = "AllChangeHouse"),    // 36: 全部更改所属方
        (e[(e.Alliance = 37)] = "Alliance"),                 // 37: 结盟
        (e[(e.Enemy = 38)] = "Enemy"),                       // 38: 成为敌人
        (e[(e.ChangeViewLevel = 39)] = "ChangeViewLevel"),   // 39: 更改视野等级
        (e[(e.ResizePlayerView = 40)] = "ResizePlayerView"), // 40: 调整玩家视野
        (e[(e.PlayAnimAt = 41)] = "PlayAnimAt"),            // 41: 在位置播放动画
        (e[(e.DetonateWarhead = 42)] = "DetonateWarhead"),  // 42: 引爆弹头
        (e[(e.DisableUserInput = 46)] = "DisableUserInput"), // 46: 禁止用户输入
        (e[(e.EnableUserInput = 47)] = "EnableUserInput"),   // 47: 允许用户输入
        (e[(e.MoveAndCenterView = 48)] = "MoveAndCenterView"), // 48: 移动并居中视野
        (e[(e.ZoomIn = 49)] = "ZoomIn"),                     // 49: 放大视野
        (e[(e.ZoomOut = 50)] = "ZoomOut"),                   // 50: 缩小视野
        (e[(e.ReshroudMap = 51)] = "ReshroudMap"),          // 51: 重新迷雾
        (e[(e.ChangeLighting = 52)] = "ChangeLighting"),     // 52: 更改照明状态
        (e[(e.EnableTrigger = 53)] = "EnableTrigger"),      // 53: 启用触发器
        (e[(e.DisableTrigger = 54)] = "DisableTrigger"),    // 54: 禁用触发器
        (e[(e.CreateRadarEvent = 55)] = "CreateRadarEvent"), // 55: 创建雷达事件
        (e[(e.LocalSet = 56)] = "LocalSet"),                // 56: 设置局部变量
        (e[(e.LocalClear = 57)] = "LocalClear"),             // 57: 清除局部变量
        (e[(e.MeteorStrike = 58)] = "MeteorStrike"),         // 58: 流星雨在…
        (e[(e.SellBuilding = 60)] = "SellBuilding"),        // 60: 出售建筑
        (e[(e.TurnOffBuilding = 61)] = "TurnOffBuilding"),  // 61: 关闭建筑电源
        (e[(e.TurnOnBuilding = 62)] = "TurnOnBuilding"),    // 62: 开启建筑电源
        (e[(e.ApplyOneHundredDamage = 63)] = "ApplyOneHundredDamage"), // 63: 造成100伤害
        (e[(e.FlashSmall = 64)] = "FlashSmall"),             // 64: 闪光（较小）
        (e[(e.FlashMedium = 65)] = "FlashMedium"),           // 65: 闪光（中等）
        (e[(e.FlashLarge = 66)] = "FlashLarge"),             // 66: 闪光（较大）
        (e[(e.DeclareWinning = 67)] = "DeclareWinning"),     // 67: 宣告胜利
        (e[(e.DeclareLosing = 68)] = "DeclareLosing"),       // 68: 宣告失败
        (e[(e.ForceEnd = 69)] = "ForceEnd"),                // 69: 强制结束游戏
        (e[(e.DestroyTag = 70)] = "DestroyTag"),            // 70: 销毁标签
        (e[(e.SetAmbientStep = 71)] = "SetAmbientStep"),    // 71: 设置环境光步进
        (e[(e.SetAmbientRate = 72)] = "SetAmbientRate"),    // 72: 设置环境光速率
        (e[(e.SetAmbientLight = 73)] = "SetAmbientLight"),  // 73: 设置环境光强度

        // ========== Yuri's Revenge 新增动作类型 (74-118) ==========
        // 这些动作类型在原版 RA2 中不存在，是 YR 资料片新增
        (e[(e.FlashTeam = 74)] = "FlashTeam"),                  // 74: 雷达闪烁队伍
        (e[(e.ReinforceTeam = 75)] = "ReinforceTeam"),          // 75: 增援队伍(路径点)
        (e[(e.CreateTeam = 76)] = "CreateTeam"),                // 76: 创建队伍
        (e[(e.DestroyTeam = 77)] = "DestroyTeam"),              // 77: 销毁队伍
        (e[(e.GenericFacing = 78)] = "GenericFacing"),          // 78: 设置单位朝向
        (e[(e.GenericTimer = 79)] = "GenericTimer"),            // 79: 通用计时器
        (e[(e.DoShroud = 80)] = "DoShroud"),                    // 80: 制造迷雾(单元格)
        (e[(e.DoUnshroud = 81)] = "DoUnshroud"),                // 81: 消除迷雾(单元格)
        (e[(e.PlayMovie = 82)] = "PlayMovie"),                  // 82: 播放影片
        (e[(e.TextNotification = 83)] = "TextNotification"),    // 83: 文本通知
        (e[(e.ChronoWarp = 84)] = "ChronoWarp"),                // 84: 超时空传送
        (e[(e.PlaySoundEffect = 85)] = "PlaySoundEffect"),      // 85: 播放音效(全局-non-localized)
        (e[(e.UnloadAll = 86)] = "UnloadAll"),                  // 86: 卸载所有运输工具
        (e[(e.SabotageUnit = 87)] = "SabotageUnit"),            // 87: 破坏单位
        (e[(e.ChangeDifficulty = 88)] = "ChangeDifficulty"),    // 88: 更改难度
        (e[(e.ChangeAlliance = 89)] = "ChangeAlliance"),        // 89: 更改联盟关系
        (e[(e.DisarmTrigger = 90)] = "DisarmTrigger"),          // 90: 解除触发器
        (e[(e.PlayBink = 91)] = "PlayBink"),                    // 91: 播放Bink视频
        (e[(e.ShowTutorial = 92)] = "ShowTutorial"),            // 92: 显示教程
        (e[(e.ResetTutorial = 93)] = "ResetTutorial"),          // 93: 重置教程
        (e[(e.EndTutorial = 94)] = "EndTutorial"),              // 94: 结束教程
        (e[(e.NukeStrike = 95)] = "NukeStrike"),                // 95: 核弹打击
        (e[(e.PreferredTarget = 96)] = "PreferredTarget"),      // 96: 设置优先目标(YR)
        (e[(e.PlaySoundFxAt = 99)] = "PlaySoundFxAt"),          // 99: 在位置播放音效
        (e[(e.PlaySoundFxRandom = 100)] = "PlaySoundFxRandom"), // 100: 随机播放音效(RA2/YR)
        (e[(e.UnrevealAroundWaypoint = 101)] = "UnrevealAroundWaypoint"), // 101: 隐藏路径点周围
        (e[(e.LightningStrike = 102)] = "LightningStrike"),     // 102: 闪电风暴打击
        (e[(e.TimerText = 103)] = "TimerText"),                  // 103: 计时器文本
        (e[(e.TimerPause = 104)] = "TimerPause"),                // 104: 暂停计时器(YR)
        (e[(e.TimerResume = 105)] = "TimerResume"),              // 105: 恢复计时器(YR)
        (e[(e.TimerShow = 106)] = "TimerShow"),                  // 106: 显示计时器(YR)
        (e[(e.TimerHide = 107)] = "TimerHide"),                  // 107: 隐藏计时器(YR)
        (e[(e.CreateCrate = 108)] = "CreateCrate"),              // 108: 创建箱子
        (e[(e.IronCurtainAt = 109)] = "IronCurtainAt"),          // 109: 铁幕效果
        (e[(e.EvictOccupiers = 111)] = "EvictOccupiers"),        // 111: 驱逐占领者
        (e[(e.ForceShieldAt = 112)] = "ForceShieldAt"),          // 112: 力场盾效果(YR)
        (e[(e.Cheer = 113)] = "Cheer"),                          // 113: 欢呼
        (e[(e.ChronoshiftAt = 114)] = "ChronoshiftAt"),          // 114: 超时空传送至位置(YR)
        (e[(e.ChronoWarpAt = 115)] = "ChronoWarpAt"),            // 115: 时间扭曲至位置(YR)
        (e[(e.StopSoundsAt = 116)] = "StopSoundsAt"),            // 116: 停止位置音效
        (e[(e.PsychicRevealAt = 117)] = "PsychicRevealAt"),      // 117: 心灵探测至位置(YR)
        (e[(e.GeneticMutatorAt = 118)] = "GeneticMutatorAt"),    // 118: 基因突变至位置(YR)

        // ========== YR 后续动作类型 (119-145) ==========
        // 参考临时源码 werhd.min.js 的 TriggerActionType 枚举（部分已由 DestroyAllExecutor 实现）
        (e[(e.DestroyAll = 119)] = "DestroyAll"),                          // 119: 摧毁全部
        (e[(e.DestroyAllBuildings = 120)] = "DestroyAllBuildings"),        // 120: 摧毁全部建筑
        (e[(e.DestroyAllLandUnits = 121)] = "DestroyAllLandUnits"),        // 121: 摧毁全部地面单位
        (e[(e.DestroyAllNavalUnits = 122)] = "DestroyAllNavalUnits"),      // 122: 摧毁全部海军单位
        (e[(e.MindControlBase = 123)] = "MindControlBase"),                // 123: 心灵控制基地
        (e[(e.RestoreMindControlledBase = 124)] = "RestoreMindControlledBase"), // 124: 恢复被心灵控制的基地
        (e[(e.CreateBuilding = 125)] = "CreateBuilding"),                  // 125: 创建建筑
        (e[(e.RestoreStartingUnits = 126)] = "RestoreStartingUnits"),      // 126: 恢复初始单位
        (e[(e.StartChronoScreenEffect = 127)] = "StartChronoScreenEffect"), // 127: 启动超时空屏幕效果
        (e[(e.TeleportAll = 128)] = "TeleportAll"),                        // 128: 传送全部
        (e[(e.SetSuperWeaponCharge = 129)] = "SetSuperWeaponCharge"),      // 129: 设置超武充能
        (e[(e.RestoreStartingBuildings = 130)] = "RestoreStartingBuildings"), // 130: 恢复初始建筑
        (e[(e.FlashBuildingsOfType = 131)] = "FlashBuildingsOfType"),      // 131: 闪烁指定类型建筑
        (e[(e.SuperWeaponSetRechargeTime = 132)] = "SuperWeaponSetRechargeTime"), // 132: 设置超武冷却时间
        (e[(e.SuperWeaponResetRechargeTime = 133)] = "SuperWeaponResetRechargeTime"), // 133: 重置超武冷却时间
        (e[(e.SuperWeaponReset = 134)] = "SuperWeaponReset"),              // 134: 重置超武
        (e[(e.SetPreferredTargetCell = 135)] = "SetPreferredTargetCell"),  // 135: 设置优先目标格
        (e[(e.ClearPreferredTargetCell = 136)] = "ClearPreferredTargetCell"), // 136: 清除优先目标格
        (e[(e.SetBaseCenterCell = 137)] = "SetBaseCenterCell"),            // 137: 设置基地中心格
        (e[(e.ClearBaseCenterCell = 138)] = "ClearBaseCenterCell"),        // 138: 清除基地中心格
        (e[(e.BlackoutRadar = 139)] = "BlackoutRadar"),                    // 139: 雷达黑屏
        (e[(e.SetDefensiveTargetCell = 140)] = "SetDefensiveTargetCell"),  // 140: 设置防御目标格
        (e[(e.ClearDefensiveTargetCell = 141)] = "ClearDefensiveTargetCell"), // 141: 清除防御目标格
        (e[(e.RetintRed = 142)] = "RetintRed"),                            // 142: 红色滤镜
        (e[(e.RetintGreen = 143)] = "RetintGreen"),                        // 143: 绿色滤镜
        (e[(e.RetintBlue = 144)] = "RetintBlue"),                          // 144: 蓝色滤镜
        (e[(e.JumpCameraHome = 145)] = "JumpCameraHome"));                 // 145: 镜头回基地
    },
  };
});
