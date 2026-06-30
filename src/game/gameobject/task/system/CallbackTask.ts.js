// === Reconstructed SystemJS module: game/gameobject/task/system/CallbackTask ===
// deps: ["game/gameobject/task/system/Task"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/task/system/CallbackTask", ["game/gameobject/task/system/Task"], function (e, t) {
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
          (super(), (this.cb = e));
        }
        onTick(e) {
          return (this.cb(e), !0);
        }
      }),
        e("CallbackTask", r));
    },
  };
});
