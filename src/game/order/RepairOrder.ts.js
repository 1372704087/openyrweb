// === Reconstructed SystemJS module: game/order/RepairOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/unit/RangeHelper","game/gameobject/task/RepairBuildingTask","game/order/OrderFeedbackType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/RepairOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/task/RepairBuildingTask",
    "game/order/OrderFeedbackType",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l;
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
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        ((l = class extends i.Order {
          constructor(e) {
            (super(r.OrderType.Repair),
              (this.game = e),
              (this.targetOptional = !1),
              (this.terminal = !0),
              (this.feedbackType = o.OrderFeedbackType.Capture));
          }
          getPointerType(e) {
            return e
              ? this.isAllowed()
                ? s.PointerType.OccupyMini
                : s.PointerType.NoActionMini
              : this.isAllowed()
                ? s.PointerType.RepairMove
                : s.PointerType.NoRepair;
          }
          isValid() {
            return (
              !!this.target.obj?.isBuilding() &&
              !this.target.obj.isDestroyed &&
              this.sourceObject.isInfantry() &&
              this.sourceObject.rules.engineer &&
              ((!this.target.obj.owner.isCombatant() &&
                (!!this.target.obj.garrisonTrait || !!this.target.obj.cabHutTrait)) ||
                this.game.areFriendly(this.target.obj, this.sourceObject))
            );
          }
          isAllowed() {
            let e = this.target.obj;
            return e.cabHutTrait
              ? e.cabHutTrait.canRepairBridge()
              : !!(e.rules.repairable && e.healthTrait.health < 100);
          }
          process() {
            var e = this.target.obj;
            return [new n.RepairBuildingTask(this.game, e)];
          }
          onAdd(t, e) {
            if (!e) {
              let e = t.find((e) => e instanceof n.RepairBuildingTask);
              if (this.isValid() && this.isAllowed() && e && !e.isCancelling() && e.target === this.target.obj)
                if (
                  new a.RangeHelper(this.game.map.tileOccupation).isInTileRange(
                    this.sourceObject,
                    this.target.obj,
                    0,
                    Math.SQRT2,
                  )
                )
                  return !1;
            }
            return !0;
          }
        }),
          e("RepairOrder", l));
      },
    };
  },
);
