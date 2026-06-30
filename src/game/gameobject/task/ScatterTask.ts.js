// === Reconstructed SystemJS module: game/gameobject/task/ScatterTask ===
// deps: ["game/gameobject/task/move/MoveTask","game/gameobject/task/system/Task","game/gameobject/unit/ScatterPositionHelper","game/type/MovementZone"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/ScatterTask",
  [
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/system/Task",
    "game/gameobject/unit/ScatterPositionHelper",
    "game/type/MovementZone",
  ],
  function (e, t) {
    "use strict";
    var s, i, a, n, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        ((r = class extends i.Task {
          constructor(e, t, i) {
            (super(), (this.game = e), (this.target = t), (this.options = i));
          }
          onStart(i) {
            if (!i.moveTrait.isDisabled() && i.rules.movementZone !== n.MovementZone.Fly) {
              let e, t;
              if (this.target) ({ tile: e, toBridge: t } = this.target);
              else {
                var r = new a.ScatterPositionHelper(this.game).findPositions([i], this.options).get(i);
                if (!r) return;
                ((e = r.tile), (t = !!r.onBridge));
              }
              this.children.push(
                new s.MoveTask(this.game, e, t, {
                  closeEnoughTiles: 0,
                  ignoredBlockers: this.options?.ignoredBlockers,
                }),
              );
            }
          }
          onTick(e) {
            return !0;
          }
        }),
          e("ScatterTask", r));
      },
    };
  },
);
