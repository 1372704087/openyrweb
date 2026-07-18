// === Custom AI module: game/bot/custom-ai/logic/mission/missionActions ===
System.register("game/bot/custom-ai/logic/mission/missionActions", ["game/bot/custom-ai/logic/mission/mission", "game/api/index"], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [
      function () {},
      function () {},
    ],
    execute: function () {
      // Type interfaces omitted (type-only exports)

      function isReleaseUnits(missionWithAction) {
        return missionWithAction.action.type === "releaseUnits";
      }
      e("isReleaseUnits", isReleaseUnits);

      function isRequestUnitTypes(missionWithAction) {
        return missionWithAction.action.type === "requestUnitTypes";
      }
      e("isRequestUnitTypes", isRequestUnitTypes);

      function isRequestSpecificUnits(missionWithAction) {
        return missionWithAction.action.type === "requestSpecificUnits";
      }
      e("isRequestSpecificUnits", isRequestSpecificUnits);

      function isGrabUnits(missionWithAction) {
        return missionWithAction.action.type === "moveToPoint";
      }
      e("isGrabUnits", isGrabUnits);
    },
  };
});
