// === Reconstructed SystemJS module: network/gamestate/PlayerConnectionStatus ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gamestate/PlayerConnectionStatus", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("PlayerConnectionStatus", (i = {})))[(e.NotConnected = 0)] = "NotConnected"),
        (e[(e.Connected = 1)] = "Connected"));
    },
  };
});
