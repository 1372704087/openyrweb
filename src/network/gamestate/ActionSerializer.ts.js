// === Reconstructed SystemJS module: network/gamestate/ActionSerializer ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gamestate/ActionSerializer", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ActionSerializer",
        (i = class {
          getActionPayload(e) {
            return { id: e.actionType, params: e.serialize() };
          }
        }),
      );
    },
  };
});
