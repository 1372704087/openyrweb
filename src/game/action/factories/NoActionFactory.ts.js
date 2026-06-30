// === Reconstructed SystemJS module: game/action/factories/NoActionFactory ===
// deps: ["game/action/NoAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/NoActionFactory", ["game/action/NoAction"], function (e, t) {
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
        "NoActionFactory",
        (r = class {
          create() {
            return new i.NoAction();
          }
        }),
      );
    },
  };
});
