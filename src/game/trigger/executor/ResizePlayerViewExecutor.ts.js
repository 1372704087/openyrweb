// === Reconstructed SystemJS module: game/trigger/executor/ResizePlayerViewExecutor ===
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/ResizePlayerViewExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          var [t, i, r, s] = this.action.params.slice(2, 6).map(Number);
          e.map.mapBounds.updateRawLocalSize({ x: t, y: i, width: r, height: s });
        }
      }),
        e("ResizePlayerViewExecutor", r));
    },
  };
});
