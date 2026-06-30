// === Reconstructed SystemJS module: game/map/OreOverlayTypes ===
// deps: ["engine/type/TiberiumType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/OreOverlayTypes", ["engine/type/TiberiumType"], function (e, t) {
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
      (e(
        "OreOverlayTypes",
        (r = class {
          static getOverlayTibType(e) {
            return this.isRiparius(e)
              ? i.TiberiumType.Riparius
              : this.isCruentus(e)
                ? i.TiberiumType.Cruentus
                : this.isVinifera(e)
                  ? i.TiberiumType.Vinifera
                  : this.isAboreus(e)
                    ? i.TiberiumType.Aboreus
                    : void 0;
          }
          static isRiparius(e) {
            return e >= this.minIdRiparius && e <= this.maxIdRiparius;
          }
          static isCruentus(e) {
            return e >= this.minIdCruentus && e <= this.maxIdCruentus;
          }
          static isVinifera(e) {
            return e >= this.minIdVinifera && e <= this.maxIdVinifera;
          }
          static isAboreus(e) {
            return e >= this.minIdAboreus && e <= this.maxIdAboreus;
          }
        }),
      ),
        (r.minIdRiparius = 102),
        (r.maxIdRiparius = 127),
        (r.minIdCruentus = 27),
        (r.maxIdCruentus = 38),
        (r.minIdVinifera = 127),
        (r.maxIdVinifera = 146),
        (r.minIdAboreus = 147),
        (r.maxIdAboreus = 166));
    },
  };
});
