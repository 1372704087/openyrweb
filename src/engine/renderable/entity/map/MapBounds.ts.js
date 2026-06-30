// === Reconstructed SystemJS module: engine/renderable/entity/map/MapBounds ===
// deps: ["engine/IsoCoords","engine/renderable/WithVisibility","util/disposable/CompositeDisposable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/map/MapBounds",
  ["engine/IsoCoords", "engine/renderable/WithVisibility", "util/disposable/CompositeDisposable"],
  function (e, t) {
    "use strict";
    var h, i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          h = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e(
          "MapBounds",
          (s = class {
            constructor(e) {
              ((this.map = e),
                (this.withVisibility = new i.WithVisibility()),
                (this.disposables = new r.CompositeDisposable()));
              let t = () => {
                this.target &&
                  this.wrapperObj &&
                  (this.target.remove(this.wrapperObj),
                  (this.wrapperObj = this.build()),
                  this.target.add(this.wrapperObj));
              };
              (e.mapBounds.onLocalResize.subscribe(t),
                this.disposables.add(() => e.mapBounds.onLocalResize.unsubscribe(t)));
            }
            build() {
              var e = this.map.mapBounds.getClampedFullSize(),
                t = this.map.mapBounds.getLocalSize();
              let i = this.createBoundRect({ x: e.x, y: e.y }, { x: e.x + e.width, y: e.y + e.height }, 16711680);
              i.matrixAutoUpdate = !1;
              let r = this.createBoundRect({ x: t.x, y: t.y }, { x: t.x + t.width, y: t.y + t.height - 1 }, 255);
              r.matrixAutoUpdate = !1;
              let s = new THREE.Object3D();
              return ((s.matrixAutoUpdate = !1), s.add(i), s.add(r), s);
            }
            createBoundRect(e, t, i) {
              var r = h.IsoCoords.screenTileToWorld(e.x, e.y),
                s = h.IsoCoords.screenTileToWorld(t.x, t.y),
                a = h.IsoCoords.screenTileToWorld(t.x, e.y),
                n = h.IsoCoords.screenTileToWorld(e.x, t.y),
                o = new THREE.LineBasicMaterial({ color: i, transparent: !0, depthTest: !1, depthWrite: !1 });
              let l = new THREE.Geometry();
              (l.vertices.push(
                new THREE.Vector3(r.x, 0, r.y),
                new THREE.Vector3(n.x, 0, n.y),
                new THREE.Vector3(s.x, 0, s.y),
                new THREE.Vector3(a.x, 0, a.y),
                new THREE.Vector3(r.x, 0, r.y),
              ),
                this.disposables.add(l, o));
              let c = new THREE.Line(l, o);
              return ((c.renderOrder = 1e6), c);
            }
            get3DObject() {
              return this.target;
            }
            create3DObject() {
              if (!this.target) {
                let e = new THREE.Object3D();
                ((e.matrixAutoUpdate = !1),
                  (e.name = "map_bounds"),
                  (e.visible = this.withVisibility.isVisible()),
                  (this.target = e),
                  !this.wrapperObj &&
                    e.visible &&
                    ((this.wrapperObj = this.build()), this.target.add(this.wrapperObj)));
              }
            }
            update() {}
            setVisible(e) {
              e !== this.withVisibility.isVisible() &&
                (this.withVisibility.setVisible(e),
                this.target &&
                  ((this.target.visible = e)
                    ? (this.wrapperObj || (this.wrapperObj = this.build()), this.target.add(this.wrapperObj))
                    : this.wrapperObj && this.target.remove(this.wrapperObj)));
            }
            dispose() {
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
