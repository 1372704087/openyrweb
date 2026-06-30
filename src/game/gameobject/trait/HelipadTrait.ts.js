// === Reconstructed SystemJS module: game/gameobject/trait/HelipadTrait ===
// deps: ["engine/type/ObjectType","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/trait/interface/NotifyUnspawn"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/HelipadTrait",
  [
    "engine/type/ObjectType",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/trait/interface/NotifyUnspawn",
  ],
  function (e, t) {
    "use strict";
    var s, i, r, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((a = class {
          [i.NotifyOwnerChange.onChange](e, t, i) {
            this.checkAircraftsForPlayer(t, i);
          }
          [r.NotifyUnspawn.onUnspawn](e, t) {
            this.checkAircraftsForPlayer(e.owner, t);
          }
          checkAircraftsForPlayer(e, t) {
            let i = t.rules.general.padAircraft;
            var r;
            for (r of e.getOwnedObjectsByType(s.ObjectType.Aircraft).filter((e) => i.includes(e.name)))
              r.airportBoundTrait && (r.airportBoundTrait.preferredAirport = void 0);
          }
        }),
          e("HelipadTrait", a));
      },
    };
  },
);
