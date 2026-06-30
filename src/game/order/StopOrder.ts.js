// === Reconstructed SystemJS module: game/order/StopOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/type/LocomotorType","game/gameobject/task/system/CallbackTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/StopOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/type/LocomotorType",
    "game/gameobject/task/system/CallbackTask",
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
            (super(r.OrderType.Stop), (this.game = e), (this.getPointerType = () => s.PointerType.NoAction));
          }
          isValid() {
            return this.sourceObject.isTechno();
          }
          isAllowed() {
            return !0;
          }
          process() {
            return [
              new n.CallbackTask((e) => {
                !e.isUnit() ||
                  (e.rules.locomotor !== a.LocomotorType.Vehicle && e.rules.locomotor !== a.LocomotorType.Ship) ||
                  (e.moveTrait.speedPenalty = 0);
              }),
            ];
          }
          onAdd(e, t) {
            let i = this.sourceObject;
            return (
              t ||
                !e.length ||
                !i.isUnit() ||
                (i.rules.locomotor !== a.LocomotorType.Vehicle && i.rules.locomotor !== a.LocomotorType.Ship) ||
                (i.moveTrait.speedPenalty = 0.5),
              i.isBuilding() &&
                i.rallyTrait?.getRallyPoint() &&
                (i.unitRepairTrait?.resetRallyPoint(i, this.game), i.factoryTrait?.resetRallyPoint(i, this.game)),
              !0
            );
          }
        }),
          e("StopOrder", o));
      },
    };
  },
);
