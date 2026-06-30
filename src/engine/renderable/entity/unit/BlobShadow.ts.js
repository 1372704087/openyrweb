// === Reconstructed SystemJS module: engine/renderable/entity/unit/BlobShadow ===
// deps: ["game/Coords","game/gameobject/unit/ZoneType","game/gameobject/infantry/StanceType","engine/gfx/batch/BatchedMesh"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/unit/BlobShadow",
  [
    "game/Coords",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/infantry/StanceType",
    "engine/gfx/batch/BatchedMesh",
  ],
  function (e, t) {
    "use strict";
    var n, o, l, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        (e(
          "BlobShadow",
          (r = class r {
            constructor(e, t, i) {
              ((this.gameObject = e), (this.radius = t), (this.useMeshInstancing = i));
            }
            get3DObject() {
              return this.obj;
            }
            create3DObject() {
              if (!this.obj) {
                let e = r.geometries.get(this.radius);
                (e ||
                  ((e = new THREE.CircleBufferGeometry(this.radius * n.Coords.ISO_WORLD_SCALE)),
                  r.geometries.set(this.radius, e)),
                  (this.obj = new (this.useMeshInstancing ? i.BatchedMesh : THREE.Mesh)(e, r.mat)),
                  (this.obj.rotation.x = -Math.PI / 2),
                  (this.obj.matrixAutoUpdate = !1));
              }
            }
            update(e, t) {
              let i = this.obj;
              var r,
                s,
                a =
                  this.gameObject.zone === o.ZoneType.Air ||
                  (this.gameObject.isInfantry() && this.gameObject.stance === l.StanceType.Paradrop);
              (i.visible = a) &&
                ((r = this.gameObject.tile.z),
                (s = this.gameObject.tileElevation),
                (a = !!this.gameObject.tile.onBridgeLandType),
                (r === this.lastTileZ && s === this.lastTileElevation && a === this.lastBridgeBelow) ||
                  ((this.lastTileZ = r),
                  (this.lastTileElevation = s),
                  (this.lastBridgeBelow = a),
                  (a = this.gameObject.position.getBridgeBelow()),
                  (i.position.y =
                    n.Coords.tileHeightToWorld(-s) +
                    (a ? n.Coords.tileHeightToWorld(a.tileElevation) + 0.01 * n.Coords.ISO_WORLD_SCALE : 0)),
                  i.updateMatrix()));
            }
            dispose() {}
          }),
        ),
          (r.geometries = new Map()),
          (r.mat = new THREE.MeshBasicMaterial({ color: 0, transparent: !0, opacity: 0.5, alphaTest: 0 })));
      },
    };
  },
);
