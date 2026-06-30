// === Reconstructed SystemJS module: game/gameobject/trait/AirportBoundTrait ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/trait/AirportBoundTrait", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "AirportBoundTrait",
        (i = class {
          constructor(e) {
            this.airportNames = e;
          }
          findAvailableAirport(e) {
            return [...e.owner.buildings].find(
              (e) => e.dockTrait && this.airportNames.includes(e.name) && 0 < e.dockTrait.getAvailableDockCount(),
            );
          }
        }),
      );
    },
  };
});
