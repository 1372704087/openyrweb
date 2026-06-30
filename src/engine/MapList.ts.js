// === Reconstructed SystemJS module: engine/MapList ===
// deps: ["engine/MapManifest"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/MapList", ["engine/MapManifest"], function (e, t) {
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
        "MapList",
        (i = class i {
          constructor(e) {
            ((this.gameModes = e), (this.manifests = []));
          }
          addFromIni(i) {
            let e = i.getSection("MultiMaps");
            if (!e) throw new Error("Invalid map list. Missing [MultiMaps] section.");
            return (
              (this.manifests = this.manifests.concat(
                [...e.entries.values()].map((e) => {
                  var t = i.getSection(e);
                  if (!t) throw new Error(`Invalid map list. Missing [${e}] section.`);
                  return new r.MapManifest().fromIni(t, this.gameModes.getAll());
                }),
              )),
              this.dedupeEntries(),
              this
            );
          }
          add(e) {
            this.manifests.push(e);
          }
          addFromMapFile(e) {
            this.add(new r.MapManifest().fromMapFile(e, this.gameModes.getAll()));
          }
          getAll() {
            return this.manifests;
          }
          getByName(t) {
            return this.manifests.find((e) => e.fileName.toLowerCase() === t.toLowerCase());
          }
          sortByName() {
            this.manifests.sort((e, t) => e.fileName.localeCompare(t.fileName));
          }
          clone() {
            let e = new i(this.gameModes);
            return ((e.manifests = [...this.manifests]), e);
          }
          mergeWith(e) {
            return (this.manifests.push(...e.manifests), this.dedupeEntries(), this);
          }
          dedupeEntries() {
            this.manifests = [...new Map(this.manifests.map((e) => [e.fileName.toLowerCase(), e])).values()];
          }
        }),
      );
    },
  };
});
