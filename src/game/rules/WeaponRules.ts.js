// === Reconstructed SystemJS module: game/rules/WeaponRules ===
// deps: ["game/rules/ObjectRules"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/WeaponRules", ["game/rules/ObjectRules"], function (e, t) {
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
        "WeaponRules",
        (r = class {
          constructor(e) {
            ((this.rules = e), this.parse());
          }
          parse() {
            ((this.ambientDamage = this.rules.getNumber("AmbientDamage")),
              (this.anim = this.rules.getArray("Anim")),
              (this.areaFire = this.rules.getBool("AreaFire")),
              (this.burst = this.rules.getNumber("Burst", 1)),
              (this.cellRangefinding = this.rules.getBool("CellRangefinding")),
              (this.damage = this.rules.getNumber("Damage")),
              // OpenYRWeb (2026-06-30, REVERSED): DrainWeapon=yes marks a weapon that, when it
              // strikes a Drainable=yes building, drains power/money instead of dealing damage
              // (vanilla Floating Disc / DISCUS uses this). REVERSED from yrmd.exe: DrainWeapon is
              // a per-weapon boolean parsed in WeaponTypeClass::ReadINI (@ 0x00849470).
              (this.drainWeapon = this.rules.getBool("DrainWeapon")),
              (this.decloakToFire = this.rules.getBool("DecloakToFire", !0)),
              (this.fireOnce = this.rules.getBool("FireOnce")),
              (this.isAlternateColor = this.rules.getBool("IsAlternateColor")),
              (this.isElectricBolt = this.rules.getBool("IsElectricBolt")),
              (this.isHouseColor = this.rules.getBool("IsHouseColor")),
              // OpenYRWeb: IsMagBeam=yes marks a weapon that should render the magnetic tractor
              // beam visual. The actual drag logic additionally requires the weapon's warhead to
              // have IsLocomotor=yes. This lets rulesmd.ini keep IsMagBeam=yes on MagneShake for
              // other purposes without it accidentally drawing the tractor beam.
              (this.isMagBeam = this.rules.getBool("IsMagBeam")),
              // OpenYRWeb (2026-07-06): MagnaBeam parameters for dedicated Magnetron beam rendering.
              // These control the visual appearance of the magnetic tractor beam: colour, alpha,
              // width, wave distortion, pulse/flicker, glow halo, and blending mode.
              // Parsed from weapon INI section (e.g. [MagneticBeam]) to replace the old hardcoded
              // RadBeamFx visual. Defaults match vanilla YR purple-beam appearance.
              (this.isCustomColor = this.rules.getBool("IsCustomColor")),
              (this.magnaBeamColor = this.rules.getNumberArray("MagnaBeamColor", /,\s*/, [160, 80, 240])),
              (this.magnaBeamAlpha = this.rules.getNumber("MagnaBeamAlpha", 0.85)),
              (this.magnaBeamHouseColor = this.rules.getBool("MagnaBeamHouseColor")),
              (this.magnaBeamWidth = this.rules.getNumber("MagnaBeamWidth", 10.0)),
              (this.magnaBeamOuterSpread = this.rules.getNumber("MagnaBeamOuterSpread", 5.0)),
              (this.magnaBeamWaveAmplitude = this.rules.getNumber("MagnaBeamWaveAmplitude", 1.8)),
              (this.magnaBeamWaveFrequency = this.rules.getNumber("MagnaBeamWaveFrequency", 6.0)),
              (this.magnaBeamWaveSpeed = this.rules.getNumber("MagnaBeamWaveSpeed", 2.2)),
              (this.magnaBeamPulse = this.rules.getNumber("MagnaBeamPulse", 0.3)),
              (this.magnaBeamPulseRate = this.rules.getNumber("MagnaBeamPulseRate", 3.5)),
              (this.magnaBeamAdditive = this.rules.getBool("MagnaBeamAdditive", !0)),
              (this.magnaBeamStartAnim = this.rules.getString("MagnaBeamStartAnim") || void 0),
              (this.magnaBeamEndAnim = this.rules.getString("MagnaBeamEndAnim") || void 0),
              (this.magnaBeamAnimScale = this.rules.getNumber("MagnaBeamAnimScale", 1.0)),
              (this.isLaser = this.rules.getBool("IsLaser")),
              (this.isRadBeam = this.rules.getBool("IsRadBeam")),
              (this.isSonic = this.rules.getBool("IsSonic")),
              (this.laserDuration = this.rules.getNumber("LaserDuration")),
              (this.limboLaunch = this.rules.getBool("LimboLaunch")),
              (this.minimumRange = this.rules.getNumber("MinimumRange")),
              (this.name = this.rules.name),
              (this.neverUse = this.rules.getBool("NeverUse")),
              (this.omniFire = this.rules.getBool("OmniFire")),
              (this.projectile = this.rules.getString("Projectile")),
              (this.radLevel = this.rules.getNumber("RadLevel")),
              (this.range = this.rules.getNumber("Range")),
              -2 === this.range && (this.range = Number.POSITIVE_INFINITY),
              (this.report = this.rules.getArray("Report")),
              (this.revealOnFire = this.rules.getBool("RevealOnFire", !0)),
              (this.rof = this.rules.getNumber("ROF")),
              (this.sabotageCursor = this.rules.getBool("SabotageCursor")),
              (this.spawner = this.rules.getBool("Spawner")));
            var e = this.rules.getNumber("Speed");
            ((this.iniSpeed = e),
              (this.speed = i.ObjectRules.iniSpeedToLeptonsPerTick(e, 100)),
              (this.suicide = this.rules.getBool("Suicide")),
              (this.useSparkParticles = this.rules.getBool("UseSparkParticles")),
              (this.warhead = this.rules.getString("Warhead")));
          }
        }),
      );
    },
  };
});
