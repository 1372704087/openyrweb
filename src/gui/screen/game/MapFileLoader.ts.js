// === Reconstructed SystemJS module: gui/screen/game/MapFileLoader ===
// deps: ["data/vfs/FileNotFoundError","data/vfs/VirtualFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/MapFileLoader",
  ["data/vfs/FileNotFoundError", "data/vfs/VirtualFile"],
  function (e, t) {
    "use strict";
    var r, s, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        e(
          "MapFileLoader",
          (i = class {
            constructor(e, t) {
              ((this.resourceLoader = e), (this.vfs = t));
            }
            async load(e, t) {
              // OpenYRWeb (offline): maps are read from the imported game files only.
              // No remote download fallback — a missing map surfaces as FileNotFoundError.
              if (this.vfs) return await this.vfs.openFileWithRfs(e);
              throw new r.FileNotFoundError(`File "${e}" not found in virtual file system`);
            }
          }),
        );
      },
    };
  },
);
