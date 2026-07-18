// === Custom AI module: game/bot/custom-ai/logic/building/navalYard ===
System.register("game/bot/custom-ai/logic/building/navalYard", [
  "game/api/index",
  "game/bot/custom-ai/logic/building/buildingRules",
  "game/bot/custom-ai/logic/building/basicBuilding",
  "game/bot/custom-ai/logic/threat/threat"
], function (e, t) {
  "use strict";
  var A, B, BB, T;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { B = x; },
      function (x) { BB = x; },
      function (x) { T = x; },
    ],
    execute: function () {
      var BasicBuilding = BB.BasicBuilding;
      var NavalYard = (function (Parent) {
        function NavalYard(basePriority, maxNeeded, onlyBuildWhenFloatingCreditsAmount, logger) {
          Parent.call(this, basePriority, maxNeeded, onlyBuildWhenFloatingCreditsAmount);
          this.logger = logger !== undefined ? logger : function () {};
        }
        NavalYard.prototype = Object.create(Parent.prototype);
        NavalYard.prototype.constructor = NavalYard;
        NavalYard.prototype.getPlacementLocation = function (game, playerData, technoRules) {
          var placementData = game.getBuildingPlacementData(technoRules.name);
          this.logger("[NavalYard] \u5c1d\u8bd5\u653e\u7f6e\u8239\u5382 " + technoRules.name + "\uff0c\u5c3a\u5bf8: " + placementData.foundation.width + "x" + placementData.foundation.height, true);
          var location = B.getDefaultPlacementLocation(game, playerData, playerData.startLocation, technoRules, true, 1);
          if (location) {
            this.logger("[NavalYard] \u627e\u5230\u5408\u9002\u7684\u653e\u7f6e\u4f4d\u7f6e: (" + location.rx + ", " + location.ry + ")", true);
          } else {
            this.logger("[NavalYard] \u672a\u627e\u5230\u5408\u9002\u7684\u653e\u7f6e\u4f4d\u7f6e", true);
          }
          return location;
        };
        NavalYard.prototype.getPriority = function (game, playerData, technoRules, threatCache) {
          var priority = Parent.prototype.getPriority.call(this, game, playerData, technoRules, threatCache);
          if (priority !== -100) {
            this.logger("[NavalYard] \u5f53\u524d\u5efa\u9020\u4f18\u5148\u7ea7: " + priority, true);
          }
          return priority;
        };
        return NavalYard;
      }(BasicBuilding));
      e("NavalYard", NavalYard);
    },
  };
});
