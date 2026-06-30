// === Reconstructed SystemJS module: gui/screen/game/GameMenu ===
// deps: ["util/disposable/CompositeDisposable","gui/screen/game/gameMenu/GameMenuController","gui/screen/game/gameMenu/ScreenType","util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/GameMenu",
  [
    "util/disposable/CompositeDisposable",
    "gui/screen/game/gameMenu/GameMenuController",
    "gui/screen/game/gameMenu/ScreenType",
    "util/event",
  ],
  function (e, t) {
    "use strict";
    var o, s, r, l, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        e(
          "GameMenu",
          (i = class {
            get onOpen() {
              return this._onOpen.asEvent();
            }
            get onQuit() {
              return this._onQuit.asEvent();
            }
            get onObserve() {
              return this._onObserve.asEvent();
            }
            get onCancel() {
              return this._onCancel.asEvent();
            }
            get onToggleAlliance() {
              return this._onToggleAlliance.asEvent();
            }
            get onSendMessage() {
              return this._onSendMessage.asEvent();
            }
            constructor(e, t, i, r, s, a, n = !1) {
              ((this.subScreens = e),
                (this.game = t),
                (this.localPlayer = i),
                (this.chatHistory = r),
                (this.gservCon = s),
                (this.isSinglePlayer = a),
                (this.isTournament = n),
                (this.disposables = new o.CompositeDisposable()),
                (this._onOpen = new l.EventDispatcher()),
                (this._onQuit = new l.EventDispatcher()),
                (this._onObserve = new l.EventDispatcher()),
                (this._onCancel = new l.EventDispatcher()),
                (this._onToggleAlliance = new l.EventDispatcher()),
                (this._onSendMessage = new l.EventDispatcher()));
            }
            init(e) {
              let t = new s.GameMenuController(e);
              for (var [i, r] of this.subScreens) t.addScreen(i, r);
              ((this.controller = t), this.disposables.add(t, () => (this.controller = void 0)), this.bindHudEvents(e));
            }
            handleHudChange(e) {
              this.controller &&
                (this.controller.setHud(e), this.bindHudEvents(e), this.controller.rerenderCurrentScreen());
            }
            bindHudEvents(e) {
              (e.onOptButtonClick.subscribe(() => this.open()), e.onDiploButtonClick.subscribe(() => this.openDiplo()));
            }
            open() {
              this.controller
                ? (this._onOpen.dispatch(this),
                  this.controller.goToScreen(r.ScreenType.Home, {
                    observeAllowed: !(
                      this.isTournament ||
                      this.isSinglePlayer ||
                      void 0 === this.localPlayer ||
                      this.localPlayer.isObserver ||
                      this.localPlayer.defeated
                    ),
                    onQuit: async () => {
                      (this.controller.close(), this._onQuit.dispatch(this));
                    },
                    onObserve: () => {
                      (this.controller.close(), this._onObserve.dispatch(this));
                    },
                    onCancel: () => {
                      (this.controller.close(), this._onCancel.dispatch(this));
                    },
                  }))
                : console.warn("Menu not initialized");
            }
            openDiplo() {
              this.controller
                ? (this._onOpen.dispatch(this),
                  this.controller.goToScreen(r.ScreenType.Diplo, {
                    game: this.game,
                    localPlayer: this.localPlayer,
                    isSinglePlayer: this.isSinglePlayer,
                    chatHistory: this.chatHistory,
                    gservCon: this.gservCon,
                    onToggleAlliance: (e, t) => {
                      this._onToggleAlliance.dispatch(e, t);
                    },
                    onSendMessage: (e) => this._onSendMessage.dispatch(this, e),
                    onCancel: () => {
                      (this.controller.close(), this._onCancel.dispatch(this));
                    },
                  }))
                : console.warn("Menu not initialized");
            }
            openConnectionInfo(e, t, i) {
              this.controller
                ? (this._onOpen.dispatch(this),
                  this.controller.goToScreen(r.ScreenType.ConnectionInfo, {
                    players: e,
                    localPlayer: this.localPlayer,
                    chatHistory: this.chatHistory,
                    chatNetHandler: i,
                    gservCon: t,
                    onQuit: async () => {
                      (this.controller.close(), this._onQuit.dispatch(this));
                    },
                  }))
                : console.warn("Menu not initialized");
            }
            close() {
              this.controller
                ? this.controller.getCurrentScreen() && (this.controller.close(), this._onCancel.dispatch(this))
                : console.warn("Menu not initialized");
            }
            getCurrentScreen() {
              return this.controller?.getCurrentScreen();
            }
            dispose() {
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
