// === Reconstructed SystemJS module: gui/replay/ReplayStorageFileSystem ===
// deps: ["data/vfs/VirtualFile","data/DataStream","data/vfs/StorageQuotaError","network/gamestate/Replay","gui/replay/ReplayStorageError"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/replay/ReplayStorageFileSystem",
  [
    "data/vfs/VirtualFile",
    "data/DataStream",
    "data/vfs/StorageQuotaError",
    "network/gamestate/Replay",
    "gui/replay/ReplayStorageError",
  ],
  function (e, t) {
    "use strict";
    var a, n, h, u, o, d;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        (e(
          "ReplayStorageFileSystem",
          (d = class d {
            constructor(e, t) {
              ((this.dir = e), (this.sentry = t));
            }
            async getManifest(e = !1) {
              if (e) return await this.rebuildManifest();
              if (!(await this.dir.containsEntry(d.manifestFileName))) return [];
              let t = (await this.dir.openFile(d.manifestFileName)).readAsString("utf-8");
              if (!t.length) return [];
              try {
                return JSON.parse(t);
              } catch (e) {
                return (
                  console.error("Replay manifest is corrupt", e),
                  this.sentry?.captureException(
                    e,
                    (e) => (e.addAttachment({ filename: d.manifestFileName, data: t }), e),
                  ),
                  await this.deleteManifest(),
                  await this.rebuildManifest()
                );
              }
            }
            async saveManifest(e) {
              let t = new n.DataStream();
              t.writeString(JSON.stringify(e), "utf-8");
              var i = new a.VirtualFile(t, d.manifestFileName);
              try {
                await this.dir.writeFile(i);
              } catch (e) {
                if (e instanceof h.StorageQuotaError) throw e;
                throw new o.ReplayStorageError(`Failed to save manifest (${e.message})`, { cause: e });
              }
            }
            async deleteManifest() {
              await this.dir.deleteFile(d.manifestFileName);
            }
            async rebuildManifest() {
              var e,
                t,
                i,
                r = await this.getManifest();
              let s = 0;
              for await (e of this.dir.getEntries()) e.endsWith(u.Replay.extension) && s++;
              if (s === r.length) return r;
              console.info("Rebuilding replay index...");
              let a = new Map();
              for await (t of this.dir.getRawFiles()) t.name.endsWith(u.Replay.extension) && a.set(t.name, t);
              let n = [];
              for (i of r) {
                var o = this.getReplayFileName(i);
                a.has(o) && (n.push(i), a.delete(o));
              }
              if (
                (0 < r.length - n.length && console.info(`Removed ${r.length - n.length} orphaned entries from index`),
                a.size)
              ) {
                for (var l of a.values()) {
                  var c = l.lastModified;
                  n.unshift({
                    id: THREE.Math.generateUUID(),
                    name: l.name.replace(d.unsavedReplayPrefix, "").replace(u.Replay.extension, ""),
                    keep: !l.name.startsWith(d.unsavedReplayPrefix),
                    timestamp: c,
                  });
                }
                (n.sort((e, t) =>
                  e.timestamp === t.timestamp ? e.name.localeCompare(t.name) : t.timestamp - e.timestamp,
                ),
                  console.info(`Added ${a.size} new entries to replay index`));
              }
              try {
                await this.saveManifest(n);
              } catch (e) {
                if (!(e instanceof h.StorageQuotaError)) throw e;
                console.error("Failed to save rebuilt manifest because storage is full", e);
              }
              return (console.info("Rebuild finished."), n);
            }
            async deleteAllReplays() {
              for await (var e of this.dir.getEntries())
                e.endsWith(u.Replay.extension) && (await this.dir.deleteFile(e));
              await this.deleteManifest();
            }
            async getReplayData(e) {
              var t = this.getReplayFileName(e);
              if (!(await this.dir.containsEntry(t))) throw new Error(`Replay file "${t}" not found.`);
              return await this.dir.getRawFile(t);
            }
            async hasReplayData(e) {
              var t = this.getReplayFileName(e);
              return await this.dir.containsEntry(t);
            }
            async saveReplayData(e, t) {
              let i = new n.DataStream();
              i.writeString(t, "utf-8");
              var r = this.getReplayFileName(e),
                s = new a.VirtualFile(i, r);
              try {
                await this.dir.writeFile(s);
              } catch (e) {
                if (e instanceof h.StorageQuotaError) throw e;
                if (e instanceof TypeError)
                  throw new o.ReplayStorageError(`Failed to save replay file "${r}" (${e.message})`, { cause: e });
                throw new o.ReplayStorageError(`Failed to save replay file (${e.message})`, { cause: e });
              }
            }
            async deleteReplayData(e) {
              await this.dir.deleteFile(this.getReplayFileName(e));
            }
            getReplayFileName(e) {
              return (e.keep ? "" : d.unsavedReplayPrefix) + e.name + u.Replay.extension;
            }
          }),
        ),
          (d.manifestFileName = "_index.json"),
          (d.unsavedReplayPrefix = "Unsaved_"));
      },
    };
  },
);
