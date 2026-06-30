// === Reconstructed SystemJS module: game/gameobject/task/CheerTask ===
// deps: ["game/gameobject/task/system/Task","game/art/SequenceType","game/gameobject/infantry/StanceType","game/gameobject/task/system/WaitMinutesTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/CheerTask",
  [
    "game/gameobject/task/system/Task",
    "game/art/SequenceType",
    "game/gameobject/infantry/StanceType",
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
        ((n = class extends i.Task {
          constructor() {
            (super(), (this.executed = !1), (this.cancellable = !1));
          }
          onTick(e) {
            return this.executed
              ? ((e.stance = s.StanceType.None), !0)
              : !e.isInfantry() ||
                  !e.art.sequences.has(r.SequenceType.Cheer) ||
                  (e.stance !== s.StanceType.None && e.stance !== s.StanceType.Guard) ||
                  ((e.stance = s.StanceType.Cheer),
                  this.children.push(new a.WaitMinutesTask(1 / 60).setCancellable(!1)),
                  !(this.executed = !0));
          }
        }),
          e("CheerTask", n));
      },
    };
  },
);
