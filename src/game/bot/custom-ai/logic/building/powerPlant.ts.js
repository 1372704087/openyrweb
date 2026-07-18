// === Custom AI module: game/bot/custom-ai/logic/building/powerPlant ===
System.register("game/bot/custom-ai/logic/building/powerPlant", [
  "game/api/index",
  "game/bot/custom-ai/logic/building/buildingRules",
  "game/bot/custom-ai/logic/threat/threat"
], function (e, t) {
  "use strict";
  var A, B, T;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { B = x; },
      function (x) { T = x; },
    ],
    execute: function () {
      var PowerPlant = class {
        getPlacementLocation(game, playerData, technoRules) {
          return B.getDefaultPlacementLocation(game, playerData, playerData.startLocation, technoRules);
        }
        getPriority(game, playerData, technoRules) {
          if (playerData.power.total < playerData.power.drain) {
            return 100;
          } else if (playerData.power.total < playerData.power.drain + technoRules.power / 2) {
            return 20;
          } else {
            return 0;
          }
        }
        getMaxCount(game, playerData, technoRules, threatCache) {
          return null;
        }
      };
      e("PowerPlant", PowerPlant);
    },
  };
});
