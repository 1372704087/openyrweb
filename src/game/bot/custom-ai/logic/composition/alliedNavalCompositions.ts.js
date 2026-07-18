// === Custom AI module: game/bot/custom-ai/logic/composition/alliedNavalCompositions ===
System.register("game/bot/custom-ai/logic/composition/alliedNavalCompositions", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/composition/common"], function (e, t) {
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
        console.log("[NAVAL_DEBUG] 计算盟军海军编队组成 (玩家: " + playerData.name + ")");

        var hasNavalYard = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "GAYARD"; }).length > 0;
        var hasAirforce = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "GAAIRC" || r.name === "AMRADR"; }).length > 0;
        var hasBattleLab = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "GATECH"; }).length > 0;

        console.log("[NAVAL_DEBUG]   建筑状态: 船厂=" + hasNavalYard + ", 空军指挥部=" + hasAirforce + ", 战斗实验室=" + hasBattleLab);

        var composition = {};

        if (hasNavalYard) {
          composition.DEST = 3;
          console.log("[NAVAL_DEBUG]   添加驱逐舰 x3");
        }

        if (hasAirforce) {
          composition.AEGIS = 1;
          console.log("[NAVAL_DEBUG]   添加神盾巡洋舰 x1");
        }

        if (hasBattleLab) {
          composition.CARRIER = 1;
          composition.DLPH = 2;
          console.log("[NAVAL_DEBUG]   添加航母 x1, 海豚 x2");
        }

        console.log("[NAVAL_DEBUG]   最终编队:", composition);
        return composition;
      };
      e("getNavalCompositions", getNavalCompositions);
    },
  };
});
