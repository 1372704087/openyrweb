// === Reconstructed SystemJS module: game/gameobject/task/WaitForBuildUpTask ===
// deps: ["game/gameobject/Building","game/gameobject/task/system/CallbackTask","game/gameobject/task/system/TaskGroup","game/gameobject/task/system/WaitMinutesTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/WaitForBuildUpTask",
  [
    "game/gameobject/Building",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/system/TaskGroup",
    "game/gameobject/task/system/WaitMinutesTask",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((n = class extends s.TaskGroup {
          constructor(e, t) {
            (super(new a.WaitMinutesTask(e), new r.CallbackTask((e) => e.setBuildStatus(i.BuildStatus.Ready, t))),
              (this.cancellable = !1));
          }
        }),
          e("WaitForBuildUpTask", n));
      },
    };
  },
);
