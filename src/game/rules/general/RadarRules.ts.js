// === Reconstructed SystemJS module: game/rules/general/RadarRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/RadarRules", [], function (t, e) {
  "use strict";
  var i, r;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("RadarEventType", (i = {})))[(e.GenericCombat = 0)] = "GenericCombat"),
        (e[(e.GenericNonCombat = 1)] = "GenericNonCombat"),
        (e[(e.DropZone = 2)] = "DropZone"),
        (e[(e.BaseUnderAttack = 3)] = "BaseUnderAttack"),
        (e[(e.HarvesterUnderAttack = 4)] = "HarvesterUnderAttack"),
        (e[(e.EnemyObjectSensed = 5)] = "EnemyObjectSensed"),
        t(
          "RadarRules",
          (r = class {
            readIni(e) {
              return (
                (this.eventSuppressionDistances = e.getNumberArray("RadarEventSuppressionDistances")),
                (this.eventVisibilityDurations = e.getNumberArray("RadarEventVisibilityDurations")),
                (this.eventDurations = e.getNumberArray("RadarEventDurations")),
                (this.flashFrameTime = e.getNumber("FlashFrameTime")),
                (this.combatFlashTime = e.getNumber("RadarCombatFlashTime")),
                (this.eventMinRadius = e.getNumber("RadarEventMinRadius")),
                (this.eventSpeed = e.getNumber("RadarEventSpeed")),
                (this.eventRotationSpeed = e.getNumber("RadarEventRotationSpeed")),
                (this.eventColorSpeed = e.getNumber("RadarEventColorSpeed")),
                this
              );
            }
            getEventSuppresionDistance(e) {
              if (e > this.eventSuppressionDistances.length - 1)
                throw new RangeError("No event suppression distance is defined for type " + i[e]);
              return this.eventSuppressionDistances[e];
            }
            getEventVisibilityDuration(e) {
              if (e > this.eventVisibilityDurations.length - 1)
                throw new RangeError("No event visibility duration is defined for type " + i[e]);
              return this.eventVisibilityDurations[e];
            }
            getEventDuration(e) {
              if (e > this.eventDurations.length - 1)
                throw new RangeError("No event duration is defined for type " + i[e]);
              return this.eventDurations[e];
            }
          }),
        ));
    },
  };
});
