// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/placementMode/PlacementGrid ===
// deps: ["game/Coords","game/theater/rampHeights","engine/gfx/OverlayUtils","util/geometry","engine/gfx/SpriteUtils","engine/IsoCoords","extensions/ExtensionHost","data/ShpFile","engine/Engine"]
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
    "extensions/ExtensionHost",
    "data/ShpFile",
    "engine/Engine",
  ],
  function (e, t) {
    "use strict";
    var u, d, a, n, s, g, p, i, b, j, k;
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
        function (e) {
          b = e;
        },
        function (e) {
          j = e;
        },
        function (e) {
          k = e;
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
                    // 状态 → 预烘焙纹理(绿=可放/黄=占用可放/红=不可放),
                    // 半透明填充与亮边已烘进纹理,材质保持白色不调色。
                    var l = r.buildable ? (this.viewModel.showBusy ? "yellow" : "green") : "red";
                    t.material.map = this.getTileOverlayTextures()[l];
                    t.material.needsUpdate = !0;
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
                  texture: this.getTileOverlayTextures().green,
                  textureArea: { x: 0, y: 2 * e * t.height, width: t.width, height: 2 * t.height },
                  align: { x: 0, y: -1 },
                  camera: this.camera,
                  scale: u.Coords.ISO_WORLD_SCALE,
                });
                i.applyMatrix(new THREE.Matrix4().makeTranslation(0, u.Coords.tileHeightToWorld(1), 0));
                t = new THREE.MeshBasicMaterial({
                  map: this.getTileOverlayTextures().green,
                  alphaTest: 0.05,
                  transparent: !0,
                  opacity: 1,
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
              // 状态→纹理(绿/红/黄各一张同布局高图)。自绘模式采用半透明填充 +
              // 同色系亮边(对齐 gamemd-master C++ 版 BuildingPlacement::Draw:
              // fill 60,220,60 / 230,60,60 @α0.43;edge 140,255,140 / 255,120,120
              // @α0.82;线宽 1.5)。placeex「使用 place.shp」开启时改用游戏资源
              // place.shp 原版菱形(纯色 α0.7、无描边)。纹理生成后缓存,开关对
              // 新一局生效。
              getTileOverlayTextures() {
                if (!this.textureCache) {
                  var a = p.IsoCoords.getScreenTileSize(),
                    m2 = [
                      ["green", [60, 220, 60], [140, 255, 140]],
                      ["red", [230, 60, 60], [255, 120, 120]],
                      ["yellow", [220, 220, 60], [255, 255, 140]],
                    ];
                  // placeex「使用 place.shp」:开启时用游戏资源 place.shp 的原版
                  // 菱形色块(纯色、无描边);place.shp 缺失或解码失败时回退到
                  // 自绘菱形。解码一次,三态各自着色。
                  let v = null;
                  if (
                    k.Engine.vfs &&
                    k.Engine.vfs.fileExists("place.shp") &&
                    b.ExtensionHost.isFeatureEnabled("placeex", "usePlaceShp")
                  ) {
                    try {
                      v = new j.ShpFile(k.Engine.vfs.openFile("place.shp")).getImage(0);
                      if (v && (v.width <= 0 || v.height <= 0)) v = null;
                    } catch (e) {
                      (console.warn("[PlacementGrid] place.shp unavailable, using procedural grid", e),
                        (v = null));
                    }
                  }
                  this.textureCache = {};
                  for (var [w2, y2, x2] of m2) {
                    let e = document.createElement("canvas"),
                      t = e.getContext("2d");
                    if (!t) throw new Error("Couldn't acquire canvas 2d context");
                    ((e.width = g(a.width)), (e.height = g(2 * a.height * d.rampHeights.length)));
                    let i = p.IsoCoords.tileToScreen(0, 0);
                    i.x += -a.width / 2;
                    var n = u.Coords.ISO_TILE_SIZE / 2;
                    // shp 形状画布:按本状态着色,原版透明度 α0.7、无描边
                    let f = null;
                    if (v) {
                      f = document.createElement("canvas");
                      ((f.width = v.width), (f.height = v.height));
                      let e = f.getContext("2d");
                      if (e) {
                        let t = e.createImageData(v.width, v.height);
                        for (let e = 0; e < v.imageData.length; ++e)
                          v.imageData[e] &&
                            ((t.data[4 * e] = y2[0]),
                              (t.data[4 * e + 1] = y2[1]),
                              (t.data[4 * e + 2] = y2[2]),
                              (t.data[4 * e + 3] = 178));
                        e.putImageData(t, 0, 0);
                      } else f = null;
                    }
                    for (let r = 0; r < d.rampHeights.length; ++r) {
                      if (f) {
                        // shp 帧在 2×格高的槽位带内垂直居中(各坡度复用同一
                        // 原版形状,与 VERA20K 的简化一致)
                        t.drawImage(
                          f,
                          Math.round((a.width - f.width) / 2),
                          Math.round((2 * a.height - f.height) / 2) + 2 * r * a.height,
                        );
                        continue;
                      }
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
                      // 半透明填充 + 同色系亮边 1.5px
                      (t.closePath(),
                        (t.lineWidth = 1.5),
                        (t.fillStyle = "rgba(" + y2[0] + "," + y2[1] + "," + y2[2] + ",0.43)"),
                        t.fill(),
                        (t.strokeStyle = "rgba(" + x2[0] + "," + x2[1] + "," + x2[2] + ",0.82)"),
                        t.stroke());
                    }
                    var T = new THREE.Texture(e);
                    (T.needsUpdate = !0), (this.textureCache[w2] = T);
                  }
                }
                return this.textureCache;
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
