// === Reconstructed SystemJS module: game/trigger/executor/TurnOnOffBuildingExecutor ===
// deps: ["game/gameobject/GameObject","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/TurnOnOffBuildingExecutor",
  ["game/gameobject/GameObject", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var r, i, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((s = class extends i.TriggerExecutor {
          constructor(e, t, i) {
            (super(e, t), (this.turnOn = i));
          }
          execute(e, t) {
            for (var i of t) i instanceof r.GameObject && i.isBuilding() && i.poweredTrait?.setTurnedOn(this.turnOn);
          }
        }),
          e("TurnOnOffBuildingExecutor", s));
      },
    };
  },
);
