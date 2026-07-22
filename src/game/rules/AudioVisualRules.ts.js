// === Reconstructed SystemJS module: game/rules/AudioVisualRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/AudioVisualRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "AudioVisualRules",
        (i = class {
          readIni(e) {
            ((this.ini = e),
              (this.ambientChangeRate = e.getNumber("AmbientChangeRate")),
              (this.ambientChangeStep = e.getNumber("AmbientChangeStep")),
              (this.behind = e.getString("Behind")),
              (this.benderOfSpoons = e.getString("BenderOfSpoons") || void 0),
              // OpenYRWeb: berserk unit tint color (vanilla YR [AudioVisual] BerserkColor).
              // Applied as a remap tint to units affected by Psychedelic=yes warhead (Chaos Drone gas).
              // Default is a reddish-purple (255,0,255 in vanilla YR). Format: r,g,b (0-255).
              (this.berserkColor = e.getNumberArray("BerserkColor")),
              (this.bridgeExplosions = e.getArray("BridgeExplosions")),
              (this.chronoBeamColor = e.getNumberArray("ChronoBeamColor")),
              (this.chronoBlast = e.getString("ChronoBlast")),
              (this.chronoBlastDest = e.getString("ChronoBlastDest")),
              (this.chronoPlacement = e.getString("ChronoPlacement")),
              (this.chronoSparkle1 = e.getString("ChronoSparkle1")),
              (this.conditionRed = e.getNumber("ConditionRed")),
              (this.conditionYellow = e.getNumber("ConditionYellow")),
              (this.creditTicks = e.getArray("CreditTicks")),
              (this.extraAircraftLight = e.getNumber("ExtraAircraftLight")),
              (this.extraInfantryLight = e.getNumber("ExtraInfantryLight")),
              (this.extraUnitLight = e.getNumber("ExtraUnitLight")));
            let t = e.getString("DamageFireTypes");
            ((t = t || "FIRE01,FIRE02,FIRE03"),
              (this.fireNames = t.split(/\.|,/).filter((e) => "" !== e)),
              (this.flyerHelper = e.getString("FlyerHelper")),
              (this.gravity = e.getNumber("Gravity")),
              (this.idleActionFrequency = 60 * e.getNumber("IdleActionFrequency")),
              (this.impactLandSound = e.getString("ImpactLandSound") || void 0),
              (this.impactWaterSound = e.getString("ImpactWaterSound") || void 0),
              (this.infantryExplode = e.getString("InfantryExplode")),
              (this.flamingInfantry = e.getString("FlamingInfantry")),
              (this.infantryHeadPop = e.getString("InfantryHeadPop")),
              (this.infantryNuked = e.getString("InfantryNuked")),
              // OpenYRWeb: YR death anims. Virus (sniper), Mutate (Genetic Mutator transform fx),
              // Brute (the unit spawned by Mutate). Strings preserved by Engine.patchAudioVisualRules.
              (this.infantryVirus = e.getString("InfantryVirus")),
              (this.infantryMutate = e.getString("InfantryMutate")),
              (this.infantryBrute = e.getString("InfantryBrute")),
              // OpenYRWeb: Psychic Dominator data (SuperWeapon=Type=PsychicDominator). The Dominator
              // mind-controls organic enemy units in DominatorCaptureRange then detonates the
              // DominatorWarhead for damage. Anim/charge strings preserved by patchAudioVisualRules.
              (this.dominatorWarhead = e.getString("DominatorWarhead")),
              (this.dominatorDamage = e.getNumber("DominatorDamage", 0)),
              (this.dominatorCaptureRange = e.getNumber("DominatorCaptureRange", 0)),
              (this.dominatorFirstAnim = e.getString("DominatorFirstAnim")),
              (this.dominatorSecondAnim = e.getString("DominatorSecondAnim")),
              (this.dominatorFireAtPercentage = e.getNumber("DominatorFireAtPercentage", 100)),
              // OpenYRWeb: Mastermind overload death + mind-control release sounds.
              (this.masterMindOverloadDeathSound = e.getString("MasterMindOverloadDeathSound")),
              (this.mindClearedSound = e.getString("MindClearedSound")),
              (this.ironCurtainInvokeAnim = e.getString("IronCurtainInvokeAnim")),
              (this.messageDuration = e.getNumber("MessageDuration", 10)),
              (this.metallicDebris = e.getArray("MetallicDebris")),
              (this.nukeTakeOff = e.getString("NukeTakeOff")),
              (this.deadBodies = e.getArray("DeadBodies")),
              (this.wake = e.getString("Wake")),
              (this.parachute = e.getString("Parachute")),
              (this.moveFlash = e.getString("MoveFlash")),
              (this.warpOut = e.getString("WarpOut")),
              (this.warpAway = e.getString("WarpAway")),
              (this.weaponNullifyAnim = e.getString("WeaponNullifyAnim")),
              (this.weatherConClouds = e.getArray("WeatherConClouds")),
              (this.weatherConBoltExplosion = e.getString("WeatherConBoltExplosion")),
              (this.weatherConBolts = e.getArray("WeatherConBolts")));
          }
        }),
      );
    },
  };
});
