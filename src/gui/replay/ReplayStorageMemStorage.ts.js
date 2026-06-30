// === Reconstructed SystemJS module: gui/replay/ReplayStorageMemStorage ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/replay/ReplayStorageMemStorage", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ReplayStorageMemStorage",
        (i = class {
          constructor() {
            this.replays = new Map();
          }
          async getManifest() {
            return this.manifest ? JSON.parse(this.manifest) : [];
          }
          async saveManifest(e) {
            this.manifest = JSON.stringify(e);
          }
          async getReplayData(e) {
            var t = this.replays.get(e.id);
            if (!t) throw new Error(`Replay "${e.id}" not found in memory`);
            return t;
          }
          async hasReplayData(e) {
            return this.replays.has(e.id);
          }
          async saveReplayData(e, t) {
            this.replays.set(e.id, t);
          }
          async deleteReplayData(e) {
            this.replays.delete(e.id);
          }
        }),
      );
    },
  };
});
