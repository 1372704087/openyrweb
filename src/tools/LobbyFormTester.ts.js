// === Reconstructed SystemJS module: tools/LobbyFormTester ===
// deps: ["engine/gfx/Renderer","engine/Engine","gui/UiScene","gui/screen/mainMenu/lobby/component/viewmodel/lobby","gui/screen/mainMenu/component/MainMenu","game/rules/Rules","gui/screen/mainMenu/lobby/component/LobbyForm","engine/UiAnimationLoop","gui/jsx/JsxRenderer","util/disposable/CompositeDisposable","gui/jsx/jsx","gui/jsx/HtmlView","game/gameopts/constants","network/ladder/PlayerRankType","network/ladder/wladderConfig"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "tools/LobbyFormTester",
  [
    "engine/gfx/Renderer",
    "engine/Engine",
    "gui/UiScene",
    "gui/screen/mainMenu/lobby/component/viewmodel/lobby",
    "gui/screen/mainMenu/component/MainMenu",
    "game/rules/Rules",
    "gui/screen/mainMenu/lobby/component/LobbyForm",
    "engine/UiAnimationLoop",
    "gui/jsx/JsxRenderer",
    "util/disposable/CompositeDisposable",
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "game/gameopts/constants",
    "network/ladder/PlayerRankType",
    "network/ladder/wladderConfig",
  ],
  function (e, t) {
    "use strict";
    var u, d, g, p, m, f, y, T, v, i, b, S, w, E, C, r;
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
          i = e;
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
      ],
      execute: function () {
        (e(
          "LobbyFormTester",
          (r = class {
            static main(e, t) {
              let i = new u.Renderer(800, 600);
              (i.init(e), i.initStats(document.body), this.disposables.add(i));
              let r = g.UiScene.factory({ x: 0, y: 0, width: 800, height: 600 });
              this.disposables.add(r);
              let s = 800,
                a = 600;
              var n = {
                x: Math.max(0, (r.viewport.width - s) / 2),
                y: Math.max(0, (r.viewport.height - a) / 2),
                width: s,
                height: a,
              };
              let o = new v.JsxRenderer(d.Engine.getImages(), d.Engine.getPalettes(), r.camera, void 0),
                l = new m.MainMenu(n, d.Engine.getImages(), o, "dummy.webm");
              r.add(l);
              let c = new f.Rules(d.Engine.getRules());
              var [n] = o.render(
                b.jsx(S.HtmlView, {
                  x: n.x,
                  y: n.y,
                  component: y.LobbyForm,
                  props: {
                    strings: t,
                    countryUiNames: new Map(
                      [
                        ["Random", "GUI:RandomEx"],
                        ["Observer", "GUI:Observer"],
                      ].concat(c.getMultiplayerCountries().map((e) => [e.name, e.uiName])),
                    ),
                    countryUiTooltips: new Map(),
                    availablePlayerCountries: ["Random"].concat(c.getMultiplayerCountries().map((e) => e.name)),
                    availablePlayerColors: [""].concat(
                      [...c.getMultiplayerColors().values()].map((e) => e.asHexString()),
                    ),
                    maxTeams: 4,
                    availableAiNames: w.aiUiNames,
                    availableStartPositions: new Array(8).fill(0).map((e, t) => t),
                    activeSlotIndex: 0,
                    teamsAllowed: !0,
                    teamsRequired: !1,
                    lobbyType: p.LobbyType.MultiplayerHost,
                    playerSlots: [
                      {
                        name: "Player 1",
                        type: p.SlotType.Player,
                        occupation: p.SlotOccupation.Occupied,
                        country: "French",
                        color: "#2269d4",
                        startPos: w.RANDOM_START_POS,
                        team: w.NO_TEAM_ID,
                        status: p.PlayerStatus.Host,
                        ping: 50,
                        playerProfile: {
                          name: "Player 1",
                          rank: 2,
                          rankType: E.PlayerRankType.Private,
                          points: 100,
                          ladder: { id: 0, name: "1v1", divisionName: "Test ladder", type: C.LadderType.Solo1v1 },
                          wins: 0,
                          losses: 0,
                        },
                      },
                      {
                        name: "Player 2",
                        type: p.SlotType.Player,
                        occupation: p.SlotOccupation.Occupied,
                        country: "Russians",
                        color: "#ff1818",
                        startPos: 1,
                        team: 0,
                        status: p.PlayerStatus.Ready,
                        ping: 300,
                      },
                      {
                        name: "Open",
                        type: p.SlotType.Player,
                        occupation: p.SlotOccupation.Open,
                        country: "Random",
                        color: "",
                        startPos: w.RANDOM_START_POS,
                        team: w.NO_TEAM_ID,
                        status: p.PlayerStatus.NotReady,
                      },
                      {
                        type: p.SlotType.Observer,
                        occupation: p.SlotOccupation.Open,
                        country: "Observer",
                        color: "",
                        startPos: w.RANDOM_START_POS,
                        team: w.NO_TEAM_ID,
                        status: p.PlayerStatus.NotReady,
                      },
                    ],
                    shortGame: !0,
                    mcvRepacks: !0,
                    cratesAppear: !0,
                    superWeapons: !0,
                    buildOffAlly: !0,
                    destroyableBridges: !0,
                    multiEngineer: !1,
                    multiEngineerCount: 3,
                    noDogEngiKills: !1,
                    instantCapture: !0,
                    delayedOils: !1,
                    gameSpeed: 6,
                    credits: 1e4,
                    unitCount: 10,
                    messages: [],
                    mpDialogSettings: c.mpDialogSettings,
                    onSendMessage: () => {},
                    onCountrySelect: (e) => {
                      console.log("selected country", e);
                    },
                    onColorSelect: (e) => {
                      console.log("selected color", e);
                    },
                    onStartPosSelect: (e) => {
                      console.log("selected start pos", e);
                    },
                    onTeamSelect: (e) => {
                      console.log("selected team", e);
                    },
                    onSlotChange: (e, t) => {
                      console.log("changed slot", e, t);
                    },
                    onToggleShortGame: (e) => console.log(e),
                    onToggleMcvRepacks: (e) => console.log(e),
                    onToggleCratesAppear: (e) => console.log(e),
                    onToggleSuperWeapons: (e) => console.log(e),
                    onToggleBuildOffAlly: (e) => console.log(e),
                    onToggleDestroyableBridges: (e) => console.log(e),
                    onToggleMultiEngineer: (e) => console.log(e),
                    onToggleNoDogEngiKills: (e) => console.log(e),
                    onToggleInstantCapture: (e) => console.log(e),
                    onToggleDelayedOils: (e) => console.log(e),
                    onChangeGameSpeed: (e) => console.log(e),
                    onChangeCredits: (e) => console.log(e),
                    onChangeUnitCount: (e) => console.log(e),
                  },
                }),
              );
              (l.add(n), i.addScene(r));
              let h = new T.UiAnimationLoop(i);
              (h.start(),
                this.disposables.add(h),
                e.appendChild(r.getHtmlContainer().getElement()),
                this.disposables.add(() => e.removeChild(r.getHtmlContainer().getElement())));
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
