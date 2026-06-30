// === Reconstructed SystemJS module: gui/replay/ReplayStorageMigration ===
// deps: ["network/gamestate/Replay","gui/replay/ReplayStorageFileSystem"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/replay/ReplayStorageMigration",
  ["network/gamestate/Replay", "gui/replay/ReplayStorageFileSystem"],
  function (e, t) {
    "use strict";
    var g, s, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          g = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        (e(
          "ReplayStorageMigration",
          (i = class i {
            constructor(e, t, i, r, s) {
              ((this.splashScreen = e),
                (this.strings = t),
                (this.replayDir = i),
                (this.localPrefs = r),
                (this.storageFileSystem = s));
            }
            async migrate() {
              4 !== Number(this.localPrefs.getItem(i.migratedMarker) || 0) &&
                (console.info("Running replay storage migrations..."),
                await this.runMigrationTo4(),
                this.localPrefs.setItem(i.migratedMarker, "4"),
                console.info("Migrations finished."));
            }
            async runMigrationTo4() {
              this.localPrefs.removeItem("_r_replayList");
              for (var e of this.localPrefs.listItems()) e.startsWith("_r_replay_") && this.localPrefs.removeItem(e);
              let i = this.replayDir;
              var n = "replays.json";
              if (await i.containsEntry(n))
                if (await i.containsEntry(s.ReplayStorageFileSystem.manifestFileName)) await i.deleteFile(n);
                else {
                  var r = (await i.openFile(n)).readAsString("utf-8");
                  let t = [];
                  try {
                    t = JSON.parse(r);
                  } catch (e) {}
                  if (t.length) {
                    this.splashScreen.setLoadingText(this.strings.get("ts:replay_storage_migrating", 0));
                    let r = [],
                      e = new Set();
                    for await (var o of i.getEntries()) o.endsWith(g.Replay.extension) && e.add(o);
                    let s = new Map(),
                      a = new Set();
                    for (var l of t) {
                      var c = "replay_" + l.id + g.Replay.extension;
                      if (e.has(c)) {
                        let e = {
                          id: THREE.Math.generateUUID(),
                          name: g.Replay.sanitizeFileName(l.name),
                          keep: l.keep,
                          timestamp: l.timestamp,
                        };
                        r.push(e);
                        let t = this.storageFileSystem.getReplayFileName(e),
                          i = 1;
                        for (; a.has(t.toLowerCase());)
                          ((t = t.replace(g.Replay.extension, "")),
                            1 < i && (t = t.replace(/ \(\d+\)$/, "")),
                            (t += ` (${++i})` + g.Replay.extension));
                        (1 < i && (e.name += ` (${i})`), s.set(c, t), a.add(t.toLowerCase()));
                      }
                    }
                    await i.deleteFile(n);
                    try {
                      let t = 0;
                      var h,
                        u,
                        d = s.size;
                      for ([h, u] of s) {
                        let e = await i.openFile(h);
                        ((e.filename = u),
                          await i.writeFile(e),
                          await i.deleteFile(h),
                          this.splashScreen.setLoadingText(
                            this.strings.get("ts:replay_storage_migrating", Math.floor((++t / d) * 100)),
                          ));
                      }
                      await this.storageFileSystem.saveManifest(r);
                    } catch (e) {
                      console.error(e);
                    }
                  } else await i.deleteFile(n);
                }
            }
          }),
        ),
          (i.migratedMarker = "_r_replays_migrated"));
      },
    };
  },
);
