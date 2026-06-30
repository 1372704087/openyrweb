// === Reconstructed SystemJS module: engine/gfx/FrustumCuller ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/FrustumCuller", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "FrustumCuller",
        (i = class {
          cull(e, t) {
            var i = [];
            return (
              (function e(t, i, r, s = 0) {
                let a = t.children,
                  n;
                var o,
                  l = t.visible;
                if (i.intersectsBox(t.box)) {
                  if (((t.visible = !0), null !== a))
                    for (n = 0, o = a.length; n < o; ++n)
                      a[n].isOctree
                        ? e(a[n], i, r, s + 1)
                        : !l && t.config.skipInvisMatrixUpdate && a[n].updateMatrixWorld(!1);
                  r.push(t);
                } else t.visible = !1;
              })(e, t, i),
              i
            );
          }
        }),
      );
    },
  };
});
