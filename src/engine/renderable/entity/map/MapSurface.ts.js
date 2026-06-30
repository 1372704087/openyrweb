// === Reconstructed SystemJS module: engine/renderable/entity/map/MapSurface ===
// deps: ["game/Coords","game/theater/rampHeights","engine/gfx/BufferGeometryUtils","util/disposable/CompositeDisposable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/map/MapSurface",
  ["game/Coords", "game/theater/rampHeights", "engine/gfx/BufferGeometryUtils", "util/disposable/CompositeDisposable"],
  function (e, t) {
    "use strict";
    var a, s, n, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        (e("MAGIC_OFFSET", 0.05),
          e(
            "MapSurface",
            (r = class {
              constructor(e, t) {
                ((this.visible = !0),
                  (this.disposables = new i.CompositeDisposable()),
                  (this.map = e),
                  (this.theater = t));
              }
              get3DObject() {
                return this.target;
              }
              create3DObject() {
                let e = this.get3DObject();
                e ||
                  ((e = this.createObject()),
                  (e.name = "map_surface_shadow"),
                  (e.matrixAutoUpdate = !1),
                  (e.visible = this.visible),
                  (this.target = e));
              }
              update() {}
              setVisible(e) {
                ((this.visible = e), this.target && (this.target.visible = e));
              }
              createObject() {
                let r = [],
                  e = this.map.tiles;
                e.forEach((e) => {
                  var t = a.Coords.tile3dToWorld(e.rx, e.ry, e.z);
                  let i = this.createRectGeometry(e.rampType);
                  (i.applyMatrix(new THREE.Matrix4().makeTranslation(t.x, t.y + 0.05, t.z)), r.push(i));
                });
                var t = n.BufferGeometryUtils.mergeBufferGeometries(r);
                let i = new THREE.ShadowMaterial();
                ((i.transparent = !0), (i.opacity = 0.5));
                let s = new THREE.Mesh(t, i);
                return (
                  (s.receiveShadow = !0),
                  (s.renderOrder = 5),
                  (s.frustumCulled = !1),
                  this.disposables.add(t, i),
                  s
                );
              }
              createRectGeometry(e) {
                var t = a.Coords.getWorldTileSize(),
                  i = s.rampHeights[e];
                let r = new THREE.BufferGeometry();
                ((t = new Float32Array([
                  0,
                  a.Coords.tileHeightToWorld(i[0]),
                  t,
                  t,
                  a.Coords.tileHeightToWorld(i[3]),
                  t,
                  0,
                  a.Coords.tileHeightToWorld(i[1]),
                  0,
                  t,
                  a.Coords.tileHeightToWorld(i[2]),
                  0,
                ])),
                  (i = new Uint16Array([0, 1, 2, 3, 2, 1])));
                return (
                  r.addAttribute("position", new THREE.BufferAttribute(t, 3)),
                  r.setIndex(new THREE.BufferAttribute(i, 1)),
                  r
                );
              }
              dispose() {
                this.disposables.dispose();
              }
            }),
          ));
      },
    };
  },
);
