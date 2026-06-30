// === Reconstructed SystemJS module: game/gameobject/task/move/AttackMoveTargetTask ===
// deps: ["game/gameobject/task/AttackTask","game/gameobject/trait/MoveTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/move/AttackMoveTargetTask",
  ["game/gameobject/task/AttackTask", "game/gameobject/trait/MoveTrait"],
  function (e, t) {
    "use strict";
    var i, s, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((r = class r extends i.AttackTask {
          constructor(e, t, i) {
            if (
              (super(e, t, i),
              (this.isAttackMove = !0),
              (this.attackPerformed = !1),
              (this.passedFirstWaypoint = !1),
              (this.internalTargetUpdateRequested = !1),
              (this.scanCooldownTicks = 0),
              !t.obj?.isTechno())
            )
              throw new Error("Target must be a techno object");
            ((this.initialTarget = t), (this.initialWeapon = i), (this.requestedTarget = t));
          }
          duplicate() {
            return new r(this.game, this.initialTarget, this.initialWeapon);
          }
          requestTargetUpdate(e) {
            (this.internalTargetUpdateRequested
              ? ((this.requestedTarget = e), (this.internalTargetUpdateRequested = !1))
              : (this.requestedTarget === this.initialTarget ? (this.requestedTarget = e) : (this.attackPerformed = !0),
                (this.initialTarget = e)),
              super.requestTargetUpdate(e));
          }
          onTargetChange(e) {
            super.onTargetChange(e);
            var t = e.attackTrait.currentTarget;
            t &&
              t.obj !== this.initialTarget.obj &&
              t.obj !== this.requestedTarget.obj &&
              (this.requestedTarget === this.initialTarget && (this.requestedTarget = t), (this.initialTarget = t));
          }
          onTick(t) {
            if (
              (t.moveTrait.moveState === s.MoveState.Moving && (this.passedFirstWaypoint = !0),
              (this.scanCooldownTicks = Math.max(0, this.scanCooldownTicks - 1)),
              t.attackTrait &&
                !t.attackTrait.isDisabled() &&
                !this.isCancelling() &&
                (this.requestedTarget === this.initialTarget || this.attackPerformed))
            ) {
              if (!(t.moveTrait.isIdle() || (t.tile === this.lastScanTile && this.scanCooldownTicks))) {
                ((this.lastScanTile = t.tile), (this.scanCooldownTicks = this.game.rules.general.normalTargetingDelay));
                let e = t.attackTrait.selectDefaultWeapon(t);
                if (e && (this.passedFirstWaypoint || !e.getCooldownTicks())) {
                  var i = t.attackTrait.scanForTarget(t, e, this.game);
                  if (i.target) {
                    let { target: e, weapon: t } = i;
                    if (!t.getCooldownTicks()) {
                      ((this.options.holdGround = !0), (this.options.passive = !0), this.setWeapon(t));
                      var r = this.game.createTarget(e, e.tile);
                      return (
                        (this.internalTargetUpdateRequested = !0),
                        this.requestTargetUpdate(r),
                        (this.attackPerformed = !1)
                      );
                    }
                  }
                }
              }
              if (this.attackPerformed) {
                if (!t.isSpawned) {
                  if (!this.forceCancel(t)) throw new Error("Force cancel failed");
                  return !0;
                }
                ((this.attackPerformed = !1),
                  (this.passedFirstWaypoint = !1),
                  (this.options.holdGround = !1),
                  (this.options.passive = !1),
                  this.setWeapon(this.initialWeapon),
                  (this.internalTargetUpdateRequested = !0),
                  this.requestTargetUpdate(this.initialTarget));
              }
            }
            r = super.onTick(t);
            return r && this.requestedTarget !== this.initialTarget
              ? ((this.attackPerformed = !0), this.isCancelling() || t.attackTrait.isDisabled())
              : r;
          }
        }),
          e("AttackMoveTargetTask", r));
      },
    };
  },
);
