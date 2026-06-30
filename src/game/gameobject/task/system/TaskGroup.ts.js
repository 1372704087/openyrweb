// === Reconstructed SystemJS module: game/gameobject/task/system/TaskGroup ===
// deps: ["game/gameobject/task/system/Task"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/task/system/TaskGroup", ["game/gameobject/task/system/Task"], function (e, t) {
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
        constructor(...e) {
          (super(), this.children.push(...e));
        }
        onTick(e) {
          return !0;
        }
      }),
        e("TaskGroup", r));
    },
  };
});
