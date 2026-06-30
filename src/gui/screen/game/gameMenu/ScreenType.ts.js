// === Reconstructed SystemJS module: gui/screen/game/gameMenu/ScreenType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/gameMenu/ScreenType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("ScreenType", (i = {})))[(e.Home = 0)] = "Home"),
        (e[(e.Diplo = 1)] = "Diplo"),
        (e[(e.ConnectionInfo = 2)] = "ConnectionInfo"),
        (e[(e.QuitConfirm = 3)] = "QuitConfirm"),
        (e[(e.Options = 4)] = "Options"),
        (e[(e.OptionsSound = 5)] = "OptionsSound"),
        (e[(e.OptionsKeyboard = 6)] = "OptionsKeyboard"));
    },
  };
});
