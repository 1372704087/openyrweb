// === Reconstructed SystemJS module: data/vfs/RealFileSystem ===
// deps: ["data/vfs/FileNotFoundError","data/vfs/RealFileSystemDir"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "data/vfs/RealFileSystem",
  ["data/vfs/FileNotFoundError", "data/vfs/RealFileSystemDir"],
  function (e, t) {
    "use strict";
    var r, i, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        e(
          "RealFileSystem",
          (s = class {
            constructor() {
              this.directories = [];
            }
            addRootDirectoryHandle(e) {
              ((this.rootDirectory = this.addDirectoryHandle(e)), (this.rootDirectoryHandle = e));
            }
            getRootDirectoryHandle() {
              return this.rootDirectoryHandle;
            }
            addDirectoryHandle(e) {
              var t = new i.RealFileSystemDir(e);
              return (this.directories.push(t), t);
            }
            addDirectory(e) {
              this.directories.push(e);
            }
            async getDirectory(e) {
              var t = await this.findDirectory(e);
              if (!t) throw new Error(`Directory "${e}" not found in real file system`);
              return t;
            }
            async findDirectory(e) {
              for (const t of this.directories) if (await t.containsEntry(e)) return await t.getDirectory(e);
            }
            getRootDirectory() {
              return this.rootDirectory;
            }
            async containsEntry(e) {
              for (const t of this.directories) if (await t.containsEntry(e)) return !0;
              return !1;
            }
            async openFile(e, t = !1) {
              for (const i of this.directories)
                try {
                  return await i.openFile(e, t);
                } catch (e) {
                  if (!(e instanceof r.FileNotFoundError)) throw e;
                }
              throw new r.FileNotFoundError(`File "${e}" not found in real file system`);
            }
            async getRawFile(e) {
              for (const t of this.directories) if (await t.containsEntry(e)) return await t.getRawFile(e);
              throw new Error(`File "${e}" not found in real file system`);
            }
            async *getEntries() {
              for (var e of this.directories) for await (var t of e.getEntries()) yield t;
            }
          }),
        );
      },
    };
  },
);
