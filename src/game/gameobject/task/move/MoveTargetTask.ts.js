// === Reconstructed SystemJS module: game/gameobject/task/move/MoveTargetTask ===
// deps: ["game/gameobject/task/move/MoveTask","game/gameobject/trait/MoveTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/move/MoveTargetTask",
  ["game/gameobject/task/move/MoveTask", "game/gameobject/trait/MoveTrait"],
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
        ((s = class extends i.MoveTask {
          constructor(e, t) {
            (super(e, t.tile, t.onBridge, { forceMove: !0, pathFinderIgnoredBlockers: [t] }),
              (this.target = t),
              (this.tilesSinceTargetUpdate = 0));
          }
          onTick(t) {
            if (!(
              this.isCancelling() ||
              t.moveTrait.moveState !== r.MoveState.ReachedNextWaypoint ||
              (this.target.tile === this.targetTile &&
                this.target.onBridge === this.toBridge &&
                this.target.moveTrait.isIdle())
            )) {
              let e = !1;
              var i;
              (((t.tile === this.targetTile && this.target.tile !== this.targetTile) ||
                10 < this.tilesSinceTargetUpdate++) &&
                (e = !0),
                e &&
                  ((this.tilesSinceTargetUpdate = 0),
                  (i = this.target.moveTrait.currentWaypoint)
                    ? this.updateTarget(i.tile, !!i.onBridge)
                    : this.updateTarget(this.target.tile, this.target.onBridge)));
            }
            return super.onTick(t);
          }
          forceCancel(e) {
            return super.forceCancel(e);
          }
          getTargetLinesConfig(e) {
            return { target: this.target, pathNodes: [] };
          }
        }),
          e("MoveTargetTask", s));
      },
    };
  },
);
