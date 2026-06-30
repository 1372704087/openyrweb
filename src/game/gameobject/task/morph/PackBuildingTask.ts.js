// === Reconstructed SystemJS module: game/gameobject/task/morph/PackBuildingTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/Building","game/gameobject/task/system/WaitMinutesTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/morph/PackBuildingTask",
  ["game/gameobject/task/system/Task", "game/gameobject/Building", "game/gameobject/task/system/WaitMinutesTask"],
  function (e, t) {
    "use strict";
    var i, r, s, a;
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
      ],
      execute: function () {
        ((a = class extends i.Task {
          constructor(e) {
            (super(), (this.game = e));
          }
          onTick(e) {
            return (
              !(
                e.buildStatus !== r.BuildStatus.BuildDown &&
                (e.setBuildStatus(r.BuildStatus.BuildDown, this.game), !e.rules.wall)
              ) || (this.children.push(new s.WaitMinutesTask(this.game.rules.general.buildupTime)), !1)
            );
          }
        }),
          e("PackBuildingTask", a));
      },
    };
  },
);
