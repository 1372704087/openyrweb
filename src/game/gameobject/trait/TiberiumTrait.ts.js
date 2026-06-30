// === Reconstructed SystemJS module: game/gameobject/trait/TiberiumTrait ===
// deps: ["game/type/LandType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/trait/TiberiumTrait", ["game/type/LandType"], function (e, t) {
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
        "TiberiumTrait",
        (r = class r {
          static canBePlacedOn(e, t) {
            return (
              [i.LandType.Clear, i.LandType.Road, i.LandType.Rough].includes(e.landType) &&
              !t.getGroundObjectsOnTile(e).find((e) => !e.isSmudge() && !e.isUnit())
            );
          }
          constructor(e, t) {
            ((this.gameObject = e), (this.rules = t));
          }
          getTiberiumType() {
            return this.rules.type;
          }
          collectBail() {
            var e = this.getBailCount();
            if (e <= 0) throw new Error("Attempted to collect an ore bail, but there are none left");
            return (this.gameObject.value--, 1 < e ? this.getTiberiumType() : void 0);
          }
          spawnBails(e) {
            this.gameObject.value = Math.min(r.maxBails, this.gameObject.value + e);
          }
          removeBails(e) {
            this.gameObject.value = Math.max(-1, this.gameObject.value - e);
          }
          getBailCount() {
            return this.gameObject.value + 1;
          }
          dispose() {
            this.gameObject = void 0;
          }
        }),
      ),
        (r.maxBails = 11));
    },
  };
});
