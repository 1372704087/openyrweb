// === Reconstructed SystemJS module: tools/InfantryTester ===
// deps: ["engine/gfx/Renderer","engine/Engine","engine/IsoCoords","game/Player","engine/renderable/WorldScene","game/rules/Rules","engine/renderable/entity/map/MapGrid","util/BoxedVar","engine/UiAnimationLoop","engine/ImageFinder","game/art/Art","engine/renderable/entity/RenderableFactory","engine/TheaterType","game/gameobject/unit/ZoneType","game/type/SpeedType","game/gameobject/infantry/StanceType","game/gameobject/infantry/InfDeathType","game/Alliances","game/PlayerList","game/gameobject/selection/SelectionLevel","game/gameobject/unit/VeteranLevel","gui/PointerEvents","util/disposable/CompositeDisposable","game/gameobject/selection/UnitSelection","tools/CameraZoomControls","engine/Lighting","game/gameobject/ObjectFactory","game/map/TileCollection","engine/type/ObjectType","game/gameobject/trait/MoveTrait","game/map/TileOccupation","game/map/Bridges","data/Strings","game/map/MapBounds","engine/renderable/entity/unit/FlyerHelperMode","engine/gfx/lighting/LightingDirector","game/World","engine/RenderableManager","engine/renderable/builder/VxlBuilderFactory","engine/renderable/builder/vxlGeometry/VxlGeometryPool","engine/gfx/geometry/VxlGeometryCache","engine/renderable/entity/unit/ShadowQuality","gui/CanvasMetrics","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "tools/InfantryTester",
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
    "game/gameobject/unit/ZoneType",
    "game/type/SpeedType",
    "game/gameobject/infantry/StanceType",
    "game/gameobject/infantry/InfDeathType",
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
    "util/math",
  ],
  function (e, t) {
    "use strict";
    var o,
      h,
      l,
      u,
      c,
      d,
      r,
      g,
      p,
      m,
      f,
      y,
      T,
      s,
      a,
      n,
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
      K;
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
          l = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          d = e;
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
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
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
      ],
      execute: function () {
        (e(
          "InfantryTester",
          (K = class {
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
                (this.theater = await h.Engine.loadTheater(T.TheaterType.Snow)));
              var r = new d.Rules(h.Engine.getRules());
              ((this.rules = r),
                (this.art = new f.Art(r, h.Engine.getArt())),
                (this.images = h.Engine.getImages()),
                this.buildBrowser(r.infantryRules));
              let s = new W.CanvasMetrics(t.getCanvas(), window);
              (s.init(), this.disposables.add(s));
              r = new C.PointerEvents(t, { x: 0, y: 0 }, document, s);
              let a = new O.CameraZoomControls(r, i.cameraZoom);
              (this.disposables.add(a, r), a.init(), t.addScene(i));
              let n = (this.uiAnimationLoop = new p.UiAnimationLoop(t));
              (n.start(), (this.worldScene = i), this.addGrid());
            }
            static addGrid() {
              let e = new r.MapGrid({ width: 10, height: 10 });
              var t = e.get3DObject();
              let i = new THREE.Object3D();
              (i.add(t), this.worldScene.scene.add(i));
            }
            static selectInfantry(e) {
              this.currentInfantry &&
                !this.currentInfantry.isDisposed &&
                (this.world.removeObject(this.currentInfantry), this.currentInfantry.dispose());
              let t = new u.Player("Player");
              (this.disposables.add(t), (t.color = this.rules.getMultiplayerColors().get("DarkRed")));
              var i = new b.Alliances(new S.PlayerList()),
                r = new x.UnitSelection(),
                s = new A.Lighting();
              this.disposables.add(s);
              var a = new y.RenderableFactory(
                  new g.BoxedVar(t),
                  r,
                  i,
                  this.rules,
                  this.art,
                  void 0,
                  new m.ImageFinder(this.images, this.theater),
                  h.Engine.getPalettes(),
                  null,
                  null,
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
                  new U.VxlBuilderFactory(new H.VxlGeometryPool(new G.VxlGeometryCache()), !1, this.worldScene.camera),
                  new Map(),
                ),
                r = new R.TileCollection([], null, this.rules.general, z.getRandomInt),
                i = new k.TileOccupation(r),
                s = new j.MapBounds(),
                s = new B.Bridges(this.theater.tileSets, r, i, s, this.rules);
              let n = (this.currentInfantry = new M.ObjectFactory(r, i, s, new g.BoxedVar(1)).create(
                P.ObjectType.Infantry,
                e,
                this.rules,
                this.art,
              ));
              ((n.owner = t), (n.position.tile = { rx: 1, ry: 1, z: 0, rampType: 0 }));
              let o = (this.world = new F.World()),
                l = new _.RenderableManager(o, this.worldScene, this.worldScene.camera, a);
              (l.init(), this.disposables.add(l), o.spawnObject(n));
              let c = (this.currentRenderable = l.getRenderableByGameObject(n));
              (c.selectionModel.setSelectionLevel(w.SelectionLevel.Selected),
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
              let t = new Map(this.rules.getMultiplayerColors()),
                r = document.createElement("select");
              ((r.style.display = "block"),
                r.addEventListener("change", () => {
                  this.currentInfantry.owner.color = t.get(r.value);
                }),
                e.appendChild(r),
                t.forEach((e, t) => {
                  let i = document.createElement("option");
                  ((i.innerHTML = t),
                    (i.value = t),
                    (i.selected = e.asHex() === this.currentInfantry.owner.color.asHex()),
                    r.appendChild(i));
                }),
                e.appendChild(document.createTextNode("Selection level:")));
              let i = document.createElement("div");
              (e.appendChild(i),
                [w.SelectionLevel.None, w.SelectionLevel.Hover, w.SelectionLevel.Selected].forEach((e) => {
                  let t = document.createElement("button");
                  ((t.innerHTML = w.SelectionLevel[e]),
                    t.addEventListener("click", () => this.currentRenderable.selectionModel.setSelectionLevel(e)),
                    i.appendChild(t));
                }),
                e.appendChild(document.createTextNode("Veteran level:")));
              let s = document.createElement("div");
              (e.appendChild(s),
                this.currentInfantry.veteranTrait &&
                  [E.VeteranLevel.None, E.VeteranLevel.Veteran, E.VeteranLevel.Elite].forEach((e) => {
                    let t = document.createElement("button");
                    ((t.innerHTML = E.VeteranLevel[e]),
                      t.addEventListener("click", () => (this.currentInfantry.veteranTrait.veteranLevel = e)),
                      s.appendChild(t));
                  }),
                e.appendChild(document.createTextNode("SubCell:")));
              let a = document.createElement("select");
              ((a.style.display = "block"),
                a.addEventListener("change", () => {
                  this.currentInfantry.position.subCell = Number(a.value);
                }),
                e.appendChild(a));
              for (let h = 0; h < 5; ++h) {
                let e = document.createElement("option");
                ((e.innerHTML = "" + h), (e.value = "" + h), a.appendChild(e));
              }
              (e.appendChild(document.createTextNode("Zone:")),
                this.createZoneSelect(e),
                e.appendChild(document.createTextNode("Stance:")),
                this.createStanceSelect(e),
                e.appendChild(document.createTextNode("isMoving:")));
              let n = document.createElement("input");
              ((n.type = "checkbox"),
                (n.style.display = "block"),
                n.addEventListener("change", (e) => {
                  this.currentInfantry.moveTrait.moveState = e.target.checked ? I.MoveState.Moving : I.MoveState.Idle;
                }),
                e.appendChild(n),
                e.appendChild(document.createTextNode("isFiring:")));
              let o = document.createElement("input");
              ((o.type = "checkbox"),
                (o.disabled = !this.currentInfantry.rules.primary),
                (o.style.display = "block"),
                o.addEventListener("change", (e) => {
                  this.currentInfantry.isFiring = e.target.checked;
                }),
                e.appendChild(o),
                e.appendChild(document.createTextNode("isPanicked:")));
              let l = document.createElement("input");
              ((l.type = "checkbox"),
                (l.disabled = !this.currentInfantry.rules.fraidycat),
                (l.style.display = "block"),
                l.addEventListener("change", (e) => {
                  this.currentInfantry.isPanicked = e.target.checked;
                }),
                e.appendChild(l),
                e.appendChild(document.createTextNode("Warped out:")));
              let c = document.createElement("input");
              ((c.type = "checkbox"),
                (c.style.display = "block"),
                c.addEventListener("change", (e) => {
                  this.currentInfantry.warpedOutTrait.debugSetActive(e.target.checked);
                }),
                e.appendChild(c),
                this.createDeathSelect(e),
                document.body.appendChild(e));
            }
            static createZoneSelect(e) {
              let t = document.createElement("select");
              ((t.style.display = "block"),
                t.addEventListener("change", () => {
                  this.currentInfantry.zone = Number(t.value);
                }),
                e.appendChild(t));
              let i = document.createElement("option");
              if (
                ((i.value = "" + s.ZoneType.Ground),
                (i.innerHTML = s.ZoneType[s.ZoneType.Ground]),
                t.appendChild(i),
                this.currentInfantry.rules.consideredAircraft)
              ) {
                let e = document.createElement("option");
                ((e.value = "" + s.ZoneType.Air), (e.innerHTML = s.ZoneType[s.ZoneType.Air]), t.appendChild(e));
              }
              if (this.currentInfantry.rules.speedType === a.SpeedType.Amphibious) {
                let e = document.createElement("option");
                ((e.value = "" + s.ZoneType.Water), (e.innerHTML = s.ZoneType[s.ZoneType.Water]), t.appendChild(e));
              }
            }
            static createStanceSelect(e) {
              let t = document.createElement("select");
              ((t.style.display = "block"),
                t.addEventListener("change", () => {
                  this.currentInfantry.stance = Number(t.value);
                }),
                e.appendChild(t));
              let i = document.createElement("option");
              ((i.value = "" + n.StanceType.None), (i.innerHTML = n.StanceType[n.StanceType.None]), t.appendChild(i));
              let r = document.createElement("option");
              ((r.value = "" + n.StanceType.Guard), (r.innerHTML = n.StanceType[n.StanceType.Guard]), t.appendChild(r));
              let s = document.createElement("option");
              ((s.value = "" + n.StanceType.Paradrop),
                (s.innerHTML = n.StanceType[n.StanceType.Paradrop]),
                t.appendChild(s));
              let a = document.createElement("option");
              if (
                ((a.value = "" + n.StanceType.Cheer),
                (a.innerHTML = n.StanceType[n.StanceType.Cheer]),
                t.appendChild(a),
                !this.currentInfantry.rules.fearless)
              ) {
                let e = document.createElement("option");
                ((e.value = "" + n.StanceType.Prone),
                  (e.innerHTML = n.StanceType[n.StanceType.Prone]),
                  t.appendChild(e));
              }
              if (this.currentInfantry.rules.deployer) {
                let e = document.createElement("option");
                ((e.value = "" + n.StanceType.Deployed),
                  (e.innerHTML = n.StanceType[n.StanceType.Deployed]),
                  t.appendChild(e));
              }
            }
            static createDeathSelect(e) {
              e.appendChild(document.createTextNode("Death"));
              let t = document.createElement("select"),
                i = 1,
                r = v.InfDeathType[i];
              for (; void 0 !== r;) {
                let e = document.createElement("option");
                ((e.innerHTML = r),
                  (e.value = "" + i),
                  (e.disabled =
                    !this.currentInfantry.rules.isHuman &&
                    ![v.InfDeathType.Gunfire, v.InfDeathType.Explode].includes(i)),
                  t.appendChild(e),
                  (r = v.InfDeathType[++i]));
              }
              e.appendChild(t);
              let s = document.createElement("button");
              ((s.style.display = "block"),
                (s.style.color = "red"),
                (s.innerHTML = "KILL"),
                s.addEventListener("click", async () => {
                  ((this.currentInfantry.isDestroyed = !0),
                    (this.currentInfantry.infDeathType = Number(t.value)),
                    this.world.removeObject(this.currentInfantry),
                    this.currentInfantry.dispose(),
                    document.body.removeChild(this.controlsEl),
                    (this.controlsEl = void 0));
                }),
                e.appendChild(s));
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
                (i.style.width = "200px"),
                (i.style.background = "rgba(255, 255, 255, 0.5)"),
                (i.style.border = "1px black solid"),
                i.appendChild(document.createTextNode("Infantry types:")));
              let t = [...e.keys()].filter((e) => this.art.hasObject(e, P.ObjectType.Infantry)).sort();
              (t.forEach((e) => {
                let t = document.createElement("a");
                ((t.style.display = "block"),
                  (t.textContent = e),
                  t.setAttribute("href", "javascript:;"),
                  t.addEventListener("click", () => {
                    (console.log("Selected infantry", e), this.selectInfantry(e));
                  }),
                  i.appendChild(t));
              }),
                document.body.appendChild(i),
                setTimeout(() => {
                  (this.selectInfantry(t[0]), this.animateInfantry());
                }, 50));
            }
            static animateInfantry() {
              (this.currentInfantry.isDisposed ||
                (this.currentInfantry.direction = (this.currentInfantry.direction + 1) % 360),
                setTimeout(() => this.animateInfantry(), 50));
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
          (K.disposables = new i.CompositeDisposable()));
      },
    };
  },
);
