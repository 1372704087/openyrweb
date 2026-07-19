// === Reconstructed SystemJS module: gui/screen/game/loadingScreen/SpLoadingScreenApi ===
// deps: ["gui/jsx/jsx","game/gameopts/constants","util/disposable/CompositeDisposable","network/gamestate/PlayerConnectionStatus","gui/screen/game/loadingScreen/LoadingScreenWrapper"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/loadingScreen/SpLoadingScreenApi",
  [
    "gui/jsx/jsx",
    "game/gameopts/constants",
    "util/disposable/CompositeDisposable",
    "network/gamestate/PlayerConnectionStatus",
    "gui/screen/game/loadingScreen/LoadingScreenWrapper",
  ],
  function (e, t) {
    "use strict";
    var i, s, a, n, r, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
          r = e;
        },
      ],
      execute: function () {
        e(
          "SpLoadingScreenApi",
          (o = class {
            constructor(e, t, i, r, s) {
              ((this.rules = e),
                (this.strings = t),
                (this.uiScene = i),
                (this.jsxRenderer = r),
                (this.gameResConfig = s),
                (this.lastLoadPercent = 0),
                (this.disposables = new a.CompositeDisposable()),
                (this.handleLoadInfoUpdate = (t) => {
                  var e;
                  this.loadingScreen
                    ? ((e = performance.now()),
                      (!this.lastRenderTime || e - this.lastRenderTime > 1e3 / 15) &&
                        ((this.lastRenderTime = e),
                        this.loadingScreen.applyOptions((e) => {
                          e.playerInfos = this.createExtendedLoadingInfos(t);
                        })))
                    : this.createLoadingScreen();
                }));
            }
            async start(e, t, i) {
              ((this.players = e), (this.localPlayerName = i), (this.mapName = t), this.handleLoadInfoUpdate(0));
            }
            onLoadProgress(e) {
              (e = Math.floor(e)) > this.lastLoadPercent && ((this.lastLoadPercent = e), this.handleLoadInfoUpdate(e));
            }
            createExtendedLoadingInfos(e) {
              let t = [...this.rules.getMultiplayerColors().values()];
              var i = this.rules.getMultiplayerCountries(),
                r = this.players.find((e) => e.name === this.localPlayerName);
              return [
                {
                  name: this.localPlayerName,
                  status: n.PlayerConnectionStatus.Connected,
                  loadPercent: e,
                  country: i[r.countryId],
                  color: r.countryId === s.OBS_COUNTRY_ID ? "#fff" : t[r.colorId].asHexString(),
                  team: r.teamId,
                },
              ];
            }
            createLoadingScreen() {
              let [e] = this.jsxRenderer.render(
                i.jsx(r.LoadingScreenWrapper, {
                  ref: (e) => (this.loadingScreen = e),
                  strings: this.strings,
                  rules: this.rules,
                  viewport: this.uiScene.menuViewport,
                  playerName: this.localPlayerName,
                  mapName: this.mapName,
                  playerInfos: this.createExtendedLoadingInfos(0),
                  gameResConfig: this.gameResConfig,
                  mapPreviewUrl: this.mapPreviewUrl,
                }),
              );
              (this.uiScene.add(e), this.disposables.add(e, () => this.uiScene.remove(e)));
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
