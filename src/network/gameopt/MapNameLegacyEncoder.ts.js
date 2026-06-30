// === Reconstructed SystemJS module: network/gameopt/MapNameLegacyEncoder ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gameopt/MapNameLegacyEncoder", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "MapNameLegacyEncoder",
        (i = class {
          encode(e) {
            let a = [],
              n = 0;
            return (
              e.split("").forEach((e, t) => {
                var i = e.charCodeAt(0) << (2 * t - 7 * n),
                  r = 127 & i,
                  s = (i >> 7) & 127,
                  i = (i >> 14) & 127;
                (i && n++, a.push(r, s), i && a.push(i));
              }),
              a.push(0, 0),
              2 <= e.length && a.push(0),
              (a = a.map((e) => 128 ^ e)),
              a.map((e) => String.fromCharCode(e)).join("")
            );
          }
          decode(e) {
            let i = e.split("").map((e) => e.charCodeAt(0));
            for (i = i.map((e) => 128 ^ e); 0 === i[i.length - 1];) i.pop();
            let r = [],
              s = 0,
              a = 0;
            for (; i.length;) {
              var n = r.length,
                o = i.shift(),
                l = i.shift();
              let e = 0,
                t = !1;
              (-1 !== [1, 2, 3].indexOf(i[0]) || n > s + 3) && ((e = i.shift()), (s = n), (t = !0));
              n = ((e << 14) | (l << 7) | o) >> (2 * n - 7 * a);
              (r.push(127 & n), t && a++);
            }
            return r.map((e) => String.fromCharCode(e)).join("");
          }
        }),
      );
    },
  };
});
