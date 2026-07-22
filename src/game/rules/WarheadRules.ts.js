// === Reconstructed SystemJS module: game/rules/WarheadRules ===
// deps: ["game/gameobject/infantry/InfDeathType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/WarheadRules", ["game/gameobject/infantry/InfDeathType"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "WarheadRules",
        (r = class {
          constructor(e) {
            ((this.rules = e), (this.verses = new Map()), this.parse());
          }
          get name() {
            return this.rules.name;
          }
          parse() {
            ((this.affectsAllies = this.rules.getBool("AffectsAllies", !0)),
              (this.animList = this.rules.getArray("AnimList")),
              (this.bombDisarm = this.rules.getBool("BombDisarm")),
              (this.bullets = this.rules.getBool("Bullets")),
              (this.causesDelayKill = this.rules.getBool("CausesDelayKill")),
              (this.cellSpread = this.rules.getNumber("CellSpread")),
              (this.conventional = this.rules.getBool("Conventional")),
              (this.culling = this.rules.getBool("Culling")),
              (this.delayKillAtMax = this.rules.getNumber("DelayKillAtMax")),
              (this.delayKillFrames = this.rules.getNumber("DelayKillFrames")),
              (this.electricAssault = this.rules.getBool("ElectricAssault")),
              (this.emEffect = this.rules.getBool("EMEffect")),
              (this.infDeath = this.rules.getEnumNumeric("InfDeath", i.InfDeathType, i.InfDeathType.None)),
              (this.ivanBomb = this.rules.getBool("IvanBomb")),
              // OpenYRWeb: IsLocomotor=yes marks the Magnetron's LocomotorBeam warhead. Such a
              // warhead does no normal damage — instead it drags the hit vehicle toward the
              // firing unit (handled in Warhead.detonate). Vanilla YR uses this for the
              // Magnetron (YTNK) primary weapon MagneticBeam (Warhead=LocomotorBeam).
              (this.isLocomotor = this.rules.getBool("IsLocomotor")),
              (this.makesDisguise = this.rules.getBool("MakesDisguise")),
              (this.mindControl = this.rules.getBool("MindControl")),
              (this.buildingMindControl = this.rules.getBool("BuildingMindControl")),
              (this.nukeMaker = this.rules.getBool("NukeMaker")),
              (this.paralyzes = this.rules.getNumber("Paralyzes")),
              (this.parasite = this.rules.getBool("Parasite")),
              (this.percentAtMax = this.rules.getNumber("PercentAtMax", 1)),
              (this.proneDamage = this.rules.getFixed("ProneDamage", 1)),
              // OpenYRWeb: vanilla YR uses "Psychedelic" as the INI key for the chaos/berserk
              // effect (Chaos Drone gas). We read both "Psychedelic" (vanilla) and "PsychicDamage"
              // (legacy fallback) for compatibility.
              (this.psychicDamage = this.rules.getBool("Psychedelic") || this.rules.getBool("PsychicDamage")),
              (this.radiation = this.rules.getBool("Radiation")),
              (this.rocker = this.rules.getBool("Rocker")),
              (this.sonic = this.rules.getBool("Sonic")),
              (this.temporal = this.rules.getBool("Temporal")));
            let e = this.rules.getFixedArray("Verses");
            (e.forEach((e, t) => this.verses.set(t, e)),
              (this.wallAbsoluteDestroyer = this.rules.getBool("WallAbsoluteDestroyer")),
              (this.wall = this.rules.getBool("Wall")),
              (this.wood = this.rules.getBool("Wood")));
          }
        }),
      );
    },
  };
});
