// === Reconstructed SystemJS module: data/map/MapLighting ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/map/MapLighting", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "MapLighting",
        (i = class {
          constructor() {
            ((this.level = 0),
              (this.ambient = 1),
              (this.red = 1),
              (this.green = 1),
              (this.blue = 1),
              (this.ground = 0),
              (this.forceTint = !1));
          }
          read(e, t = "") {
            return (
              (this.level = e.getNumber(t + "Level", 0.032)),
              (this.ambient = e.getNumber(t + "Ambient", 1)),
              (this.red = e.getNumber(t + "Red", 1)),
              (this.green = e.getNumber(t + "Green", 1)),
              (this.blue = e.getNumber(t + "Blue", 1)),
              (this.ground = e.getNumber(t + "Ground", 0)),
              this
            );
          }
          copy(e) {
            return (
              (this.level = e.level),
              (this.ambient = e.ambient),
              (this.red = e.red),
              (this.green = e.green),
              (this.blue = e.blue),
              (this.ground = e.ground),
              (this.forceTint = e.forceTint),
              this
            );
          }
        }),
      );
    },
  };
});
