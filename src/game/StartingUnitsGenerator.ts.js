// === Reconstructed SystemJS module: game/StartingUnitsGenerator ===
// deps: ["engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/StartingUnitsGenerator", ["engine/type/ObjectType"], function (e, t) {
  "use strict";
  var p, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        p = e;
      },
    ],
    execute: function () {
      e(
        "StartingUnitsGenerator",
        (i = class {
          static generate(e, t, i, r) {
            var s,
              a = (i.reduce((e, t) => e + t.cost, 0) / i.length) * e;
            let n = [],
              o = a,
              l = (i = i.filter((e) => e.isAvailableTo(r) && e.hasOwner(r))).filter((e) => t.includes(e.name));
            for (s of l) {
              if (o <= 0) break;
              var c = 2 / 3 / l.length,
                c = Math.ceil((c * a) / s.cost);
              ((o -= c * s.cost), n.push({ name: s.name, type: p.ObjectType.Vehicle, count: c }));
            }
            var h,
              u = i.filter((e) => !l.includes(e)),
              d = o / u.length;
            for (h of u) {
              if (o <= 0) break;
              var g = Math.ceil(d / h.cost);
              ((o -= g * h.cost), n.push({ name: h.name, type: p.ObjectType.Infantry, count: g }));
            }
            return n;
          }
        }),
      );
    },
  };
});
