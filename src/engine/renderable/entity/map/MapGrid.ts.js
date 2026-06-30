// === Reconstructed SystemJS module: engine/renderable/entity/map/MapGrid ===
// deps: ["game/Coords","engine/IsoCoords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/map/MapGrid", ["game/Coords", "engine/IsoCoords"], function (e, t) {
  "use strict";
  var o, l, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
      function (e) {
        l = e;
      },
    ],
    execute: function () {
      e(
        "MapGrid",
        (i = class {
          constructor(e) {
            ((this.size = e), this.build());
          }
          build() {
            var e = this.size,
              t = o.Coords.getWorldTileSize(),
              i = l.IsoCoords.screenTileToWorld(0, 0),
              r = l.IsoCoords.screenTileToWorld(e.width, e.height),
              s = l.IsoCoords.screenTileToWorld(0, e.height),
              e = l.IsoCoords.screenTileToWorld(e.width, 0),
              i = r.x - i.x,
              s = s.y - e.y,
              e = new THREE.PlaneGeometry(i, s, i / t, s / t),
              t = new THREE.MeshBasicMaterial({ color: 9474192, wireframe: !0, side: THREE.DoubleSide });
            let a = new THREE.Mesh(e, t);
            ((a.matrixAutoUpdate = !1), (a.rotation.x = Math.PI / 2), a.updateMatrix());
            let n = new THREE.Object3D();
            ((n.matrixAutoUpdate = !1),
              n.add(a),
              (n.position.x = i / 2),
              (n.position.z = s / 2),
              (n.position.y = -1 * o.Coords.ISO_WORLD_SCALE),
              n.updateMatrix(),
              (this.target = n));
          }
          get3DObject() {
            return this.target;
          }
          create3DObject() {}
          update() {}
        }),
      );
    },
  };
});
