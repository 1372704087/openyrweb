// === Reconstructed SystemJS module: game/trigger/executor/PlayAnimAtExecutor ===
// deps: ["game/event/TriggerAnimEvent","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/PlayAnimAtExecutor",
  ["game/event/TriggerAnimEvent", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var a, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerExecutor {
          execute(e) {
            var t,
              i = this.action,
              r = Number(i.params[1]),
              s = e.rules.getAnimationName(r);
            void 0 !== s
              ? ((t = i.params[6]),
                (i = e.map.getTileAtWaypoint(t))
                  ? e.events.dispatch(new a.TriggerAnimEvent(s, i))
                  : console.warn(
                      `No valid location found for waypoint ${t}. ` + `Skipping action ${this.getDebugName()}.`,
                    ))
              : console.warn(`No animation found for index "${r}". Skipping action ` + this.getDebugName());
          }
        }),
          e("PlayAnimAtExecutor", r));
      },
    };
  },
);
