// === Reconstructed SystemJS module: gui/screen/game/loadingScreen/LoadingScreenApiFactory ===
// deps: ["network/gameopt/LoadInfoParser","gui/screen/game/loadingScreen/MpLoadingScreenApi","gui/screen/game/loadingScreen/ReplayLoadingScreenApi","gui/screen/game/loadingScreen/SpLoadingScreenApi"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/loadingScreen/LoadingScreenApiFactory",
  [
    "network/gameopt/LoadInfoParser",
    "gui/screen/game/loadingScreen/MpLoadingScreenApi",
    "gui/screen/game/loadingScreen/ReplayLoadingScreenApi",
    "gui/screen/game/loadingScreen/SpLoadingScreenApi",
  ],
  function (t, e) {
    "use strict";
    var l, c, h, u, d, i;
    e && e.id;
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
      ],
      execute: function () {
        var e;
        (((e = d || t("LoadingScreenType", (d = {})))[(e.SinglePlayer = 0)] = "SinglePlayer"),
          (e[(e.MultiPlayer = 1)] = "MultiPlayer"),
          (e[(e.Replay = 2)] = "Replay"),
          t(
            "LoadingScreenApiFactory",
            (i = class {
              constructor(e, t, i, r, s, a) {
                ((this.rules = e),
                  (this.strings = t),
                  (this.uiScene = i),
                  (this.jsxRenderer = r),
                  (this.gameResConfig = s),
                  (this.gservCon = a));
              }
              create(e) {
                var { rules: t, strings: i, uiScene: r, jsxRenderer: s, gameResConfig: a, gservCon: n } = this;
                switch (e) {
                  case d.SinglePlayer:
                    return new u.SpLoadingScreenApi(t, i, r, s, a);
                  case d.MultiPlayer:
                    var o = new l.LoadInfoParser();
                    return new c.MpLoadingScreenApi(n, o, t, i, r, s, a);
                  case d.Replay:
                    return new h.ReplayLoadingScreenApi(t, i, r, s, a);
                  default:
                    throw new Error(`Unsupported loading screen type "${e}"`);
                }
              }
            }),
          ));
      },
    };
  },
);
