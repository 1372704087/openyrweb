// === Reconstructed SystemJS module: game/action/factories/PingLocationActionFactory ===
// deps: ["game/action/PingLocationAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/PingLocationActionFactory", ["game/action/PingLocationAction"], function (e, t) {
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
        "PingLocationActionFactory",
        (r = class {
          constructor(e) {
            this.game = e;
          }
          create() {
            return new i.PingLocationAction(this.game);
          }
        }),
      );
    },
  };
});
