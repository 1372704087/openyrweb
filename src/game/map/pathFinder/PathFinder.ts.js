// === Reconstructed SystemJS module: game/map/pathFinder/PathFinder ===
// deps: ["game/map/pathFinder/NodeHeap","game/map/pathFinder/SearchStatePool"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/map/pathFinder/PathFinder",
  ["game/map/pathFinder/NodeHeap", "game/map/pathFinder/SearchStatePool"],
  function (e, t) {
    "use strict";
    var T, i;
    t && t.id;
    function r() {
      return 0;
    }
    function s() {
      return 1;
    }
    function v(e) {
      let t = [e.node],
        i = e.parent;
      for (; i;) (t.push(i.node), (i = i.parent));
      return t;
    }
    return (
      e("PathFinder", function (u, e = {}) {
        let d = e.bestEffort,
          g = e.maxExpandedNodes || Number.POSITIVE_INFINITY,
          p = e.heuristic ?? r,
          m = e.distance ?? s,
          f = e.excludedNodes,
          y = i.makeSearchStatePool();
        return {
          find: function (e, t) {
            let i = u.getNode(e);
            if (!i) throw new Error("fromId is not defined in this graph: " + e);
            let r = u.getNode(t);
            if (!r) throw new Error("toId is not defined in this graph: " + t);
            if (i === r) return [];
            y.reset();
            let s = new Map(),
              a = new T.NodeHeap(),
              n = y.createNewState(i);
            if (
              (s.set(e, n),
              (n.fScore = f?.(r.data) ? Number.POSITIVE_INFINITY : p(i, r)),
              !Number.isFinite(n.fScore) && i.neighbors.has(r))
            )
              return [];
            ((n.distanceToSource = 0), a.push(n), (n.open = 1));
            let o,
              l = n,
              c = 0;
            for (; 0 < a.length;) {
              if (((o = a.pop()), o.node === r)) return v(o);
              if ((c++, c > g)) break;
              ((o.closed = !0), o.node.neighbors.forEach(h));
            }
            return d ? v(l) : [];
            function h(e) {
              let t = s.get(e.id);
              var i;
              (t || ((t = y.createNewState(e)), s.set(e.id, t)),
                t.closed ||
                  (0 === t.open && (a.push(t), (t.open = 1)),
                  (i = f?.(e.data) ? Number.POSITIVE_INFINITY : o.distanceToSource + m(o.node, e)) >=
                    t.distanceToSource ||
                    ((t.parent = o),
                    (t.distanceToSource = i),
                    f?.(r.data) ? (t.fScore = Number.POSITIVE_INFINITY) : (t.fScore = i + p(t.node, r, t)),
                    t.fScore - t.distanceToSource < l.fScore - l.distanceToSource && (l = t),
                    a.updateItem(t.heapIndex))));
            }
          },
        };
      }),
      {
        setters: [
          function (e) {
            T = e;
          },
          function (e) {
            i = e;
          },
        ],
        execute: function () {},
      }
    );
  },
);
