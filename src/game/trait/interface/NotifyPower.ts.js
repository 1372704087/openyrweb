// === Reconstructed SystemJS module: game/trait/interface/NotifyPower ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trait/interface/NotifyPower", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("NotifyPower", (i = {}))).onPowerLow = Symbol()),
        (e.onPowerRestore = Symbol()),
        (e.onPowerChange = Symbol()));
    },
  };
});
