// === Reconstructed SystemJS module: game/rules/CombatDamageRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/CombatDamageRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CombatDamageRules",
        (i = class {
          readIni(e) {
            ((this.ballisticScatter = e.getNumber("BallisticScatter")),
              (this.bridgeStrength = e.getNumber("BridgeStrength")),
              (this.c4Delay = e.getNumber("C4Delay")),
              (this.c4Warhead = e.getString("C4Warhead")),
              // OpenYRWeb: CrushWarhead (vanilla YR [CombatDamage] CrushWarhead=, stored at
              // Rules+0xfac in yrmd.exe). The warhead used when a vehicle crushes (drives over
              // OR is dropped onto) another object. Magnetron drop-crush routes through this
              // (verified @ FUN_0054ca90: TakeDamage warhead = Rules+0xfac). Defaults to "Crush"
              // per vanilla rulesmd.ini.
              (this.crushWarhead = e.getString("CrushWarhead", "Crush")),
              // OpenYRWeb: Magnetron drop-damage knobs (vanilla YR [CombatDamage] ;***Magnetron***).
              // FallingDamageMultiplier: final impact damage = falling unit's base HP x this (default 1.0).
              // CurrentStrengthDamage: if true (default), base = current HP; else max HP.
              // Used by MagnetronDragTask._applyDrop when a lifted vehicle lands.
              (this.fallingDamageMultiplier = e.getNumber("FallingDamageMultiplier", 1)),
              (this.currentStrengthDamage = e.getBool("CurrentStrengthDamage", !0)),
              (this.deathWeapon = e.getString("DeathWeapon")),
              (this.cMislEliteWarhead = e.getString("CMislEliteWarhead")),
              (this.cMislWarhead = e.getString("CMislWarhead")),
              (this.dMislEliteWarhead = e.getString("DMislEliteWarhead")),
              (this.dMislWarhead = e.getString("DMislWarhead")),
              // OpenYRWeb: Floating Disc (DISCUS) drain config (vanilla YR, yrmd.exe strings).
              // DrainMoneyAmount: credits siphoned per DrainMoneyFrameDelay ticks from a
              //   refinery/slave-miner the disc is hovering over.
              // DrainMoneyFrameDelay: tick interval between drains.
              // DrainAnimationType: anim played on the drained building (visual only).
              (this.drainMoneyAmount = e.getNumber("DrainMoneyAmount", 0)),
              (this.drainMoneyFrameDelay = e.getNumber("DrainMoneyFrameDelay", 0)),
              (this.drainAnimationType = e.getString("DrainAnimationType")),
              (this.flameDamage = e.getString("FlameDamage")),
              (this.ironCurtainDuration = e.getNumber("IronCurtainDuration")),
              // OpenYRWeb (2026-06-30, REVERSED): Force Shield super-weapon config (vanilla keys
              // in [General], REVERSED from yrmd.exe: ForceShieldDuration @ 0x0083bc4c,
              // ForceShieldRadius @ 0x0083bc60, ForceShieldBlackoutDuration @ 0x0083bc30).
              // ForceShield: when activated, buildings within ForceShieldRadius (leptons) of the
              // activation tile gain temporary invulnerability for ForceShieldDuration frames;
              // the activating player's power is blacked out (low-power) for
              // ForceShieldBlackoutDuration frames as the cost. Co-located with IronCurtainDuration.
              (this.forceShieldDuration = e.getNumber("ForceShieldDuration", 0)),
              (this.forceShieldRadius = e.getNumber("ForceShieldRadius", 0)),
              (this.forceShieldBlackoutDuration = e.getNumber("ForceShieldBlackoutDuration", 0)),
              // OpenYRWeb (2026-06-30, REVERSED): PsychicReveal super-weapon radius (vanilla key
              // in [CombatDamage], REVERSED from yrmd.exe). Yuri's Psychic Reveal mini-superweapon
              // (unlocked by the Psychic Sensor / YAGGNT) permanently reveals a circular area of
              // shroud around the activation tile for the activating player. Default 10 tiles.
              (this.psychicRevealRadius = e.getNumber("PsychicRevealRadius", 10)),
              (this.ivanDamage = e.getNumber("IvanDamage")),
              (this.ivanIconFlickerRate = e.getNumber("IvanIconFlickerRate")),
              (this.ivanTimedDelay = e.getNumber("IvanTimedDelay")),
              (this.ivanWarhead = e.getString("IvanWarhead")),
              // OpenYRWeb: Mastermind overload tiers (vanilla YR [CombatDamage]).
              (this.overloadCount = e.getArray("OverloadCount")),
              (this.overloadDamage = e.getArray("OverloadDamage")),
              (this.overloadFrames = e.getArray("OverloadFrames")),
              // OpenYRWeb: mind-control visual feedback (vanilla YR [CombatDamage]).
              (this.controlledAnimationType = e.getString("ControlledAnimationType")),
              (this.permaControlledAnimationType = e.getString("PermaControlledAnimationType")),
              (this.mindControlAttackLineFrames = e.getNumber("MindControlAttackLineFrames", 20)),
              (this.splashList = e.getArray("SplashList")),
              (this.v3EliteWarhead = e.getString("V3EliteWarhead")),
              (this.v3Warhead = e.getString("V3Warhead")),
              // OpenYRWeb: berserk fire-rate multiplier (vanilla YR [CombatDamage] BerserkROFMultiplier).
              // When a unit is berserk (hit by Psychedelic=yes warhead), its ROF is multiplied by this value.
              // Default 0.5 = 2x fire rate (fires twice as fast). Ares docs confirm default 0.5.
              (this.berserkROFMultiplier = e.getNumber("BerserkROFMultiplier", 0.5)),
              // OpenYRWeb: Tank Bunker weapon bonus multipliers (vanilla YR [CombatDamage]).
              // BunkerDamageMultiplier: global multiplier to weapon Damage when fired from inside a Tank Bunker.
              // BunkerROFMultiplier: global multiplier to weapon ROF (rate of fire) when inside a Tank Bunker.
              // BunkerWeaponRangeBonus: bonus tiles added to weapon Range when inside a Tank Bunker.
              // See ModEnc/BunkerDamageMultiplier, ModEnc/Bunkers.
              (this.bunkerDamageMultiplier = e.getNumber("BunkerDamageMultiplier", 1)),
              (this.bunkerROFMultiplier = e.getNumber("BunkerROFMultiplier", 1)),
              (this.bunkerWeaponRangeBonus = e.getNumber("BunkerWeaponRangeBonus", 0)));
          }
        }),
      );
    },
  };
});
