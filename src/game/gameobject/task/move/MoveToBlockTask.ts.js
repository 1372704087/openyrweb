// === Reconstructed SystemJS module: game/gameobject/task/move/MoveToBlockTask ===
// deps: ["game/gameobject/trait/MoveTrait","game/gameobject/task/system/Task","game/gameobject/task/move/MoveTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/move/MoveToBlockTask",
  ["game/gameobject/trait/MoveTrait", "game/gameobject/task/system/Task", "game/gameobject/task/move/MoveTask"],
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
        ((a = class extends r.Task {
          constructor(e, t) {
            (super(),
              (this.game = e),
              (this.target = t),
              (this.preventOpportunityFire = !1),
              (this.useChildTargetLines = !0),
              (this.attackPerformed = !1));
          }
          onStart(e) {
            this.children.push(
              new s.MoveTask(this.game, this.target.centerTile, !1, {
                closeEnoughTiles: 1,
                pathFinderIgnoredBlockers: [this.target],
                stopOnBlocker: this.target,
              }),
            );
          }
          onTick(e) {
            if (this.attackPerformed || this.isCancelling() || !e.attackTrait || e.attackTrait.isDisabled()) return !0;
            if (e.moveTrait.lastMoveResult !== i.MoveResult.CloseEnough) return !0;
            var t = e.attackTrait.selectWeaponVersus(e, this.target, this.game, !0);
            return (
              !t ||
              (this.children.push(
                e.attackTrait.createAttackTask(this.game, this.target, this.target.tile, t, { force: !0 }),
              ),
              !(this.attackPerformed = !0))
            );
          }
        }),
          e("MoveToBlockTask", a));
      },
    };
  },
);
