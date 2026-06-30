// === Reconstructed SystemJS module: util/Color ===
// deps: ["util/string"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/Color", ["util/string"], function (e, t) {
  "use strict";
  var i, u;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "Color",
        (u = class u {
          static fromRgb(e, t, i) {
            return new u(e, t, i);
          }
          static fromHsv(e, t, i) {
            let r = 0,
              s = 0,
              a = 0;
            if (((e = ((e / 255) * 360) % 360), (i /= 255), 0 === (t /= 255))) ((r = i), (s = i), (a = i));
            else {
              var n = e / 60,
                o = Math.floor(n),
                n = n - o,
                l = i * (1 - t),
                c = i * (1 - t * n),
                h = i * (1 - t * (1 - n));
              switch (o) {
                case 0:
                  ((r = i), (s = h), (a = l));
                  break;
                case 1:
                  ((r = c), (s = i), (a = l));
                  break;
                case 2:
                  ((r = l), (s = i), (a = h));
                  break;
                case 3:
                  ((r = l), (s = c), (a = i));
                  break;
                case 4:
                  ((r = h), (s = l), (a = i));
                  break;
                case 5:
                  ((r = i), (s = l), (a = c));
              }
            }
            return u.fromRgb(Math.floor(255 * r), Math.floor(255 * s), Math.floor(255 * a));
          }
          constructor(e, t, i) {
            ((this.r = e), (this.g = t), (this.b = i));
          }
          asHex() {
            return (this.r << 16) + (this.g << 8) + this.b;
          }
          asHexString() {
            return "#" + i.pad(this.asHex().toString(16), "000000");
          }
          clone() {
            return new u(this.r, this.g, this.b);
          }
        }),
      );
    },
  };
});
