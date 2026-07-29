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
          y = i.makeSearchStatePool(),
          _b = e.bidirectional !== false;
        // Single-direction A*
        function w(e, t) {
          var i = u.getNode(e);
          if (!i) throw new Error("fromId is not defined in this graph: " + e);
          var r = u.getNode(t);
          if (!r) throw new Error("toId is not defined in this graph: " + t);
          if (i === r) return [];
          y.reset();
          var s = new Map(),
            a = new T.NodeHeap(),
            n = y.createNewState(i);
          s.set(e, n),
            (n.fScore = f?.(r.data) ? Number.POSITIVE_INFINITY : p(i, r));
          if (!Number.isFinite(n.fScore) && i.neighbors.has(r)) return [];
          (n.distanceToSource = 0), a.push(n), (n.open = 1);
          var o,
            l = n,
            c = 0;
          for (; 0 < a.length;) {
            if (((o = a.pop()), o.node === r)) return v(o);
            if ((c++, c > g)) break;
            (o.closed = !0), o.node.neighbors.forEach(function (e) {
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
            });
          }
          return d ? v(l) : [];
        }
        // Bidirectional A*
        function b(e, t) {
          var i = u.getNode(e);
          if (!i) throw new Error("fromId is not defined in this graph: " + e);
          var r = u.getNode(t);
          if (!r) throw new Error("toId is not defined in this graph: " + t);
          if (i === r) return [];
          y.reset();
          // Forward: start -> goal
          var s = new T.NodeHeap(),
            a = new Map(),
            n = y.createNewState(i);
          a.set(e, n),
            (n.fScore = f?.(r.data) ? Number.POSITIVE_INFINITY : p(i, r));
          if (!Number.isFinite(n.fScore) && i.neighbors.has(r)) return [];
          (n.distanceToSource = 0), s.push(n), (n.open = 1);
          // Backward: goal -> start
          var o = new T.NodeHeap(),
            l = new Map(),
            c = y.createNewState(r);
          l.set(t, c),
            (c.fScore = f?.(i.data) ? Number.POSITIVE_INFINITY : p(r, i));
          if (!Number.isFinite(c.fScore) && r.neighbors.has(i)) return [];
          (c.distanceToSource = 0), o.push(c), (c.open = 1);
          var h = n,
            u2 = c,
            ec = 0;
          for (; 0 < s.length && 0 < o.length;) {
            // Forward step
            var fwd = s.pop();
            fwd.closed = !0;
            ec++;
            if (ec > g) break;
            var bwd_state = l.get(fwd.node.id);
            if (bwd_state && bwd_state.closed) return _(fwd, bwd_state);
            fwd.node.neighbors.forEach(function (e) {
              let t = a.get(e.id);
              var i;
              (t || ((t = y.createNewState(e)), a.set(e.id, t)),
                t.closed ||
                  (0 === t.open && (s.push(t), (t.open = 1)),
                  (i = f?.(e.data) ? Number.POSITIVE_INFINITY : fwd.distanceToSource + m(fwd.node, e)) >=
                    t.distanceToSource ||
                    ((t.parent = fwd),
                    (t.distanceToSource = i),
                    f?.(r.data) ? (t.fScore = Number.POSITIVE_INFINITY) : (t.fScore = i + p(t.node, r, t)),
                    t.fScore - t.distanceToSource < h.fScore - h.distanceToSource && (h = t),
                    s.updateItem(t.heapIndex))));
            });
            // Backward step
            var bwd = o.pop();
            bwd.closed = !0;
            ec++;
            if (ec > g) break;
            var fwd_state = a.get(bwd.node.id);
            if (fwd_state && fwd_state.closed) return _(fwd_state, bwd);
            bwd.node.neighbors.forEach(function (e) {
              let t = l.get(e.id);
              var _g;
              (t || ((t = y.createNewState(e)), l.set(e.id, t)),
                t.closed ||
                  (0 === t.open && (o.push(t), (t.open = 1)),
                  (_g = f?.(e.data) ? Number.POSITIVE_INFINITY : bwd.distanceToSource + m(bwd.node, e)) >=
                    t.distanceToSource ||
                    ((t.parent = bwd),
                    (t.distanceToSource = _g),
                    f?.(i.data) ? (t.fScore = Number.POSITIVE_INFINITY) : (t.fScore = _g + p(t.node, i, t)),
                    t.fScore - t.distanceToSource < u2.fScore - u2.distanceToSource && (u2 = t),
                    o.updateItem(t.heapIndex))));
            });
          }
          // bestEffort fallback
          if (d) {
            var x = h.fScore - h.distanceToSource,
              N = u2.fScore - u2.distanceToSource;
            return x <= N ? v(h) : v(u2).reverse();
          }
          return [];
        }
        // Bidirectional path reconstruction: [goalNode, ..., meetingNode, ..., startNode]
        function _(e, t) {
          var i = [];
          var r = t;
          for (; r;) i.push(r.node), (r = r.parent);
          i.reverse();
          r = e.parent;
          for (; r;) i.push(r.node), (r = r.parent);
          return i;
        }
        return {
          find: _b ? b : w,
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
