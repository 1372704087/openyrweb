// === Reconstructed SystemJS module: engine/gfx/geometry/VxlGeometryCache ===
// deps: ["data/DataStream","data/vfs/VirtualFile","engine/gfx/geometry/BufferGeometrySerializer","data/vfs/FileNotFoundError"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/gfx/geometry/VxlGeometryCache",
  [
    "data/DataStream",
    "data/vfs/VirtualFile",
    "engine/gfx/geometry/BufferGeometrySerializer",
    "data/vfs/FileNotFoundError",
  ],
  function (e, t) {
    "use strict";
    var r, s, n, o, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        (e(
          "VxlGeometryCache",
          (a = class a {
            constructor(e, t) {
              ((this.cacheDir = e), (this.activeMod = t), (this.geometries = new Map()));
            }
            async loadFromStorage(t, i) {
              let r = this.geometries.get(t);
              if (!r) {
                let e = this.cacheDir;
                if (e) {
                  var s = this.getCacheFileName(i, t.name);
                  try {
                    var a = await e.openFile(s);
                    ((r = new n.BufferGeometrySerializer().unserialize(a.stream)), this.set(t, r));
                  } catch (e) {
                    e instanceof o.FileNotFoundError ||
                      console.error(`Failed to load buffer geometry from cache file "${s}"`, e);
                  }
                }
              }
              return r;
            }
            async persistToStorage(e, t, i) {
              (this.geometries.has(e) || this.set(e, new n.BufferGeometrySerializer().unserialize(new r.DataStream(i))),
                await this.cacheDir?.writeFile(
                  new s.VirtualFile(new r.DataStream(i), this.getCacheFileName(t, e.name)),
                ));
            }
            async clearStorage() {
              await this.clearStorageFiles();
            }
            async clearOtherModStorage() {
              let t = a.cacheFilePrefix + this.getModPrefix();
              await this.clearStorageFiles((e) => !e.startsWith(t));
            }
            async clearStorageFiles(e = () => !0) {
              let t = this.cacheDir;
              if (t)
                for await (var i of t.getEntries()) i.startsWith(a.cacheFilePrefix) && e(i) && (await t.deleteFile(i));
            }
            getCacheFileName(e, t) {
              var i = this.getModPrefix();
              return "" + a.cacheFilePrefix + i + e.replace(".vxl", "") + "_" + t;
            }
            getModPrefix() {
              return this.activeMod ? this.activeMod + "#" : "#";
            }
            clear() {
              (this.geometries.forEach((e) => {
                e.dispose();
                for (var t of Object.keys(e.attributes)) e.removeAttribute(t);
              }),
                this.geometries.clear());
            }
            get(e) {
              return this.geometries.get(e);
            }
            set(e, t) {
              this.geometries.set(e, t);
            }
          }),
        ),
          (a.cacheFilePrefix = "geocache_"));
      },
    };
  },
);
