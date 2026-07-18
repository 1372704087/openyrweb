// === Custom AI module: game/bot/custom-ai/logic/composition/sovietCompositions ===
System.register("game/bot/custom-ai/logic/composition/sovietCompositions", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/composition/common"], function (e, t) {
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
      var getSovietComposition = function (gameApi, playerData, matchAwareness) {
        var hasWarFactory = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "NAWEAP"; }).length > 0;
        var hasRadar = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "NARADR"; }).length > 0;
        var hasBattleLab = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "NATECH"; }).length > 0;

        var includeInfantry = !hasBattleLab;
        var result = {};
        if (includeInfantry) { result.E2 = 5; result.FLAKT = 2; result.DOG = 1; }
        if (hasWarFactory) { result.HTNK = 4; result.HTK = 2; result.V3 = 2; }
        if (hasRadar) { result.APOC = 1; }
        if (hasBattleLab) { result.APOC = 2; result.V3 = 3; }
        return result;
      };
      e("getSovietComposition", getSovietComposition);

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
        return result;
      };
      e("getYuriComposition", getYuriComposition);
    },
  };
});
