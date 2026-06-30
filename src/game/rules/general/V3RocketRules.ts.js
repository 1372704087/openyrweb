// === Reconstructed SystemJS module: game/rules/general/V3RocketRules ===
// deps: ["game/rules/general/MissileRules"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/V3RocketRules", ["game/rules/general/MissileRules"], function (e, t) {
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
      ((r = class extends i.MissileRules {
        readIni(e) {
          return (
            (this.pauseFrames = e.getNumber("V3RocketPauseFrames")),
            (this.tiltFrames = e.getNumber("V3RocketTiltFrames")),
            (this.pitchInitial = e.getNumber("V3RocketPitchInitial")),
            (this.pitchFinal = e.getNumber("V3RocketPitchFinal")),
            (this.turnRate = e.getNumber("V3RocketTurnRate")),
            (this.acceleration = e.getNumber("V3RocketAcceleration")),
            (this.altitude = e.getNumber("V3RocketAltitude")),
            (this.damage = e.getNumber("V3RocketDamage")),
            (this.eliteDamage = e.getNumber("V3RocketEliteDamage")),
            (this.bodyLength = e.getNumber("V3RocketBodyLength")),
            (this.lazyCurve = e.getBool("V3RocketLazyCurve")),
            (this.type = e.getString("V3RocketType")),
            this
          );
        }
      }),
        e("V3RocketRules", r));
    },
  };
});
