// === Reconstructed SystemJS module: game/gameobject/task/system/WaitTicksTask ===
// deps: ["game/gameobject/task/system/Task"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/task/system/WaitTicksTask", ["game/gameobject/task/system/Task"], function (e, t) {
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
      ((r = class extends i.Task {
        constructor(e) {
          (super(), (this.ticks = e));
        }
        onTick() {
          return !!this.isCancelling() || !(0 < this.ticks--);
        }
      }),
        e("WaitTicksTask", r));
    },
  };
});
