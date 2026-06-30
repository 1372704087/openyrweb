// === Reconstructed SystemJS module: tools/VehicleTester ===
// deps: ["engine/gfx/Renderer","engine/Engine","engine/IsoCoords","game/Player","engine/renderable/WorldScene","game/rules/Rules","engine/renderable/entity/map/MapGrid","util/BoxedVar","engine/UiAnimationLoop","engine/ImageFinder","game/art/Art","engine/renderable/entity/RenderableFactory","engine/TheaterType","game/theater/rampHeights","game/Alliances","game/PlayerList","game/gameobject/selection/SelectionLevel","game/gameobject/unit/VeteranLevel","game/gameobject/ObjectFactory","engine/type/ObjectType","gui/PointerEvents","util/disposable/CompositeDisposable","game/gameobject/selection/UnitSelection","tools/CameraZoomControls","engine/Lighting","game/map/TileCollection","game/gameobject/trait/MoveTrait","game/map/TileOccupation","game/map/Bridges","data/Strings","game/map/MapBounds","engine/renderable/entity/unit/FlyerHelperMode","engine/gfx/lighting/LightingDirector","game/World","engine/RenderableManager","engine/renderable/builder/VxlBuilderFactory","engine/renderable/builder/vxlGeometry/VxlGeometryPool","engine/gfx/geometry/VxlGeometryCache","engine/renderable/entity/unit/ShadowQuality","gui/CanvasMetrics","game/gameobject/unit/ZoneType","util/math","game/gameobject/trait/interface/NotifyTileChange","engine/type/TiberiumType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "tools/VehicleTester",
  [
    "engine/gfx/Renderer",
    "engine/Engine",
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
    "game/theater/rampHeights",
    "game/Alliances",
    "game/PlayerList",
    "game/gameobject/selection/SelectionLevel",
    "game/gameobject/unit/VeteranLevel",
    "game/gameobject/ObjectFactory",
    "engine/type/ObjectType",
    "gui/PointerEvents",
    "util/disposable/CompositeDisposable",
    "game/gameobject/selection/UnitSelection",
    "tools/CameraZoomControls",
    "engine/Lighting",
    "game/map/TileCollection",
    "game/gameobject/trait/MoveTrait",
    "game/map/TileOccupation",
    "game/map/Bridges",
    "data/Strings",
    "game/map/MapBounds",
    "engine/renderable/entity/unit/FlyerHelperMode",
    "engine/gfx/lighting/LightingDirector",
    "game/World",
    "engine/RenderableManager",
    "engine/renderable/builder/VxlBuilderFactory",
    "engine/renderable/builder/vxlGeometry/VxlGeometryPool",
    "engine/gfx/geometry/VxlGeometryCache",
    "engine/renderable/entity/unit/ShadowQuality",
    "gui/CanvasMetrics",
    "game/gameobject/unit/ZoneType",
    "util/math",
    "game/gameobject/trait/interface/NotifyTileChange",
    "engine/type/TiberiumType",
  ],
  function (e, t) {
    "use strict";
    var o,
      u,
      l,
      d,
      c,
      h,
      r,
      g,
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
      x,
      O,
      i,
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
      q,
      $,
      s;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          g = e;
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
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          i = e;
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
        function (e) {
          q = e;
        },
        function (e) {
          $ = e;
        },
      ],
      execute: function () {
        (e(
          "VehicleTester",
          (s = class {
            static async main(e) {
              let t = (this.renderer = new o.Renderer(800, 600));
              (t.init(document.body), t.initStats(document.body));
              let i = c.WorldScene.factory(
                { x: 0, y: 0, width: 800, height: 600 },
                new g.BoxedVar(!0),
                new g.BoxedVar(V.ShadowQuality.High),
              );
              (this.disposables.add(i),
                (i.scene.background = new THREE.Color(12632256)),
                l.IsoCoords.init({ x: 0, y: 0 }),
                (this.theater = await u.Engine.loadTheater(T.TheaterType.Temperate)));
              var r = new h.Rules(u.Engine.getRules());
              ((this.rules = r),
                (this.art = new f.Art(r, u.Engine.getArt())),
                (this.images = u.Engine.getImages()),
                (this.voxels = u.Engine.getVoxels()),
                (this.voxelAnims = u.Engine.getVoxelAnims()),
                this.buildBrowser(r.vehicleRules));
              let s = new W.CanvasMetrics(t.getCanvas(), window);
              (s.init(), this.disposables.add(s));
              r = new O.PointerEvents(t, { x: 0, y: 0 }, document, s);
              let a = new M.CameraZoomControls(r, i.cameraZoom);
              (this.disposables.add(a, r), a.init(), t.addScene(i));
              let n = (this.uiAnimationLoop = new p.UiAnimationLoop(t));
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
                (i.position.y = 1),
                this.worldScene.scene.add(i));
            }
            static selectVehicle(e) {
              this.currentVehicle &&
                !this.currentVehicle.isDisposed &&
                (this.world.removeObject(this.currentVehicle), this.currentVehicle.dispose());
              let t = new d.Player("Player");
              (this.disposables.add(t), (t.color = this.rules.getMultiplayerColors().get("DarkRed")));
              var i = new b.Alliances(new S.PlayerList()),
                r = new A.UnitSelection(),
                s = new R.Lighting();
              this.disposables.add(s);
              var a = new y.RenderableFactory(
                  new g.BoxedVar(t),
                  r,
                  i,
                  this.rules,
                  this.art,
                  void 0,
                  new m.ImageFinder(this.images, this.theater),
                  u.Engine.getPalettes(),
                  this.voxels,
                  this.voxelAnims,
                  this.theater,
                  this.worldScene.camera,
                  s,
                  new D.LightingDirector(s, this.renderer, new g.BoxedVar(1)),
                  new g.BoxedVar(!1),
                  new g.BoxedVar(!1),
                  new g.BoxedVar(2),
                  void 0,
                  new N.Strings(),
                  new g.BoxedVar(L.FlyerHelperMode.Selected),
                  new g.BoxedVar(!1),
                  new U.VxlBuilderFactory(this.vxlGeometryPool, !1, this.worldScene.camera),
                  new Map(),
                ),
                r = new P.TileCollection([], null, this.rules.general, K.getRandomInt),
                i = new k.TileOccupation(r),
                s = new j.MapBounds(),
                s = new B.Bridges(this.theater.tileSets, r, i, s, this.rules);
              let n = new C.ObjectFactory(r, i, s, new g.BoxedVar(1)),
                o = (this.currentVehicle = n.create(x.ObjectType.Vehicle, e, this.rules, this.art));
              ((o.owner = t),
                (o.position.tile = this.tile),
                o.harvesterTrait
                  ? (o.harvesterTrait.addBails($.TiberiumType.Ore, 5),
                    o.harvesterTrait.addBails($.TiberiumType.Gems, 10))
                  : o.transportTrait &&
                    o.transportTrait.units.push(
                      n.create(x.ObjectType.Vehicle, "FV", this.rules, this.art),
                      n.create(x.ObjectType.Infantry, "E1", this.rules, this.art),
                      n.create(x.ObjectType.Infantry, "CLEG", this.rules, this.art),
                    ),
                o.tilterTrait?.[q.NotifyTileChange.onTileChange](o));
              let l = (this.world = new F.World()),
                c = new _.RenderableManager(l, this.worldScene, this.worldScene.camera, a);
              (c.init(), this.disposables.add(c), l.spawnObject(o));
              let h = (this.currentRenderable = c.getRenderableByGameObject(o));
              (h.selectionModel.setSelectionLevel(w.SelectionLevel.Selected),
                h.selectionModel.setControlGroupNumber(3),
                this.buildControls());
            }
            static buildControls() {
              this.controlsEl && document.body.removeChild(this.controlsEl);
              let t = (this.controlsEl = document.createElement("div"));
              ((t.style.position = "absolute"),
                (t.style.left = "0"),
                (t.style.top = "0"),
                (t.style.width = "200px"),
                (t.style.padding = "5px"),
                (t.style.background = "rgba(255, 255, 255, 0.5)"),
                (t.style.border = "1px black solid"),
                t.appendChild(document.createTextNode("Remap color:")));
              let e = this.rules.getMultiplayerColors(),
                r = document.createElement("select");
              ((r.style.display = "block"),
                r.addEventListener("change", () => {
                  this.currentVehicle.owner.color = e.get(r.value);
                }),
                t.appendChild(r),
                e.forEach((e, t) => {
                  let i = document.createElement("option");
                  ((i.innerHTML = t),
                    (i.value = t),
                    (i.selected = e.asHex() === this.currentVehicle.owner.color.asHex()),
                    r.appendChild(i));
                }),
                t.appendChild(document.createTextNode("Selection level:")));
              let i = document.createElement("div");
              (t.appendChild(i),
                [w.SelectionLevel.None, w.SelectionLevel.Hover, w.SelectionLevel.Selected].forEach((e) => {
                  let t = document.createElement("button");
                  ((t.innerHTML = w.SelectionLevel[e]),
                    t.addEventListener("click", () => this.currentRenderable.selectionModel.setSelectionLevel(e)),
                    i.appendChild(t));
                }),
                t.appendChild(document.createTextNode("Veteran level:")));
              let s = document.createElement("div");
              (t.appendChild(s),
                this.currentVehicle.veteranTrait &&
                  [E.VeteranLevel.None, E.VeteranLevel.Veteran, E.VeteranLevel.Elite].forEach((e) => {
                    let t = document.createElement("button");
                    ((t.innerHTML = E.VeteranLevel[e]),
                      t.addEventListener("click", () => (this.currentVehicle.veteranTrait.veteranLevel = e)),
                      s.appendChild(t));
                  }),
                t.appendChild(document.createTextNode("Ramp type:")));
              let a = document.createElement("select");
              ((a.style.display = "block"),
                a.addEventListener("change", () => {
                  ((this.tile.rampType = Number(a.value)),
                    this.currentVehicle.tilterTrait?.[q.NotifyTileChange.onTileChange](this.currentVehicle));
                }),
                t.appendChild(a));
              for (let y = 0; y < v.rampHeights.length; ++y) {
                let e = document.createElement("option");
                ((e.innerHTML = "" + y), (e.value = "" + y), a.appendChild(e));
              }
              t.appendChild(document.createTextNode("Turret #:"));
              let n = document.createElement("select");
              ((n.style.display = "block"),
                (n.disabled = !this.currentVehicle.rules.turret),
                n.addEventListener("change", () => {
                  this.currentVehicle.turretNo = Number(n.value);
                }),
                t.appendChild(n));
              for (let T = 0; T < this.currentVehicle.rules.turretCount; ++T) {
                let e = document.createElement("option");
                ((e.innerHTML = "" + T), (e.value = "" + T), n.appendChild(e));
              }
              t.appendChild(document.createTextNode("isMoving:"));
              let o = document.createElement("input");
              ((o.type = "checkbox"),
                (o.style.display = "block"),
                o.addEventListener("change", (e) => {
                  var t = e.target.checked;
                  ((this.currentVehicle.moveTrait.moveState = t ? I.MoveState.Moving : I.MoveState.Idle),
                    this.currentVehicle.rules.consideredAircraft && t
                      ? (this.currentVehicle.zone = z.ZoneType.Air)
                      : (this.currentVehicle.zone = this.currentVehicle.rules.naval
                          ? z.ZoneType.Water
                          : z.ZoneType.Ground));
                }),
                t.appendChild(o),
                t.appendChild(document.createTextNode("isFiring:")));
              let l = document.createElement("input");
              ((l.type = "checkbox"),
                (l.style.display = "block"),
                l.addEventListener("change", (e) => {
                  this.currentVehicle.isFiring = e.target.checked;
                }),
                t.appendChild(l),
                t.appendChild(document.createTextNode("isRocking:")));
              let c = document.createElement("input");
              if (
                ((c.type = "checkbox"),
                (c.style.display = "block"),
                c.addEventListener("change", (e) => {
                  e.target.checked
                    ? this.currentVehicle.applyRocking(360 * Math.random(), 1)
                    : (this.currentVehicle.rocking = void 0);
                }),
                t.appendChild(c),
                this.currentVehicle.airSpawnTrait)
              ) {
                t.appendChild(document.createTextNode("hasSpawns:"));
                let e = document.createElement("input");
                ((e.type = "checkbox"),
                  (e.style.display = "block"),
                  (e.checked = !!this.currentVehicle.airSpawnTrait.availableSpawns),
                  e.addEventListener("change", (e) => {
                    var t = e.target.checked ? 1 : 0;
                    this.currentVehicle.airSpawnTrait.debugSetStorage(null, t);
                  }),
                  t.appendChild(e));
              }
              t.appendChild(document.createTextNode("Warped out:"));
              let h = document.createElement("input");
              ((h.type = "checkbox"),
                (h.style.display = "block"),
                h.addEventListener("change", (e) => {
                  this.currentVehicle.warpedOutTrait.debugSetActive(e.target.checked);
                }),
                t.appendChild(h),
                t.appendChild(document.createTextNode("Direction:")));
              let u = document.createElement("div");
              t.appendChild(u);
              let d = document.createElement("input");
              ((d.type = "range"),
                (d.min = "-180"),
                (d.max = "180"),
                (d.value = "0"),
                (d.disabled = void 0 === this.fixedDirection),
                (d.style.verticalAlign = "middle"),
                d.addEventListener("input", () => {
                  this.fixedDirection = Number(d.value);
                }),
                u.appendChild(d));
              let g = document.createElement("button");
              ((g.innerHTML = "Reset"),
                (g.disabled = void 0 === this.fixedDirection),
                (g.style.verticalAlign = "middle"),
                g.addEventListener("click", () => {
                  void 0 !== this.fixedDirection && ((this.fixedDirection = 0), (d.value = "0"));
                }),
                u.appendChild(g));
              let p = document.createElement("input");
              ((p.type = "checkbox"),
                (p.checked = void 0 === this.fixedDirection),
                p.addEventListener("change", (e) => {
                  ((this.fixedDirection = e.target.checked ? void 0 : 0),
                    (d.disabled = g.disabled = void 0 === this.fixedDirection),
                    (d.value = "0"));
                }),
                t.appendChild(p));
              let m = document.createElement("label");
              ((m.innerHTML = "Auto rotate"), t.appendChild(m));
              let f = document.createElement("button");
              ((f.style.display = "block"),
                (f.style.color = "red"),
                (f.innerHTML = "DESTROY"),
                f.addEventListener("click", async () => {
                  ((this.currentVehicle.isDestroyed = !0),
                    this.world.removeObject(this.currentVehicle),
                    this.currentVehicle.dispose(),
                    document.body.removeChild(this.controlsEl),
                    (this.controlsEl = void 0));
                }),
                t.appendChild(f),
                document.body.appendChild(t));
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
                i.appendChild(document.createTextNode("Vehicle types:")));
              let t = [...e.keys()].filter((e) => this.art.hasObject(e, x.ObjectType.Vehicle)).sort();
              (t.forEach((e) => {
                let t = document.createElement("a");
                ((t.style.display = "block"),
                  (t.textContent = e),
                  t.setAttribute("href", "javascript:;"),
                  t.addEventListener("click", () => {
                    (console.log("Selected vehicle", e), this.selectVehicle(e));
                  }),
                  i.appendChild(t));
              }),
                document.body.appendChild(i),
                setTimeout(() => {
                  (this.selectVehicle(t[0]), this.animateVehicle());
                }, 50));
            }
            static animateVehicle() {
              ((this.currentVehicle.direction = this.fixedDirection ?? (this.currentVehicle.direction + 1) % 360),
                this.currentVehicle.turretTrait &&
                  (this.currentVehicle.turretTrait.facing =
                    this.fixedDirection ?? (this.currentVehicle.turretTrait.facing + 2) % 360),
                setTimeout(() => this.animateVehicle(), 50));
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
          (s.tile = { rx: 1, ry: 1, rampType: 0, z: 0 }),
          (s.disposables = new i.CompositeDisposable()));
      },
    };
  },
);
