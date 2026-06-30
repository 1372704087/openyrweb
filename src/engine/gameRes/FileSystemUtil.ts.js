// === Reconstructed SystemJS module: engine/gameRes/FileSystemUtil ===
// deps: ["file-system-access","data/vfs/FileNotFoundError","data/vfs/IOError"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/gameRes/FileSystemUtil",
  ["file-system-access", "data/vfs/FileNotFoundError", "data/vfs/IOError"],
  function (e, t) {
    "use strict";
    var i, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        e(
          "FileSystemUtil",
          (a = class {
            static async getDirContents(t) {
              let e = [];
              try {
                for await (var i of t.values()) e.push(i);
              } catch (e) {
                if ("NotFoundError" === e.name)
                  throw new r.FileNotFoundError(`Directory "${t.name}" not found`, { cause: e });
                if (e instanceof DOMException)
                  throw new s.IOError(`Directory "${t.name}" could not be read (${e.name})`, { cause: e });
                throw e;
              }
              return e;
            }
            static async listDir(t) {
              let e = [];
              try {
                for await (var i of t.keys()) e.push(i);
              } catch (e) {
                if ("NotFoundError" === e.name)
                  throw new r.FileNotFoundError(`Directory "${t.name}" not found`, { cause: e });
                if (e instanceof DOMException)
                  throw new s.IOError(`Directory "${t.name}" could not be read (${e.name})`, { cause: e });
                throw e;
              }
              return e;
            }
            static async showArchivePicker() {
              var e = await i.showOpenFilePicker({
                types: [
                  {
                    description: "Archive",
                    accept: {
                      "application/vnd.rar": [".rar"],
                      "application/zip": [".zip"],
                      "application/x-tar": [".tar"],
                      "application/gzip": [".gz"],
                      "application/x-bzip": [".bz"],
                      "application/x-bzip2": [".bz2"],
                      "application/x-xz": [".xz"],
                      "application/x-7z-compressed": [".7z"],
                      "application/octet-stream": [".exe"],
                    },
                  },
                ],
              });
              return Array.isArray(e) ? e[0] : e;
            }
            static polyfillGetFile() {
              const e = FileSystemFileHandle.prototype.getFile;
              FileSystemFileHandle.prototype.getFile = function () {
                return e
                  .call(this)
                  .then((e) => new File([e], this.name, { type: e.type, lastModified: e.lastModified }));
              };
            }
          }),
        );
      },
    };
  },
);
