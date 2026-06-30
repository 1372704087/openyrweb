// === Reconstructed SystemJS module: game/trigger/executor/ReshroudMapExecutor ===
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/ReshroudMapExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          for (var t of e.getCombatants()) e.mapShroudTrait.resetShroud(t, e);
        }
      }),
        e("ReshroudMapExecutor", r));
    },
  };
});
