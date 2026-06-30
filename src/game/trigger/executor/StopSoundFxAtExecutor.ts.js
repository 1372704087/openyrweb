// === Reconstructed SystemJS module: game/trigger/executor/StopSoundFxAtExecutor ===
// deps: ["game/event/TriggerStopSoundFxEvent","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/StopSoundFxAtExecutor",
  ["game/event/TriggerStopSoundFxEvent", "game/trigger/TriggerExecutor"],
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
          execute(e) {
            var t = this.action.params[6],
              i = e.map.getTileAtWaypoint(t);
            i
              ? e.events.dispatch(new r.TriggerStopSoundFxEvent(i))
              : console.warn(`No valid location found for waypoint ${t}. ` + `Skipping action ${this.getDebugName()}.`);
          }
        }),
          e("StopSoundFxAtExecutor", s));
      },
    };
  },
);
