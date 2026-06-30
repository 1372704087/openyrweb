// === Reconstructed SystemJS module: engine/renderable/builder/ShpAggregator ===
// deps: ["data/ShpFile","data/ShpImage"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/builder/ShpAggregator", ["data/ShpFile", "data/ShpImage"], function (e, t) {
  "use strict";
  var c, h, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        c = e;
      },
      function (e) {
        h = e;
      },
    ],
    execute: function () {
      e(
        "ShpAggregator",
        (i = class {
          static getShpFrameInfo(e, t) {
            return { file: e, hasShadow: t, frameCount: Math.floor(e.numImages * (t ? 0.5 : 1)) };
          }
          aggregate(e, t) {
            let i = new c.ShpFile();
            i.filename = t;
            let r = [],
              s = new Map(),
              a = 0;
            for (var { file: n, hasShadow: o, frameCount: l } of e)
              if (!s.has(n)) {
                s.set(n, a);
                for (let e = 0; e < l; e++)
                  (i.addImage(n.getImage(e)), r.push(o ? n.getImage(l + e) : new h.ShpImage()), a++);
              }
            return (r.forEach((e) => i.addImage(e)), { file: i, imageIndexes: s });
          }
        }),
      );
    },
  };
});
