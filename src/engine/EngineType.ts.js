// === Reconstructed SystemJS module: engine/EngineType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: YR-only engine. The enum keeps YurisRevenge as the sole active value; the
// historical AutoDetect/TiberianSun/Firestorm/RedAlert2 entries have been removed since RA2
// support is no longer maintained. The numeric value (4) is preserved for binary compat
// with any persisted state.

System.register("engine/EngineType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      ((e = i || t("EngineType", (i = {})))[(e.YurisRevenge = 4)] = "YurisRevenge");
    },
  };
});
