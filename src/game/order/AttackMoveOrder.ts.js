// === Reconstructed SystemJS module: game/order/AttackMoveOrder ===
// deps: ["game/order/OrderType","engine/type/PointerType","game/gameobject/task/move/AttackMoveTask","game/order/OrderFeedbackType","game/type/MovementZone","game/order/AttackOrder","game/gameobject/task/PlantC4Task","game/gameobject/task/move/AttackMoveTargetTask","game/gameobject/task/move/MoveTask","game/gameobject/task/AttackTask","game/type/LocomotorType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/AttackMoveOrder",
  [
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/task/move/AttackMoveTask",
    "game/order/OrderFeedbackType",
    "game/type/MovementZone",
    "game/order/AttackOrder",
    "game/gameobject/task/PlantC4Task",
    "game/gameobject/task/move/AttackMoveTargetTask",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/AttackTask",
    "game/type/LocomotorType",
  ],
  function (e, t) {
    "use strict";
    var i, o, r, s, l, a, n, c, h, u, d, g;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        ((g = class extends a.AttackOrder {
          constructor(e, t) {
            (super(e),
              (this.map = t),
              (this.orderType = i.OrderType.AttackMove),
              (this.targetOptional = !1),
              (this.feedbackType = s.OrderFeedbackType.Move));
          }
          getPointerType(t, i) {
            if (this.isTargetted()) {
              let e = super.getPointerType(t, i);
              return (
                (e !== o.PointerType.AttackRange && e !== o.PointerType.AttackNoRange) ||
                  (e = o.PointerType.AttackMove),
                e
              );
            }
            let e = this.isAllowed();
            var r, s, a, n;
            return (
              e &&
                ((r = !!this.target.getBridge()),
                (s = this.sourceObject.rules.speedType),
                (a = this.sourceObject.isInfantry()),
                (n = this.sourceObject.rules.movementZone === l.MovementZone.Fly),
                (e =
                  n ||
                  0 < this.map.terrain.getPassableSpeed(this.target.tile, s, a, r) ||
                  !!this.game.mapShroudTrait
                    .getPlayerShroud(this.sourceObject.owner)
                    ?.isShrouded(this.target.tile, this.target.obj?.tileElevation))),
              t
                ? e
                  ? o.PointerType.AttackMini
                  : o.PointerType.NoActionMini
                : e
                  ? o.PointerType.AttackMove
                  : o.PointerType.NoMove
            );
          }
          isValid() {
            var e =
              this.sourceObject.isUnit() &&
              !!this.sourceObject.attackTrait &&
              !this.sourceObject.rules.preventAttackMove &&
              !(
                this.game.mapShroudTrait
                  .getPlayerShroud(this.sourceObject.owner)
                  ?.isShrouded(this.target.tile, this.target.obj?.tileElevation) &&
                !this.sourceObject.rules.moveToShroud
              ) &&
              (!this.isTargetted() || super.isValid());
            return ((this.feedbackType = s.OrderFeedbackType.Move), e);
          }
          isAllowed() {
            return !(!this.isTargetted() && this.sourceObject.moveTrait.isDisabled()) && super.isAllowed();
          }
          process() {
            if (this.isTargetted()) {
              if (this.isC4) return [new n.PlantC4Task(this.game, this.target.obj)];
              var e = this.sourceObject.attackTrait.selectWeaponVersus(this.sourceObject, this.target, this.game);
              return [new c.AttackMoveTargetTask(this.game, this.target, e)];
            }
            return [
              new r.AttackMoveTask(this.game, this.target.tile, !!this.target.getBridge(), {
                closeEnoughTiles: this.game.rules.general.closeEnough,
              }),
            ];
          }
          isTargetted() {
            return this.target.obj?.isTechno();
          }
          onAdd(t, e) {
            let i = this.sourceObject;
            if (!e && i.isUnit() && this.isValid() && this.isAllowed())
              if (i.rules.movementZone === l.MovementZone.Fly) {
                let e = t.find(
                  (e) =>
                    [h.MoveTask, u.AttackTask, r.AttackMoveTask, c.AttackMoveTargetTask].includes(e.constructor) &&
                    !e.isCancelling(),
                );
                if (e)
                  if (this.isTargetted())
                    (i.moveTrait.currentWaypoint?.tile === this.target.tile ||
                      i.isAircraft() ||
                      e.constructor !== h.MoveTask) &&
                      e.forceCancel(i) &&
                      t.splice(t.indexOf(e));
                  else {
                    if (e.constructor === r.AttackMoveTask)
                      return (
                        e.updateTarget(this.target.tile, !!this.target.getBridge()),
                        t.splice(t.indexOf(e) + 1),
                        i.unitOrderTrait.clearOrders(),
                        !1
                      );
                    e.forceCancel(i) && t.splice(t.indexOf(e));
                  }
              } else
                this.isTargetted() &&
                  t.length &&
                  i.isUnit() &&
                  (i.rules.locomotor === d.LocomotorType.Vehicle || i.rules.locomotor === d.LocomotorType.Ship) &&
                  (i.moveTrait.speedPenalty = 0.5);
            return !0;
          }
        }),
          e("AttackMoveOrder", g));
      },
    };
  },
);
