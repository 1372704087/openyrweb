// === Reconstructed SystemJS module: game/art/FlhCoords ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/art/FlhCoords", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "FlhCoords",
        (i = class i {
          constructor(e) {
            ((this.forward = 0), (this.lateral = 0), (this.vertical = 0), e && 3 === e.length && this.fromArray(e));
          }
          fromArray(e) {
            return ((this.forward = e[0]), (this.lateral = e[1]), (this.vertical = e[2]), this);
          }
          clone() {
            return new i([this.forward, this.lateral, this.vertical]);
          }
        }),
      );
    },
  };
});
