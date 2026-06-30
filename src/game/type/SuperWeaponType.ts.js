// === Reconstructed SystemJS module: game/type/SuperWeaponType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/type/SuperWeaponType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("SuperWeaponType", (i = {})))[(e.MultiMissile = 0)] = "MultiMissile"),
        (e[(e.IronCurtain = 1)] = "IronCurtain"),
        (e[(e.LightningStorm = 2)] = "LightningStorm"),
        (e[(e.ChronoSphere = 3)] = "ChronoSphere"),
        (e[(e.ChronoWarp = 4)] = "ChronoWarp"),
        (e[(e.ParaDrop = 5)] = "ParaDrop"),
        (e[(e.AmerParaDrop = 6)] = "AmerParaDrop"),
        // OpenYRWeb: YR superweapons. Verified against the vanilla YR [SuperWeaponTypes]
        // list (rulesmd.ini) — there are 12 entries. Values 7–11 are the YR additions:
        //   7 PsychicDominator — Yuri's mind-control + area damage superweapon
        //   8 SpyPlane         — Yuri/America recon plane (reveals map area)
        //   9 GeneticConverter — Yuri's Genetic Mutator (transforms infantry → Brutes)
        //  10 ForceShield      — force shield (temporary invulnerability, like IronCurtain)
        //  11 PsychicReveal    — Yuri's map reveal ability
        // NOTE: the engine's internal logical name for #9 is `GeneticMutator` (the effect
        // class is GeneticMutatorEffect). YR's INI spells the `Type=` value
        // `GeneticConverter`, so that string must also resolve to value 9. We register both
        // names to the same numeric value so getEnum("Type", SuperWeaponType) accepts the
        // vanilla INI value without emitting a "not an accepted enum value" warning.
        (e[(e.PsychicDominator = 7)] = "PsychicDominator"),
          (e[(e.SpyPlane = 8)] = "SpyPlane"),
          // GeneticMutator (engine name) and GeneticConverter (vanilla INI name) are the
          // same superweapon; both map to 9.
          (e[(e.GeneticMutator = 9)] = "GeneticMutator"),
          (e.GeneticConverter = 9),
          (e[(e.ForceShield = 10)] = "ForceShield"),
          (e[(e.PsychicReveal = 11)] = "PsychicReveal"));
    },
  };
});
