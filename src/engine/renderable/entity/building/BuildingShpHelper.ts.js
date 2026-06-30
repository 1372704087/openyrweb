// === Reconstructed SystemJS module: engine/renderable/entity/building/BuildingShpHelper ===
// deps: ["engine/AnimProps","engine/ImageFinder","engine/renderable/builder/ShpAggregator"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/building/BuildingShpHelper",
  ["engine/AnimProps", "engine/ImageFinder", "engine/renderable/builder/ShpAggregator"],
  function (e, t) {
    "use strict";
    var o, a, l, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        e(
          "BuildingShpHelper",
          (i = class {
            constructor(e) {
              this.imageFinder = e;
            }
            getShpFrameInfos(e, t, i, r) {
              let s = new Map();
              (t && s.set(t, l.ShpAggregator.getShpFrameInfo(t, e.hasShadow)),
                i && s.set(i, l.ShpAggregator.getShpFrameInfo(i, e.hasShadow)));
              for (var [a, n] of r) {
                ((a = new o.AnimProps(a.art, n)), (a = l.ShpAggregator.getShpFrameInfo(n, a.shadow)));
                s.set(n, a);
              }
              return s;
            }
            collectAnimShpFiles(e, r) {
              let s = new Map();
              return (
                e.getAll().forEach((e, t) => {
                  for (var i of e) {
                    let e;
                    try {
                      e = this.imageFinder.find(i.image, r.useTheaterExtension);
                    } catch (e) {
                      if (e instanceof a.ImageFinder.MissingImageError) {
                        console.warn(e.message);
                        continue;
                      }
                      throw e;
                    }
                    s.set(i, e);
                  }
                }),
                s
              );
            }
          }),
        );
      },
    };
  },
);
