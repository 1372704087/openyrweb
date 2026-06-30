// === Reconstructed SystemJS module: game/Prng ===
// deps: ["mersenne-twister","data/Crc32","util/string"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/Prng", ["mersenne-twister", "data/Crc32", "util/string"], function (e, t) {
  "use strict";
  var i, r, s, a;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "Prng",
        (a = class a {
          static factory(e, t) {
            var i = Number.isNaN(Number(e)) ? r.Crc32.calculateCrc(s.binaryStringToUint8Array(e)) : Number(e + "" + t);
            return new a(i);
          }
          constructor(e) {
            this.prng = new i.default(e);
          }
          generateRandomInt(e, t) {
            var i = this.prng.random();
            return ((this.lastRandom = i), Math.floor(i * (t - e + 1)) + e);
          }
          generateRandom() {
            var e = this.prng.random();
            return (this.lastRandom = e);
          }
          getLastRandom() {
            return this.lastRandom;
          }
        }),
      );
    },
  };
});
