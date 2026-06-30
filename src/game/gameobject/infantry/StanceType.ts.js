// === Reconstructed SystemJS module: game/gameobject/infantry/StanceType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/infantry/StanceType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("StanceType", (i = {})))[(e.None = 0)] = "None"),
        (e[(e.Guard = 1)] = "Guard"),
        (e[(e.Prone = 2)] = "Prone"),
        (e[(e.Deployed = 3)] = "Deployed"),
        (e[(e.Paradrop = 4)] = "Paradrop"),
        (e[(e.Cheer = 5)] = "Cheer"));
    },
  };
});
