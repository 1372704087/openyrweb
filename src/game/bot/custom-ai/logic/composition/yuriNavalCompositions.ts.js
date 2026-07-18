// === Custom AI module: game/bot/custom-ai/logic/composition/yuriNavalCompositions ===
System.register("game/bot/custom-ai/logic/composition/yuriNavalCompositions", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/composition/common"], function (e, t) {
  "use strict";
  t && t.id;
  var GameApi, PlayerData;
  return {
    setters: [
      function (x) { GameApi = x.GameApi; PlayerData = x.PlayerData; },
      function (x) { },
      function (x) { }
    ],
    execute: function () {
      var getNavalCompositions = function (gameApi, playerData, matchAwareness) {
        console.log("[NAVAL_DEBUG] 计算尤里海军编队组成 (玩家: " + playerData.name + ")");

        var hasNavalYard = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "YAYARD"; }).length > 0;
        var hasRadar = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "NAPSIS"; }).length > 0;
        var hasBattleLab = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "YATECH"; }).length > 0;

        console.log("[NAVAL_DEBUG]   建筑状态: 船厂=" + hasNavalYard + ", 雷达=" + hasRadar + ", 战斗实验室=" + hasBattleLab);

        var composition = {};

        if (hasNavalYard) {
          composition.YHVR = 1;
          console.log("[NAVAL_DEBUG]   添加悬浮运输艇 x1");
        }

        if (hasRadar) {
          composition.BSUB = 2;
          console.log("[NAVAL_DEBUG]   添加雷鸣潜艇 x2");
        }

        if (hasBattleLab) {
          composition.BSUB = 3;
          console.log("[NAVAL_DEBUG]   战斗实验室阶段雷鸣潜艇 x3");
        }

        console.log("[NAVAL_DEBUG]   最终编队:", composition);
        return composition;
      };
      e("getNavalCompositions", getNavalCompositions);
    },
  };
});
