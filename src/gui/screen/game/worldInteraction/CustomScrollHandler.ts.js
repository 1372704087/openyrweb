// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/CustomScrollHandler ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/worldInteraction/CustomScrollHandler", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CustomScrollHandler",
        (i = class {
          constructor(e) {
            ((this.mapScrollHandler = e), (this.isPaused = !1));
          }
          requestScroll(e) {
            this.isPaused || this.mapScrollHandler.requestForceScroll(e);
          }
          cancel() {
            this.mapScrollHandler.cancelForceScroll();
          }
          pause() {
            this.isPaused = !0;
          }
          unpause() {
            this.isPaused = !1;
          }
        }),
      );
    },
  };
});
