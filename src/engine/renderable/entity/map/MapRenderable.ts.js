// === Reconstructed SystemJS module: engine/renderable/entity/map/MapRenderable ===
// deps: ["engine/renderable/entity/map/MapTileLayer","engine/renderable/entity/map/MapTileLayerDebug","engine/renderable/entity/map/MapSurface","engine/renderable/entity/map/MapBounds","engine/renderable/entity/map/MapShroudLayer","engine/renderable/builder/ShpAggregator","engine/renderable/entity/map/MapSpriteBatchLayer","game/map/BridgeOverlayTypes"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/map/MapRenderable",
  [
    "engine/renderable/entity/map/MapTileLayer",
    "engine/renderable/entity/map/MapTileLayerDebug",
    "engine/renderable/entity/map/MapSurface",
    "engine/renderable/entity/map/MapBounds",
    "engine/renderable/entity/map/MapShroudLayer",
    "engine/renderable/builder/ShpAggregator",
    "engine/renderable/entity/map/MapSpriteBatchLayer",
    "game/map/BridgeOverlayTypes",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
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
          c = e;
        },
      ],
      execute: function () {
        e(
          "MapRenderable",
          (h = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d) {
              ((this.gameObj = e),
                (this.mapShroud = t),
                (this.mapRadiation = i),
                (this.lighting = r),
                (this.theater = s),
                (this.rules = a),
                (this.art = n),
                (this.imageFinder = o),
                (this.camera = l),
                (this.debugWireframe = c),
                (this.gameSpeed = h),
                (this.worldSound = u),
                (this.useSpriteBatching = d),
                (this.lastDebugValue = !1),
                (this.invalidatedRadTiles = new Set()),
                (this.radTileLights = new Map()),
                (this.handleRadChange = (e) => {
                  for (var t of e) this.invalidatedRadTiles.add(t);
                }),
                (this._objects = []),
                this.init());
            }
            get3DObject() {
              return this.target;
            }
            getGameObject() {
              return this.gameObj;
            }
            init() {
              var e = this.getGameObject();
              ((this.tileLayer = new i.MapTileLayer(
                e,
                this.theater,
                this.art,
                this.imageFinder,
                this.camera,
                this.debugWireframe,
                this.gameSpeed,
                this.worldSound,
                this.lighting,
                this.useSpriteBatching,
              )),
                this.addObject(this.tileLayer),
                (this.debugLayer = new r.MapTileLayerDebug(e, this.theater, this.camera)),
                this.debugLayer.setVisible(!1),
                this.addObject(this.debugLayer),
                (this.mapSurface = new s.MapSurface(e, this.theater)),
                this.addObject(this.mapSurface),
                (this.mapBounds = new a.MapBounds(e)),
                this.mapBounds.setVisible(!1),
                this.mapShroud &&
                  ((this.shroudLayer = new n.MapShroudLayer(this.mapShroud, this.imageFinder, this.camera)),
                  this.addObject(this.shroudLayer)),
                this.addObject(this.mapBounds));
              e = new o.ShpAggregator();
              ((this.terrainLayer = new l.MapSpriteBatchLayer(
                "map_terrain_layer",
                [...this.rules.terrainRules.values()].filter(
                  (e) => !e.isAnimated && this.art.hasObject(e.name, e.type),
                ),
                () => !1,
                this.theater,
                this.art,
                this.imageFinder,
                this.camera,
                this.lighting,
                e,
              )),
                this.addObject(this.terrainLayer),
                (this.overlayLayer = new l.MapSpriteBatchLayer(
                  "map_overlay_layer",
                  [...this.rules.overlayRules.values()].filter(
                    (e) =>
                      this.art.hasObject(e.name, e.type) &&
                      !c.BridgeOverlayTypes.isBridge(this.rules.getOverlayId(e.name)),
                  ),
                  (e) => e.rules.wall,
                  this.theater,
                  this.art,
                  this.imageFinder,
                  this.camera,
                  this.lighting,
                  e,
                )),
                this.addObject(this.overlayLayer),
                (this.smudgeLayer = new l.MapSpriteBatchLayer(
                  "map_smudge_layer",
                  [...this.rules.smudgeRules.values()].filter((e) => this.art.hasObject(e.name, e.type)),
                  () => !1,
                  this.theater,
                  this.art,
                  this.imageFinder,
                  this.camera,
                  this.lighting,
                  e,
                )),
                this.addObject(this.smudgeLayer),
                this.mapRadiation.onChange.subscribe(this.handleRadChange));
            }
            setShroud(e) {
              e !== this.mapShroud &&
                (!e &&
                  this.shroudLayer &&
                  (this.removeObject(this.shroudLayer), this.shroudLayer.dispose(), (this.shroudLayer = void 0)),
                (this.mapShroud = e),
                this.mapShroud &&
                  (this.shroudLayer
                    ? this.shroudLayer.setShroud(this.mapShroud)
                    : ((this.shroudLayer = new n.MapShroudLayer(this.mapShroud, this.imageFinder, this.camera)),
                      this.addObject(this.shroudLayer))));
            }
            addObject(e) {
              (this._objects.push(e), this.target && (e.create3DObject(), this.target.add(e.get3DObject())));
            }
            removeObject(e) {
              var t = this._objects.indexOf(e);
              -1 !== t &&
                (this._objects.splice(t, 1), this.target && e.get3DObject() && this.target.remove(e.get3DObject()));
            }
            create3DObject() {
              let i = this.get3DObject();
              if (!i) {
                ((i = new THREE.Object3D()), (i.name = "map"), (i.matrixAutoUpdate = !1), (this.target = i));
                for (let e = 0, t = this._objects.length; e < t; ++e)
                  (this._objects[e].create3DObject(), i.add(this._objects[e].get3DObject()));
              }
            }
            update(t, i) {
              if (
                (this.create3DObject(),
                this.debugWireframe.value !== this.lastDebugValue &&
                  ((this.lastDebugValue = this.debugWireframe.value),
                  this.debugLayer.setVisible(this.debugWireframe.value),
                  this.mapBounds.setVisible(this.debugWireframe.value)),
                this._objects.forEach((e) => e.update(t, i)),
                this.invalidatedRadTiles.size)
              ) {
                for (var e of this.invalidatedRadTiles) {
                  var r,
                    s = this.mapRadiation.getRadLevel(e);
                  s
                    ? ((r = Math.min(1, s / this.rules.radiation.radLevelMax)),
                      this.radTileLights.has(e) && this.lighting.removeTileLight(e, this.radTileLights.get(e)),
                      (s = this.rules.radiation.radColor),
                      (r = {
                        intensity: this.rules.radiation.radLightFactor * r,
                        red: (s[0] / 255) * r,
                        green: (s[1] / 255) * r,
                        blue: (s[2] / 255) * r,
                      }),
                      this.lighting.addTileLight(e, r),
                      this.radTileLights.set(e, r))
                    : (this.lighting.removeTileLight(e, this.radTileLights.get(e)), this.radTileLights.delete(e));
                }
                (this.lighting.forceUpdate([...this.invalidatedRadTiles]), this.invalidatedRadTiles.clear());
              }
            }
            updateLighting(e) {
              (this.tileLayer.updateLighting(e),
                this.terrainLayer.updateLighting(),
                this.overlayLayer.updateLighting(),
                this.smudgeLayer.updateLighting());
            }
            dispose() {
              (this.mapRadiation.onChange.unsubscribe(this.handleRadChange),
                this.tileLayer.dispose(),
                this.debugLayer.dispose(),
                this.terrainLayer.dispose(),
                this.overlayLayer.dispose(),
                this.smudgeLayer.dispose(),
                this.shroudLayer?.dispose(),
                this.mapBounds.dispose(),
                this.mapSurface.dispose());
            }
          }),
        );
      },
    };
  },
);
