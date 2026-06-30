// === Reconstructed SystemJS module: gui/screen/game/loadingScreen/ReplayLoadingScreenApi ===
// deps: ["gui/jsx/jsx","game/gameopts/constants","util/disposable/CompositeDisposable","network/gamestate/PlayerConnectionStatus","gui/screen/game/loadingScreen/LoadingScreenWrapper"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/loadingScreen/ReplayLoadingScreenApi",
  [
    "gui/jsx/jsx",
    "game/gameopts/constants",
    "util/disposable/CompositeDisposable",
    "network/gamestate/PlayerConnectionStatus",
    "gui/screen/game/loadingScreen/LoadingScreenWrapper",
  ],
  function (e, t) {
    "use strict";
    var i, a, n, o, r, s;
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
          n = e;
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
          "ReplayLoadingScreenApi",
          (s = class {
            constructor(e, t, i, r, s) {
              ((this.rules = e),
                (this.strings = t),
                (this.uiScene = i),
                (this.jsxRenderer = r),
                (this.gameResConfig = s),
                (this.lastLoadPercent = 0),
                (this.disposables = new n.CompositeDisposable()),
                (this.handleLoadInfoUpdate = (t) => {
                  var e;
                  this.loadingScreen
                    ? ((e = performance.now()),
                      (!this.lastRenderTime || e - this.lastRenderTime > 1e3 / 15) &&
                        ((this.lastRenderTime = e),
                        this.loadingScreen.applyOptions((e) => {
                          e.playerInfos = this.createExtendedLoadingInfos(t);
                        })))
                    : this.createLoadingScreen(t);
                }));
            }
            async start(e, t) {
              ((this.players = e), (this.mapName = t), this.handleLoadInfoUpdate(0));
            }
            onLoadProgress(e) {
              (e = Math.floor(e)) > this.lastLoadPercent && ((this.lastLoadPercent = e), this.handleLoadInfoUpdate(e));
            }
            createExtendedLoadingInfos(t) {
              let i = [...this.rules.getMultiplayerColors().values()],
                r = this.rules.getMultiplayerCountries(),
                s = this.players?.every((e) => e.countryId === a.OBS_COUNTRY_ID || e.teamId !== a.NO_TEAM_ID);
              return this.players
                .filter((e) => e.countryId !== a.OBS_COUNTRY_ID)
                .map((e) => ({
                  name: e.name,
                  status: o.PlayerConnectionStatus.Connected,
                  loadPercent: t,
                  country: r[e.countryId],
                  color: i[e.colorId].asHexString(),
                  team: e.teamId,
                }))
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
                  playerName: void 0,
                  mapName: this.mapName,
                  playerInfos: this.createExtendedLoadingInfos(e),
                  gameResConfig: this.gameResConfig,
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
