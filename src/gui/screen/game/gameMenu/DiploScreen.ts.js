// === Reconstructed SystemJS module: gui/screen/game/gameMenu/DiploScreen ===
// deps: ["gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/game/gameMenu/DiploForm","util/disposable/CompositeDisposable","gui/screen/game/GameMenuScreen","network/gameopt/LoadInfoParser"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/gameMenu/DiploScreen",
  [
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "gui/screen/game/gameMenu/DiploForm",
    "util/disposable/CompositeDisposable",
    "gui/screen/game/GameMenuScreen",
    "network/gameopt/LoadInfoParser",
  ],
  function (e, t) {
    "use strict";
    var a, n, o, l, i, c, r;
    t && t.id;
    return {
      setters: [
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
          i = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        ((r = class extends i.GameMenuScreen {
          constructor(e, t, i, r, s, a) {
            (super(),
              (this.strings = e),
              (this.jsxRenderer = t),
              (this.renderer = i),
              (this.gameModes = r),
              (this.taunts = s),
              (this.mutedPlayers = a),
              (this.disposables = new l.CompositeDisposable()),
              (this.onFrame = (e) => {
                (!this.lastUpdate || 500 < e - this.lastUpdate) && ((this.lastUpdate = e), this.updateForm());
              }),
              (this.handleConInfoUpdate = (t) => {
                this.form.applyOptions((e) => {
                  e.conInfos = new c.LoadInfoParser().parse(t);
                });
              }),
              (this.updateForm = () => {
                this.form.applyOptions((e) => {
                  this.params &&
                    ((e.playerInfos = this.buildPlayerInfos(this.params.game, this.params.localPlayer)),
                    (e.taunts = this.taunts.value),
                    (e.messages = this.params.chatHistory?.getAll()));
                });
              }));
          }
          onEnter(e) {
            (this.controller.toggleContentAreaVisibility(!0),
              this.initView(e),
              (this.params = e),
              this.renderer.onFrame.subscribe(this.onFrame),
              this.disposables.add(() => this.renderer.onFrame.unsubscribe(this.onFrame)));
            const t = e.chatHistory;
            t &&
              (t.onNewMessage.subscribe(this.updateForm),
              this.disposables.add(() => t.onNewMessage.unsubscribe(this.updateForm)));
            const i = e.gservCon;
            if (i?.isOpen()) {
              (i.onLoadInfo.subscribe(this.handleConInfoUpdate),
                this.disposables.add(() => i.onLoadInfo.unsubscribe(this.handleConInfoUpdate)),
                i.requestLoadInfo());
              let e = setInterval(() => {
                i.isOpen() ? i.requestLoadInfo() : this.disposables.dispose();
              }, 1e4);
              this.disposables.add(() => clearInterval(e));
            }
          }
          initView(t) {
            let e = this.strings;
            var i = [{ label: e.get("GUI:ResumeMission"), isBottom: !0, onClick: t.onCancel }];
            (this.controller.setSidebarButtons(i), this.controller.showSidebarButtons());
            var { localPlayer: r, isSinglePlayer: s, game: i } = t,
              [i] = this.jsxRenderer.render(
                a.jsx(n.HtmlView, {
                  width: "100%",
                  height: "100%",
                  component: o.DiploForm,
                  innerRef: (e) => (this.form = e),
                  props: {
                    playerInfos: this.buildPlayerInfos(i, r),
                    localPlayer: r,
                    gameOpts: i.gameOpts,
                    gameModes: this.gameModes,
                    taunts: s ? void 0 : this.taunts.value,
                    singlePlayer: s,
                    alliancesAllowed:
                      !s && i.rules.mpDialogSettings.alliesAllowed && i.rules.mpDialogSettings.allyChangeAllowed,
                    mapName: i.gameOpts.mapTitle,
                    messages: t.chatHistory?.getAll(),
                    chatHistory: t.chatHistory,
                    onToggleTaunts: (e) => (this.taunts.value = e),
                    onToggleAlliance: t.onToggleAlliance,
                    onToggleChat: (e, t) => {
                      t ? this.mutedPlayers.delete(e.name) : this.mutedPlayers.add(e.name);
                    },
                    onSendMessage: t.onSendMessage,
                    onCancelMessage: (e) => e && t.onCancel(),
                    strings: this.strings,
                  },
                }),
              );
            (this.controller.setMainComponent(i), this.disposables.add(() => (this.form = void 0)));
          }
          buildPlayerInfos(e, i) {
            let r = i ? e.alliances.filterByPlayer(i) : void 0;
            return e
              .getNonNeutralPlayers()
              .filter((e) => e !== i)
              .map((t) => ({
                player: t,
                muted: this.mutedPlayers.has(t.name),
                allianceToggleable: !!i && e.alliances.canRequestAlliance(t) && e.alliances.canFormAlliance(i, t),
                alliance: r?.find((e) => e.players.first === t || e.players.second === t),
              }));
          }
          async onLeave() {
            ((this.params = void 0),
              this.controller.hideSidebarButtons(),
              this.controller.toggleContentAreaVisibility(!1),
              this.disposables.dispose());
          }
        }),
          e("DiploScreen", r));
      },
    };
  },
);
