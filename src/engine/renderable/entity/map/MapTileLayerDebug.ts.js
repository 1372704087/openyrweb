// === Reconstructed SystemJS module: engine/renderable/entity/map/MapTileLayerDebug ===
// deps: ["game/Coords","game/theater/rampHeights","engine/gfx/SpriteUtils","game/type/SpeedType","util/disposable/CompositeDisposable","engine/gfx/BufferGeometryUtils","engine/IsoCoords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/map/MapTileLayerDebug",
  [
    "game/Coords",
    "game/theater/rampHeights",
    "engine/gfx/SpriteUtils",
    "game/type/SpeedType",
    "util/disposable/CompositeDisposable",
    "engine/gfx/BufferGeometryUtils",
    "engine/IsoCoords",
  ],
  function (e, t) {
    "use strict";
    var g, p, a, i, r, n, m, f;
    t && t.id;
    return {
      setters: [
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        e(
          "MapTileLayerDebug",
          (f = class f {
            constructor(e, t, i) {
              ((this._textureTilesNo = 20),
                (this.visible = !0),
                (this.needsLinesUpdate = !1),
                (this.disposables = new r.CompositeDisposable()),
                (this.handleTileOccupationChanged = () => (this.needsLinesUpdate = !0)),
                (this.map = e),
                (this.theater = t),
                (this.camera = i));
            }
            get3DObject() {
              return this.target;
            }
            create3DObject() {
              let t = this.get3DObject();
              if (!t) {
                if (
                  ((t = new THREE.Object3D()),
                  (t.name = "map_tile_layer_debug"),
                  (t.visible = this.visible),
                  (t.matrixAutoUpdate = !1),
                  this.visible)
                ) {
                  if (!this.tileOverlay) {
                    let e = (this.tileOverlay = this.createTileOverlay());
                    ((e.matrixAutoUpdate = !1), (e.frustumCulled = !1), t.add(e));
                  }
                  this.setupLines(t);
                }
                this.target = t;
              }
            }
            update() {
              this.needsLinesUpdate &&
                this.visible &&
                ((this.needsLinesUpdate = !1), this.destroyLines(), this.setupLines(this.target));
            }
            setVisible(e) {
              if (e !== this.visible && ((this.visible = e), this.target))
                if (((this.target.visible = e), this.visible)) {
                  if (!this.tileOverlay) {
                    let e = (this.tileOverlay = this.createTileOverlay());
                    ((e.matrixAutoUpdate = !1), this.target.add(e));
                  }
                  this.setupLines(this.target);
                } else this.destroyLines();
            }
            setupLines(e) {
              ((this.lines = new THREE.Object3D()),
                (this.lines.matrixAutoUpdate = !1),
                this.lines.add(this.createConnectivityLines(i.SpeedType.Foot, !1, 65280)));
              let t = this.createConnectivityLines(i.SpeedType.Float, !1, 255);
              ((t.position.y = 1),
                t.updateMatrix(),
                this.lines.add(t),
                e.add(this.lines),
                this.map.tileOccupation.onChange.subscribe(this.handleTileOccupationChanged));
            }
            destroyLines() {
              this.lines &&
                (this.target.remove(this.lines),
                (this.lines = void 0),
                this.map.tileOccupation.onChange.unsubscribe(this.handleTileOccupationChanged));
            }
            createTileOverlay() {
              let s = [],
                e = this.map.tiles;
              e.forEach((e) => {
                var t = g.Coords.tile3dToWorld(e.rx, e.ry, e.z + 1),
                  i = m.IsoCoords.getScreenTileSize();
                let r = a.SpriteUtils.createSpriteGeometry({
                  texture: this.getTileTexture(),
                  textureArea: { x: e.z * i.width, y: 2 * e.rampType * i.height, width: i.width, height: 2 * i.height },
                  align: { x: 0, y: -1 },
                  camera: this.camera,
                  scale: g.Coords.ISO_WORLD_SCALE,
                });
                (r.applyMatrix(new THREE.Matrix4().makeTranslation(t.x, t.y, t.z)), s.push(r));
              });
              var t = n.BufferGeometryUtils.mergeBufferGeometries(s),
                i = new THREE.MeshBasicMaterial({
                  map: this.getTileTexture(),
                  alphaTest: 0.5,
                  transparent: !0,
                  opacity: 0.7,
                  flatShading: !0,
                });
              return (this.disposables.add(t, i), new THREE.Mesh(t, i));
            }
            getTileTexture() {
              let t = f.textureCache;
              if (!t) {
                var n = m.IsoCoords.getScreenTileSize(),
                  o = this._textureTilesNo;
                let e = document.createElement("canvas"),
                  r = e.getContext("2d");
                if (!r) throw new Error("Could not acquire canvas 2d context");
                ((e.width = n.width * o), (e.height = 2 * n.height * p.rampHeights.length));
                let s = m.IsoCoords.tileToScreen(0, 0);
                s.x += -n.width / 2;
                var l = g.Coords.ISO_TILE_SIZE / 2;
                for (let a = 0; a < o; ++a)
                  for (let i = 0; i < p.rampHeights.length; ++i) {
                    var c = p.rampHeights[i],
                      h = [
                        [0, 1],
                        [0, 0],
                        [1, 0],
                        [1, 1],
                      ];
                    let e = 16711680 - (a << 11) - (a << 7);
                    r.beginPath();
                    var u = m.IsoCoords.tileToScreen.apply(this, h[0]);
                    r.moveTo(-s.x + u.x + a * n.width, -s.y + u.y + (1 - c[0]) * l + 2 * i * n.height);
                    for (let t = 1; t < h.length; ++t) {
                      var d = m.IsoCoords.tileToScreen.apply(this, h[t]);
                      r.lineTo(-s.x + d.x + a * n.width, -s.y + d.y + (1 - c[t]) * l + 2 * i * n.height);
                    }
                    (r.closePath(),
                      (r.lineWidth = 1),
                      (r.fillStyle = "#" + e.toString(16)),
                      r.fill(),
                      (r.strokeStyle = "#" + (16777215 - e).toString(16)),
                      r.stroke());
                  }
                ((t = new THREE.Texture(e)),
                  (t.minFilter = THREE.NearestFilter),
                  (t.magFilter = THREE.NearestFilter),
                  (t.needsUpdate = !0),
                  (f.textureCache = t));
              }
              return t;
            }
            createConnectivityLines(e, t, i) {
              let r = this.map.terrain.computePassabilityGraph(e, t),
                s = new THREE.Geometry(),
                a = new Set();
              r.forEachNode((e) => {
                let r = e;
                e.neighbors.forEach((e) => {
                  var t = e,
                    i = r.id + "->" + t.id;
                  a.has(i) ||
                    (a.add(i),
                    s.vertices.push(
                      g.Coords.tile3dToWorld(
                        r.data.tile.rx + 0.5,
                        r.data.tile.ry + 0.5,
                        r.data.tile.z + (r.data.onBridge?.tileElevation ?? 0),
                      ),
                      g.Coords.tile3dToWorld(
                        t.data.tile.rx + 0.5,
                        t.data.tile.ry + 0.5,
                        t.data.tile.z + (t.data.onBridge?.tileElevation ?? 0),
                      ),
                    ));
                });
              });
              var n = new THREE.LineBasicMaterial({ color: i, transparent: !0, depthTest: !1, depthWrite: !1 });
              let o = new THREE.LineSegments(s, n);
              return ((o.matrixAutoUpdate = !1), this.disposables.add(s, n), o);
            }
            onRemove() {
              this.lines && this.destroyLines();
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
