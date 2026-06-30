// === Reconstructed SystemJS module: game/gameobject/task/system/WaitMinutesTask ===
// deps: ["game/gameobject/task/system/WaitTicksTask","game/GameSpeed"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/system/WaitMinutesTask",
  ["game/gameobject/task/system/WaitTicksTask", "game/GameSpeed"],
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
        ((s = class extends i.WaitTicksTask {
          constructor(e) {
            super(Math.floor(r.GameSpeed.BASE_TICKS_PER_SECOND * e * 60));
          }
        }),
          e("WaitMinutesTask", s));
      },
    };
  },
);
