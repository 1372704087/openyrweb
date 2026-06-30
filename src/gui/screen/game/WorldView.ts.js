// === Reconstructed SystemJS module: gui/screen/game/WorldView ===
// deps: ["util/disposable/CompositeDisposable","engine/renderable/WorldScene","engine/util/WorldViewportHelper","engine/util/MapTileIntersectHelper","engine/sound/WorldSound","engine/Engine","engine/util/MapPanningHelper","engine/IsoCoords","engine/ImageFinder","engine/renderable/entity/map/MapRenderable","engine/renderable/entity/RenderableFactory","engine/RenderableManager","engine/renderable/fx/handler/ChronoFxHandler","engine/Lighting","engine/gfx/lighting/LightingDirector","engine/renderable/fx/handler/WarheadDetonateFxHandler","engine/renderable/fx/handler/SuperWeaponFxHandler","engine/renderable/fx/handler/CrateFxHandler","engine/renderable/fx/handler/BeaconFxHandler","engine/renderable/builder/VxlBuilderFactory","engine/renderable/fx/handler/TriggerActionFxHandler","util/BoxedVar","engine/renderable/fx/handler/ParasiteSparkFxHandler"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/WorldView",
  [
    "util/disposable/CompositeDisposable",
    "engine/renderable/WorldScene",
    "engine/util/WorldViewportHelper",
    "engine/util/MapTileIntersectHelper",
    "engine/sound/WorldSound",
    "engine/Engine",
    "engine/util/MapPanningHelper",
    "engine/IsoCoords",
    "engine/ImageFinder",
    "engine/renderable/entity/map/MapRenderable",
    "engine/renderable/entity/RenderableFactory",
    "engine/RenderableManager",
    "engine/renderable/fx/handler/ChronoFxHandler",
    "engine/Lighting",
    "engine/gfx/lighting/LightingDirector",
    "engine/renderable/fx/handler/WarheadDetonateFxHandler",
    "engine/renderable/fx/handler/SuperWeaponFxHandler",
    "engine/renderable/fx/handler/CrateFxHandler",
    "engine/renderable/fx/handler/BeaconFxHandler",
    "engine/renderable/builder/VxlBuilderFactory",
    "engine/renderable/fx/handler/TriggerActionFxHandler",
    "util/BoxedVar",
    "engine/renderable/fx/handler/ParasiteSparkFxHandler",
  ],
  function (e, t) {
    "use strict";
    var u, o, v, b, S, w, l, c, E, C, x, O, A, M, R, P, I, k, B, N, j, d, L, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          u = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          P = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          j = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          L = e;
        },
      ],
      execute: function () {
        e(
          "WorldView",
          (i = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h = !1) {
              ((this.hudGutterSize = e),
                (this.game = t),
                (this.sound = i),
                (this.renderer = r),
                (this.runtimeVars = s),
                (this.minimap = a),
                (this.strings = n),
                (this.generalOptions = o),
                (this.vxlGeometryPool = l),
                (this.buildingImageDataCache = c),
                (this.aprilFools = h),
                (this.disposables = new u.CompositeDisposable()),
                (this.localPlayer = new d.BoxedVar(void 0)));
            }
            init(e, t, i) {
              ((this.localPlayer.value = e), this.disposables.add(() => (this.localPlayer.value = void 0)));
              let r = this.game,
                s = r.map;
              var a = this.computeMapScreenBounds(s.mapBounds.getLocalSize()),
                n = this.computeWorldViewport(t, a);
              let o = this.initWorldView(e, n, r, s);
              ((this.worldScene = o), this.disposables.add(() => (this.worldScene = void 0)));
              var l = new v.WorldViewportHelper(o),
                c = new b.MapTileIntersectHelper(s, o),
                a = r.getWorld(),
                n = e ? this.game.mapShroudTrait.getPlayerShroud(e) : void 0;
              let h = new S.WorldSound(this.sound, e, n, l, c, a, o, this.renderer);
              (h.init(), (this.worldSound = h), this.disposables.add(h, () => (this.worldSound = void 0)));
              let u = new M.Lighting(r.mapLightingTrait);
              (this.disposables.add(u), o.applyLighting(u));
              let d = new R.LightingDirector(u, this.renderer, r.speed);
              (d.init(), this.disposables.add(d));
              a = r.getUnitSelection();
              let {
                renderableManager: g,
                mapRenderable: p,
                superWeaponFxHandler: m,
                beaconFxHandler: f,
              } = this.initRenderables(r, this.localPlayer, o, i, a, h, u, d);
              ((this.mapRenderable = p), this.disposables.add(() => (this.mapRenderable = void 0)));
              let y = (e) => {
                (o.applyLighting(u), g.updateLighting(), p.updateLighting(e));
              };
              (u.onChange.subscribe(y),
                this.disposables.add(() => u.onChange.unsubscribe(y)),
                this.minimap.initWorld(o));
              let T = () => {
                (this.handleMapBoundsOrViewportChange(t), this.minimap.forceRerender());
              };
              return (
                s.mapBounds.onLocalResize.subscribe(T),
                this.disposables.add(() => s.mapBounds.onLocalResize.unsubscribe(T)),
                { worldScene: o, worldSound: h, renderableManager: g, superWeaponFxHandler: m, beaconFxHandler: f }
              );
            }
            changeLocalPlayer(e) {
              var t = (this.localPlayer.value = e) ? this.game.mapShroudTrait.getPlayerShroud(e) : void 0;
              (this.worldSound?.changeLocalPlayer(e, t), this.mapRenderable?.setShroud(t));
            }
            handleViewportChange(e) {
              this.handleMapBoundsOrViewportChange(e);
            }
            handleMapBoundsOrViewportChange(e) {
              var t;
              this.worldScene &&
                ((t = this.computeMapScreenBounds(this.game.map.mapBounds.getLocalSize())),
                (t = this.computeWorldViewport(e, t)),
                this.worldScene.updateViewport(t),
                this.updatePanLimits(this.game.map, this.worldScene.cameraPan, t));
            }
            initWorldView(e, t, i, r) {
              let s = o.WorldScene.factory(t, this.runtimeVars.freeCamera, this.generalOptions.graphics.shadows);
              (this.disposables.add(s), this.updatePanLimits(r, s.cameraPan, t));
              var a = (!e || e.isObserver ? i.getCombatants()[0] : e).startLocation,
                a = r.startingLocations[a];
              let n = new l.MapPanningHelper(r);
              s.cameraPan.setPan(n.computeCameraPanFromTile(a.x, a.y));
              ((a = r.mapBounds.getFullSize()), (a = c.IsoCoords.screenTileToWorld(a.width / 2, a.height / 2)));
              return (s.setLightFocusPoint(a.x, a.y), s);
            }
            initRenderables(e, t, i, r, s, a, n, o) {
              var l = w.Engine.getImages(),
                c = w.Engine.getVoxels(),
                h = w.Engine.getVoxelAnims(),
                u = new E.ImageFinder(l, r),
                d = w.Engine.getPalettes(),
                g = t.value ? e.mapShroudTrait.getPlayerShroud(t.value) : void 0,
                l = new C.MapRenderable(
                  e.map,
                  g,
                  e.mapRadiationTrait,
                  n,
                  r,
                  e.rules,
                  e.art,
                  u,
                  i.camera,
                  this.runtimeVars.debugWireframes,
                  e.speed,
                  a,
                  !0,
                );
              (i.add(l), this.disposables.add(l));
              ((g = this.renderer.supportsInstancing()),
                (g = new x.RenderableFactory(
                  t,
                  s,
                  e.alliances,
                  e.rules,
                  e.art,
                  l,
                  u,
                  d,
                  c,
                  h,
                  r,
                  i.camera,
                  n,
                  o,
                  this.runtimeVars.debugWireframes,
                  this.runtimeVars.debugText,
                  e.speed,
                  a,
                  this.strings,
                  this.generalOptions.flyerHelper,
                  this.generalOptions.hiddenObjects,
                  new N.VxlBuilderFactory(this.vxlGeometryPool, g, i.camera),
                  this.buildingImageDataCache,
                  !0,
                  g,
                  this.aprilFools,
                )));
              let p = new O.RenderableManager(e.getWorld(), i, i.camera, g);
              (p.init(), this.disposables.add(p));
              let m = new A.ChronoFxHandler(e, p);
              (m.init(), this.disposables.add(m));
              let f = new P.WarheadDetonateFxHandler(e, p);
              (f.init(), this.disposables.add(f));
              let y = new I.SuperWeaponFxHandler(e, p, o);
              (y.init(), this.disposables.add(y));
              let T = new k.CrateFxHandler(e, p);
              (T.init(), this.disposables.add(T));
              let v = new B.BeaconFxHandler(e, t, p, this.renderer, a);
              (v.init(), this.disposables.add(v));
              let b = new L.ParasiteSparkFxHandler(e, p);
              (b.init(), this.disposables.add(b));
              let S = new j.TriggerActionFxHandler(e, p);
              return (
                S.init(),
                this.disposables.add(S),
                { renderableManager: p, mapRenderable: l, superWeaponFxHandler: y, beaconFxHandler: v }
              );
            }
            computeWorldViewport(e, t) {
              return {
                x: e.x,
                y: e.y,
                width: Math.min(t.width, e.width - this.hudGutterSize.width),
                height: Math.min(t.height, e.height - this.hudGutterSize.height),
              };
            }
            updatePanLimits(e, t, i) {
              let r = new l.MapPanningHelper(e);
              var s = this.computeMapScreenBounds(e.mapBounds.getLocalSize());
              t.setPanLimits(r.computeCameraPanLimits(i, s));
            }
            computeMapScreenBounds(e) {
              var t = c.IsoCoords.screenTileToScreen(e.x, e.y),
                i = c.IsoCoords.screenTileToScreen(e.x + e.width, e.y + e.height - 1);
              return { x: t.x, y: t.y, width: i.x - t.x, height: i.y - t.y };
            }
            dispose() {
              (this.worldScene && this.renderer.removeScene(this.worldScene), this.disposables.dispose());
            }
          }),
        );
      },
    };
  },
);
