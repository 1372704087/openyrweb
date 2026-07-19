// === Reconstructed SystemJS module: gui/screen/game/loadingScreen/MpLoadingScreenApi ===
// deps: ["gui/jsx/jsx","game/gameopts/constants","util/disposable/CompositeDisposable","gui/screen/game/loadingScreen/LoadingScreenWrapper"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/loadingScreen/MpLoadingScreenApi",
  [
    "gui/jsx/jsx",
    "game/gameopts/constants",
    "util/disposable/CompositeDisposable",
    "gui/screen/game/loadingScreen/LoadingScreenWrapper",
  ],
  function (e, t) {
    "use strict";
    var i, a, o, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e(
          "MpLoadingScreenApi",
          (s = class {
            constructor(e, t, i, r, s, a, n) {
              ((this.gservCon = e),
                (this.loadInfoParser = t),
                (this.rules = i),
                (this.strings = r),
                (this.uiScene = s),
                (this.jsxRenderer = a),
                (this.gameResConfig = n),
                (this.lastLoadPercent = 0),
                (this.disposables = new o.CompositeDisposable()),
                (this.handleLoadInfoUpdate = (e) => {
                  let t = this.loadInfoParser.parse(e);
                  this.loadingScreen
                    ? this.loadingScreen.applyOptions((e) => {
                        e.playerInfos = this.createExtendedLoadingInfos(t);
                      })
                    : this.createLoadingScreen(t);
                }));
            }
            async start(t, i, r) {
              if (this.gservCon.isOpen()) {
                ((this.players = t),
                  (this.localPlayerName = r),
                  (this.mapName = i),
                  this.gservCon.onLoadInfo.subscribe(this.handleLoadInfoUpdate),
                  this.disposables.add(() => this.gservCon.onLoadInfo.unsubscribe(this.handleLoadInfoUpdate)),
                  this.gservCon.requestLoadInfo());
                let e = setInterval(() => {
                  this.gservCon.isOpen() ? this.gservCon.requestLoadInfo() : this.disposables.dispose();
                }, 1e4);
                this.disposables.add(() => clearInterval(e));
              }
            }
            onLoadProgress(e) {
              (e = Math.floor(e)) > this.lastLoadPercent &&
                ((this.lastLoadPercent = e), this.gservCon.isOpen() && this.gservCon.sendLoadedPercent(e));
            }
            createExtendedLoadingInfos(e) {
              let i = [...this.rules.getMultiplayerColors().values()],
                r = this.rules.getMultiplayerCountries(),
                s = this.players?.every((e) => e.countryId === a.OBS_COUNTRY_ID || e.teamId !== a.NO_TEAM_ID);
              return e
                .map((t) => {
                  var e = this.players.find((e) => e.name === t.name);
                  return {
                    name: t.name,
                    status: t.status,
                    loadPercent: t.loadPercent,
                    country: r[e.countryId],
                    color: e.countryId === a.OBS_COUNTRY_ID ? "#fff" : i[e.colorId].asHexString(),
                    team: e.teamId,
                  };
                })
                .sort((e, t) =>
                  s
                    ? Boolean(e.country) === Boolean(t.country)
                      ? e.team - t.team
                      : Number(void 0 !== t.country) - Number(void 0 !== e.country)
                    : 0,
                );
            }
            createLoadingScreen(e) {
              let [t] = this.jsxRenderer.render(
                i.jsx(r.LoadingScreenWrapper, {
                  ref: (e) => (this.loadingScreen = e),
                  strings: this.strings,
                  rules: this.rules,
                  viewport: this.uiScene.menuViewport,
                  playerName: this.localPlayerName,
                  mapName: this.mapName,
                  playerInfos: this.createExtendedLoadingInfos(e),
                  gameResConfig: this.gameResConfig,
                  mapPreviewUrl: this.mapPreviewUrl,
                }),
              );
              (this.uiScene.add(t),
                this.disposables.add(
                  t,
                  () => this.uiScene.remove(t),
                  () => (this.loadingScreen = void 0),
                ));
            }
            dispose() {
              this.disposables.dispose();
            }
            updateViewport() {
              this.loadingScreen?.updateViewport(this.uiScene.menuViewport);
            }
          }),
        );
      },
    };
  },
);
