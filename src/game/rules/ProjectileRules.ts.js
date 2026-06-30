// === Reconstructed SystemJS module: game/rules/ProjectileRules ===
// deps: ["game/rules/ObjectRules"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/ProjectileRules", ["game/rules/ObjectRules"], function (e, t) {
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
      ((r = class extends i.ObjectRules {
        parse() {
          super.parse();
          var e = this.ini.getNumber("ROT", 0);
          let t = this.ini.getNumber("Acceleration");
          (1 !== e || t || (t = Number.POSITIVE_INFINITY),
            (t = t || 3),
            (this.acceleration = t),
            (this.arcing = this.ini.getBool("Arcing")),
            (this.courseLockDuration = this.ini.getNumber("CourseLockDuration")),
            (this.detonationAltitude = this.ini.getNumber("DetonationAltitude")),
            (this.firersPalette = this.ini.getBool("FirersPalette")),
            (this.flakScatter = this.ini.getBool("FlakScatter")),
            (this.inaccurate = this.ini.getBool("Inaccurate")),
            (this.inviso = this.ini.getBool("Inviso")),
            (this.isAntiAir = this.ini.getBool("AA")),
            (this.isAntiGround = this.ini.getBool("AG", !0)),
            (this.level = this.ini.getBool("Level")),
            (this.rot = i.ObjectRules.iniRotToDegsPerTick(e)),
            (this.iniRot = e),
            (this.shadow = this.ini.getBool("Shadow", !0)),
            (this.shrapnelWeapon = this.ini.getString("ShrapnelWeapon") || void 0),
            (this.shrapnelCount = this.ini.getNumber("ShrapnelCount")),
            (this.subjectToCliffs = this.ini.getBool("SubjectToCliffs")),
            (this.subjectToElevation = this.ini.getBool("SubjectToElevation")),
            (this.subjectToWalls = this.ini.getBool("SubjectToWalls")),
            (this.vertical = this.ini.getBool("Vertical")));
        }
      }),
        e("ProjectileRules", r));
    },
  };
});
