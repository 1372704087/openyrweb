// === Reconstructed SystemJS module: game/order/OccupyOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/task/GarrisonBuildingTask","game/gameobject/unit/RangeHelper","game/order/OrderFeedbackType","game/type/MovementZone","game/type/LocomotorType","game/gameobject/task/EnterRecyclerTask","game/gameobject/task/InfiltrateBuildingTask","game/gameobject/task/EnterHospitalTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/OccupyOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/task/GarrisonBuildingTask",
    "game/gameobject/unit/RangeHelper",
    "game/order/OrderFeedbackType",
    "game/type/MovementZone",
    "game/type/LocomotorType",
    "game/gameobject/task/EnterRecyclerTask",
    "game/gameobject/task/InfiltrateBuildingTask",
    "game/gameobject/task/EnterHospitalTask",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d, g;
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
        function (e) {
          l = e;
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
        ((g = class extends i.Order {
          constructor(e) {
            (super(r.OrderType.Occupy),
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
                ? s.PointerType.Occupy
                : s.PointerType.NoOccupy;
          }
          isValid() {
            return (
              !!(this.target.obj?.isSpawned && this.target.obj?.isBuilding() && this.sourceObject.isUnit()) &&
              (!!this.isUnitRecycle(this.sourceObject, this.target.obj) ||
                (!!this.sourceObject.isInfantry() &&
                  (this.target.obj.isBuilding() && this.target.obj.hospitalTrait
                    ? this.game.areFriendly(this.sourceObject, this.target.obj) && this.sourceObject.isInfantry()
                    : this.target.obj.garrisonTrait
                      ? this.target.obj.garrisonTrait.canBeOccupied() &&
                        this.sourceObject.rules.occupier &&
                        !(
                          this.target.obj.garrisonTrait.units.length &&
                          this.target.obj.garrisonTrait.units[0].owner !== this.sourceObject.owner
                        ) &&
                        !this.sourceObject.mindControllableTrait?.isActive() &&
                        !this.sourceObject.mindControllerTrait?.isActive()
                      : !(
                          !this.target.obj.rules.spyable ||
                          !this.sourceObject.rules.infiltrate ||
                          this.game.areFriendly(this.sourceObject, this.target.obj)
                        ))))
            );
          }
          isUnitRecycle(e, t) {
            return (
              e.owner === t.owner && ((e.isInfantry() && t.rules.cloning) || t.rules.grinding) && !e.rules.engineer
            );
          }
          isAllowed() {
            var e = this.target.obj,
              t = this.sourceObject;
            return this.isUnitRecycle(t, e)
              ? t.rules.movementZone !== l.MovementZone.Fly &&
                  t.rules.locomotor !== c.LocomotorType.Chrono &&
                  0 < this.game.sellTrait.computeRefundValue(t)
              : e.hospitalTrait
                ? t.healthTrait.health < 100 && t.rules.movementZone !== l.MovementZone.Fly
                : !e.garrisonTrait || e.garrisonTrait.units.length < e.rules.maxNumberOccupants;
          }
          process() {
            var e = this.target.obj,
              t = this.sourceObject;
            return this.isUnitRecycle(t, e)
              ? [new h.EnterRecyclerTask(this.game, e)]
              : e.hospitalTrait
                ? [new d.EnterHospitalTask(this.game, e)]
                : e.garrisonTrait
                  ? [new a.GarrisonBuildingTask(this.game, e)]
                  : [new u.InfiltrateBuildingTask(this.game, e)];
          }
          onAdd(t, e) {
            if (!e) {
              let e = t.find((e) => e instanceof a.GarrisonBuildingTask || e instanceof u.InfiltrateBuildingTask);
              if (this.isValid() && this.isAllowed() && e && !e.isCancelling() && e.target === this.target.obj)
                if (
                  new n.RangeHelper(this.game.map.tileOccupation).isInTileRange(
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
          e("OccupyOrder", g));
      },
    };
  },
);
