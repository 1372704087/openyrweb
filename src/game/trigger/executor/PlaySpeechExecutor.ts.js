// === Reconstructed SystemJS module: game/trigger/executor/PlaySpeechExecutor ===
// deps: ["game/event/TriggerEvaEvent","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/PlaySpeechExecutor",
  ["game/event/TriggerEvaEvent", "game/trigger/TriggerExecutor"],
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
            e.events.dispatch(new i.TriggerEvaEvent(this.action.params[1]));
          }
        }),
          e("PlaySpeechExecutor", s));
      },
    };
  },
);
