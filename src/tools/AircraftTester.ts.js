// === Reconstructed SystemJS module: tools/AircraftTester ===
// deps: ["engine/gfx/Renderer","engine/Engine","game/Coords","engine/IsoCoords","game/Player","engine/renderable/WorldScene","game/rules/Rules","engine/renderable/entity/map/MapGrid","util/BoxedVar","engine/UiAnimationLoop","engine/ImageFinder","game/art/Art","engine/renderable/entity/RenderableFactory","engine/TheaterType","game/Alliances","game/PlayerList","game/gameobject/selection/SelectionLevel","game/gameobject/unit/VeteranLevel","gui/PointerEvents","util/disposable/CompositeDisposable","game/gameobject/selection/UnitSelection","tools/CameraZoomControls","engine/Lighting","game/gameobject/ObjectFactory","game/map/TileCollection","engine/type/ObjectType","game/gameobject/trait/MoveTrait","game/map/TileOccupation","game/map/Bridges","engine/RenderableManager","game/World","data/Strings","game/map/MapBounds","engine/renderable/entity/unit/FlyerHelperMode","engine/gfx/lighting/LightingDirector","engine/renderable/builder/VxlBuilderFactory","engine/renderable/builder/vxlGeometry/VxlGeometryPool","engine/gfx/geometry/VxlGeometryCache","engine/renderable/entity/unit/ShadowQuality","gui/CanvasMetrics","game/gameobject/unit/ZoneType","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "tools/AircraftTester",
  [
    "engine/gfx/Renderer",
    "engine/Engine",
    "game/Coords",
    "engine/IsoCoords",
    "game/Player",
    "engine/renderable/WorldScene",
    "game/rules/Rules",
    "engine/renderable/entity/map/MapGrid",
    "util/BoxedVar",
    "engine/UiAnimationLoop",
    "engine/ImageFinder",
    "game/art/Art",
    "engine/renderable/entity/RenderableFactory",
    "engine/TheaterType",
    "game/Alliances",
    "game/PlayerList",
    "game/gameobject/selection/SelectionLevel",
    "game/gameobject/unit/VeteranLevel",
    "gui/PointerEvents",
    "util/disposable/CompositeDisposable",
    "game/gameobject/selection/UnitSelection",
    "tools/CameraZoomControls",
    "engine/Lighting",
    "game/gameobject/ObjectFactory",
    "game/map/TileCollection",
    "engine/type/ObjectType",
    "game/gameobject/trait/MoveTrait",
    "game/map/TileOccupation",
    "game/map/Bridges",
    "engine/RenderableManager",
    "game/World",
    "data/Strings",
    "game/map/MapBounds",
    "engine/renderable/entity/unit/FlyerHelperMode",
    "engine/gfx/lighting/LightingDirector",
    "engine/renderable/builder/VxlBuilderFactory",
    "engine/renderable/builder/vxlGeometry/VxlGeometryPool",
    "engine/gfx/geometry/VxlGeometryCache",
    "engine/renderable/entity/unit/ShadowQuality",
    "gui/CanvasMetrics",
    "game/gameobject/unit/ZoneType",
    "util/math",
  ],
  function (e, t) {
    "use strict";
    var o,
      h,
      d,
      l,
      u,
      c,
      g,
      r,
      p,
      m,
      f,
      y,
      T,
      v,
      b,
      S,
      w,
      E,
      C,
      i,
      x,
      O,
      A,
      M,
      R,
      P,
      I,
      k,
      B,
      N,
      j,
      L,
      D,
      F,
      _,
      U,
      H,
      G,
      V,
      W,
      z,
      K,
      s;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
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
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          i = e;
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
          L = e;
        },
        function (e) {
          D = e;
        },
        function (e) {
          F = e;
        },
        function (e) {
          _ = e;
        },
        function (e) {
          U = e;
        },
        function (e) {
          H = e;
        },
        function (e) {
          G = e;
        },
        function (e) {
          V = e;
        },
        function (e) {
          W = e;
        },
        function (e) {
          z = e;
        },
        function (e) {
          K = e;
        },
      ],
      execute: function () {
        (e(
          "AircraftTester",
          (s = class {
            static async main(e) {
              let t = (this.renderer = new o.Renderer(800, 600));
              (t.init(document.body), t.initStats(document.body));
              let i = c.WorldScene.factory(
                { x: 0, y: 0, width: 800, height: 600 },
                new p.BoxedVar(!0),
                new p.BoxedVar(V.ShadowQuality.High),
              );
              (this.disposables.add(i),
                (i.scene.background = new THREE.Color(12632256)),
                l.IsoCoords.init({ x: 0, y: 0 }),
                (this.theater = await h.Engine.loadTheater(v.TheaterType.Temperate)));
              var r = new g.Rules(h.Engine.getRules());
              ((this.rules = r),
                (this.art = new y.Art(r, h.Engine.getArt())),
                (this.images = h.Engine.getImages()),
                (this.voxels = h.Engine.getVoxels()),
                (this.voxelAnims = h.Engine.getVoxelAnims()),
                this.buildBrowser(r.aircraftRules));
              let s = new W.CanvasMetrics(t.getCanvas(), window);
              (s.init(), this.disposables.add(s));
              r = new C.PointerEvents(t, { x: 0, y: 0 }, document, s);
              let a = new O.CameraZoomControls(r, i.cameraZoom);
              (a.init(), this.disposables.add(r, a), t.addScene(i));
              let n = (this.uiAnimationLoop = new m.UiAnimationLoop(t));
              (n.start(),
                (this.worldScene = i),
                (this.vxlGeometryPool = new H.VxlGeometryPool(new G.VxlGeometryCache())),
                this.addGrid(),
                this.createFloor());
            }
            static addGrid() {
              let e = new r.MapGrid({ width: 10, height: 10 });
              var t = e.get3DObject();
              let i = new THREE.Object3D();
              (i.add(t), this.worldScene.scene.add(i));
            }
            static createFloor() {
              var e = new THREE.PlaneGeometry(1e4, 1e4);
              let t = new THREE.ShadowMaterial();
              t.opacity = 0.5;
              let i = new THREE.Mesh(e, t);
              ((i.rotation.x = -Math.PI / 2),
                (i.receiveShadow = !0),
                (i.renderOrder = 2e5),
                this.worldScene.scene.add(i));
            }
            static selectAircraft(e) {
              this.currentAircraft && (this.world.removeObject(this.currentAircraft), this.currentAircraft.dispose());
              let t = new u.Player("Player");
              (this.disposables.add(t), (t.color = this.rules.getMultiplayerColors().get("DarkRed")));
              var i = new b.Alliances(new S.PlayerList()),
                r = new x.UnitSelection(),
                s = new A.Lighting();
              this.disposables.add(s);
              var a = new T.RenderableFactory(
                  new p.BoxedVar(t),
                  r,
                  i,
                  this.rules,
                  this.art,
                  void 0,
                  new f.ImageFinder(this.images, this.theater),
                  h.Engine.getPalettes(),
                  this.voxels,
                  this.voxelAnims,
                  this.theater,
                  this.worldScene.camera,
                  s,
                  new _.LightingDirector(s, this.renderer, new p.BoxedVar(1)),
                  new p.BoxedVar(!1),
                  new p.BoxedVar(!1),
                  new p.BoxedVar(2),
                  void 0,
                  new L.Strings(),
                  new p.BoxedVar(F.FlyerHelperMode.Selected),
                  new p.BoxedVar(!1),
                  new U.VxlBuilderFactory(this.vxlGeometryPool, !1, this.worldScene.camera),
                  new Map(),
                ),
                r = new R.TileCollection([], null, this.rules.general, K.getRandomInt),
                i = new k.TileOccupation(r),
                s = new D.MapBounds(),
                s = new B.Bridges(this.theater.tileSets, r, i, s, this.rules);
              let n = (this.currentAircraft = new M.ObjectFactory(r, i, s, new p.BoxedVar(0)).create(
                P.ObjectType.Aircraft,
                e,
                this.rules,
                this.art,
              ));
              ((n.owner = t), (n.position.tile = { rx: 1, ry: 1, z: 0, rampType: 0 }));
              let o = (this.world = new j.World()),
                l = new N.RenderableManager(o, this.worldScene, this.worldScene.camera, a);
              (l.init(), this.disposables.add(l), o.spawnObject(n));
              let c = (this.currentRenderable = l.getRenderableByGameObject(n));
              (c.selectionModel.setSelectionLevel(w.SelectionLevel.None),
                c.selectionModel.setControlGroupNumber(3),
                this.buildControls());
            }
            static buildControls() {
              this.controlsEl && document.body.removeChild(this.controlsEl);
              let e = (this.controlsEl = document.createElement("div"));
              ((e.style.position = "absolute"),
                (e.style.left = "0"),
                (e.style.top = "0"),
                (e.style.width = "200px"),
                (e.style.padding = "5px"),
                (e.style.background = "rgba(255, 255, 255, 0.5)"),
                (e.style.border = "1px black solid"),
                e.appendChild(document.createTextNode("Remap color:")));
              let t = this.rules.getMultiplayerColors(),
                r = document.createElement("select");
              ((r.style.display = "block"),
                r.addEventListener("change", () => {
                  this.currentAircraft.owner.color = t.get(r.value);
                }),
                e.appendChild(r),
                t.forEach((e, t) => {
                  let i = document.createElement("option");
                  ((i.innerHTML = t),
                    (i.value = t),
                    (i.selected = e.asHex() === this.currentAircraft.owner.color.asHex()),
                    r.appendChild(i));
                }),
                e.appendChild(document.createTextNode("Selection level:")));
              let i = document.createElement("div");
              (e.appendChild(i),
                [w.SelectionLevel.None, w.SelectionLevel.Hover, w.SelectionLevel.Selected].forEach((e) => {
                  let t = document.createElement("button");
                  ((t.innerHTML = w.SelectionLevel[e]),
                    (t.disabled = !this.currentAircraft.rules.selectable),
                    t.addEventListener("click", () => this.currentRenderable.selectionModel.setSelectionLevel(e)),
                    i.appendChild(t));
                }),
                e.appendChild(document.createTextNode("Veteran level:")));
              let s = document.createElement("div");
              (e.appendChild(s),
                this.currentAircraft.veteranTrait &&
                  [E.VeteranLevel.None, E.VeteranLevel.Veteran, E.VeteranLevel.Elite].forEach((e) => {
                    let t = document.createElement("button");
                    ((t.innerHTML = E.VeteranLevel[e]),
                      t.addEventListener("click", () => (this.currentAircraft.veteranTrait.veteranLevel = e)),
                      s.appendChild(t));
                  }),
                e.appendChild(document.createTextNode("Rudder:")));
              let a = document.createElement("input");
              ((a.style.display = "block"),
                (a.type = "range"),
                (a.min = "-180"),
                (a.max = "180"),
                (a.value = "0"),
                a.addEventListener("input", () => {
                  this.currentAircraft.yaw = Number(a.value);
                }),
                e.appendChild(a));
              let n = document.createElement("input");
              ((n.style.display = "block"),
                (n.type = "range"),
                (n.min = "-180"),
                (n.max = "180"),
                (n.value = "0"),
                n.addEventListener("input", () => {
                  this.currentAircraft.pitch = Number(n.value);
                }),
                e.appendChild(n));
              let o = document.createElement("input");
              ((o.style.display = "block"),
                (o.type = "range"),
                (o.min = "-180"),
                (o.max = "180"),
                (o.value = "0"),
                o.addEventListener("input", () => {
                  this.currentAircraft.roll = Number(o.value);
                }),
                e.appendChild(o),
                e.appendChild(document.createTextNode("Height:")));
              let l = document.createElement("input");
              ((l.type = "range"),
                (l.min = "0"),
                (l.max = "2560"),
                (l.value = "0"),
                (l.style.display = "block"),
                l.addEventListener("input", () => {
                  this.currentAircraft.position.tileElevation = d.Coords.worldToTileHeight(Number(l.value));
                }),
                e.appendChild(l),
                e.appendChild(document.createTextNode("isMoving:")));
              let c = document.createElement("input");
              ((c.type = "checkbox"),
                (c.style.display = "block"),
                c.addEventListener("change", (e) => {
                  var t = e.target.checked;
                  ((this.currentAircraft.moveTrait.moveState = t ? I.MoveState.Moving : I.MoveState.Idle),
                    (this.currentAircraft.zone = t ? z.ZoneType.Air : z.ZoneType.Ground));
                }),
                e.appendChild(c),
                e.appendChild(document.createTextNode("Warped out:")));
              let h = document.createElement("input");
              ((h.type = "checkbox"),
                (h.style.display = "block"),
                h.addEventListener("change", (e) => {
                  this.currentAircraft.warpedOutTrait.debugSetActive(e.target.checked);
                }),
                e.appendChild(h));
              let u = document.createElement("button");
              ((u.style.display = "block"),
                (u.style.color = "red"),
                (u.innerHTML = "DESTROY"),
                u.addEventListener("click", async () => {
                  ((this.currentAircraft.isDestroyed = !0),
                    this.world.removeObject(this.currentAircraft),
                    this.currentAircraft.dispose(),
                    (this.currentAircraft = void 0),
                    document.body.removeChild(this.controlsEl),
                    (this.controlsEl = void 0));
                }),
                e.appendChild(u),
                document.body.appendChild(e));
            }
            static buildBrowser(e) {
              let i = (this.listEl = document.createElement("div"));
              ((i.style.position = "absolute"),
                (i.style.right = "0"),
                (i.style.top = "0"),
                (i.style.height = "600px"),
                (i.style.width = "200px"),
                (i.style.overflowY = "auto"),
                (i.style.padding = "5px"),
                (i.style.background = "rgba(255, 255, 255, 0.5)"),
                (i.style.border = "1px black solid"),
                i.appendChild(document.createTextNode("Aircraft types:")));
              let t = [...e.keys()].filter((e) => this.art.hasObject(e, P.ObjectType.Aircraft)).sort();
              (t.forEach((e) => {
                let t = document.createElement("a");
                ((t.style.display = "block"),
                  (t.textContent = e),
                  t.setAttribute("href", "javascript:;"),
                  t.addEventListener("click", () => {
                    (console.log("Selected aircraft", e), this.selectAircraft(e));
                  }),
                  i.appendChild(t));
              }),
                document.body.appendChild(i),
                setTimeout(() => {
                  this.selectAircraft(t[0]);
                }, 50));
            }
            static destroy() {
              (this.renderer.destroy(),
                this.uiAnimationLoop.destroy(),
                this.listEl.remove(),
                this.controlsEl && (this.controlsEl.remove(), (this.controlsEl = void 0)),
                this.timeoutId && (clearTimeout(this.timeoutId), (this.timeoutId = void 0)),
                this.disposables.dispose());
            }
          }),
        ),
          (s.disposables = new i.CompositeDisposable()));
      },
    };
  },
);
