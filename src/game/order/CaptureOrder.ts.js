// === Reconstructed SystemJS module: game/order/CaptureOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/unit/RangeHelper","game/gameobject/task/CaptureBuildingTask","game/order/OrderFeedbackType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/CaptureOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/task/CaptureBuildingTask",
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
            (super(r.OrderType.Capture),
              (this.game = e),
              (this.targetOptional = !1),
              (this.terminal = !0),
              (this.feedbackType = o.OrderFeedbackType.Capture));
          }
          getPointerType(e) {
            if (!this.isAllowed()) return e ? s.PointerType.NoActionMini : s.PointerType.NoOccupy;
            if (e) return s.PointerType.OccupyMini;
            if (this.game.gameOpts.multiEngineer) {
              var t = this.game.rules.general,
                i = this.target.obj;
              if (
                (!i.rules.needsEngineer || !t.engineerAlwaysCaptureTech) &&
                i.healthTrait.health > 100 * t.engineerCaptureLevel
              )
                return s.PointerType.EngineerDamage;
            }
            return s.PointerType.Occupy;
          }
          isValid() {
            return (
              !(this.target.obj?.isDestroyed || !this.target.obj?.isBuilding() || !this.sourceObject.isInfantry()) &&
              this.target.obj.rules.capturable &&
              this.sourceObject.rules.engineer &&
              !this.target.obj.secureProgressTrait?.isActiveFrom(this.sourceObject.owner) &&
              !this.game.areFriendly(this.sourceObject, this.target.obj)
            );
          }
          isAllowed() {
            return !0;
          }
          process() {
            return [new n.CaptureBuildingTask(this.game, this.target.obj)];
          }
          onAdd(t, e) {
            if (!e) {
              let e = t.find((e) => e instanceof n.CaptureBuildingTask);
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
          e("CaptureOrder", l));
      },
    };
  },
);
