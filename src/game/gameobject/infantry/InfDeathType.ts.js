// === Reconstructed SystemJS module: game/gameobject/infantry/InfDeathType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/infantry/InfDeathType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("InfDeathType", (i = {})))[(e.None = 0)] = "None"),
        (e[(e.Gunfire = 1)] = "Gunfire"),
        (e[(e.Explode = 2)] = "Explode"),
        (e[(e.ExplodeAlt = 3)] = "ExplodeAlt"),
        (e[(e.Fire = 4)] = "Fire"),
        (e[(e.Electro = 5)] = "Electro"),
        (e[(e.HeadExplode = 6)] = "HeadExplode"),
        (e[(e.Nuke = 7)] = "Nuke"),
        // OpenYRWeb: YR death types. Virus=sniper kill (Virus unit), Mutate=Genetic Mutator
        // transform (handled in Warhead.inflictDamage: victim becomes a Brute instead of dying).
        (e[(e.Virus = 8)] = "Virus"),
        (e[(e.Mutate = 9)] = "Mutate"),
        // OpenYRWeb: YR uses InfDeath=10 in a few vanilla warheads. It indexes the 11th
        // entry of the victim's DeathAnims sequence (a Yuri-specific death animation).
        // Registered so getEnumNumeric stops warning on the vanilla value.
        (e[(e.YuriDeath = 10)] = "YuriDeath"));
    },
  };
});
