// === Reconstructed SystemJS module: gui/screen/game/gameMenu/ConnectionInfoScreen ===
// deps: ["gui/jsx/jsx","gui/screen/game/gameMenu/ScreenType","gui/jsx/HtmlView","util/disposable/CompositeDisposable","gui/screen/game/gameMenu/ConInfoForm","gui/screen/game/GameMenuScreen","network/gameopt/LoadInfoParser"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/gameMenu/ConnectionInfoScreen",
  [
    "gui/jsx/jsx",
    "gui/screen/game/gameMenu/ScreenType",
    "gui/jsx/HtmlView",
    "util/disposable/CompositeDisposable",
    "gui/screen/game/gameMenu/ConInfoForm",
    "gui/screen/game/GameMenuScreen",
    "network/gameopt/LoadInfoParser",
  ],
  function (e, t) {
    "use strict";
    var r, s, a, i, n, o, l, c;
    t && t.id;
    return {
      setters: [
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
          i = e;
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
      ],
      execute: function () {
        ((c = class extends o.GameMenuScreen {
          constructor(e, t) {
            (super(),
              (this.strings = e),
              (this.jsxRenderer = t),
              (this.messages = []),
              (this.disposables = new i.CompositeDisposable()),
              (this.handleChatMessage = (e) => {
                (this.messages.push(e), this.form.refresh());
              }),
              (this.handleConInfoUpdate = (t) => {
                this.form.applyOptions((e) => {
                  e.conInfos = new l.LoadInfoParser().parse(t);
                });
              }));
          }
          onEnter(t) {
            if (
              ((this.params = t),
              this.controller.toggleContentAreaVisibility(!0),
              this.initView(t),
              t.gservCon.isOpen())
            ) {
              (t.gservCon.onLoadInfo.subscribe(this.handleConInfoUpdate),
                this.disposables.add(() => t.gservCon.onLoadInfo.unsubscribe(this.handleConInfoUpdate)),
                t.gservCon.requestLoadInfo());
              let e = setInterval(() => {
                t.gservCon.isOpen() ? t.gservCon.requestLoadInfo() : this.disposables.dispose();
              }, 1e3);
              (this.disposables.add(() => clearInterval(e)),
                t.chatHistory.onNewMessage.subscribe(this.handleChatMessage),
                this.disposables.add(() => {
                  ((this.messages.length = 0), t.chatHistory.onNewMessage.unsubscribe(this.handleChatMessage));
                }));
            }
            this.messages.push({
              text:
                this.strings.get("GUI:ConnectingToPlayers") +
                "...\n" +
                this.strings.get("TXT_RECONNECT_HELP2") +
                " " +
                this.strings.get("TXT_RECONNECT_HELP2B"),
            });
          }
          initView(t) {
            let e = this.strings;
            var i = [
              {
                label: e.get("GUI:AbortMission"),
                onClick: () => {
                  this.controller?.pushScreen(s.ScreenType.QuitConfirm, {
                    onQuit: t.onQuit,
                    onCancel: () => {
                      this.controller?.popScreen();
                    },
                  });
                },
              },
            ];
            (this.controller.setSidebarButtons(i), this.controller.showSidebarButtons());
            var [i] = this.jsxRenderer.render(
              r.jsx(a.HtmlView, {
                width: "100%",
                height: "100%",
                component: n.ConInfoForm,
                innerRef: (e) => (this.form = e),
                props: {
                  players: t.players,
                  localPlayer: t.localPlayer,
                  strings: this.strings,
                  messages: this.messages,
                  chatHistory: t.chatHistory,
                  onSendMessage: (e) => {
                    t.chatNetHandler.submitMessage(e.value, e.recipient);
                  },
                },
              }),
            );
            (this.controller.setMainComponent(i), this.disposables.add(() => (this.form = void 0)));
          }
          async onLeave() {
            ((this.params = void 0),
              this.controller.hideSidebarButtons(),
              this.controller.toggleContentAreaVisibility(!1),
              this.disposables.dispose());
          }
          async onStack() {
            this.controller.hideSidebarButtons();
          }
          onUnstack() {
            this.initView(this.params);
          }
        }),
          e("ConnectionInfoScreen", c));
      },
    };
  },
);
