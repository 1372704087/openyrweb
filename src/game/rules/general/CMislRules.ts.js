// === Reconstructed SystemJS module: game/rules/general/CMislRules ===
// deps: ["game/rules/general/MissileRules"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/CMislRules", ["game/rules/general/MissileRules"], function (e, t) {
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
            (this.pauseFrames = e.getNumber("CMislPauseFrames")),
            (this.tiltFrames = e.getNumber("CMislTiltFrames")),
            (this.pitchInitial = e.getNumber("CMislPitchInitial")),
            (this.pitchFinal = e.getNumber("CMislPitchFinal")),
            (this.turnRate = e.getNumber("CMislTurnRate")),
            (this.raiseRate = e.getNumber("CMislRaiseRate")),
            (this.acceleration = e.getNumber("CMislAcceleration")),
            (this.altitude = e.getNumber("CMislAltitude")),
            (this.damage = e.getNumber("CMislDamage")),
            (this.eliteDamage = e.getNumber("CMislEliteDamage")),
            (this.bodyLength = e.getNumber("CMislBodyLength")),
            (this.lazyCurve = e.getBool("CMislLazyCurve")),
            (this.type = e.getString("CMislType")),
            this
          );
        }
      }),
        e("CMislRules", r));
    },
  };
});
