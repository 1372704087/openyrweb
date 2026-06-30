// === Reconstructed SystemJS module: game/action/NoAction ===
// deps: ["game/action/Action","game/action/ActionType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/NoAction", ["game/action/Action", "game/action/ActionType"], function (e, t) {
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
      ((s = class extends i.Action {
        constructor() {
          super(r.ActionType.NoAction);
        }
        process() {}
      }),
        e("NoAction", s));
    },
  };
});
