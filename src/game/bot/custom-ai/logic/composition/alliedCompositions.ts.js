// === Custom AI module: game/bot/custom-ai/logic/composition/alliedCompositions ===
System.register("game/bot/custom-ai/logic/composition/alliedCompositions", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/composition/common"], function (e, t) {
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
      var getAlliedCompositions = function (gameApi, playerData, matchAwareness) {
        var hasWarFactory = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "GAWEAP"; }).length > 0;
        var hasAirforce =
          gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "GAAIRC" || r.name === "AMRADR"; }).length > 0;
        var hasBattleLab = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "GATECH"; }).length > 0;

        var includeInfantry = !hasAirforce && !hasBattleLab;
        var result = {};
        if (includeInfantry) { result.E1 = 5; }
        if (hasWarFactory) { result.MTNK = 4; result.FV = 2; }
        if (hasAirforce) { result.JUMPJET = 4; result.ORCA = 2; }
        if (hasBattleLab) { result.MGTK = 3; result.SREF = 2; }
        return result;
      };
      e("getAlliedCompositions", getAlliedCompositions);
    },
  };
});
