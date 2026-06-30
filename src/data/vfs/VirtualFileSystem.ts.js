// === Reconstructed SystemJS module: data/vfs/VirtualFileSystem ===
// deps: ["data/AudioBagFile","data/IdxFile","data/MixFile","engine/EngineType","util/string","data/vfs/FileNotFoundError","data/vfs/MemArchive"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "data/vfs/VirtualFileSystem",
  [
    "data/AudioBagFile",
    "data/IdxFile",
    "data/MixFile",
    "engine/EngineType",
    "util/string",
    "data/vfs/FileNotFoundError",
    "data/vfs/MemArchive",
  ],
  function (e, t) {
    "use strict";
    var r, s, l, c, h, i, n, a;
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
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        e(
          "VirtualFileSystem",
          (a = class {
            constructor(e, t) {
              ((this.rfs = e), (this.logger = t), (this.allArchives = new Map()), (this.archivesByPriority = []));
            }
            fileExists(e) {
              for (const t of this.archivesByPriority) if (t.containsFile(e)) return !0;
              return !1;
            }
            openFile(e) {
              for (const t of this.archivesByPriority) if (t.containsFile(e)) return t.openFile(e);
              throw new i.FileNotFoundError(`File "${e}" not found in VFS`);
            }
            addArchive(e, t) {
              (this.allArchives.has(t) || (this.allArchives.set(t, e), this.archivesByPriority.push(e)),
                this.logger.info(`Added archive "${t}" to VFS`));
            }
            hasArchive(e) {
              return this.allArchives.has(e);
            }
            removeArchive(e) {
              var t = this.allArchives.get(e);
              t &&
                (this.allArchives.delete(e),
                this.archivesByPriority.splice(this.archivesByPriority.indexOf(t), 1),
                this.logger.info(`Removed archive "${e}" from VFS`));
            }
            listArchives() {
              return [...this.allArchives.keys()];
            }
            async addMixFile(e) {
              await this.addArchiveByFilename(e, (e) => new l.MixFile(e.stream));
            }
            async addBagFile(e) {
              const i = await this.openFileWithRfs(e.replace(".bag", ".idx"));
              await this.addArchiveByFilename(e, (e) => {
                var t = new s.IdxFile(i.stream);
                return new r.AudioBagFile().fromVirtualFile(e, t);
              });
            }
            async addArchiveByFilename(e, t) {
              var i;
              this.allArchives.has(e) || ((i = await this.openFileWithRfs(e)) && this.addArchive(t(i), e));
            }
            async openFileWithRfs(e) {
              let t;
              try {
                t = await this.rfs.openFile(e);
              } catch (e) {
                if (!(e instanceof i.FileNotFoundError)) throw e;
              }
              if (!t) {
                if (!this.fileExists(e)) throw new i.FileNotFoundError(`File "${e}" not found`);
                t = this.openFile(e);
              }
              return t;
            }
            async loadImplicitMixFiles(e) {
              // OpenYRWeb: YR-only engine. Both the *md.mix (YR) and the base .mix (RA2, which
              // YR depends on) archives are always mounted. addMixFile silently skips any
              // archive not present in the install. The `e` (engineType) arg is retained for
              // signature compatibility but is always YurisRevenge now.
              (this.logger.info("Initializing implicit mix files..."),
                await this.addMixFile("langmd.mix"),
                await this.addMixFile("language.mix"),
                await this.addMixFile("ra2md.mix"),
                await this.addMixFile("ra2.mix"),
                await this.addMixFile("cachemd.mix"),
                await this.addMixFile("cache.mix"),
                await this.addMixFile("loadmd.mix"),
                await this.addMixFile("load.mix"),
                await this.addMixFile("localmd.mix"),
                await this.addMixFile("local.mix"),
                await this.addMixFile("ntrlmd.mix"),
                await this.addMixFile("neutral.mix"),
                await this.addMixFile("audiomd.mix"),
                await this.addMixFile("audio.mix"),
                await this.addBagFile("audio.bag"),
                await this.addMixFile("conqmd.mix"),
                await this.addMixFile("conquer.mix"),
                await this.addMixFile("genermd.mix"),
                await this.addMixFile("generic.mix"),
                await this.addMixFile("isogenmd.mix"),
                await this.addMixFile("isogen.mix"),
                await this.addMixFile("cameomd.mix"),
                await this.addMixFile("cameo.mix"),
                await this.addMixFile("multimd.mix"),
                await this.addMixFile("multi.mix"));
            }
            async loadExtraMixFiles(i) {
              // OpenYRWeb: YR-only — always pick up both expand##.mix and expandmd##.mix (plus
              // ecache/elocal), and register both .mmx and .yro archive extensions.
              let r = new Set();
              for await (var e of this.rfs.getEntries()) r.add(e.toLowerCase());
              for (var s of ["ecache", "expand", "elocal"])
                for (let t = 99; 0 <= t; t--) {
                  let e = ["" + s + h.pad(t, "00") + ".mix", `${s}md${h.pad(t, "00")}.mix`];
                  for (var a of e) r.has(a) && (await this.addMixFile(a));
                }
              let t = [".mmx", ".yro"];
              for (const n of t)
                for (const o of r)
                  o.endsWith(n) && this.addArchive(new l.MixFile((await this.rfs.openFile(o)).stream), o);
            }
            async loadStandaloneFiles(e) {
              let i = ["ini", "csf"],
                r = new Set(e?.exclude),
                s = [];
              for await (var a of this.rfs.getEntries()) {
                let t = a.toLowerCase();
                i.some((e) => t.endsWith("." + e)) && !r.has(t) && s.push(await this.rfs.openFile(a, !0));
              }
              if (s.length) {
                let e = new n.MemArchive();
                for (var t of s) e.addFile(t);
                this.addArchive(e, "mem.archive");
              }
            }
          }),
        );
      },
    };
  },
);
