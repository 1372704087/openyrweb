// === Reconstructed SystemJS module: game/order/orderPriorities ===
// deps: ["game/order/OrderType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/order/orderPriorities", ["game/order/OrderType"], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e("orderPriorities", [
        i.OrderType.Occupy,
        i.OrderType.Dock,
        i.OrderType.Attack,
        i.OrderType.Capture,
        i.OrderType.Repair,
        i.OrderType.EnterTransport,
        i.OrderType.PlaceBomb,
        i.OrderType.Deploy,
        i.OrderType.Gather,
      ]);
    },
  };
});
