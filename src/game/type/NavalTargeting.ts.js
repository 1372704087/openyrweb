// === Reconstructed SystemJS module: game/type/NavalTargeting ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/type/NavalTargeting", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
      execute: function () {
        var e;
        (((e = i || t("NavalTargeting", (i = {})))[(e.UnderwaterNever = 0)] = "UnderwaterNever"),
        (e[(e.UnderwaterSecondary = 1)] = "UnderwaterSecondary"),
        (e[(e.UnderwaterOnly = 2)] = "UnderwaterOnly"),
        (e[(e.OrganicSecondary = 3)] = "OrganicSecondary"),
        (e[(e.SealSpecial = 4)] = "SealSpecial"),
        (e[(e.NavalAll = 5)] = "NavalAll"),
        (e[(e.NavalNone = 6)] = "NavalNone"),
        // OpenYRWeb: YR added value 7. Per ModEnc, NavalTargeting=5 and 7 are functionally
        // identical (the game treats any unrecognised value the same as NAVAL_ALL). The
        // vanilla YR rulesmd.ini uses 7 in a few places, so we register it to silence the
        // "not an accepted enum value" warning without changing behaviour.
        (e[(e.NavalAllEquivalent = 7)] = "NavalAllEquivalent"));
      },
  };
});
