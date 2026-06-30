// === Reconstructed SystemJS module: game/Country ===
// deps: ["engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/Country", ["engine/type/ObjectType"], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "Country",
        (i = class {
          static factory(e, t) {
            return new this(t.getCountry(e));
          }
          constructor(e) {
            this.rules = e;
          }
          get id() {
            return this.rules.id;
          }
          get side() {
            return this.rules.side;
          }
          get name() {
            return this.rules.name;
          }
          isPlayable() {
            return this.rules.multiplay && !this.rules.multiplayPassive;
          }
          hasVeteranUnit(e, t) {
            let i = [];
            switch (e) {
              case r.ObjectType.Aircraft:
                i = this.rules.veteranAircraft;
                break;
              case r.ObjectType.Infantry:
                i = this.rules.veteranInfantry;
                break;
              case r.ObjectType.Vehicle:
                i = this.rules.veteranUnits;
                break;
              default:
                throw new Error(`Unsupported object type "${r.ObjectType[e]}"`);
            }
            return i.includes(t);
          }
        }),
      );
    },
  };
});
