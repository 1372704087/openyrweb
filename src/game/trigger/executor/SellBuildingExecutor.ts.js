// === Reconstructed SystemJS module: game/trigger/executor/SellBuildingExecutor ===
// deps: ["game/gameobject/GameObject","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/SellBuildingExecutor",
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
          execute(e, t) {
            for (var i of t) i instanceof r.GameObject && i.isBuilding() && !i.isDestroyed && e.sellTrait.sell(i);
          }
        }),
          e("SellBuildingExecutor", s));
      },
    };
  },
);
