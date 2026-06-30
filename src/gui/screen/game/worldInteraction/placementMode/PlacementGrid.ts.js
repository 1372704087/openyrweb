// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/placementMode/PlacementGrid ===
// deps: ["game/Coords","game/theater/rampHeights","engine/gfx/OverlayUtils","util/geometry","engine/gfx/SpriteUtils","engine/IsoCoords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/placementMode/PlacementGrid",
  [
    "game/Coords",
    "game/theater/rampHeights",
    "engine/gfx/OverlayUtils",
    "util/geometry",
    "engine/gfx/SpriteUtils",
    "engine/IsoCoords",
  ],
  function (e, t) {
    "use strict";
    var u, d, a, n, s, g, p, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {
        ((g = THREE.Math.ceilPowerOfTwo),
          e(
            "PlacementGrid",
            (i = class {
              constructor(e, t, i) {
                ((this.viewModel = e), (this.camera = t), (this.mapTiles = i), (this.tileOverlays = new Map()));
              }
              get3DObject() {
                return this.target;
              }
              create3DObject() {
                let e = new THREE.Object3D();
                ((e.name = "placement_grid"), (this.target = e), this.createTileOverlays());
              }
              update() {
                if ((this.refreshRangeCircle(), this.viewModel.visible || !this.tilesObject)) {
                  let i = new THREE.Object3D();
                  i.visible = !0;
                  for (var r of this.viewModel.tiles) {
                    var s = this.mapTiles.getByMapCoords(r.rx, r.ry);
                    if (!s) throw new Error(`Map tile not found for coords (${r.rx}, ${r.ry})`);
                    let e = this.tileOverlays.get(s.rampType);
                    if (!e) throw new Error("Missing overlay mesh for rampType " + s.rampType);
                    let t = e.clone();
                    t.material = t.material.clone();
                    r = r.buildable ? (this.viewModel.showBusy ? 16776960 : 65280) : 16711680;
                    t.material.color.set(r);
                    s = this.getTilePosition(s);
                    (t.position.copy(s), i.add(t));
                  }
                  let e = this.get3DObject();
                  (e.remove(this.tilesObject), (this.tilesObject = i), e.add(i));
                } else this.tilesObject.visible = !1;
              }
              refreshRangeCircle() {
                if (this.viewModel.visible || !this.rangeObject) {
                  this.rangeObject && (this.rangeObject.visible = !0);
                  let e = this.get3DObject();
                  var t = this.viewModel.rangeIndicator;
                  if (t) {
                    if (
                      ((this.lastRangeCircle && t.radius === this.lastRangeCircle.radius) ||
                        ((s = a.OverlayUtils.createGroundCircle(
                          t.radius * u.Coords.getWorldTileSize(),
                          this.viewModel.rangeIndicatorColor,
                        )),
                        this.rangeObject && e.remove(this.rangeObject),
                        e.add(s),
                        (this.rangeObject = s)),
                      !this.lastRangeCircle || !n.pointEquals(t.center, this.lastRangeCircle.center))
                    ) {
                      var i = Math.floor(t.center.x),
                        r = Math.floor(t.center.y),
                        s = this.mapTiles.getByMapCoords(i, r);
                      if (!s) return void console.warn(`Map tile not found for coords (${i}, ${r})`);
                      let e = this.getTilePosition(s);
                      ((e.x += (t.center.x % 1) * u.Coords.getWorldTileSize()),
                        (e.z += (t.center.y % 1) * u.Coords.getWorldTileSize()),
                        this.rangeObject.position.copy(e));
                    }
                    this.lastRangeCircle = t;
                  } else
                    this.rangeObject &&
                      (e.remove(this.rangeObject), (this.rangeObject = void 0), (this.lastRangeCircle = void 0));
                } else this.rangeObject.visible = !1;
              }
              createTileOverlays() {
                for (let e = 0; e < d.rampHeights.length; ++e) this.tileOverlays.set(e, this.createTileOverlay(e));
              }
              createTileOverlay(e) {
                var t = p.IsoCoords.getScreenTileSize();
                let i = s.SpriteUtils.createSpriteGeometry({
                  texture: this.getTileOverlayTexture(),
                  textureArea: { x: 0, y: 2 * e * t.height, width: t.width, height: 2 * t.height },
                  align: { x: 0, y: -1 },
                  camera: this.camera,
                  scale: u.Coords.ISO_WORLD_SCALE,
                });
                i.applyMatrix(new THREE.Matrix4().makeTranslation(0, u.Coords.tileHeightToWorld(1), 0));
                t = new THREE.MeshBasicMaterial({
                  map: this.getTileOverlayTexture(),
                  alphaTest: 0.5,
                  transparent: !0,
                  opacity: 0.7,
                  flatShading: !0,
                  depthTest: !1,
                  depthWrite: !1,
                });
                let r = new THREE.Mesh(i, t);
                return ((r.renderOrder = 1e6), (r.frustumCulled = !1), r);
              }
              getTilePosition(e) {
                return u.Coords.tile3dToWorld(e.rx, e.ry, e.z);
              }
              getTileOverlayTexture() {
                let s = this.textureCache;
                if (!s) {
                  var a = p.IsoCoords.getScreenTileSize();
                  let e = document.createElement("canvas"),
                    t = e.getContext("2d");
                  if (!t) throw new Error("Couldn't acquire canvas 2d context");
                  ((e.width = g(a.width)), (e.height = g(2 * a.height * d.rampHeights.length)));
                  let i = p.IsoCoords.tileToScreen(0, 0);
                  i.x += -a.width / 2;
                  var n = u.Coords.ISO_TILE_SIZE / 2;
                  for (let r = 0; r < d.rampHeights.length; ++r) {
                    var o = d.rampHeights[r],
                      l = [
                        [0, 1],
                        [0, 0],
                        [1, 0],
                        [1, 1],
                      ];
                    t.beginPath();
                    var c = p.IsoCoords.tileToScreen(l[0][0], l[0][1]);
                    t.moveTo(-i.x + c.x, -i.y + c.y + (1 - o[0]) * n + 2 * r * a.height);
                    for (let e = 1; e < l.length; ++e) {
                      var h = p.IsoCoords.tileToScreen(l[e][0], l[e][1]);
                      t.lineTo(-i.x + h.x, -i.y + h.y + (1 - o[e]) * n + 2 * r * a.height);
                    }
                    (t.closePath(),
                      (t.lineWidth = 1),
                      (t.fillStyle = "#" + (16777215).toString(16)),
                      t.fill(),
                      (t.strokeStyle = "#" + (0).toString(16)),
                      t.stroke());
                  }
                  ((s = new THREE.Texture(e)), (s.needsUpdate = !0), (this.textureCache = s));
                }
                return s;
              }
              dispose() {
                this.tileOverlays.forEach((e) => {
                  (e.material.dispose(), e.geometry.dispose());
                });
              }
            }),
          ));
      },
    };
  },
);
