// === Reconstructed SystemJS module: engine/gameRes/GameResConfig ===
// deps: ["engine/gameRes/GameResSource"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gameRes/GameResConfig", ["engine/gameRes/GameResSource"], function (e, t) {
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
        "GameResConfig",
        (i = class {
          constructor(e) {
            this.defaultCdnBaseUrl = e;
          }
          unserialize(e) {
            var [t, i] = e.split(","),
              t = Number(t);
            if (!r.GameResSource[t]) throw new Error(`Unknown game res source "${t}"`);
            ((this.source = t), (this.cdnUrl = i ? decodeURI(i) : void 0));
          }
          serialize() {
            return this.source + (this.cdnUrl ? "," + encodeURI(this.cdnUrl) : "");
          }
          isCdn() {
            return this.source === r.GameResSource.Cdn;
          }
          getCdnBaseUrl() {
            return this.cdnUrl ?? this.defaultCdnBaseUrl;
          }
        }),
      );
    },
  };
});
