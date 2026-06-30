// === Reconstructed SystemJS module: game/art/SequenceReader ===
// deps: ["game/art/SequenceType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/art/SequenceReader", ["game/art/SequenceType"], function (e, t) {
  "use strict";
  var s, a, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      ((a = new Map([
        ["E", 5],
        ["S", 3],
        ["W", 1],
        ["N", 7],
      ])),
        e(
          "SequenceReader",
          (i = class {
            readIni(e) {
              let t = new Map();
              for (var [i, r] of e.entries) {
                i = s.SequenceType[i];
                void 0 !== i &&
                  ((r = r.split(",")),
                  (r = {
                    type: i,
                    startFrame: Number(r[0]),
                    frameCount: Number(r[1]),
                    facingMult: Number(r[2]),
                    onlyFacing: r[3] ? a.get(r[3]) : void 0,
                  }),
                  t.set(i, r));
              }
              return t;
            }
          }),
        ));
    },
  };
});
