// === Reconstructed SystemJS module: game/gameobject/task/move/AttackMoveTask ===
// deps: ["game/gameobject/task/move/MoveTask","game/gameobject/trait/MoveTrait","game/type/MovementZone"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/move/AttackMoveTask",
  ["game/gameobject/task/move/MoveTask", "game/gameobject/trait/MoveTrait", "game/type/MovementZone"],
  function (e, t) {
    "use strict";
    var i, s, a, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((r = class r extends i.MoveTask {
          constructor() {
            (super(...arguments),
              (this.isAttackMove = !0),
              (this.attackPerformed = !1),
              (this.passedFirstWaypoint = !1));
          }
          duplicate() {
            return new r(this.game, this.targetTile, this.toBridge, this.options);
          }
          onTick(i) {
            if (
              (i.moveTrait.moveState === s.MoveState.Moving && (this.passedFirstWaypoint = !0),
              i.moveTrait.moveState === s.MoveState.ReachedNextWaypoint &&
                i.attackTrait &&
                !i.attackTrait.isDisabled() &&
                (i.rules.movementZone !== a.MovementZone.Fly || !i.rules.balloonHover) &&
                (!i.ammoTrait || i.ammoTrait.ammo || !i.rules.manualReload) &&
                !this.isCancelling())
            ) {
              let e = i.attackTrait.selectDefaultWeapon(i);
              if (e && (this.passedFirstWaypoint || (e && !e.getCooldownTicks()))) {
                var r = i.attackTrait.scanForTarget(i, e, this.game);
                if (r.target) {
                  let { target: e, weapon: t } = r;
                  if (!t.getCooldownTicks()) {
                    r = i.attackTrait.createAttackTask(this.game, e, e.tile, t, { holdGround: !0, passive: !0 });
                    return (
                      this.children.push(r),
                      (this.useChildTargetLines = !0),
                      (this.attackPerformed = !0),
                      i.moveTrait.velocity.set(0, 0, 0),
                      (i.moveTrait.currentWaypoint = void 0),
                      (i.moveTrait.collisionState = s.CollisionState.Waiting),
                      !1
                    );
                  }
                }
              }
              if (this.attackPerformed) {
                if (!i.isSpawned) {
                  if (!this.forceCancel(i)) throw new Error("Force cancel failed");
                  return !0;
                }
                ((this.attackPerformed = !1),
                  (this.passedFirstWaypoint = !1),
                  (this.useChildTargetLines = !1),
                  (i.moveTrait.collisionState = s.CollisionState.Resolved),
                  this.updateTarget(this.targetTile, this.toBridge));
              }
            }
            return super.onTick(i);
          }
        }),
          e("AttackMoveTask", r));
      },
    };
  },
);
