// === Reconstructed SystemJS module: game/trigger/executor/PlaySoundFxAtExecutor ===
// deps: ["game/event/TriggerSoundFxEvent","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/PlaySoundFxAtExecutor",
  ["game/event/TriggerSoundFxEvent", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var s, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerExecutor {
          execute(e) {
            var t = this.action,
              i = t.params[1],
              r = t.params[6],
              t = e.map.getTileAtWaypoint(r);
            t
              ? e.events.dispatch(new s.TriggerSoundFxEvent(i, t))
              : console.warn(`No valid location found for waypoint ${r}. ` + `Skipping action ${this.getDebugName()}.`);
          }
        }),
          e("PlaySoundFxAtExecutor", r));
      },
    };
  },
);
