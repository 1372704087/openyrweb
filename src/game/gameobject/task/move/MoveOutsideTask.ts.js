// === Reconstructed SystemJS module: game/gameobject/task/move/MoveOutsideTask ===
// deps: ["game/gameobject/task/move/MoveTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/task/move/MoveOutsideTask", ["game/gameobject/task/move/MoveTask"], function (e, t) {
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
      ((r = class extends i.MoveTask {
        constructor(e, t, i) {
          (super(e, i ?? t.tile, !1, { ignoredBlockers: [t] }), (this.target = t), (this.cancellable = !1));
        }
        canStopAtTile(e, t, i) {
          return !this.game.map.tileOccupation.isTileOccupiedBy(t, this.target) && super.canStopAtTile(e, t, i);
        }
      }),
        e("MoveOutsideTask", r));
    },
  };
});
