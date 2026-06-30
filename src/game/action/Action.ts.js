// === Reconstructed SystemJS module: game/action/Action ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/Action", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "Action",
        (i = class {
          constructor(e) {
            this.actionType = e;
          }
          unserialize(e) {}
          serialize() {
            return new Uint8Array();
          }
          print() {
            return "";
          }
        }),
      );
    },
  };
});
