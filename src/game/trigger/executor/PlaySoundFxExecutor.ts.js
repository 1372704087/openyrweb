// === Reconstructed SystemJS module: game/trigger/executor/PlaySoundFxExecutor ===
// deps: ["game/event/TriggerSoundFxEvent","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/PlaySoundFxExecutor",
  ["game/event/TriggerSoundFxEvent", "game/trigger/TriggerExecutor"],
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
        ((s = class extends r.TriggerExecutor {
          execute(e) {
            e.events.dispatch(new i.TriggerSoundFxEvent(this.action.params[1]));
          }
        }),
          e("PlaySoundFxExecutor", s));
      },
    };
  },
);
