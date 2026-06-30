// === Reconstructed SystemJS module: gui/screen/mainMenu/modSel/ModStatus ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/modSel/ModStatus", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("ModStatus", (i = {})))[(e.NotInstalled = 0)] = "NotInstalled"),
        (e[(e.Installed = 1)] = "Installed"),
        (e[(e.UpdateAvailable = 2)] = "UpdateAvailable"));
    },
  };
});
