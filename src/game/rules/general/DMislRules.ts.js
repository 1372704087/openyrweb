// === Reconstructed SystemJS module: game/rules/general/DMislRules ===
// deps: ["game/rules/general/MissileRules"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/DMislRules", ["game/rules/general/MissileRules"], function (e, t) {
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
            (this.pauseFrames = e.getNumber("DMislPauseFrames")),
            (this.tiltFrames = e.getNumber("DMislTiltFrames")),
            (this.pitchInitial = e.getNumber("DMislPitchInitial")),
            (this.pitchFinal = e.getNumber("DMislPitchFinal")),
            (this.turnRate = e.getNumber("DMislTurnRate")),
            (this.acceleration = e.getNumber("DMislAcceleration")),
            (this.altitude = e.getNumber("DMislAltitude")),
            (this.damage = e.getNumber("DMislDamage")),
            (this.eliteDamage = e.getNumber("DMislEliteDamage")),
            (this.bodyLength = e.getNumber("DMislBodyLength")),
            (this.lazyCurve = e.getBool("DMislLazyCurve")),
            (this.type = e.getString("DMislType")),
            this
          );
        }
      }),
        e("DMislRules", r));
    },
  };
});
