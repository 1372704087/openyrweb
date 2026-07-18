// === SystemJS wrapper for @timohausmann/quadtree-ts (minimal implementation) ===
System.register("vendor/quadtree", [], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [],
    execute: function () {
      var Circle = class {
        constructor(e) {
          (this.x = e.x), (this.y = e.y), (this.r = e.r), (this.data = e.data);
        }
      };
      e("Circle", Circle);

      var Quadtree = class {
        constructor(e) {
          var t = e || {};
          (this.bounds = { x: t.x || 0, y: t.y || 0, width: t.width || 0, height: t.height || 0 }),
            (this.maxObjects = t.maxObjects || 10),
            (this.maxLevels = t.maxLevels || 4),
            (this.level = t.level || 0),
            (this.objects = []),
            (this.nodes = []);
        }
        clear() {
          (this.objects = []), (this.nodes = []);
        }
        _split() {
          var e = this.bounds,
            t = e.x,
            i = e.y,
            r = e.width / 2,
            s = e.height / 2,
            n = this.level + 1,
            a = this.maxObjects,
            o = this.maxLevels;
          this.nodes = [
            new Quadtree.Branch({ x: t, y: i, width: r, height: s, level: n, maxObjects: a, maxLevels: o }),
            new Quadtree.Branch({ x: t + r, y: i, width: r, height: s, level: n, maxObjects: a, maxLevels: o }),
            new Quadtree.Branch({ x: t, y: i + s, width: r, height: s, level: n, maxObjects: a, maxLevels: o }),
            new Quadtree.Branch({ x: t + r, y: i + s, width: r, height: s, level: n, maxObjects: a, maxLevels: o }),
          ];
        }
        _getIndex(e) {
          var t = this.bounds,
            i = t.x + t.width / 2,
            r = t.y + t.height / 2,
            s = e.x - e.r >= i,
            n = e.x + e.r < i,
            o = e.y + e.r < r,
            a = e.y - e.r >= r;
          return n
            ? o
              ? 0
              : a
                ? 2
                : -1
            : s
              ? o
                ? 1
                : a
                  ? 3
                  : -1
              : -1;
        }
        insert(e) {
          if (this.nodes.length) {
            var t = this._getIndex(e);
            if (-1 !== t) return void this.nodes[t].insert(e);
          }
          this.objects.push(e);
          if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            this.nodes.length || this._split();
            for (var i = this.objects.length - 1; i >= 0; i--) {
              var r = this._getIndex(this.objects[i]);
              -1 !== r && this.nodes[r].insert(this.objects.splice(i, 1)[0]);
            }
          }
        }
        _retrieve(e, t) {
          for (var i = this.objects.length, r = 0; r < i; r++) t.push(this.objects[r]);
          if (this.nodes.length) {
            var s = this._getIndex(e);
            -1 !== s && this.nodes[s]._retrieve(e, t);
            for (var n = 0; n < this.nodes.length; n++) n !== s && this._boundsIntersect(e, this.nodes[n].bounds) && this.nodes[n]._retrieve(e, t);
          }
        }
        _boundsIntersect(e, t) {
          var i = e.x - e.r,
            r = e.x + e.r,
            s = e.y - e.r,
            n = e.y + e.r;
          return i <= t.x + t.width && r >= t.x && s <= t.y + t.height && n >= t.y;
        }
        retrieve(e) {
          var t = [];
          return this._retrieve(e, t), t;
        }
      };
      // Internal Branch helper that shares prototype methods
      Quadtree.Branch = function(e) {
        return new Quadtree(e);
      };
      e("Quadtree", Quadtree);
    },
  };
});
