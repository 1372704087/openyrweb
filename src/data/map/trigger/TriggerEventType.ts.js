// === OpenYRWeb: 触发事件类型枚举 (TriggerEventType) ===
// 涵盖 RA2 原版 + Yuri's Revenge 扩展的所有事件类型
// 枚举值对应原版 INI 地图文件中 [Events] 节的 EventType 数字 ID
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/map/trigger/TriggerEventType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("TriggerEventType", (i = {})))[
        // ========== RA2 原版事件类型 (0-57) ==========
        (e.NoEvent = 0)] = "NoEvent"),                         // 0: 无事件(永不触发)
        (e[(e.EnteredBy = 1)] = "EnteredBy"),                 // 1: 被指定方进入
        (e[(e.SpiedBy = 2)] = "SpiedBy"),                     // 2: 被间谍渗透
        (e[(e.ThievedBy = 3)] = "ThievedBy"),                  // 3: 被窃取资金
        (e[(e.DiscoveredByPlayer = 4)] = "DiscoveredByPlayer"), // 4: 被玩家发现
        (e[(e.HouseDiscovered = 5)] = "HouseDiscovered"),      // 5: 阵营被发现
        (e[(e.AttackedByAny = 6)] = "AttackedByAny"),         // 6: 被任意攻击
        (e[(e.DestroyedByAny = 7)] = "DestroyedByAny"),       // 7: 被任意摧毁
        (e[(e.AnyEvent = 8)] = "AnyEvent"),                   // 8: 任意事件(始终触发)
        (e[(e.DestroyedAllUnits = 9)] = "DestroyedAllUnits"), // 9: 摧毁所有单位
        (e[(e.DestroyedAllBuildings = 10)] = "DestroyedAllBuildings"), // 10: 摧毁所有建筑
        (e[(e.DestroyedAll = 11)] = "DestroyedAll"),          // 11: 摧毁所有(单位+建筑)
        (e[(e.CreditsExceed = 12)] = "CreditsExceed"),        // 12: 资金超过
        (e[(e.ElapsedTime = 13)] = "ElapsedTime"),            // 13: 经过时间
        (e[(e.MissionTimerExpired = 14)] = "MissionTimerExpired"), // 14: 任务计时器到期
        (e[(e.DestroyedBuildings = 15)] = "DestroyedBuildings"), // 15: 摧毁指定建筑数
        (e[(e.DestroyedUnits = 16)] = "DestroyedUnits"),      // 16: 摧毁指定单位数
        (e[(e.NoFactoriesLeft = 17)] = "NoFactoriesLeft"),    // 17: 无工厂剩余
        (e[(e.CiviliansEvacuated = 18)] = "CiviliansEvacuated"), // 18: 平民撤离
        (e[(e.BuildBuilding = 19)] = "BuildBuilding"),        // 19: 建造建筑
        (e[(e.BuildUnit = 20)] = "BuildUnit"),                // 20: 建造单位(车辆)
        (e[(e.BuildInfantry = 21)] = "BuildInfantry"),        // 21: 建造步兵
        (e[(e.BuildAircraft = 22)] = "BuildAircraft"),        // 22: 建造飞行器
        (e[(e.TeamInZone = 23)] = "TeamInZone"),               // 23: 队伍进入区域
        (e[(e.TechBuildingCaptured = 24)] = "TechBuildingCaptured"), // 24: 科技建筑被占领
        (e[(e.CrossesHorizontalLine = 25)] = "CrossesHorizontalLine"), // 25: 穿越水平线
        (e[(e.CrossesVerticalLine = 26)] = "CrossesVerticalLine"), // 26: 穿越垂直线
        (e[(e.GlobalIsSet = 27)] = "GlobalIsSet"),            // 27: 全局变量已设置
        (e[(e.GlobalIsCleared = 28)] = "GlobalIsCleared"),    // 28: 全局变量已清除
        (e[(e.DestroyedOrCaptured = 29)] = "DestroyedOrCaptured"), // 29: 被摧毁或占领
        (e[(e.LowPower = 30)] = "LowPower"),                  // 30: 低电力
        (e[(e.DestroyedBridge = 31)] = "DestroyedBridge"),    // 31: 桥梁被摧毁
        (e[(e.BuildingExists = 32)] = "BuildingExists"),      // 32: 建筑存在
        (e[(e.SelectedByPlayer = 33)] = "SelectedByPlayer"),   // 33: 被玩家选中
        (e[(e.ComesNearWaypoint = 34)] = "ComesNearWaypoint"), // 34: 接近路径点
        (e[(e.EnemyInZone = 35)] = "EnemyInZone"),             // 35: 敌人在区域内
        (e[(e.LocalIsSet = 36)] = "LocalIsSet"),              // 36: 局部变量已设置
        (e[(e.LocalIsCleared = 37)] = "LocalIsCleared"),      // 37: 局部变量已清除
        (e[(e.FirstDamagedCombat = 38)] = "FirstDamagedCombat"), // 38: 首次受伤(战斗单位)
        (e[(e.HalfHealthCombat = 39)] = "HalfHealthCombat"),  // 39: 半血(战斗单位)
        (e[(e.QuarterHealthCombat = 40)] = "QuarterHealthCombat"), // 40: 四分之一血(战斗单位)
        (e[(e.FirstDamagedAny = 41)] = "FirstDamagedAny"),    // 41: 首次受伤(任意)
        (e[(e.HalfHealthAny = 42)] = "HalfHealthAny"),        // 42: 半血(任意)
        (e[(e.QuarterHealthAny = 43)] = "QuarterHealthAny"),  // 43: 四分之一血(任意)
        (e[(e.AttackedByHouse = 44)] = "AttackedByHouse"),    // 44: 被指定阵营攻击
        (e[(e.AmbientLightBelow = 45)] = "AmbientLightBelow"), // 45: 环境光低于
        (e[(e.AmbientLightAbove = 46)] = "AmbientLightAbove"), // 46: 环境光高于
        (e[(e.ElapsedScenarioTime = 47)] = "ElapsedScenarioTime"), // 47: 场景经过时间
        (e[(e.DestroyedOrCapturedOrInfiltrated = 48)] = "DestroyedOrCapturedOrInfiltrated"), // 48: 被摧毁/占领/渗透
        (e[(e.PickupCrate = 49)] = "PickupCrate"),            // 49: 拾取指定箱子
        (e[(e.PickupCrateAny = 50)] = "PickupCrateAny"),      // 50: 拾取任意箱子
        (e[(e.RandomDelay = 51)] = "RandomDelay"),            // 51: 随机延迟
        (e[(e.CreditsBelow = 52)] = "CreditsBelow"),          // 52: 资金低于
        (e[(e.SpyEnteringAsHouse = 53)] = "SpyEnteringAsHouse"), // 53: 间谍以阵营身份进入
        (e[(e.SpyEnteringAsInfantry = 54)] = "SpyEnteringAsInfantry"), // 54: 间谍以步兵身份进入
        (e[(e.DestroyedAllUnitsNaval = 55)] = "DestroyedAllUnitsNaval"), // 55: 摧毁所有海军
        (e[(e.DestroyedAllUnitsLand = 56)] = "DestroyedAllUnitsLand"), // 56: 摧毁所有陆军
        (e[(e.BuildingNotExists = 57)] = "BuildingNotExists")); // 57: 建筑不存在
    },
  };
});
