// === Reconstructed SystemJS module: engine/renderable/entity/SecureProgressSprite ===
// deps: ["engine/gfx/CanvasUtils","engine/gfx/SpriteUtils","game/Coords","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/SecureProgressSprite",
  ["engine/gfx/CanvasUtils", "engine/gfx/SpriteUtils", "game/Coords", "util/math"],
  function (e, t) {
    "use strict";
    var n, a, o, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        (0,
          0,
          e(
            "SecureProgressSprite",
            (r = class {
              constructor(e, t, i, r, s) {
                ((this.building = e),
                  (this.camera = t),
                  (this.viewer = i),
                  (this.alliances = r),
                  (this.selectionModel = s));
              }
              get3DObject() {
                return this.mesh;
              }
              create3DObject() {
                if (!this.mesh) {
                  let e = document.createElement("canvas");
                  ((e.width = 90), (e.height = 26), (this.ctx = e.getContext("2d", { alpha: !0 })));
                  let t = (this.texture = new THREE.Texture(e));
                  ((t.minFilter = THREE.NearestFilter), (t.magFilter = THREE.NearestFilter), (t.flipY = !0));
                  var r = a.SpriteUtils.createSpriteGeometry({
                      texture: t,
                      camera: this.camera,
                      align: { x: 1, y: -1 },
                      offset: { x: -Math.floor(45), y: -Math.floor(13) },
                      scale: o.Coords.ISO_WORLD_SCALE,
                    }),
                    s = new THREE.MeshBasicMaterial({
                      map: t,
                      side: THREE.DoubleSide,
                      transparent: !0,
                      depthTest: !1,
                      flatShading: !0,
                    });
                  let i = (this.mesh = new THREE.Mesh(r, s));
                  ((i.matrixAutoUpdate = !1),
                    (i.visible = !1),
                    (i.position.x = (o.Coords.getWorldTileSize() * this.building.art.foundation.width) / 2),
                    (i.position.y = o.Coords.tileHeightToWorld((this.building.art.height + 1) / 2)),
                    (i.position.z = (o.Coords.getWorldTileSize() * this.building.art.foundation.height) / 2),
                    i.updateMatrix());
                }
              }
              update(e) {
                if (this.mesh && this.ctx && this.texture) {
                  var t = this.computeKey();
                  if (!t) return ((this.lastKey = void 0), void (this.mesh.visible = !1));
                  this.lastKey !== t && ((this.lastKey = t), this.redraw(), (this.texture.needsUpdate = !0));
                  var i = this.viewer.value,
                    t = this.building.secureProgressTrait?.getSecuringPlayer();
                  ((this.mesh.renderOrder = i && t && this.alliances.haveSharedIntel(i, t) ? 999999 : 999998),
                    (this.mesh.visible = !0));
                }
              }
              computeKey() {
                let e = this.building.secureProgressTrait,
                  t = e?.getSecuringPlayer();
                if (e?.isActive() && t) {
                  var i = this.selectionModel.isHovered();
                  return [t.name, t.color.asHex(), this.getFillWidth(e.getProgress()), i ? 1 : 0].join("_");
                }
              }
              redraw() {
                let e = this.ctx,
                  t = this.building.secureProgressTrait,
                  i = t?.getSecuringPlayer();
                var r, s, a;
                e &&
                  t?.isActive() &&
                  i &&
                  ((r = i.color.asHexString()),
                  (s = this.getFillWidth(t.getProgress())),
                  (a = this.selectionModel.isHovered()),
                  e.clearRect(0, 0, 90, 26),
                  (e.fillStyle = "rgba(0, 0, 0, 0.75)"),
                  a
                    ? (e.fillRect(0, 0, 90, 26),
                      n.CanvasUtils.drawText(e, i.name, 0, 0, {
                        color: r,
                        fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
                        fontSize: 10,
                        fontWeight: "500",
                        textAlign: "center",
                        width: 90,
                        paddingTop: 4,
                      }))
                    : e.fillRect(4, 15, 82, 9),
                  (e.fillStyle = "rgba(15, 15, 15, 0.95)"),
                  e.fillRect(6, 17, 78, 5),
                  (e.fillStyle = r),
                  e.fillRect(5, 16, 80, 1),
                  e.fillRect(5, 22, 80, 1),
                  e.fillRect(5, 17, 1, 5),
                  e.fillRect(84, 17, 1, 5),
                  0 < s && e.fillRect(7, 18, s, 3));
              }
              getFillWidth(e) {
                return i.clamp(Math.ceil(76 * e), 1, 76);
              }
              dispose() {
                (this.texture?.dispose(), this.mesh?.material?.dispose(), this.mesh?.geometry.dispose());
              }
            }),
          ));
      },
    };
  },
);
