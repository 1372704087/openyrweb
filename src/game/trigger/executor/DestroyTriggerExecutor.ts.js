// === Reconstructed SystemJS module: game/trigger/executor/DestroyTriggerExecutor ===
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/DestroyTriggerExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          var t = this.action.params[1];
          e.triggers.destroyTrigger(t);
        }
      }),
        e("DestroyTriggerExecutor", r));
    },
  };
});
