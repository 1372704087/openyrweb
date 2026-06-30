// === Reconstructed SystemJS module: game/trigger/executor/FireSaleExecutor ===
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/FireSaleExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends i.TriggerExecutor {
        constructor(e, t) {
          (super(e, t), (this.houseId = Number(e.params[1])));
        }
        execute(e) {
          var t = e.getAllPlayers().find((e) => e.country?.id === this.houseId);
          if (t) for (var i of t.buildings) e.sellTrait.sell(i);
        }
      }),
        e("FireSaleExecutor", r));
    },
  };
});
