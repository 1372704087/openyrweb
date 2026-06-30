// === Reconstructed SystemJS module: game/player/trait/RadarTrait ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/player/trait/RadarTrait", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "RadarTrait",
        (i = class {
          constructor() {
            ((this.disabled = !0), (this.activeEvents = []));
          }
          isDisabled() {
            return this.disabled;
          }
          setDisabled(e) {
            this.disabled = e;
          }
        }),
      );
    },
  };
});
