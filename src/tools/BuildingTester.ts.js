// === Reconstructed SystemJS module: tools/BuildingTester ===
// deps: ["engine/gfx/Renderer","engine/Engine","engine/IsoCoords","engine/TheaterType","game/Player","engine/renderable/entity/building/DamageType","engine/renderable/entity/building/AnimationType","engine/renderable/WorldScene","game/rules/Rules","engine/renderable/entity/map/MapGrid","util/BoxedVar","engine/UiAnimationLoop","engine/ImageFinder","game/art/Art","engine/renderable/entity/RenderableFactory","util/Color","game/gameobject/selection/SelectionLevel","game/Alliances","game/PlayerList","game/gameobject/ObjectFactory","engine/type/ObjectType","gui/PointerEvents","util/disposable/CompositeDisposable","game/gameobject/selection/UnitSelection","tools/CameraZoomControls","game/gameobject/Infantry","engine/Lighting","game/map/TileCollection","game/map/TileOccupation","game/map/Bridges","data/Strings","game/gameobject/trait/AutoRepairTrait","game/map/MapBounds","engine/renderable/entity/unit/FlyerHelperMode","engine/gfx/lighting/LightingDirector","game/World","engine/RenderableManager","engine/renderable/builder/VxlBuilderFactory","engine/renderable/builder/vxlGeometry/VxlGeometryPool","engine/gfx/geometry/VxlGeometryCache","engine/renderable/entity/unit/ShadowQuality","gui/CanvasMetrics","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "tools/BuildingTester",
  [
    "engine/gfx/Renderer",
    "engine/Engine",
    "engine/IsoCoords",
    "engine/TheaterType",
    "game/Player",
    "engine/renderable/entity/building/DamageType",
    "engine/renderable/entity/building/AnimationType",
    "engine/renderable/WorldScene",
    "game/rules/Rules",
    "engine/renderable/entity/map/MapGrid",
    "util/BoxedVar",
    "engine/UiAnimationLoop",
    "engine/ImageFinder",
    "game/art/Art",
    "engine/renderable/entity/RenderableFactory",
    "util/Color",
    "game/gameobject/selection/SelectionLevel",
    "game/Alliances",
    "game/PlayerList",
    "game/gameobject/ObjectFactory",
    "engine/type/ObjectType",
    "gui/PointerEvents",
    "util/disposable/CompositeDisposable",
    "game/gameobject/selection/UnitSelection",
    "tools/CameraZoomControls",
    "game/gameobject/Infantry",
    "engine/Lighting",
    "game/map/TileCollection",
    "game/map/TileOccupation",
    "game/map/Bridges",
    "data/Strings",
    "game/gameobject/trait/AutoRepairTrait",
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
      u,
      l,
      c,
      d,
      p,
      s,
      h,
      g,
      r,
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
      a,
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
      n;
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
          c = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          r = e;
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
          a = e;
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
          "BuildingTester",
          (n = class n {
            static async main(e) {
              let t = (this.renderer = new o.Renderer(800, 600));
              (t.init(document.body), t.initStats(document.body));
              let i = h.WorldScene.factory(
                { x: 0, y: 0, width: 800, height: 600 },
                new m.BoxedVar(!0),
                new m.BoxedVar(V.ShadowQuality.High),
              );
              (this.disposables.add(i),
                (i.scene.background = new THREE.Color(12632256)),
                l.IsoCoords.init({ x: 0, y: 0 }),
                (this.theater = await u.Engine.loadTheater(c.TheaterType.Snow)));
              var r = new g.Rules(u.Engine.getRules());
              (this.buildBrowser(r.buildingRules),
                (this.rules = r),
                (this.art = new T.Art(r, u.Engine.getArt())),
                (this.images = u.Engine.getImages()),
                (this.voxels = u.Engine.getVoxels()),
                (this.voxelAnims = u.Engine.getVoxelAnims()));
              let s = new W.CanvasMetrics(t.getCanvas(), window);
              (s.init(), this.disposables.add(s));
              r = new O.PointerEvents(t, { x: 0, y: 0 }, document, s);
              let a = new M.CameraZoomControls(r, i.cameraZoom);
              (this.disposables.add(a, r), a.init(), t.addScene(i));
              let n = (this.uiAnimationLoop = new f.UiAnimationLoop(t));
              (n.start(),
                (this.worldScene = i),
                (this.vxlGeometryPool = new H.VxlGeometryPool(new G.VxlGeometryCache())),
                this.addGrid());
            }
            static addGrid() {
              let e = new r.MapGrid({ width: 10, height: 10 });
              var t = e.get3DObject();
              let i = new THREE.Object3D();
              (i.add(t), this.worldScene.scene.add(i));
            }
            static selectBuilding(e) {
              this.currentRenderable &&
                !this.currentBuilding.isDisposed &&
                (this.world.removeObject(this.currentBuilding), this.currentBuilding.dispose());
              var t = this.rules.getBuilding(e);
              let i = new d.Player("Player");
              (this.disposables.add(i),
                (i.color =
                  -1 !== t.techLevel || t.constructionYard
                    ? this.rules.getMultiplayerColors().get("DarkRed")
                    : new b.Color(255, 255, 255)));
              let r = new E.PlayerList();
              r.addPlayer(i);
              var s = new w.Alliances(r),
                a = new A.UnitSelection(),
                n = new R.Lighting();
              this.disposables.add(n);
              ((t = new v.RenderableFactory(
                new m.BoxedVar(i),
                a,
                s,
                this.rules,
                this.art,
                void 0,
                new y.ImageFinder(this.images, this.theater),
                u.Engine.getPalettes(),
                this.voxels,
                this.voxelAnims,
                this.theater,
                this.worldScene.camera,
                n,
                new D.LightingDirector(n, this.renderer, new m.BoxedVar(1)),
                new m.BoxedVar(!1),
                new m.BoxedVar(!1),
                new m.BoxedVar(2),
                void 0,
                new B.Strings({ TXT_PRIMARY: "Primary" }),
                new m.BoxedVar(L.FlyerHelperMode.Selected),
                new m.BoxedVar(!1),
                new U.VxlBuilderFactory(this.vxlGeometryPool, !1, this.worldScene.camera),
                new Map(),
              )),
                (a = new P.TileCollection([], null, this.rules.general, z.getRandomInt)),
                (s = new I.TileOccupation(a)),
                (n = new j.MapBounds()),
                (n = new k.Bridges(this.theater.tileSets, a, s, n, this.rules)));
              let o = (this.currentBuilding = new C.ObjectFactory(a, s, n, new m.BoxedVar(1)).create(
                x.ObjectType.Building,
                e,
                this.rules,
                this.art,
              ));
              ((o.owner = i),
                (o.position.tile = { rx: 1, ry: 1, z: 0, rampType: 0 }),
                o.position.setCenterOffset(o.getFoundationCenterOffset()));
              let l = (this.world = new F.World()),
                c = new _.RenderableManager(l, this.worldScene, this.worldScene.camera, t);
              (c.init(), this.disposables.add(c), l.spawnObject(o));
              let h = (this.currentRenderable = c.getRenderableByGameObject(o));
              (h.selectionModel.setSelectionLevel(S.SelectionLevel.Selected),
                this.currentRenderable.selectionModel.setControlGroupNumber(3),
                setTimeout(() => {
                  (this.buildBuildingControls(), this.createAnimButtons(), this.createOccupiedButtons());
                }, 50));
            }
            static selectAnimation(e) {
              this.currentRenderable && this.currentRenderable.setAnimation(e, performance.now());
            }
            static stopCurrentAnimation() {
              this.currentRenderable && this.currentRenderable.endCurrentAnimation();
            }
            static setDamageType(e) {
              this.currentBuilding.healthTrait.health = e
                ? 100 *
                  (e === p.DamageType.CONDITION_YELLOW
                    ? n.rules.audioVisual.conditionYellow
                    : n.rules.audioVisual.conditionRed)
                : 100;
            }
            static setActiveState(e) {
              this.currentRenderable && this.currentRenderable.setPowered(e);
            }
            static createAnimButtons() {
              let t = this.animButtonsWrap;
              t.innerHTML = "";
              for (let r of [
                s.AnimationType.IDLE,
                s.AnimationType.PRODUCTION,
                s.AnimationType.BUILDUP,
                s.AnimationType.UNBUILD,
                s.AnimationType.SUPER_CHARGE_START,
                s.AnimationType.SPECIAL_REPAIR_START,
                s.AnimationType.SPECIAL_SHOOT,
                s.AnimationType.SPECIAL_DOCKING,
                s.AnimationType.FACTORY_DEPLOYING,
                s.AnimationType.FACTORY_ROOF_DEPLOYING,
              ]) {
                let e = document.createElement("button");
                if (
                  ((e.innerHTML = s.AnimationType[r]),
                  (e.style.display = "block"),
                  e.addEventListener("click", () => this.selectAnimation(r)),
                  !this.currentRenderable)
                )
                  throw new Error("Must build anim buttons after a building is selected");
                var i = !this.currentRenderable.hasAnimation(r);
                ((e.disabled = i), (e.style.opacity = i ? ".5" : "1"), t.appendChild(e));
              }
            }
            static createOccupiedButtons() {
              let e = this.occupiedButtonsWrap;
              e.innerHTML = "";
              let t = document.createElement("select");
              ((t.disabled = !this.currentBuilding.garrisonTrait),
                (t.style.display = "block"),
                t.addEventListener("change", () => {
                  this.currentBuilding.garrisonTrait.units = new Array(Number(t.value))
                    .fill(0)
                    .map(() => new a.Infantry("dummy", this.rules.getObject("E1", x.ObjectType.Infantry), null));
                }));
              for (let i = 0; i < this.currentBuilding.rules.maxNumberOccupants + 1; i++) {
                let e = document.createElement("option");
                ((e.innerHTML = String(i)), (e.value = String(i)), (e.selected = 0 === i), t.appendChild(e));
              }
              e.appendChild(t);
            }
            static buildBuildingControls() {
              this.controlsElement && document.body.removeChild(this.controlsElement);
              let e = (this.controlsElement = document.createElement("div"));
              ((e.style.position = "absolute"),
                (e.style.left = "0"),
                (e.style.top = "0"),
                (e.style.width = "220px"),
                (e.style.padding = "5px"),
                (e.style.background = "rgba(255, 255, 255, 0.5)"),
                (e.style.border = "1px black solid"),
                e.appendChild(document.createTextNode("Remap color:")));
              let t = new Map(this.rules.getMultiplayerColors());
              t.set("None", new b.Color(255, 255, 255));
              let r = document.createElement("select");
              ((r.style.display = "block"),
                r.addEventListener("change", () => {
                  this.currentBuilding.owner.color = t.get(r.value);
                }),
                e.appendChild(r),
                t.forEach((e, t) => {
                  let i = document.createElement("option");
                  ((i.innerHTML = t),
                    (i.value = t),
                    (i.selected = e.asHex() === this.currentBuilding.owner.color.asHex()),
                    r.appendChild(i));
                }),
                e.appendChild(document.createTextNode("Selection level:")));
              let i = document.createElement("div");
              (e.appendChild(i),
                [S.SelectionLevel.None, S.SelectionLevel.Hover, S.SelectionLevel.Selected].forEach((e) => {
                  let t = document.createElement("button");
                  ((t.innerHTML = S.SelectionLevel[e]),
                    (t.disabled = e === S.SelectionLevel.Selected && !this.currentBuilding.rules.selectable),
                    t.addEventListener("click", () => this.currentRenderable.selectionModel.setSelectionLevel(e)),
                    i.appendChild(t));
                }),
                e.appendChild(document.createTextNode("Animation type:")));
              var s = (this.animButtonsWrap = document.createElement("div"));
              e.appendChild(s);
              let a = document.createElement("button");
              ((a.innerHTML = "Stop current"),
                (a.style.display = "block"),
                a.addEventListener("click", () => this.stopCurrentAnimation()),
                e.appendChild(a),
                e.appendChild(document.createTextNode("Occupants:")));
              s = this.occupiedButtonsWrap = document.createElement("div");
              (e.appendChild(s), e.appendChild(document.createTextNode("Damage type:")));
              let n = document.createElement("button");
              ((n.innerHTML = "NORMAL"),
                (n.style.display = "block"),
                n.addEventListener("click", () => this.setDamageType(p.DamageType.NORMAL)),
                e.appendChild(n));
              let o = document.createElement("button");
              ((o.innerHTML = "YELLOW"),
                (o.style.display = "block"),
                o.addEventListener("click", () => this.setDamageType(p.DamageType.CONDITION_YELLOW)),
                e.appendChild(o));
              let l = document.createElement("button");
              ((l.innerHTML = "RED"),
                (l.style.display = "block"),
                l.addEventListener("click", () => this.setDamageType(p.DamageType.CONDITION_RED)),
                e.appendChild(l));
              let c = document.createElement("button");
              ((c.innerHTML = "DESTROYED"),
                (c.style.display = "block"),
                c.addEventListener("click", async () => {
                  ((this.currentBuilding.isDestroyed = !0),
                    (this.currentBuilding.healthTrait.health = 0),
                    this.world.removeObject(this.currentBuilding),
                    this.currentBuilding.dispose(),
                    document.body.removeChild(this.controlsElement),
                    (this.controlsElement = void 0));
                }),
                e.appendChild(c));
              let h = document.createElement("button");
              ((h.innerHTML = "Toggle repair"),
                (h.style.display = "block"),
                h.addEventListener("click", () => {
                  let e = this.currentBuilding.traits.get(N.AutoRepairTrait);
                  e.setDisabled(!e.isDisabled());
                }),
                e.appendChild(h),
                e.appendChild(document.createTextNode("Powered state:")));
              let u = document.createElement("button");
              ((u.innerHTML = "INACTIVE"),
                (u.style.display = "block"),
                u.addEventListener("click", () => this.setActiveState(!1)),
                e.appendChild(u));
              let d = document.createElement("button");
              ((d.innerHTML = "ACTIVE"),
                (d.style.display = "block"),
                d.addEventListener("click", () => this.setActiveState(!0)),
                e.appendChild(d),
                e.appendChild(document.createTextNode("Warped out:")));
              let g = document.createElement("input");
              ((g.type = "checkbox"),
                (g.style.display = "block"),
                g.addEventListener("change", (e) => {
                  this.currentBuilding.warpedOutTrait.debugSetActive(e.target.checked);
                }),
                e.appendChild(g),
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
                i.appendChild(document.createTextNode("Building types:")));
              let r = [];
              (e.forEach((e, t) => {
                -1 !== ["AMMOCRAT", "GADUMY", "GAGREEN", "CAARMR"].indexOf(t) ||
                  /^CASIN/.exec(t) ||
                  /^CITY/.exec(t) ||
                  r.push(t);
              }),
                r.sort(),
                r.forEach((e) => {
                  let t = document.createElement("a");
                  ((t.style.display = "block"),
                    (t.textContent = e),
                    t.setAttribute("href", "javascript:;"),
                    t.addEventListener("click", () => {
                      (console.log("Selected building", e), this.selectBuilding(e));
                    }),
                    i.appendChild(t));
                }),
                document.body.appendChild(i),
                setTimeout(() => {
                  this.selectBuilding(r[0]);
                }, 50));
            }
            static destroy() {
              (this.renderer.destroy(),
                this.uiAnimationLoop.destroy(),
                this.listEl.remove(),
                this.controlsElement && (this.controlsElement.remove(), (this.controlsElement = void 0)),
                this.disposables.dispose());
            }
          }),
        ),
          (n.disposables = new i.CompositeDisposable()));
      },
    };
  },
);
