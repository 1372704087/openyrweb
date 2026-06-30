// === Reconstructed SystemJS module: network/gameres/GameResType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gameres/GameResType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("GameResType", (i = {})))[(e.ConnectionLost = 2)] = "ConnectionLost"),
        (e[(e.Playing = 8)] = "Playing"),
        (e[(e.Draw = 64)] = "Draw"),
        (e[(e.Win = 256)] = "Win"),
        (e[(e.Loss = 512)] = "Loss"),
        (e[(e.Resign = 528)] = "Resign"),
        (e[(e.Disconnect = 768)] = "Disconnect"));
    },
  };
});
