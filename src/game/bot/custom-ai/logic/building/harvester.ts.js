// === Custom AI module: game/bot/custom-ai/logic/building/harvester ===
System.register("game/bot/custom-ai/logic/building/harvester", [
  "game/api/index",
  "game/bot/custom-ai/logic/threat/threat",
  "game/bot/custom-ai/logic/building/basicGroundUnit"
], function (e, t) {
  "use strict";
  var A, T, BG;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { T = x; },
      function (x) { BG = x; },
    ],
    execute: function () {
      var BasicGroundUnit = BG.BasicGroundUnit;
      var IDEAL_HARVESTERS_PER_REFINERY = 2;
      var MAX_HARVESTERS_PER_REFINERY = 3;
      var Harvester = (function (Parent) {
        function Harvester(basePriority, baseAmount, minNeeded) {
          Parent.call(this, basePriority, baseAmount, 0, 0);
          this.minNeeded = minNeeded;
        }
        Harvester.prototype = Object.create(Parent.prototype);
        Harvester.prototype.constructor = Harvester;
        Harvester.prototype.getPriority = function (game, playerData, technoRules, threatCache) {
          var refineries = game.getVisibleUnits(playerData.name, "self", function (r) { return r.refinery; }).length;
          var harvesters = game.getVisibleUnits(playerData.name, "self", function (r) { return r.harvester; }).length;
          var boost = harvesters < this.minNeeded ? 3 : harvesters > refineries * MAX_HARVESTERS_PER_REFINERY ? 0 : 1;
          return this.basePriority * (refineries / Math.max(harvesters / IDEAL_HARVESTERS_PER_REFINERY, 1)) * boost;
        };
        return Harvester;
      }(BasicGroundUnit));
      e("Harvester", Harvester);
    },
  };
});
