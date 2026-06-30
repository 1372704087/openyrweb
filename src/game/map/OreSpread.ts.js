// === Reconstructed SystemJS module: game/map/OreSpread ===
// deps: ["game/map/OreOverlayTypes","engine/type/TiberiumType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/OreSpread", ["game/map/OreOverlayTypes", "engine/type/TiberiumType"], function (e, t) {
  "use strict";
  var s, a, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e(
        "OreSpread",
        (i = class {
          static calculateOverlayId(e, t) {
            var i = t.dx,
              r = t.dy,
              i = Math.floor(
                (((((r - 9) / 2) % 12) * (((r - 8) / 2) % 12)) % 12) -
                  (((((i - 13) / 2) % 12) * (((i - 12) / 2) % 12)) % 12) +
                  12e4,
              );
            return (
              (i %= 12),
              e === a.TiberiumType.Riparius
                ? s.OreOverlayTypes.minIdRiparius + i
                : e === a.TiberiumType.Cruentus
                  ? s.OreOverlayTypes.minIdCruentus + i
                  : e === a.TiberiumType.Vinifera
                    ? s.OreOverlayTypes.minIdVinifera + i
                    : e === a.TiberiumType.Aboreus
                      ? s.OreOverlayTypes.minIdAboreus + i
                      : void 0
            );
          }
        }),
      );
    },
  };
});
