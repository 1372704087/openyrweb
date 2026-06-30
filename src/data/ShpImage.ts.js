// === Reconstructed SystemJS module: data/ShpImage ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/ShpImage", [], function (e, t) {
  "use strict";
  var n;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ShpImage",
        (n = class n {
          constructor(e) {
            ((this.height = 1),
              (this.width = 1),
              (this.x = 0),
              (this.y = 0),
              (this.imageData = e ?? new Uint8Array(0)));
          }
          clip(t, i) {
            let e = new n();
            ((e.width = Math.min(this.width, t)), (e.height = Math.min(this.height, i)));
            let r = new Uint8Array(t * i),
              s = 0;
            for (let a = 0; a < this.height && !(a >= i); a++)
              for (let e = 0; e < this.width; e++) e >= t || (r[s++] = this.imageData[a * this.width + e]);
            return ((e.imageData = r), (e.x = this.x), (e.y = this.y), e);
          }
        }),
      );
    },
  };
});
