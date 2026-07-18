// === Custom AI module: game/bot/custom-ai/logic/common/rulesCache ===
System.register("game/bot/custom-ai/logic/common/rulesCache", ["game/api/index"], function (e, t) {
  "use strict";
  t && t.id;
  var technoRulesCache;
  return {
    setters: [
      function (x) { }
    ],
    execute: function () {
      technoRulesCache = {};

      var getCachedTechnoRules = function (gameApi, unitId) {
        var gameObject = gameApi.getGameObjectData(unitId);
        if (!gameObject) {
          return null;
        }
        var rulesApi = gameApi.rulesApi;
        var name = gameObject.name;

        if (technoRulesCache[name]) {
          return technoRulesCache[name];
        }

        var aircraftRules = rulesApi.aircraftRules.get(name);
        if (aircraftRules) {
          technoRulesCache[name] = aircraftRules;
          return aircraftRules;
        }

        var buildingRules = rulesApi.buildingRules.get(name);
        if (buildingRules) {
          technoRulesCache[name] = buildingRules;
          return buildingRules;
        }

        var infantryRules = rulesApi.infantryRules.get(name);
        if (infantryRules) {
          technoRulesCache[name] = infantryRules;
          return infantryRules;
        }

        var vehicleRules = rulesApi.vehicleRules.get(name);
        if (vehicleRules) {
          technoRulesCache[name] = vehicleRules;
          return vehicleRules;
        }

        technoRulesCache[name] = null;
        return null;
      };
      e("getCachedTechnoRules", getCachedTechnoRules);
    },
  };
});
