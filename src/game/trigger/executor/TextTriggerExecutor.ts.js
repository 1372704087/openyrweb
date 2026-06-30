// === Reconstructed SystemJS module: game/trigger/executor/TextTriggerExecutor ===
// deps: ["game/event/TriggerTextEvent","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/TextTriggerExecutor",
  ["game/event/TriggerTextEvent", "game/trigger/TriggerExecutor"],
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
            e.events.dispatch(new i.TriggerTextEvent(this.action.params[1]));
          }
        }),
          e("TextTriggerExecutor", s));
      },
    };
  },
);
