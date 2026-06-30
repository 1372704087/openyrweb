// === Reconstructed SystemJS module: game/order/ScatterOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/task/ScatterTask","game/type/MovementZone"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/ScatterOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/task/ScatterTask",
    "game/type/MovementZone",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o;
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
      ],
      execute: function () {
        ((o = class extends i.Order {
          constructor(e) {
            (super(r.OrderType.Scatter), (this.game = e), (this.getPointerType = () => s.PointerType.NoAction));
          }
          isValid() {
            return (
              (this.sourceObject.isInfantry() || this.sourceObject.isVehicle()) &&
              this.sourceObject.rules.movementZone !== n.MovementZone.Fly &&
              !this.sourceObject.moveTrait.isDisabled()
            );
          }
          isAllowed() {
            return !0;
          }
          process() {
            if (!this.target)
              throw new Error("Target should be set for executing a scatter order. See OrderUnitsAction.");
            return [new a.ScatterTask(this.game, { tile: this.target.tile, toBridge: !!this.target.getBridge() })];
          }
        }),
          e("ScatterOrder", o));
      },
    };
  },
);
