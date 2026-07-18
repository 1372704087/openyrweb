// === Custom AI module: game/bot/custom-ai/logic/threat/threat ===
System.register("game/bot/custom-ai/logic/threat/threat", [], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [],
    execute: function () {
      var GlobalThreat = (function () {
        function GlobalThreat(
          certainty,
          totalOffensiveLandThreat,
          totalOffensiveAirThreat,
          totalOffensiveAntiAirThreat,
          totalDefensiveThreat,
          totalDefensivePower,
          totalAvailableAntiGroundFirepower,
          totalAvailableAntiAirFirepower,
          totalAvailableAirPower
        ) {
          this.certainty = certainty;
          this.totalOffensiveLandThreat = totalOffensiveLandThreat;
          this.totalOffensiveAirThreat = totalOffensiveAirThreat;
          this.totalOffensiveAntiAirThreat = totalOffensiveAntiAirThreat;
          this.totalDefensiveThreat = totalDefensiveThreat;
          this.totalDefensivePower = totalDefensivePower;
          this.totalAvailableAntiGroundFirepower = totalAvailableAntiGroundFirepower;
          this.totalAvailableAntiAirFirepower = totalAvailableAntiAirFirepower;
          this.totalAvailableAirPower = totalAvailableAirPower;
        }
        return GlobalThreat;
      })();
      e("GlobalThreat", GlobalThreat);
    },
  };
});
