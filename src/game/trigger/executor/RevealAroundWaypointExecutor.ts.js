// === Reconstructed SystemJS module: game/trigger/executor/RevealAroundWaypointExecutor ===
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/RevealAroundWaypointExecutor",
  ["game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerExecutor {
          execute(e) {
            var t = Number(this.action.params[1]),
              i = e.map.getTileAtWaypoint(t);
            if (i)
              for (var r of e.getCombatants())
                e.mapShroudTrait.getPlayerShroud(r)?.revealAround(i, e.rules.general.revealTriggerRadius);
            else
              console.warn(`No valid location found for waypoint ${t}. ` + `Skipping action ${this.getDebugName()}.`);
          }
        }),
          e("RevealAroundWaypointExecutor", r));
      },
    };
  },
);
