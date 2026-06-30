// === Reconstructed SystemJS module: game/gameobject/task/InfiltrateBuildingTask ===
// deps: ["game/event/BuildingInfiltrationEvent","game/gameobject/task/EnterBuildingTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/InfiltrateBuildingTask",
  ["game/event/BuildingInfiltrationEvent", "game/gameobject/task/EnterBuildingTask"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class extends r.EnterBuildingTask {
          isAllowed(e) {
            return (
              e.rules.infiltrate &&
              this.target.rules.spyable &&
              !this.target.isDestroyed &&
              !this.game.areFriendly(e, this.target)
            );
          }
          onEnter(e) {
            (this.game.unspawnObject(e),
              e.agentTrait?.infiltrate(e, this.target, this.game),
              this.game.events.dispatch(new i.BuildingInfiltrationEvent(this.target, e)));
          }
        }),
          e("InfiltrateBuildingTask", s));
      },
    };
  },
);
