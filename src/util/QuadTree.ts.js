// === Reconstructed SystemJS module: util/QuadTree ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/QuadTree", [], function (e, t) {
  "use strict";
  var n, a;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      ((n = new THREE.Vector2()),
        e(
          "QuadTree",
          (a = class a {
            constructor(e, t) {
              ((this.box = e), (this.config = t), (this.parentMap = new Map()), (this.objects = []));
            }
            add(e, t = !0) {
              var i = this.config.getKey(e);
              if (this.box.containsPoint(i)) {
                if (!this.regions)
                  return (
                    this.parentMap.get(e)?.remove(e),
                    this.parentMap.set(e, this),
                    this.objects.push({ key: i, value: e }),
                    t && this.update(),
                    !0
                  );
                for (var r of this.regions) if (r.add(e, t)) return !0;
              }
              return !1;
            }
            remove(t, e = !0) {
              let i = this.parentMap.get(t);
              i &&
                (i === this
                  ? (this.parentMap.delete(t),
                    this.objects.splice(
                      this.objects.findIndex((e) => e.value === t),
                      1,
                    ),
                    e && this.parent?.update())
                  : i.remove(t, e));
            }
            updateObject(t) {
              let i = this.parentMap.get(t);
              if (i) {
                var e = this.config.getKey(t);
                if (i.box.containsPoint(e)) i.objects.find((e) => e.value === t).key = e;
                else {
                  i.remove(t, !1);
                  let e = i.parent;
                  for (; e && !e.add(t, !1);) e = e.parent;
                }
              }
            }
            queryRange(e, t = []) {
              if (this.box.intersectsBox(e))
                if (this.regions) for (var i of this.regions) i.queryRange(e, t);
                else for (var r of this.objects) e.containsPoint(r.key) && t.push(r.value);
              return t;
            }
            update() {
              let e = 0;
              if (this.regions) {
                for (var t of this.regions) e += t.update();
                e <= this.config.joinThreshold && this.join();
              } else ((e = this.objects.length), e >= this.config.splitThreshold && this.split() && this.update());
              return e;
            }
            split() {
              if (this.regions || this.config.maxDepth <= 1) return !1;
              var t,
                e,
                i = {
                  getKey: this.config.getKey,
                  joinThreshold: this.config.joinThreshold,
                  splitThreshold: this.config.splitThreshold,
                  maxDepth: this.config.maxDepth - 1,
                },
                r = this.generateRegions(),
                s = this.objects;
              ((this.objects = []), (this.regions = []));
              for (t of r) {
                let e = new a(t, i);
                ((e.parentMap = this.parentMap), this.regions.push(e), (e.parent = this));
              }
              for (e of s) (this.parentMap.delete(e.value), this.add(e.value, !1));
              return !0;
            }
            join() {
              if (!this.regions) return !1;
              for (var e of this.regions) {
                (e.join(), (e.parent = void 0));
                for (var t of e.objects) (this.objects.push(t), this.parentMap.set(t.value, this));
              }
              return !(this.regions = void 0);
            }
            generateRegions() {
              let e = [this.box.clone()];
              var t = this.box.getCenter(n);
              let i = e[0],
                r = i.clone();
              ((i.max.x = t.x), (r.min.x = t.x), e.push(r));
              for (let s = 0, a = e.length; s < a; s++)
                ((i = e[s]), (r = i.clone()), (i.max.y = t.y), (r.min.y = t.y), e.push(r));
              return e;
            }
          }),
        ));
    },
  };
});
