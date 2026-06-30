// === Reconstructed SystemJS module: game/action/factories/OrderUnitsActionFactory ===
// deps: ["game/action/OrderUnitsAction","game/order/OrderFactory"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/factories/OrderUnitsActionFactory",
  ["game/action/OrderUnitsAction", "game/order/OrderFactory"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e(
          "OrderUnitsActionFactory",
          (s = class {
            constructor(e, t, i) {
              ((this.game = e), (this.map = t), (this.orderActionContext = i));
            }
            create() {
              return new i.OrderUnitsAction(
                this.game,
                this.map,
                this.orderActionContext,
                new r.OrderFactory(this.game, this.map),
              );
            }
          }),
        );
      },
    };
  },
);
