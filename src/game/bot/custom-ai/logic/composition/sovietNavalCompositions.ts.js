// === Custom AI module: game/bot/custom-ai/logic/composition/sovietNavalCompositions ===
System.register("game/bot/custom-ai/logic/composition/sovietNavalCompositions", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/composition/common"], function (e, t) {
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
        console.log("[NAVAL_DEBUG] 计算苏联海军编队组成 (玩家: " + playerData.name + ")");

        var hasNavalYard = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "NAYARD"; }).length > 0;
        var hasAirforce = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "NARADR"; }).length > 0;
        var hasBattleLab = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "NATECH"; }).length > 0;

        console.log("[NAVAL_DEBUG]   建筑状态: 船厂=" + hasNavalYard + ", 雷达=" + hasAirforce + ", 战斗实验室=" + hasBattleLab);

        var composition = {};

        if (hasAirforce) {
          composition.HYD = 3;
          console.log("[NAVAL_DEBUG]   添加海蝎 x3");
        }

        if (hasBattleLab) {
          composition.DRED = 1;
          console.log("[NAVAL_DEBUG]   添加无畏 x1");
        }

        console.log("[NAVAL_DEBUG]   最终编队:", composition);
        return composition;
      };
      e("getNavalCompositions", getNavalCompositions);
    },
  };
});
