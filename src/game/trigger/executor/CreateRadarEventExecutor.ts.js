// === Reconstructed SystemJS module: game/trigger/executor/CreateRadarEventExecutor ===
// deps: ["game/rules/general/RadarRules","game/trait/RadarTrait","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/CreateRadarEventExecutor",
  ["game/rules/general/RadarRules", "game/trait/RadarTrait", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var a, n, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerExecutor {
          execute(e) {
            var t = Number(this.action.params[1]) - 1;
            if (Object.values(a.RadarEventType).includes(t)) {
              var i = this.action.params[6],
                r = e.map.getTileAtWaypoint(i);
              if (r) for (var s of e.getCombatants()) e.traits.get(n.RadarTrait).addEventForPlayer(t, s, r, e);
              else
                console.warn(`No valid location found for waypoint ${i}. ` + `Skipping action ${this.getDebugName()}.`);
            } else console.warn(`Unknown radar event type "${1 + t}". Skipping action ${this.getDebugName()}.`);
          }
        }),
          e("CreateRadarEventExecutor", r));
      },
    };
  },
);
