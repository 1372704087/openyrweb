// === Reconstructed SystemJS module: data/encoding/Format80 ===
// deps: ["data/DataStream"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/encoding/Format80", ["data/DataStream"], function (e, t) {
  "use strict";
  var d, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        d = e;
      },
    ],
    execute: function () {
      e(
        "Format80",
        (i = class {
          static decode(e, t) {
            var i = new Uint8Array(t);
            return (this.decodeInto(e, i), i);
          }
          static decodeInto(e, t) {
            let i = new d.DataStream(new DataView(e.buffer, e.byteOffset, e.byteLength)),
              r = 0;
            for (;;) {
              var s = i.readUint8();
              if (0 == (128 & s)) {
                var a = i.readUint8(),
                  n = 3 + ((112 & s) >> 4);
                (this.replicatePrevious(t, r, r - (((15 & s) << 8) + a), n), (r += n));
              } else if (0 == (64 & s)) {
                n = 63 & s;
                if (0 == n) return r;
                (t.set(i.readUint8Array(n), r), (r += n));
              } else {
                s = 63 & s;
                if (62 == s) for (var o = i.readInt16(), l = i.readUint8(), c = r + o; r < c; r++) t[r] = l;
                else if (63 == s) {
                  o = i.readInt16();
                  let e = i.readInt16();
                  if (e >= r) throw new Error(`srcIndex >= destIndex  ${e}  ` + r);
                  for (var h = r + o; r < h; r++) t[r] = t[e++];
                } else {
                  s = 3 + s;
                  let e = i.readInt16();
                  if (e >= r) throw new Error(`srcIndex >= destIndex  ${e}  ` + r);
                  for (var u = r + s; r < u; r++) t[r] = t[e++];
                }
              }
            }
          }
          static replicatePrevious(i, r, s, a) {
            if (r < s) throw new Error(`srcIndex > destIndex  ${s}  ` + r);
            if (r - s == 1) for (let e = 0; e < a; e++) i[r + e] = i[r - 1];
            else for (let t = 0; t < a; t++) i[r + t] = i[s + t];
          }
        }),
      );
    },
  };
});
