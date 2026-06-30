// === Reconstructed SystemJS module: ClientApi ===
// deps: ["BattleControlApi"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("ClientApi", ["BattleControlApi"], function (e, t) {
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
        "ClientApi",
        (r = class {
          constructor() {
            this.battleControl = new i.BattleControlApi();
          }
        }),
      );
    },
  };
});
