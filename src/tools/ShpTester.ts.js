// === Reconstructed SystemJS module: tools/ShpTester ===
// deps: ["engine/gfx/Renderer","gui/UiScene","gui/screen/game/component/Hud","engine/Engine","gui/screen/game/component/hud/viewmodel/SidebarModel","game/rules/Rules","game/art/Art","game/Country","game/Player","game/World","game/gameobject/ObjectFactory","game/art/ObjectArt","engine/type/ObjectType","engine/UiAnimationLoop","game/Game","gui/jsx/JsxRenderer","util/disposable/CompositeDisposable","game/Alliances","game/PlayerList","gui/Pointer","util/BoxedVar","game/map/TileCollection","game/map/TileOccupation","game/map/Bridges","game/gameobject/selection/UnitSelection","game/ini/GameModeType","util/math","engine/TheaterType","game/GameMap","game/player/trait/RadarTrait","gui/screen/game/component/Minimap","game/player/production/Production","gui/screen/game/component/hud/viewmodel/CombatantSidebarModel","gui/screen/game/component/hud/viewmodel/MessageList","game/trait/MapShroudTrait","game/trait/SellTrait","game/map/MapBounds","engine/mixDatabase","gui/screen/game/component/hud/commandBar/CommandBarButtonType","gui/CanvasMetrics","game/trait/StalemateDetectTrait","game/CountdownTimer","data/IniSection","gui/chat/ChatHistory"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "tools/ShpTester",
  [
    "engine/gfx/Renderer",
    "gui/UiScene",
    "gui/screen/game/component/Hud",
    "engine/Engine",
    "gui/screen/game/component/hud/viewmodel/SidebarModel",
    "game/rules/Rules",
    "game/art/Art",
    "game/Country",
    "game/Player",
    "game/World",
    "game/gameobject/ObjectFactory",
    "game/art/ObjectArt",
    "engine/type/ObjectType",
    "engine/UiAnimationLoop",
    "game/Game",
    "gui/jsx/JsxRenderer",
    "util/disposable/CompositeDisposable",
    "game/Alliances",
    "game/PlayerList",
    "gui/Pointer",
    "util/BoxedVar",
    "game/map/TileCollection",
    "game/map/TileOccupation",
    "game/map/Bridges",
    "game/gameobject/selection/UnitSelection",
    "game/ini/GameModeType",
    "util/math",
    "engine/TheaterType",
    "game/GameMap",
    "game/player/trait/RadarTrait",
    "gui/screen/game/component/Minimap",
    "game/player/production/Production",
    "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel",
    "gui/screen/game/component/hud/viewmodel/MessageList",
    "game/trait/MapShroudTrait",
    "game/trait/SellTrait",
    "game/map/MapBounds",
    "engine/mixDatabase",
    "gui/screen/game/component/hud/commandBar/CommandBarButtonType",
    "gui/CanvasMetrics",
    "game/trait/StalemateDetectTrait",
    "game/CountdownTimer",
    "data/IniSection",
    "gui/chat/ChatHistory",
  ],
  function (e, t) {
    "use strict";
    var F,
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
      Q,
      Y,
      Z,
      X,
      J,
      i,
      ee,
      te,
      ie,
      re,
      se,
      ae,
      ne,
      oe,
      le,
      ce,
      he,
      ue,
      de,
      ge,
      pe,
      me,
      fe,
      ye,
      Te,
      ve,
      be,
      Se,
      we,
      Ee,
      Ce,
      xe,
      Oe,
      r;
    t && t.id;
    return {
      setters: [
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
        function (e) {
          Q = e;
        },
        function (e) {
          Y = e;
        },
        function (e) {
          Z = e;
        },
        function (e) {
          X = e;
        },
        function (e) {
          J = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          ee = e;
        },
        function (e) {
          te = e;
        },
        function (e) {
          ie = e;
        },
        function (e) {
          re = e;
        },
        function (e) {
          se = e;
        },
        function (e) {
          ae = e;
        },
        function (e) {
          ne = e;
        },
        function (e) {
          oe = e;
        },
        function (e) {
          le = e;
        },
        function (e) {
          ce = e;
        },
        function (e) {
          he = e;
        },
        function (e) {
          ue = e;
        },
        function (e) {
          de = e;
        },
        function (e) {
          ge = e;
        },
        function (e) {
          pe = e;
        },
        function (e) {
          me = e;
        },
        function (e) {
          fe = e;
        },
        function (e) {
          ye = e;
        },
        function (e) {
          Te = e;
        },
        function (e) {
          ve = e;
        },
        function (e) {
          be = e;
        },
        function (e) {
          Se = e;
        },
        function (e) {
          we = e;
        },
        function (e) {
          Ee = e;
        },
        function (e) {
          Ce = e;
        },
        function (e) {
          xe = e;
        },
        function (e) {
          Oe = e;
        },
      ],
      execute: function () {
        (e(
          "ShpTester",
          (r = class {
            static async main(e, t, i, r) {
              let s = new F.Renderer(800, 600);
              (s.init(i), s.initStats(document.body), this.disposables.add(s));
              let a = _.UiScene.factory({ x: 0, y: 0, width: 800, height: 600 });
              (this.disposables.add(a), await e.addMixFile("sidec01.mix"));
              var n = be.mixDatabase.get("cameo.mix");
              if (!n) throw new Error("Missing file list database for cameos");
              let o = new V.Rules(H.Engine.getRules()),
                l = new W.Art(o, H.Engine.getArt());
              var c = await H.Engine.loadTheater(he.TheaterType.Temperate),
                h = new ue.GameMap(t, c.tileSets, o, ce.getRandomInt),
                u = { superWeapons: !1, gameSpeed: 5 },
                d = z.Country.factory("Americans", o);
              let g = new K.Player("Player", d);
              ((g.radarTrait = new de.RadarTrait()),
                (g.production = new pe.Production(g, 10, u, o, [
                  ...o.buildingRules.values(),
                  ...o.infantryRules.values(),
                ])),
                this.disposables.add(g));
              var p = new q.World(),
                m = new te.PlayerList(),
                f = new ee.Alliances(m),
                y = new oe.UnitSelection(),
                T = new se.TileCollection([], null, o.general, ce.getRandomInt),
                v = new ae.TileOccupation(T),
                d = new ve.MapBounds(),
                c = new ne.Bridges(c.tileSets, T, v, d, o),
                d = new re.BoxedVar(1);
              let b = new $.ObjectFactory(T, v, c, d),
                S = new X.Game(p, h, o, l, null, "0", 0, u, le.GameModeType.Battle, m, y, f, d, b, null);
              (S.addPlayer(g),
                (S.mapShroudTrait = new ye.MapShroudTrait(h, f)),
                S.traits.add(S.mapShroudTrait),
                (S.sellTrait = new Te.SellTrait(S, S.rules.general)),
                S.traits.add(S.sellTrait));
              var w;
              ["GACNST", "GAPOWR", "GAREFN", "GAPILE", "GAAIRC", "GAWEAP", "GATECH", "NACNST", "NAPOWR"].forEach((e) =>
                g.addOwnedObject(b.create(Y.ObjectType.Building, e, o, l)),
              );
              let E = new me.CombatantSidebarModel(g, S);
              ((E.powerDrained = 150), (E.powerGenerated = 300), g.radarTrait.setDisabled(!1));
              let C = setInterval(() => {
                ((E.powerDrained = ce.getRandomInt(0, 300)),
                  (E.powerGenerated = ce.getRandomInt(200, 1e3)),
                  console.log(`Set power = ${E.powerGenerated}, drain = ` + E.powerDrained));
              }, 5e3);
              (this.disposables.add(() => clearInterval(C)), (g.credits = 5e3));
              let x = setInterval(() => {
                ((g.credits = ce.clamp(g.credits + ce.getRandomInt(-1e3, 1e3), 0, 1e6)),
                  console.log("Set credits", g.credits));
              }, 5e3);
              this.disposables.add(() => clearInterval(x));
              for (w of g.production.getAvailableObjects()) {
                var O = Q.ObjectArt.factory(
                  w.type,
                  w,
                  H.Engine.getArt(),
                  H.Engine.getArt().getSection(w.imageName) ?? new xe.IniSection(w.imageName),
                );
                let e = E.getTabForQueueType(g.production.getQueueTypeForObject(w));
                e.items.push({
                  target: { type: G.SidebarItemTargetType.Techno, rules: w },
                  cameo: O.cameo,
                  disabled: e.id === G.SidebarCategory.Structures,
                  progress: 0,
                  quantity: 0,
                  status: G.SidebarItemStatus.Idle,
                });
              }
              let A = E.activeTab.items[1];
              ((A.disabled = !1), (A.progress = 0.75), (A.quantity = 2), (A.status = G.SidebarItemStatus.OnHold));
              let M = E.tabs[G.SidebarCategory.Infantry].items[0];
              ((M.quantity = 5), (M.progress = 1), (M.status = G.SidebarItemStatus.Ready));
              let R = new we.CanvasMetrics(s.getCanvas(), window);
              (R.init(), this.disposables.add(R));
              let P = ie.Pointer.factory(
                H.Engine.getImages().get("mouse.shp"),
                H.Engine.getPalettes().get("mousepal.pal"),
                s,
                document,
                R,
                new re.BoxedVar(!1),
              );
              (P.init(), P.lock(), this.disposables.add(P), a.add(P.getSprite()));
              f = new J.JsxRenderer(H.Engine.getImages(), H.Engine.getPalettes(), a.camera, P.pointerEvents);
              let I = new fe.MessageList(S.rules.audioVisual.messageDuration, 6, g),
                k,
                B = ["txt_low_power", "txt_space_cant_save", "txt_receiving_scenario", "txt_bad_chankey"],
                N = () => {
                  var e = r.get(B[ce.getRandomInt(0, B.length - 1)]);
                  (console.log("Add system message:", e),
                    I.addSystemMessage(
                      e,
                      "#" + new THREE.Color(Math.random(), Math.random(), Math.random()).getHexString(),
                    ),
                    (k = setTimeout(N, 5e3 * Math.random())));
                };
              ((k = setTimeout(N, 5e3 * Math.random())), this.disposables.add(() => clearTimeout(k)));
              let j = new U.Hud(
                  g.country.side,
                  a.viewport,
                  H.Engine.getImages(),
                  H.Engine.getPalettes(),
                  n,
                  E,
                  I,
                  new Oe.ChatHistory(),
                  new re.BoxedVar(""),
                  new re.BoxedVar(!1),
                  void 0,
                  [],
                  new Ee.StalemateDetectTrait(),
                  new Ce.CountdownTimer(),
                  f,
                  r,
                  Object.values(Se.CommandBarButtonType).filter((e) => "number" == typeof e),
                ),
                L = new ge.Minimap(S, g, j.getTextColor(), o.general.radar);
              (L.setPointerEvents(P.pointerEvents),
                j.setMinimap(L),
                this.disposables.add(L),
                a.add(j),
                j.onSidebarSlotClick.subscribe((e) => {
                  console.log("clicked", e);
                }),
                j.onOptButtonClick.subscribe(() => {
                  (P.unlock(),
                    j.showSidebarMenu([
                      {
                        label: "Button 1",
                        onClick() {
                          console.log("button 1 clicked");
                        },
                      },
                      {
                        label: "Button 2",
                        disabled: !0,
                        onClick() {
                          console.error("button 2 should not trigger onClick");
                        },
                      },
                      {
                        label: "Exit",
                        isBottom: !0,
                        onClick() {
                          (P.lock(), j.hideSidebarMenu());
                        },
                      },
                    ]));
                }),
                j.onRepairButtonClick.subscribe(() => {
                  g.radarTrait.setDisabled(!g.radarTrait.isDisabled());
                }),
                j.onCommandBarButtonClick.subscribe((e) => {
                  console.log("Clicked command bar -> " + Se.CommandBarButtonType[e]);
                }));
              n = new Date().getTime();
              s.addScene(a);
              let D = new Z.UiAnimationLoop(s);
              (this.disposables.add(D), D.start());
              f = new Date().getTime();
              (console.log("Rendering took " + (f - n) + "ms"),
                i.appendChild(a.getHtmlContainer().getElement()),
                this.disposables.add(() => {
                  i.removeChild(a.getHtmlContainer().getElement());
                }));
            }
            static destroy() {
              this.disposables.dispose();
            }
          }),
        ),
          (r.disposables = new i.CompositeDisposable()));
      },
    };
  },
);
