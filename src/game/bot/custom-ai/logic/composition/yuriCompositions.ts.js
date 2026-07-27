// === Custom AI module: game/bot/custom-ai/logic/composition/yuriCompositions ===
System.register("game/bot/custom-ai/logic/composition/yuriCompositions", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/composition/common"], function (e, t) {
  "use strict";
  t && t.id;
  var GameApi, PlayerData, adjustCompositionByEnemy;
  return {
    setters: [
      function (x) { GameApi = x.GameApi; PlayerData = x.PlayerData; },
      function (x) { },
      function (x) { adjustCompositionByEnemy = x.adjustCompositionByEnemy; }
    ],
    execute: function () {
      var getYuriComposition = function (gameApi, playerData, matchAwareness) {
        var hasWarFactory = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "YAWEAP"; }).length > 0;
        var hasRadar = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "NAPSIS"; }).length > 0;
        var hasBattleLab = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "YATECH"; }).length > 0;

        var includeInfantry = !hasBattleLab;
        var result = {};
        if (includeInfantry) { result.INIT = 4; result.BRUTE = 4; }
        if (hasWarFactory) { result.LTNK = 6; result.YTNK = 2; }
        if (hasRadar) { result.TELE = 2; }
        if (hasBattleLab) { result.MIND = 2; }
        // 根据敌方主力护甲动态调整配比（兵种克制）
        result = adjustCompositionByEnemy(gameApi, playerData, result);
        return result;
      };
      e("getYuriComposition", getYuriComposition);
    },
  };
});
