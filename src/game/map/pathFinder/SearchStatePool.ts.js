// === Reconstructed SystemJS module: game/map/pathFinder/SearchStatePool ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/pathFinder/SearchStatePool", [], function (e, t) {
  "use strict";
  var s;
  t && t.id;
  return (
    e("makeSearchStatePool", function () {
      let i = 0,
        r = [];
      return {
        createNewState(e) {
          let t = r[i];
          return (
            t
              ? ((t.node = e),
                (t.parent = void 0),
                (t.closed = !1),
                (t.open = 0),
                (t.distanceToSource = Number.POSITIVE_INFINITY),
                (t.fScore = Number.POSITIVE_INFINITY),
                (t.heapIndex = -1))
              : ((t = new s(e)), (r[i] = t)),
            i++,
            t
          );
        },
        reset() {
          i = 0;
        },
      };
    }),
    {
      setters: [],
      execute: function () {
        e(
          "NodeSearchState",
          (s = class {
            constructor(e) {
              ((this.node = e),
                (this.closed = !1),
                (this.open = 0),
                (this.distanceToSource = Number.POSITIVE_INFINITY),
                (this.fScore = Number.POSITIVE_INFINITY),
                (this.heapIndex = -1));
            }
          }),
        );
      },
    }
  );
});
