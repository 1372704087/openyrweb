// === Reconstructed SystemJS module: game/order/CheerOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/task/CheerTask","game/gameobject/infantry/StanceType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/CheerOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/task/CheerTask",
    "game/gameobject/infantry/StanceType",
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
          constructor() {
            (super(r.OrderType.Cheer), (this.getPointerType = () => s.PointerType.NoAction));
          }
          isValid() {
            return (
              this.sourceObject.isInfantry() &&
              [n.StanceType.None, n.StanceType.Guard].includes(this.sourceObject.stance)
            );
          }
          isAllowed() {
            return !0;
          }
          process() {
            return [new a.CheerTask()];
          }
        }),
          e("CheerOrder", o));
      },
    };
  },
);
