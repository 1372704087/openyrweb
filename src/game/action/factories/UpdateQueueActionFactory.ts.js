// === Reconstructed SystemJS module: game/action/factories/UpdateQueueActionFactory ===
// deps: ["game/action/UpdateQueueAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/UpdateQueueActionFactory", ["game/action/UpdateQueueAction"], function (e, t) {
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
      e(
        "UpdateQueueActionFactory",
        (r = class {
          constructor(e) {
            this.game = e;
          }
          create() {
            return new i.UpdateQueueAction(this.game);
          }
        }),
      );
    },
  };
});
