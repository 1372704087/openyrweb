// === Reconstructed SystemJS module: data/vfs/RealFileSystemDir ===
// deps: ["data/vfs/StorageQuotaError","util/string","data/vfs/FileNotFoundError","data/vfs/IOError","data/vfs/NameNotAllowedError","data/vfs/VirtualFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "data/vfs/RealFileSystemDir",
  [
    "data/vfs/StorageQuotaError",
    "util/string",
    "data/vfs/FileNotFoundError",
    "data/vfs/IOError",
    "data/vfs/NameNotAllowedError",
    "data/vfs/VirtualFile",
  ],
  function (e, t) {
    "use strict";
    var a, i, n, o, l, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e(
          "RealFileSystemDir",
          (s = class s {
            constructor(e, t = !1) {
              ((this.handle = e), (this.caseSensitive = t));
            }
            get name() {
              return this.handle.name;
            }
            async *getEntries() {
              try {
                for await (var e of this.handle.keys()) yield e;
              } catch (e) {
                if ("NotFoundError" === e.name)
                  throw new n.FileNotFoundError(`Directory "${this.handle.name}" not found`, { cause: e });
                if (e instanceof DOMException)
                  throw new o.IOError(`Directory "${this.handle.name}" could not be read (${e.name})`, { cause: e });
                throw e;
              }
            }
            async listEntries() {
              let e = [];
              for await (var t of this.getEntries()) e.push(t);
              return e;
            }
            async *getFileHandles() {
              try {
                for await (const e of this.handle.values()) "file" === e.kind && (yield e);
              } catch (e) {
                if ("NotFoundError" === e.name)
                  throw new n.FileNotFoundError(`Directory "${this.handle.name}" not found`, { cause: e });
                if (e instanceof DOMException)
                  throw new o.IOError(`Directory "${this.handle.name}" could not be read (${e.name})`, { cause: e });
                throw e;
              }
            }
            async *getRawFiles() {
              for await (const e of this.getFileHandles()) yield await e.getFile();
            }
            async containsEntry(e) {
              return void 0 !== (await this.resolveEntryName(e));
            }
            async resolveEntryName(e) {
              if (this.caseSensitive)
                return (
                  await this.handle
                    .getFileHandle(e)
                    .catch(() => this.handle.getDirectoryHandle(e))
                    .catch(() => {})
                )?.name;
              for await (const t of this.getEntries()) if (i.equalsIgnoreCase(t, e)) return t;
            }
            async fixEntryCase(e) {
              if (!this.caseSensitive)
                for await (var t of this.getEntries())
                  if (i.equalsIgnoreCase(t, e)) {
                    e = t;
                    break;
                  }
              return e;
            }
            async getRawFile(t, e = !1, i) {
              let r;
              try {
                var s = e ? t : await this.fixEntryCase(t);
                r = await this.handle.getFileHandle(s);
              } catch (e) {
                if ("NotFoundError" === e.name)
                  throw new n.FileNotFoundError(`File "${t}" not found in directory "${this.handle.name}"`, {
                    cause: e,
                  });
                if (e instanceof TypeError && e.message.includes("not allowed"))
                  throw new l.NameNotAllowedError(`File name "${t}" is not allowed`, { cause: e });
                if (e instanceof DOMException)
                  throw new o.IOError(`File "${t}" could not be read (${e.name})`, { cause: e });
                throw e;
              }
              s = await r.getFile();
              return i ? new File([s], s.name, { type: i }) : s;
            }
            async openFile(e, t = !1) {
              var i = await this.getRawFile(e, t);
              return r.VirtualFile.fromRealFile(i);
            }
            async writeFile(i, e) {
              var r = e ?? (i instanceof File ? i.name : i.filename);
              try {
                var s = await this.fixEntryCase(r);
                await this.deleteFile(s, !0);
                let e = await this.handle.getFileHandle(s, { create: !0 }),
                  t = await e.createWritable();
                try {
                  (await t.write(
                    i instanceof File ? i : new Uint8Array(i.stream.buffer, i.stream.byteOffset, i.stream.byteLength),
                  ),
                    await t.close());
                } catch (e) {
                  throw (await t.abort(), e);
                }
              } catch (e) {
                if ("QuotaExceededError" === e.name) throw new a.StorageQuotaError({ cause: e });
                if ("NotFoundError" === e.name)
                  throw new n.FileNotFoundError(`Directory "${this.handle.name}" not found`, { cause: e });
                if (e instanceof TypeError && e.message.includes("not allowed"))
                  throw new l.NameNotAllowedError(`File name "${r}" is not allowed`, { cause: e });
                if (e instanceof DOMException)
                  throw new o.IOError(`File "${r}" could not be written (${e.name})`, { cause: e });
                throw e;
              }
            }
            async deleteFile(e, t = !1) {
              var i = t ? e : await this.resolveEntryName(e);
              if (i)
                try {
                  await this.handle.removeEntry(i);
                } catch (e) {
                  if (t && "NotFoundError" === e.name) return;
                  if ("QuotaExceededError" === e.name) throw new a.StorageQuotaError({ cause: e });
                  if (e instanceof TypeError && e.message.includes("not allowed"))
                    throw new l.NameNotAllowedError(`File name "${i}" is not allowed`, { cause: e });
                  if (e instanceof DOMException)
                    throw new o.IOError(`File "${i}" could not be deleted (${e.name})`, { cause: e });
                  throw e;
                }
            }
            async getDirectory(t, e = this.caseSensitive) {
              var i = e ? t : await this.fixEntryCase(t);
              let r;
              try {
                r = await this.handle.getDirectoryHandle(i);
              } catch (e) {
                if ("NotFoundError" === e.name)
                  throw new n.FileNotFoundError(
                    `Directory "${t}" not found or parent directory "${this.handle.name}" is gone`,
                    { cause: e },
                  );
                if (e instanceof TypeError && e.message.includes("not allowed"))
                  throw new l.NameNotAllowedError(`Directory name "${t}" is not allowed`, { cause: e });
                if (e instanceof DOMException)
                  throw new o.IOError(`Directory "${t}" could not be read (${e.name})`, { cause: e });
                throw e;
              }
              return new s(r, e);
            }
            async getOrCreateDirectory(t, e = this.caseSensitive) {
              var i = e ? t : await this.fixEntryCase(t);
              try {
                return new s(await this.handle.getDirectoryHandle(i, { create: !0 }), e);
              } catch (e) {
                if ("QuotaExceededError" === e.name) throw new a.StorageQuotaError({ cause: e });
                if ("NotFoundError" === e.name)
                  throw new n.FileNotFoundError(`Directory "${this.handle.name}" not found"`, { cause: e });
                if (e instanceof TypeError && e.message.includes("not allowed"))
                  throw new l.NameNotAllowedError(`Directory name "${t}" is not allowed`, { cause: e });
                if (e instanceof DOMException)
                  throw new o.IOError(`Directory "${t}" could not be created (${e.name})`, { cause: e });
                throw e;
              }
            }
            async deleteDirectory(e, t = !1) {
              var i = await this.resolveEntryName(e);
              if (i)
                try {
                  await this.handle.removeEntry(i, { recursive: t });
                } catch (e) {
                  if ("QuotaExceededError" === e.name) throw new a.StorageQuotaError({ cause: e });
                  if ("InvalidModificationError" === e.name)
                    throw new o.IOError("Can't delete non-empty directory when recursive = false");
                  if (e instanceof TypeError && e.message.includes("not allowed"))
                    throw new l.NameNotAllowedError(`Directory name "${i}" is not allowed`, { cause: e });
                  if (e instanceof DOMException)
                    throw new o.IOError(`Directory "${i}" could not be deleted (${e.name})`, { cause: e });
                  throw e;
                }
            }
          }),
        );
      },
    };
  },
);
