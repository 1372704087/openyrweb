// === Reconstructed SystemJS module: game/order/EnterTransportOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/unit/RangeHelper","game/order/OrderFeedbackType","game/gameobject/task/EnterTransportTask","game/gameobject/unit/ZoneType","game/gameobject/trait/MoveTrait","game/gameobject/task/system/CallbackTask","game/gameobject/task/move/MoveTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/EnterTransportOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/unit/RangeHelper",
    "game/order/OrderFeedbackType",
    "game/gameobject/task/EnterTransportTask",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/move/MoveTask",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d;
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
      ],
      execute: function () {
        ((d = class extends i.Order {
          constructor(e) {
            (super(r.OrderType.EnterTransport),
              (this.game = e),
              (this.targetOptional = !1),
              (this.terminal = !0),
              (this.feedbackType = n.OrderFeedbackType.Enter));
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
            return !(
              !this.target.obj?.isVehicle() ||
              !this.target.obj.transportTrait ||
              this.target.obj.isDestroyed ||
              this.target.obj === this.sourceObject ||
              !this.game.areFriendly(this.target.obj, this.sourceObject) ||
              (!this.sourceObject.isVehicle() && !this.sourceObject.isInfantry())
            );
          }
          isAllowed() {
            let e = this.target.obj,
              t = this.sourceObject;
            return (
              t.zone !== l.ZoneType.Air &&
              e.zone !== l.ZoneType.Air &&
              e.transportTrait.unitFitsInside(t) &&
              e.moveTrait.moveState === c.MoveState.Idle &&
              !e.warpedOutTrait.isActive() &&
              !t.mindControllableTrait?.isActive() &&
              !t.mindControllerTrait?.isActive()
            );
          }
          process() {
            let e = this.sourceObject,
              t = this.target.obj;
            return this.game.map.terrain.getPassableSpeed(t.tile, e.rules.speedType, e.isInfantry(), e.onBridge)
              ? [new o.EnterTransportTask(this.game, t)]
              : [
                  new h.CallbackTask(() => {
                    (t.unitOrderTrait.addTask(new u.MoveTask(this.game, e.tile, e.onBridge)),
                      t.unitOrderTrait.addTask(
                        new h.CallbackTask(() => {
                          this.game.map.terrain.getPassableSpeed(
                            t.tile,
                            e.rules.speedType,
                            e.isInfantry(),
                            e.onBridge,
                          ) && e.unitOrderTrait.addTask(new o.EnterTransportTask(this.game, t));
                        }),
                      ));
                  }),
                ];
          }
          onAdd(t, e) {
            if (!e) {
              let e = t.find((e) => e instanceof o.EnterTransportTask);
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
          e("EnterTransportOrder", d));
      },
    };
  },
);
