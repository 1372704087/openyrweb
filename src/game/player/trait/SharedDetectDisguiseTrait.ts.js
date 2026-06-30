// === Reconstructed SystemJS module: game/player/trait/SharedDetectDisguiseTrait ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/player/trait/SharedDetectDisguiseTrait", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "SharedDetectDisguiseTrait",
        (i = class {
          constructor() {
            this.objects = new Set();
          }
          add(e) {
            this.objects.add(e);
          }
          delete(e) {
            this.objects.delete(e);
          }
          has(e) {
            return this.objects.has(e);
          }
          dispose() {
            this.objects.clear();
          }
        }),
      );
    },
  };
});
