// === Reconstructed SystemJS module: game/rules/DebrisRules ===
// deps: ["util/math","game/rules/ObjectRules"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/DebrisRules", ["util/math", "game/rules/ObjectRules"], function (e, t) {
  "use strict";
  var i, r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      ((s = class extends r.ObjectRules {
        parse() {
          (super.parse(),
            (this.damage = this.ini.getNumber("Damage")),
            (this.damageRadius = this.ini.getNumber("DamageRadius")),
            (this.duration = this.ini.getNumber("Duration")),
            (this.elasticity = i.clamp(this.ini.getNumber("Elasticity", 0.75), 0, 1)),
            (this.expireAnim = this.ini.getString("ExpireAnim") || void 0),
            (this.minAngularVelocity = this.ini.getNumber("MinAngularVelocity")),
            (this.maxAngularVelocity = this.ini.getNumber("MaxAngularVelocity")),
            (this.maxXYVel = this.ini.getNumber("MaxXYVel")),
            (this.minZVel = this.ini.getNumber("MinZVel")),
            (this.maxZVel = this.ini.getNumber("MaxZVel")),
            (this.shareTurretData = this.ini.getBool("ShareTurretData")),
            (this.shareBodyData = this.ini.getBool("ShareBodyData")),
            (this.shareBarrelData = this.ini.getBool("ShareBarrelData")),
            (this.shareSource = this.ini.getString("ShareSource") || void 0),
            (this.trailerAnim = this.ini.getString("TrailerAnim") || void 0),
            (this.trailerSeparation = this.ini.getNumber("TrailerSeperation")),
            (this.warhead = this.ini.getString("Warhead") || void 0));
        }
      }),
        e("DebrisRules", s));
    },
  };
});
