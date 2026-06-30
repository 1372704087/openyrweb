// === Reconstructed SystemJS module: util/Graph ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/Graph", [], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "Node",
        (r = class {
          constructor(e, t) {
            ((this.id = e), (this.data = t), (this.neighbors = new Set()));
          }
          addLink(e) {
            (this.neighbors.add(e), e !== this && e.neighbors.add(this));
          }
          removeLink(e) {
            (this.neighbors.delete(e), e.neighbors.delete(this));
          }
          deleteLinks() {
            for (var e of this.neighbors) e.neighbors.delete(this);
            this.neighbors.clear();
          }
        }),
      ),
        e(
          "Graph",
          (i = class {
            constructor() {
              this.nodes = new Map();
            }
            addNode(e, t) {
              let i = this.getNode(e);
              return (i ? (i.data = t) : (i = new r(e, t)), this.nodes.set(e, i), i);
            }
            removeNode(e) {
              let t = this.getNode(e);
              return !!t && (t.deleteLinks(), this.nodes.delete(e), !0);
            }
            hasNode(e) {
              return this.nodes.has(e);
            }
            getNode(e) {
              return this.nodes.get(e);
            }
            getNodeCount() {
              return this.nodes.size;
            }
            forEachNode(e) {
              for (var t of this.nodes.values()) e(t);
            }
            clear() {
              for (var e of this.nodes.values()) e.deleteLinks();
              this.nodes.clear();
            }
          }),
        ));
    },
  };
});
