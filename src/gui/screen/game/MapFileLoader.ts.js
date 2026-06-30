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
              let i;
              if (this.vfs)
                try {
                  i = await this.vfs.openFileWithRfs(e);
                } catch (e) {
                  e instanceof r.FileNotFoundError || console.error(e);
                }
              return ((i = i || s.VirtualFile.fromBytes(await this.resourceLoader.loadBinary(e, t), e)), i);
            }
          }),
        );
      },
    };
  },
);
