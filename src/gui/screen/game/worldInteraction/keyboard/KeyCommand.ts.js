// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/KeyCommand ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/worldInteraction/keyboard/KeyCommand", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("TriggerMode", (i = {})))[(e.KeyDown = 0)] = "KeyDown"),
        (e[(e.KeyUp = 1)] = "KeyUp"),
        (e[(e.KeyDownUp = 2)] = "KeyDownUp"));
    },
  };
});
