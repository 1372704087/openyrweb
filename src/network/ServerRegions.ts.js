// === Reconstructed SystemJS module: network/ServerRegions ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/ServerRegions", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ServerRegions",
        (i = class {
          constructor() {
            this.regions = new Map();
          }
          load(e) {
            this.regions.clear();
            for (var t of e.getOrderedSections())
              this.regions.set(t.name, {
                id: t.name,
                label: t.getString("label"),
                available: t.getBool("available", !0),
                gameVersion: this.normalizeVersion(t.getString("gameVersion") || void 0),
                wolUrl: t.getString("wolUrl"),
                apiRegUrl: t.getString("apiRegUrl"),
                wladderUrl: t.getString("wladderUrl") || void 0,
                wgameresUrl: t.getString("wgameresUrl") || void 0,
                mapTransferUrl: t.getString("mapTransferUrl") || void 0,
                leaderboardUrl: t.getString("leaderboardUrl") || void 0,
              });
          }
          normalizeVersion(e) {
            return (void 0 !== e && e.match(/^\d+\.\d+$/) && (e += ".0"), e);
          }
          get(e) {
            if (!this.regions.has(e)) throw new Error("Unknown region id " + e);
            return this.regions.get(e);
          }
          has(e) {
            return this.regions.has(e);
          }
          isAvailable(e) {
            return this.regions.has(e) && this.regions.get(e).available;
          }
          getAll() {
            return [...this.regions.values()];
          }
          getFirstAvailable() {
            return this.getAll().filter((e) => e.available)[0];
          }
          getSize() {
            return this.regions.size;
          }
          setSelectedRegion(e) {
            this.selectedRegion = this.get(e);
          }
          getSelectedRegion() {
            if (!this.selectedRegion) throw new Error("No server region selected");
            return this.selectedRegion;
          }
        }),
      );
    },
  };
});
