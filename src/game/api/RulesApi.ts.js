// === Reconstructed SystemJS module: game/api/RulesApi ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/api/RulesApi", [], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "RulesApi",
        (r = class {
          get allObjectRules() {
            return __classPrivateFieldGet(this, i, "f").allObjectRules;
          }
          get buildingRules() {
            return __classPrivateFieldGet(this, i, "f").buildingRules;
          }
          get infantryRules() {
            return __classPrivateFieldGet(this, i, "f").infantryRules;
          }
          get vehicleRules() {
            return __classPrivateFieldGet(this, i, "f").vehicleRules;
          }
          get aircraftRules() {
            return __classPrivateFieldGet(this, i, "f").aircraftRules;
          }
          get terrainRules() {
            return __classPrivateFieldGet(this, i, "f").terrainRules;
          }
          get overlayRules() {
            return __classPrivateFieldGet(this, i, "f").overlayRules;
          }
          get countryRules() {
            return __classPrivateFieldGet(this, i, "f").countryRules;
          }
          get general() {
            return __classPrivateFieldGet(this, i, "f").general;
          }
          get ai() {
            return __classPrivateFieldGet(this, i, "f").ai;
          }
          get crateRules() {
            return __classPrivateFieldGet(this, i, "f").crateRules;
          }
          get combatDamage() {
            return __classPrivateFieldGet(this, i, "f").combatDamage;
          }
          get radiation() {
            return __classPrivateFieldGet(this, i, "f").radiation;
          }
          constructor(e) {
            (i.set(this, void 0), __classPrivateFieldSet(this, i, e, "f"));
          }
          hasObject(e, t) {
            return __classPrivateFieldGet(this, i, "f").hasObject(e, t);
          }
          getObject(e, t) {
            return __classPrivateFieldGet(this, i, "f").getObject(e, t);
          }
          getBuilding(e) {
            return __classPrivateFieldGet(this, i, "f").getBuilding(e);
          }
          getWeapon(e) {
            return __classPrivateFieldGet(this, i, "f").getWeapon(e);
          }
          getWarhead(e) {
            return __classPrivateFieldGet(this, i, "f").getWarhead(e);
          }
          getProjectile(e) {
            return __classPrivateFieldGet(this, i, "f").getProjectile(e);
          }
          getOverlayName(e) {
            return __classPrivateFieldGet(this, i, "f").getOverlayName(e);
          }
          getOverlayId(e) {
            return __classPrivateFieldGet(this, i, "f").getOverlayId(e);
          }
          getOverlay(e) {
            return __classPrivateFieldGet(this, i, "f").getOverlay(e);
          }
          getCountry(e) {
            return __classPrivateFieldGet(this, i, "f").getCountry(e);
          }
          getMultiplayerCountries() {
            return __classPrivateFieldGet(this, i, "f").getMultiplayerCountries();
          }
          getIni() {
            return __classPrivateFieldGet(this, i, "f").getIni();
          }
        }),
      ),
        (i = new WeakMap()));
    },
  };
});
