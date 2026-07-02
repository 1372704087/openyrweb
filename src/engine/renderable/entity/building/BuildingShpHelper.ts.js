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
            getShpFrameInfos(e, t, i, r, a) {
              let s = new Map();
              (t && s.set(t, l.ShpAggregator.getShpFrameInfo(t, e.hasShadow)),
                i && s.set(i, l.ShpAggregator.getShpFrameInfo(i, e.hasShadow)));
              a.getAll().forEach((t) => {
                t.forEach((e) => {
                  let addFrameInfo = (t, i) => {
                    if (!i) return;
                    let a = r.get(i);
                    if (a) {
                      let e = new o.AnimProps(t, a);
                      s.set(a, l.ShpAggregator.getShpFrameInfo(a, e.shadow));
                    }
                  };
                  addFrameInfo(e.art, e.image), e.damagedArt && addFrameInfo(e.damagedArt, e.damagedImage);
                });
              });
              return s;
            }
            collectAnimShpFiles(e, r) {
              let s = new Map();
              return (
                e.getAll().forEach((e, t) => {
                  for (var i of e) {
                    for (var n of [i.image, i.damagedImage]) {
                      if (!n || s.has(n)) continue;
                      let e;
                      try {
                        e = this.imageFinder.find(n, r.useTheaterExtension);
                      } catch (e) {
                        if (e instanceof a.ImageFinder.MissingImageError) {
                          // OpenYRWeb: an optional animation SHP is missing from the user's game
                          // data (e.g. a production/activation frame, a snow-theater variant).
                          // The building still renders (main image + other anim layers); this is
                          // a common data-completeness issue, not an engine error. Demote to debug
                          // to keep the console clean while leaving a diagnostic breadcrumb.
                          console.debug(e.message);
                          continue;
                        }
                        throw e;
                      }
                      s.set(n, e);
                    }
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
