// === Reconstructed SystemJS module: network/WolGameReport ===
// deps: ["util/Base64"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/WolGameReport", ["util/Base64"], function (t, e) {
  "use strict";
  var i, r, s;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      var e;
      (((e = r || t("WolGameReportResult", (r = {})))[(e.Win = 0)] = "Win"),
        (e[(e.Loss = 1)] = "Loss"),
        (e[(e.Draw = 2)] = "Draw"),
        t(
          "WolGameReport",
          (s = class {
            constructor(e) {
              var t = JSON.parse(i.Base64.decode(e));
              return ((this.gameId = t.gameId), (this.players = t.players), (this.duration = t.duration), this);
            }
          }),
        ));
    },
  };
});
