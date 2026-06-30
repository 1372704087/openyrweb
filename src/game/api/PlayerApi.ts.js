// === Reconstructed SystemJS module: game/api/PlayerApi ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/api/PlayerApi", [], function (e, t) {
  "use strict";
  var s, i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "PlayerApi",
        (i = class {
          constructor(e, t, i, r) {
            ((this.name = e),
              (this.actions = i),
              (this.production = r),
              s.set(this, void 0),
              __classPrivateFieldSet(this, s, t, "f"));
          }
          getPlayerData() {
            return __classPrivateFieldGet(this, s, "f").getPlayerData(this.name);
          }
          isDefeated() {
            return __classPrivateFieldGet(this, s, "f").isPlayerDefeated(this.name);
          }
          isAlliedWith(e) {
            return __classPrivateFieldGet(this, s, "f").areAlliedPlayers(this.name, e);
          }
          canPlaceBuilding(e, t) {
            return __classPrivateFieldGet(this, s, "f").canPlaceBuilding(this.name, e, t);
          }
          getVisibleUnits(e, t = () => !0) {
            return __classPrivateFieldGet(this, s, "f").getVisibleUnits(this.name, e, t);
          }
        }),
      ),
        (s = new WeakMap()));
    },
  };
});
