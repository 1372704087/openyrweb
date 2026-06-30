// === Reconstructed SystemJS module: game/map/pathFinder/NodeHeap ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/pathFinder/NodeHeap", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "NodeHeap",
        (i = class {
          constructor(t = []) {
            if (((this.data = t), (this.length = t.length), 0 < this.length))
              for (let e = this.length >> 1; 0 <= e; e--) this.down(e);
            for (let e = 0; e < this.length; ++e) this.setNodeId(this.data[e], e);
          }
          compare(e, t) {
            return e.fScore - t.fScore;
          }
          setNodeId(e, t) {
            e.heapIndex = t;
          }
          push(e) {
            (this.data.push(e), this.setNodeId(e, this.length), this.length++, this.up(this.length - 1));
          }
          pop() {
            if (0 !== this.length) {
              var e = this.data[0];
              return (
                this.length--,
                0 < this.length &&
                  ((this.data[0] = this.data[this.length]), this.setNodeId(this.data[0], 0), this.down(0)),
                this.data.pop(),
                e
              );
            }
          }
          peek() {
            return this.data[0];
          }
          updateItem(e) {
            (this.down(e), this.up(e));
          }
          up(e) {
            let t = this.data;
            for (var i = t[e]; 0 < e;) {
              var r = (e - 1) >> 1,
                s = t[r];
              if (0 <= this.compare(i, s)) break;
              ((t[e] = s), this.setNodeId(s, e), (e = r));
            }
            ((t[e] = i), this.setNodeId(i, e));
          }
          down(i) {
            let r = this.data;
            for (var e = this.length >> 1, s = r[i]; i < e;) {
              let e = 1 + (i << 1);
              var a = e + 1;
              let t = r[e];
              if ((a < this.length && this.compare(r[a], t) < 0 && ((e = a), (t = r[a])), 0 <= this.compare(t, s)))
                break;
              ((r[i] = t), this.setNodeId(t, i), (i = e));
            }
            ((r[i] = s), this.setNodeId(s, i));
          }
        }),
      );
    },
  };
});
