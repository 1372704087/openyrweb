// === Reconstructed SystemJS module: data/IdxFile ===
// deps: ["data/IdxEntry"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/IdxFile", ["data/IdxEntry"], function (e, t) {
  "use strict";
  var n, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        n = e;
      },
    ],
    execute: function () {
      e(
        "IdxFile",
        (i = class {
          constructor(e) {
            ((this.entries = new Map()), this.parse(e));
          }
          parse(t) {
            var e = t.readCString(4);
            if ("GABA" !== e) throw new Error(`Unable to load Idx file, did not find magic id, found ${e} instead`);
            e = t.readInt32();
            if (2 !== e) throw new Error(`Unable to load Idx file, did not find magic number 2, found ${e} instead`);
            var i = t.readInt32();
            for (let s = 0; s < i; s++) {
              const a = new n.IdxEntry();
              let e = t.readString(16);
              var r = e.indexOf("\0");
              (0 !== r && (e = e.substr(0, r)),
                (a.filename = e + ".wav"),
                (a.offset = t.readUint32()),
                (a.length = t.readUint32()),
                (a.sampleRate = t.readUint32()),
                (a.flags = t.readUint32()),
                (a.chunkSize = t.readUint32()),
                this.entries.set(a.filename, a));
            }
          }
        }),
      );
    },
  };
});
