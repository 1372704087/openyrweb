// === Reconstructed SystemJS module: game/gameobject/task/TurnTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/unit/FacingUtil"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/TurnTask",
  ["game/gameobject/task/system/Task", "game/gameobject/unit/FacingUtil"],
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
        ((s = class extends i.Task {
          constructor(e) {
            (super(), (this.direction = e), (this.cancellable = !1));
          }
          onTick(e) {
            if (e.direction === this.direction) return !(e.spinVelocity = 0);
            var t = e.rules.rot,
              { facing: i, delta: t } = r.FacingUtil.tick(e.direction, this.direction, t);
            return ((e.direction = i), (e.spinVelocity = t), !1);
          }
        }),
          e("TurnTask", s));
      },
    };
  },
);
