// === Reconstructed SystemJS module: gui/screen/game/component/Minimap ===
// deps: ["gui/UiObject","engine/gfx/SpriteUtils","util/geometry","engine/renderable/entity/map/MinimapRenderer","engine/util/MapTileIntersectHelper","engine/IsoCoords","util/disposable/CompositeDisposable","util/event","game/event/EventType","gui/screen/game/component/MinimapPing","game/rules/general/RadarRules","engine/renderable/entity/map/MinimapModel","game/GameSpeed"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/Minimap",
  [
    "gui/UiObject",
    "engine/gfx/SpriteUtils",
    "util/geometry",
    "engine/renderable/entity/map/MinimapRenderer",
    "engine/util/MapTileIntersectHelper",
    "engine/IsoCoords",
    "util/disposable/CompositeDisposable",
    "util/event",
    "game/event/EventType",
    "gui/screen/game/component/MinimapPing",
    "game/rules/general/RadarRules",
    "engine/renderable/entity/map/MinimapModel",
    "game/GameSpeed",
  ],
  function (e, t) {
    "use strict";
    var i, n, a, o, r, l, s, c, h, u, d, g, p, m, f;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
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
          r = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {
        ((m = new Map([
          [d.RadarEventType.EnemyObjectSensed, { high: 16776960, low: 8684544 }],
          [d.RadarEventType.GenericNonCombat, { high: 65535, low: 33924 }],
        ])),
          (f = class extends i.UiObject {
            get onClick() {
              return this._onClick.asEvent();
            }
            get onRightClick() {
              return this._onRightClick.asEvent();
            }
            get onMouseOver() {
              return this._onMouseOver.asEvent();
            }
            get onMouseMove() {
              return this._onMouseMove.asEvent();
            }
            get onMouseOut() {
              return this._onMouseOut.asEvent();
            }
            constructor(e, t, i, r) {
              (super(new THREE.Object3D()),
                (this.game = e),
                (this.localPlayer = t),
                (this.borderColor = i),
                (this.radarRules = r),
                (this.disposables = new s.CompositeDisposable()),
                (this.tilesForRecalc = new Set()),
                (this.tilesForRedraw = new Set()),
                (this.needsFullRedraw = !1),
                (this.pings = []),
                (this._onClick = new c.EventDispatcher()),
                (this._onRightClick = new c.EventDispatcher()),
                (this._onMouseOver = new c.EventDispatcher()),
                (this._onMouseMove = new c.EventDispatcher()),
                (this._onMouseOut = new c.EventDispatcher()),
                (this.handleTileUpdate = ({ tiles: e }) => {
                  e.forEach((e) => {
                    (this.tilesForRecalc.add(e), this.tilesForRedraw.add(e));
                  });
                }),
                (this.handleShroudUpdate = (e, i) => {
                  "incremental" === e.type
                    ? e.coords.forEach((e) => {
                        var t;
                        for (t of i.findTilesAtShroudCoords(e, this.map.tiles)) this.tilesForRedraw.add(t);
                      })
                    : (this.needsFullRedraw = !0);
                }),
                (this.handleObjectChange = (e) => {
                  e.target.isSpawned &&
                    this.map.tileOccupation.calculateTilesForGameObject(e.target.tile, e.target).forEach((e) => {
                      (this.tilesForRecalc.add(e), this.tilesForRedraw.add(e));
                    });
                }),
                (this.handleRadarEvent = (t) => {
                  if (t.target === this.localPlayer) {
                    var i = this.minimapRenderer.dxyToCanvas(t.tile.dx, t.tile.dy),
                      r = m.get(t.radarEventType);
                    let e = new u.MinimapPing(this.radarRules, r?.high ?? 16711935, r?.low ?? 8650884);
                    (e.setPosition(this.wrapperObj.position.x + i.x, this.wrapperObj.position.y + i.y),
                      this.pings.push({
                        obj: e,
                        startTime: void 0,
                        duration: this.radarRules.getEventVisibilityDuration(t.radarEventType),
                      }));
                  }
                }),
                (this.shroud = this.localPlayer && e.mapShroudTrait.getPlayerShroud(this.localPlayer)),
                (this.minimapModel = new g.MinimapModel(
                  e.map.tiles,
                  e.map.tileOccupation,
                  this.shroud,
                  this.localPlayer,
                  this.game.alliances,
                  this.game.rules.general.paradrop,
                )));
            }
            get map() {
              return this.game.map;
            }
            setFitSize(e) {
              var t = this.fitSize;
              ((this.fitSize = e).width === t?.width && e.height === t?.height) || this.forceRerender();
            }
            forceRerender() {
              var e, t, i, r;
              this.wrapperObj &&
                this.fitSize &&
                (this.get3DObject().remove(this.wrapperObj),
                this.destroyMesh(),
                ({ mesh: e, texture: t, wrapperObj: i, canvasLayoutSize: r } = this.renderMinimap(this.fitSize)),
                (this.mesh = e),
                (this.texture = t),
                (this.wrapperObj = i),
                (this.size = r),
                this.get3DObject().add(i),
                this.setupListeners(this.mesh),
                (this.lastViewport = void 0));
            }
            initWorld(e) {
              ((this.worldScene = e), (this.mapTileIntersectHelper = new r.MapTileIntersectHelper(this.map, e)));
            }
            changeLocalPlayer(e) {
              ((this.localPlayer = e),
                this.shroud?.onChange.unsubscribe(this.handleShroudUpdate),
                (this.shroud = this.localPlayer && this.game.mapShroudTrait.getPlayerShroud(this.localPlayer)),
                this.shroud?.onChange.subscribe(this.handleShroudUpdate),
                (this.minimapModel = new g.MinimapModel(
                  this.game.map.tiles,
                  this.game.map.tileOccupation,
                  this.shroud,
                  this.localPlayer,
                  this.game.alliances,
                  this.game.rules.general.paradrop,
                )),
                this.forceRerender());
            }
            create3DObject() {
              if ((super.create3DObject(), !this.mesh)) {
                var e = this.fitSize;
                if (!e) throw new Error("setFitSize must be called before first render");
                var { mesh: t, texture: i, wrapperObj: r, canvasLayoutSize: e } = this.renderMinimap(e);
                ((this.mesh = t),
                  (this.texture = i),
                  (this.wrapperObj = r),
                  (this.size = e),
                  this.get3DObject().add(r),
                  this.setupListeners(this.mesh),
                  this.map.tileOccupation.onChange.subscribe(this.handleTileUpdate),
                  this.disposables.add(() => this.map.tileOccupation.onChange.unsubscribe(this.handleTileUpdate)),
                  this.shroud?.onChange.subscribe(this.handleShroudUpdate),
                  this.disposables.add(
                    this.game.events.subscribe(h.EventType.ObjectOwnerChange, this.handleObjectChange),
                    this.game.events.subscribe(h.EventType.ObjectDisguiseChange, this.handleObjectChange),
                    this.game.events.subscribe(h.EventType.ObjectDestroy, (e) => {
                      var t;
                      !e.target.isBuilding() ||
                        ((t = e.target).rules.leaveRubble &&
                          this.map.tileOccupation.calculateTilesForGameObject(t.tile, t).forEach((e) => {
                            (this.tilesForRecalc.add(e), this.tilesForRedraw.add(e));
                          }));
                    }),
                    this.game.events.subscribe(h.EventType.RadarEvent, this.handleRadarEvent),
                  ));
              }
            }
            renderMinimap(e) {
              ((this.minimapRenderer = new o.MinimapRenderer(this.map, this.minimapModel, e, this.borderColor, 2)),
                this.minimapModel.computeAllColors());
              var t = this.minimapRenderer.renderFull(),
                i = { width: 0.5 * t.width, height: 0.5 * t.height },
                r = this.computeMinimapPosition(e, i),
                s = this.createTexture(t),
                t = this.createMesh(s, i.width, i.height);
              let a = new THREE.Object3D();
              return (
                (a.matrixAutoUpdate = !1),
                (a.position.x = r.x),
                (a.position.y = r.y),
                a.updateMatrix(),
                a.add(t),
                { mesh: t, texture: s, wrapperObj: a, canvasLayoutSize: i }
              );
            }
            computeMinimapPosition(e, t) {
              return { x: Math.floor((e.width - t.width) / 2), y: Math.floor((e.height - t.height) / 2) };
            }
            createTexture(e) {
              let t = new THREE.Texture(e);
              return (
                (t.needsUpdate = !0),
                (t.flipY = !1),
                (t.minFilter = THREE.NearestFilter),
                (t.magFilter = THREE.NearestFilter),
                t
              );
            }
            createMesh(e, t, i) {
              let r = n.SpriteUtils.createRectGeometry(t, i);
              (n.SpriteUtils.addRectUvs(r, { x: 0, y: 0, width: t, height: i }, { width: t, height: i }),
                r.translate(t / 2, i / 2, 0));
              var s = new THREE.MeshBasicMaterial({ map: e, side: THREE.DoubleSide });
              let a = new THREE.Mesh(r, s);
              return ((a.matrixAutoUpdate = !1), (a.frustumCulled = !1), a);
            }
            setupListeners(e) {
              if (!this.pointerEvents) throw new Error("Must call setPointerEvents before rendering");
              this.disposables.add(
                this.pointerEvents.addEventListener(e, "click", (e) => {
                  var t = this.computeIntersectionTile(e.intersection.uv);
                  t &&
                    (2 === e.button || e.isTouch
                      ? this._onRightClick.dispatch(this, t)
                      : 0 === e.button && this._onClick.dispatch(this, t));
                }),
                this.pointerEvents.addEventListener(e, "mouseover", () => this._onMouseOver.dispatch(this)),
                this.pointerEvents.addEventListener(e, "mousemove", (e) => (this.queuedHoverUv = e.intersection.uv)),
                this.pointerEvents.addEventListener(e, "mouseout", () => this._onMouseOut.dispatch(this)),
              );
            }
            computeIntersectionTile(e) {
              return this.canvasCoordsToTile(e.x * this.size.width, e.y * this.size.height);
            }
            canvasCoordsToTile(e, t) {
              let i = this.minimapRenderer.canvasToDxy(e, t);
              return (
                (i.x = Math.round(i.x)),
                (i.y = Math.round(i.y)),
                this.map.tiles.getByDisplayCoords(i.x, i.y + ((i.x % 2) - (i.y % 2)))
              );
            }
            update(t) {
              if ((super.update(t), !this.lastCanvasUpdate || t - this.lastCanvasUpdate >= 1e3 / 30)) {
                if (
                  (this.tilesForRecalc.size &&
                    (this.minimapModel.updateColors(this.tilesForRecalc), this.tilesForRecalc.clear()),
                  this.needsFullRedraw &&
                    (this.minimapRenderer.renderFull(),
                    (this.texture.needsUpdate = !0),
                    (this.needsFullRedraw = !1),
                    this.tilesForRedraw.clear()),
                  this.tilesForRedraw.size &&
                    ((this.lastCanvasUpdate = t),
                    this.minimapRenderer.renderIncremental(this.tilesForRedraw),
                    (this.texture.needsUpdate = !0),
                    this.tilesForRedraw.clear()),
                  this.worldScene)
                ) {
                  var e = this.worldScene.cameraPan.getPan(),
                    i = this.worldScene.viewport,
                    r = !this.lastViewport || !a.rectEquals(i, this.lastViewport);
                  if (!a.pointEquals(e, this.lastPan) || r) {
                    ((this.lastPan = e), (this.lastViewport = i));
                    var s = this.mapTileIntersectHelper.getTileAtScreenPoint({
                      x: i.x + i.width / 2,
                      y: i.y + i.height / 2,
                    });
                    if (!s) return void console.warn("Current pan intersects no map tile");
                    ((i = l.IsoCoords.screenToScreenTile(i.width / 2, i.height / 2)),
                      (s = { x: s.dx - i.x, y: s.dy - i.y, width: 2 * i.x, height: 2 * i.y }));
                    (this.viewportOutline && !r) ||
                      ((i = this.minimapRenderer.dxyToCanvas(s.x, s.y)),
                      (i = {
                        width: (r = this.minimapRenderer.dxyToCanvas(s.x + s.width, s.y + s.height)).x - i.x,
                        height: r.y - i.y,
                      }),
                      this.viewportOutline
                        ? this.updateOutlineSize(this.viewportOutline, i.width, i.height)
                        : ((this.viewportOutline = this.createViewportOutline(i.width, i.height)),
                          (this.viewportOutline.matrixAutoUpdate = !1),
                          this.wrapperObj.add(this.viewportOutline)));
                    s = this.minimapRenderer.dxyToCanvas(s.x, s.y);
                    ((this.viewportOutline.position.x = Math.max(2, Math.floor(s.x))),
                      (this.viewportOutline.position.y = Math.max(1, Math.floor(s.y))),
                      this.viewportOutline.updateMatrix());
                  }
                }
                (this.queuedHoverUv &&
                  ((s = this.computeIntersectionTile(this.queuedHoverUv)) && this._onMouseMove.dispatch(this, s),
                  (this.queuedHoverUv = void 0)),
                  this.pings.forEach((e) => {
                    e.startTime
                      ? t - e.startTime >
                          e.duration / ((p.GameSpeed.BASE_TICKS_PER_SECOND / 1e3) * this.game.speed.value) &&
                        (this.remove(e.obj), e.obj.destroy(), this.pings.splice(this.pings.indexOf(e), 1))
                      : ((e.startTime = t), this.add(e.obj));
                  }));
              }
            }
            createViewportOutline(e, t) {
              let i = new THREE.Geometry();
              i.vertices.push(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, t, 0),
                new THREE.Vector3(e, t, 0),
                new THREE.Vector3(e, 0, 0),
                new THREE.Vector3(0, 0, 0),
              );
              var r = new THREE.LineBasicMaterial({ color: this.borderColor, transparent: !0, side: THREE.DoubleSide });
              return new THREE.Line(i, r);
            }
            updateOutlineSize(e, t, i) {
              let r = e.geometry;
              (r.vertices[1].set(0, i, 0),
                r.vertices[2].set(t, i, 0),
                r.vertices[3].set(t, 0, 0),
                (r.verticesNeedUpdate = !0));
            }
            destroy() {
              (super.destroy(),
                this.destroyMesh(),
                this.shroud?.onChange.unsubscribe(this.handleShroudUpdate),
                this.disposables.dispose());
            }
            destroyMesh() {
              (this.mesh && (this.mesh.geometry.dispose(), this.mesh.material.dispose()),
                this.texture?.dispose(),
                this.destroyViewportOutline());
            }
            destroyViewportOutline() {
              this.viewportOutline &&
                (this.wrapperObj?.remove(this.viewportOutline),
                this.viewportOutline.geometry.dispose(),
                this.viewportOutline.material.dispose(),
                (this.viewportOutline = void 0));
            }
          }),
          e("Minimap", f));
      },
    };
  },
);
