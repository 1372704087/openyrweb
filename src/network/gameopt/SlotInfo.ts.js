// === Reconstructed SystemJS module: network/gameopt/SlotInfo ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gameopt/SlotInfo", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("SlotType", (i = {})))[(e.Closed = 0)] = "Closed"),
        (e[(e.Open = 1)] = "Open"),
        (e[(e.OpenObserver = 2)] = "OpenObserver"),
        (e[(e.Player = 3)] = "Player"),
        (e[(e.Ai = 4)] = "Ai"));
    },
  };
});
