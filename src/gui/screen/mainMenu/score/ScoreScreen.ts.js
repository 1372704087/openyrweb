// === Reconstructed SystemJS module: gui/screen/mainMenu/score/ScoreScreen ===
// deps: ["gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/mainMenu/score/ScoreTable","game/SideType","engine/sound/Music","gui/screen/mainMenu/MainMenuScreen","LocalPrefs","@puzzl/core/lib/async/Task","@puzzl/core/lib/async/cancellation/OperationCanceledError","@puzzl/core/lib/async/sleep"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/score/ScoreScreen",
  [
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "gui/screen/mainMenu/score/ScoreTable",
    "game/SideType",
    "engine/sound/Music",
    "gui/screen/mainMenu/MainMenuScreen",
    "LocalPrefs",
    "@puzzl/core/lib/async/Task",
    "@puzzl/core/lib/async/cancellation/OperationCanceledError",
    "@puzzl/core/lib/async/sleep",
  ],
  function (e, t) {
    "use strict";
    var l, c, h, u, n, i, r, s, a, o, d, g;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
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
          n = e;
        },
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
          o = e;
        },
      ],
      execute: function () {
        ((d = new Map([
          [u.SideType.GDI, { img: "mpascrnl.shp", pal: "mpascrn.pal" }],
          [u.SideType.Nod, { img: "mpsscrnl.shp", pal: "mpsscrn.pal" }],
          [u.SideType.ThirdSide, { img: "mpyscrnl.shp", pal: "mpyscrn.pal" }],
        ])),
          (g = class extends i.MainMenuScreen {
            constructor(e, t, i, r, s, a) {
              (super(),
                (this.strings = e),
                (this.jsxRenderer = t),
                (this.messageBoxApi = i),
                (this.localPrefs = r),
                (this.config = s),
                (this.wolService = a),
                (this.musicType = n.MusicType.Score));
            }
            async onEnter(e) {
              ((this.title = e.singlePlayer
                ? this.strings.get("GUI:SkirmishScore")
                : this.strings.get("GUI:MultiplayerScore")),
                this.controller.toggleMainVideo(!1),
                this.initView(e),
                e.singlePlayer || this.loadGameReport(e.game));
            }
            initView({ game: e, localPlayer: t, isQuit: i, singlePlayer: r, tournament: s, returnTo: a }) {
              (this.controller.setSidebarButtons([
                {
                  label: this.strings.get("GUI:Continue"),
                  tooltip: this.strings.get("STT:MPScoreButtonContinue"),
                  isBottom: !0,
                  onClick: () => {
                    this.controller?.goToScreen(a.screenType, a.params);
                  },
                },
              ]),
                this.controller.showSidebarButtons());
              var n = t.country?.side ?? u.SideType.GDI,
                o = d.get(n);
              if (!o) throw new Error("Unsupported sideType " + n);
              var [o] = this.jsxRenderer.render(
                l.jsx(
                  "container",
                  { width: "100%", height: "100%" },
                  l.jsx("sprite", { image: o.img, palette: o.pal }),
                  l.jsx(c.HtmlView, {
                    width: "100%",
                    height: "100%",
                    component: h.ScoreTable,
                    innerRef: (e) => (this.scoreTable = e),
                    props: {
                      game: e,
                      singlePlayer: r,
                      isQuit: i,
                      localPlayer: t,
                      tournament: s,
                      strings: this.strings,
                    },
                  }),
                ),
              );
              this.controller.setMainComponent(o);
            }
            loadGameReport(i) {
              this.reportUpdateTask?.cancel();
              let e = (this.reportUpdateTask = new s.Task(async (e) => {
                for (;;) {
                  if (e.isCancelled()) return;
                  let t = this.wolService.getLastGameReport();
                  if (t?.gameId === i.id)
                    return void this.scoreTable.applyOptions((e) => {
                      e.gameReport = t;
                    });
                  await o.sleep(1e3, e);
                }
              }));
              e.start().catch((e) => {
                e instanceof a.OperationCanceledError || console.error(e);
              });
            }
            async onLeave() {
              (this.reportUpdateTask && (this.reportUpdateTask.cancel(), (this.reportUpdateTask = void 0)),
                await this.controller.hideSidebarButtons());
              var e,
                t,
                i = this.config.donateUrl;
              i &&
                (2 <= (t = Number(this.localPrefs.getItem(r.StorageKey.DonateBoxState) ?? "0"))
                  ? ((e = await this.messageBoxApi.confirm(
                      this.strings.get("TS:DonatePrompt"),
                      this.strings.get("TS:DonateNow"),
                      this.strings.get("TS:DonateLater"),
                    )) && window.open(i, "_blank"),
                    this.localPrefs.setItem(r.StorageKey.DonateBoxState, "-" + Date.now()),
                    window.gtag?.("event", "donate_dismiss", { donate: e }))
                  : 0 <= t
                    ? this.localPrefs.setItem(r.StorageKey.DonateBoxState, String(t + 1))
                    : ((t = -t), 2592e6 < Date.now() - t && this.localPrefs.setItem(r.StorageKey.DonateBoxState, "0")));
            }
          }),
          e("ScoreScreen", g));
      },
    };
  },
);
