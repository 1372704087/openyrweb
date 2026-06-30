// === Reconstructed SystemJS module: engine/gameRes/GameRes ===
// deps: ["file-system-access","file-system-access/lib/adapters/indexeddb","file-system-access/lib/adapters/cache","data/DataStream","data/MixFile","engine/Engine","engine/EngineType","engine/ResourceLoader","util/Logger","engine/gameRes/GameResConfig","engine/gameRes/importError/ChecksumError","engine/gameRes/importError/FileNotFoundError","engine/gameRes/importError/NoStorageError","data/Crc32","data/Palette","data/ShpFile","data/PcxFile","engine/gfx/ImageUtils","data/Bitmap","engine/gfx/CanvasUtils","gui/component/GameResBoxApi","engine/gameRes/GameResSource","data/vfs/RealFileSystem","engine/resourceConfigs","engine/gameRes/CdnResourceLoader","LocalPrefs","engine/gameRes/FileSystemUtil","data/vfs/StorageQuotaError","data/vfs/FileNotFoundError","data/vfs/IOError","engine/gameRes/GameResImporter"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/gameRes/GameRes",
  [
    "file-system-access",
    "file-system-access/lib/adapters/indexeddb",
    "file-system-access/lib/adapters/cache",
    "data/DataStream",
    "data/MixFile",
    "engine/Engine",
    "engine/EngineType",
    "engine/ResourceLoader",
    "util/Logger",
    "engine/gameRes/GameResConfig",
    "engine/gameRes/importError/ChecksumError",
    "engine/gameRes/importError/FileNotFoundError",
    "engine/gameRes/importError/NoStorageError",
    "data/Crc32",
    "data/Palette",
    "data/ShpFile",
    "data/PcxFile",
    "engine/gfx/ImageUtils",
    "data/Bitmap",
    "engine/gfx/CanvasUtils",
    "gui/component/GameResBoxApi",
    "engine/gameRes/GameResSource",
    "data/vfs/RealFileSystem",
    "engine/resourceConfigs",
    "engine/gameRes/CdnResourceLoader",
    "LocalPrefs",
    "engine/gameRes/FileSystemUtil",
    "data/vfs/StorageQuotaError",
    "data/vfs/FileNotFoundError",
    "data/vfs/IOError",
    "engine/gameRes/GameResImporter",
    "data/vfs/MemArchive",
    "data/vfs/VirtualFile",
  ],
  function (e, t) {
    "use strict";
    var l, r, s, c, h, f, o, u, d, y, n, g, T, p, m, v, b, S, w, E, C, x, O, A, M, R, P, I, k, B, N, i, Ma, Vf;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          P = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          Ma = e;
        },
        function (e) {
          Vf = e;
        },
      ],
      execute: function () {
        e(
          "GameRes",
          (i = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h) {
              ((this.appVersion = e),
                (this.engineType = t),
                (this.modName = i),
                (this.localPrefs = r),
                (this.strings = s),
                (this.rootEl = a),
                (this.splashScreen = n),
                (this.viewport = o),
                (this.appConfig = l),
                (this.appResPath = c),
                (this.sentry = h));
            }
            async init(i, r, s) {
              let a = !1,
                n = !1,
                o,
                l = (e, t) => {
                  if ((e && this.splashScreen.setLoadingText(e), t)) {
                    let e;
                    ((e = "string" == typeof t ? t : (o = URL.createObjectURL(t))),
                      this.splashScreen.setBackgroundImage(e));
                  }
                },
                e;
              try {
                e = await this.getBrowserFsHandle("native");
              } catch (e) {
                if (!(e instanceof T.NoStorageError)) throw e;
              }
              let t;
              try {
                t = !!e && (await this.migrateStorageToNative(e, l));
              } catch (e) {
                (console.warn("Storage migration to native failed", e),
                  this.sentry?.captureException(
                    new Error("Failed to migrate files to native file system", { cause: e }),
                  ),
                  (t = !1));
              } finally {
                l(this.strings.get("GUI:LoadingEx"));
              }
              let c;
              try {
                var h = t ? e : await this.getBrowserFsHandle("fallback");
                h && (c = await f.Engine.initRfs(h));
              } catch (e) {
                if (!(e instanceof T.NoStorageError)) throw e;
                console.warn("No storage adapters available.");
              }
              !i &&
                c &&
                (await this.lookForGameFiles(c.getRootDirectory())) &&
                (((i = new y.GameResConfig("")).source = x.GameResSource.Local), (n = !0));
              let u;
              (c && ((g = await f.Engine.getModDir()), (u = await this.loadMod(c, g))),
                c && c.addDirectory(await f.Engine.getMapDir()));
              let d;
              if (i) {
                var g = await this.loadSplashScreenBackground(c?.getRootDirectory(), u, i);
                "string" == typeof g
                  ? this.splashScreen.setBackgroundImage(g)
                  : g && ((o = URL.createObjectURL(g)), this.splashScreen.setBackgroundImage(o));
                try {
                  ((d = await this.loadResources(c, i, l)), (a = !0));
                } catch (e) {
                  (console.error("Failed to load initial game resources"),
                    console.error(e),
                    this.splashScreen.setLoadingText(""),
                    this.splashScreen.setBackgroundImage(""),
                    await r(e, this.strings));
                }
              }
              let p = new C.GameResBoxApi(this.viewport, this.strings, this.rootEl),
                m = this.appConfig.gameResArchiveUrl;
              for (; !a;) {
                (this.splashScreen.setLoadingText(""),
                  this.splashScreen.setBackgroundImage(""),
                  o && (URL.revokeObjectURL(o), (o = void 0)));
                let e = await p.promptForGameRes(
                    m,
                    !!this.appConfig.gameresBaseUrl && !this.modName,
                    this.appConfig.gameResArchiveUrl,
                    this.appConfig.gameResExpansionArchiveUrl,
                  );
                ((i = new y.GameResConfig(this.appConfig.gameresBaseUrl ?? "")), (n = !0));
                let t;
                // OpenYRWeb one-click sentinel: download both exes + extract the 6 mixes.
                let oneClick = e && "object" == typeof e && !0 === e.oneClick;
                if (oneClick) t = x.GameResSource.Archive;
                else if (e)
                  if (e instanceof URL) ((t = x.GameResSource.Archive), (m = e.toString()));
                  else if ("file" === e.kind) t = x.GameResSource.Archive;
                  else {
                    if ("directory" !== e.kind) throw new Error("Unexpected FileSystemHandle type " + e.kind);
                    t = x.GameResSource.Local;
                  }
                else t = x.GameResSource.Cdn;
                if (((i.source = t), t !== x.GameResSource.Cdn))
                  try {
                    if (!c) throw new T.NoStorageError("No storage adapters available");
                    // OpenYRWeb: one-click = import RA2 exe then YR exe sequentially. Each
                    // GameResImporter.import() fetches its URL and extracts ONLY the required
                    // mix files (7z x <archive> <mixFile> per wanted file). RA2 exe yields
                    // ra2/language/multi.mix; YR exe yields ra2md/langmd/multimd/expandmd01.mix.
                    if (oneClick) {
                      let importer = new N.GameResImporter(this.appConfig, this.strings, this.sentry);
                      let cb = (e, t) => {
                        (l(e, t), e && console.info(e));
                      };
                      let urls = [];
                      this.appConfig.gameResArchiveUrl && urls.push(this.appConfig.gameResArchiveUrl);
                      this.appConfig.gameResExpansionArchiveUrl && urls.push(this.appConfig.gameResExpansionArchiveUrl);
                      for (let u of urls) {
                        await importer.import(new URL(u), c.getRootDirectory(), this.engineType, cb);
                      }
                    } else {
                      await new N.GameResImporter(this.appConfig, this.strings, this.sentry).import(
                        e,
                        c.getRootDirectory(),
                        this.engineType,
                        (e, t) => {
                          (l(e, t), e && console.info(e));
                        },
                      );
                    }
                    console.info("Game assets successfully imported.");
                  } catch (e) {
                    (console.error("Failed to import game assets"),
                      console.error(e),
                      this.splashScreen.setLoadingText(""),
                      this.splashScreen.setBackgroundImage(""),
                      await s(e, this.strings));
                    continue;
                  } finally {
                    this.splashScreen.setLoadingText("");
                  }
                try {
                  (this.splashScreen.setLoadingText(this.strings.get("GUI:LoadingEx")),
                    (d = await this.loadResources(c, i, l)),
                    (a = !0));
                } catch (e) {
                  (console.error("Failed to load game assets"),
                    console.error(e),
                    this.splashScreen.setLoadingText(""),
                    this.splashScreen.setBackgroundImage(""),
                    await r(e, this.strings));
                }
              }
              return (o && URL.revokeObjectURL(o), { configToPersist: n ? i : void 0, cdnResLoader: d });
            }
            async loadMod(e, t) {
              let i = this.modName,
                r;
              return (
                i &&
                  ((await t.containsEntry(i))
                    ? (console.info(`Loading mod "${i}"...`),
                      (r = await t.getDirectory(i)),
                      e.addDirectory(r),
                      f.Engine.setActiveMod(i))
                    : (console.info(`Mod "${i}" not found. Ignoring.`), (i = this.modName = void 0))),
                r
              );
            }
            async lookForGameFiles(e) {
              // OpenYRWeb: YR-only engine. The required game-data set is fixed (the RA2 base
              // archives plus the YR expansion archives — YR depends on RA2's base data). No
              // engine-type probing is needed since the engine is always YurisRevenge.
              let t = [
                "language.mix",
                "langmd.mix",
                "multi.mix",
                "multimd.mix",
                "ra2.mix",
                "ra2md.mix",
              ];
              let i = await e.listEntries();
              return t.every((e) => i.includes(e));
            }
            async migrateStorageToNative(t, e) {
              var i = "_storage_migration_pending";
              if (this.localPrefs.getItem(i)) {
                for await (var r of t.keys()) await t.removeEntry(r, { recursive: !0 });
                this.localPrefs.removeItem(i);
              } else if (!!(await t.keys().next()).value) return !0;
              if (void 0 === this.localPrefs.getItem(R.StorageKey.LastGpuTier)) return !0;
              console.info("Migrating to new storage...");
              let s;
              try {
                s = await this.getBrowserFsHandle("fallback");
              } catch (e) {
                if (e instanceof T.NoStorageError)
                  return (console.info("No existing storage found. Migration skipped."), !1);
                throw e;
              }
              if (navigator.storage?.estimate) {
                var a = await navigator.storage.estimate();
                if (void 0 === a.usage || void 0 === a.quota) return !1;
                if (a.usage > (a.quota - 5242880) / 2)
                  return (console.info("Migration to native storage skipped because of insufficient space."), !1);
              }
              let n = await P.FileSystemUtil.listDir(s);
              (n.includes(f.Engine.rfsSettings.cacheDir) &&
                (await s.removeEntry(f.Engine.rfsSettings.cacheDir, { recursive: !0 })),
                this.localPrefs.setItem(i, "1"));
              try {
                await this.migrateDir(s, t, e);
              } catch (e) {
                for await (var o of t.keys()) await t.removeEntry(o, { recursive: !0 });
                throw e;
              } finally {
                this.localPrefs.removeItem(i);
              }
              try {
                (indexedDB.deleteDatabase("fileSystem"),
                  l.support.adapter.cache && (await globalThis.caches?.delete("sandboxed-fs")));
              } catch (e) {
                console.warn(e);
              }
              return (console.info("Migration done."), !0);
            }
            async migrateDir(e, i, r) {
              var s;
              for (s of await P.FileSystemUtil.getDirContents(e))
                try {
                  if ("directory" === s.kind) {
                    var t = await i.getDirectoryHandle(s.name, { create: !0 });
                    await this.migrateDir(s, t, r);
                  } else {
                    var a = s.name.replace(/\u200f/g, "");
                    r(this.strings.get("TS:storage_migrating_file", i.name + "/" + s.name));
                    let e = await i.getFileHandle(a, { create: !0 });
                    var n = await e.createWritable();
                    let t = await s.getFile();
                    await t.stream().pipeTo(n);
                  }
                } catch (e) {
                  if ("QuotaExceededError" === e.name) throw new I.StorageQuotaError({ cause: e });
                  throw new Error(`Failed migrating "${s.name}"`, { cause: e });
                }
            }
            async loadResources(t, i, e) {
              f.Engine.initGameResSource(i.source);
              // OpenYRWeb: YR-only engine — no auto-detection needed. The engine type is fixed
              // at YurisRevenge by Application at boot, so the YR archives are always loaded.
              let r;
              if (i.isCdn()) {
                var s = i.getCdnBaseUrl();
                let e = new u.ResourceLoader(s);
                var a = await e.loadJson("manifest.json");
                if (2 !== a.version) throw new Error("Unknown manifest version " + a.version);
                if ("mix" !== a.format) throw new Error("Unsupported CDN resource format " + a.format);
                ((t = t || new O.RealFileSystem()), (r = new M.CdnResourceLoader(s, a, await f.Engine.getCacheDir())));
              } else {
                if (!t) throw new T.NoStorageError("No available storage adapters");
                (console.info("Checking integrity of mix files..."),
                  await this.checkMixesIntegrity(t.getRootDirectory()),
                  console.info("Mixes are valid."));
              }
              const n = d.AppLogger.get("vfs");
              n.info("Initializing virtual filesystem...");
              let o = await f.Engine.initVfs(t, n);
              return (
                await o.loadStandaloneFiles({
                  exclude: ["keyboard.ini", "theme.ini"].map((e) => f.Engine.getFileNameVariant(e)),
                }),
                await o.loadExtraMixFiles(f.Engine.getActiveEngine()),
                await this.loadCustomMix(o),
                await this.loadMixes(i, r, o, e),
                await f.Engine.loadMapList(),
                await this.initUiCssVariables(this.rootEl),
                r
              );
            }
            async checkMixesIntegrity(r) {
              // OpenYRWeb: YR-only — always validate both the RA2 base archives and the YR
              // expansion archives (YR depends on RA2's base data).
              let e = new Map([
                ["ra2.mix", ["E7BA3BE", "5DC70844"]],
                ["multi.mix", ["984EFDB6", "3CDB648F"]],
                ["ra2md.mix", ["49A9E8EA"]],
                ["multimd.mix", ["743DA541"]],
                ["expandmd01.mix", ["F3D92D6C"]],
              ]);
              for (var [s, a] of e.entries()) {
                let e, t;
                try {
                  ((e = await r.getRawFile(s, !0)), (t = await e.arrayBuffer()));
                } catch (e) {
                  if (e instanceof k.FileNotFoundError) throw new g.FileNotFoundError(s);
                  if (e instanceof DOMException) throw new B.IOError(`Failed to read file (${e.name})`, { cause: e });
                  throw e;
                }
                let i = p.Crc32.calculateCrc(new Uint8Array(t));
                if (!a.includes(i.toString(16).toUpperCase()))
                  throw new n.ChecksumError(
                    `Checksum mismatch for "${s}" (size: ${e.size}). ` + `Checksum "${i}" doesn't match known values`,
                    s,
                  );
              }
            }
            async loadCustomMix(e) {
              // OpenYRWeb: instead of loading a bundled ra2cd.mix (the upstream product's
              // custom-asset container), load the engine-required INI overrides as standalone
              // files from res/cd-overrides/ and inject them into the VFS as a MemArchive.
              // These are engine data (YR bug-fixes, multiplayer-mode definitions), not branding.
              //
              // The 7 files below are exactly the engine-data INIs that lived inside the
              // upstream ra2cd.mix (verified via tools/mix-tool.mjs against client/res/ra2cd.mix):
              //   - rulescd/artcd/soundcd: rules/art/sound overrides merged into the *md.ini base.
              //   - mpmodescd:             multiplayer game-mode definitions (modes + their
              //                            rulesOverride file refs, consumed by getMpModes()).
              //   - mpteammd/mpfreeforallmd: the rulesOverride INIs that mpmodescd.ini references
              //                            for the [Battle] TeamGame and [FreeForAll] modes.
              //                            getMpModes() → GameModes ctor reads each mode's
              //                            rulesOverride via getIni(), which throws if absent.
              //   - ui.ini:                AdvancedCommandBar layout (loaded via getUiIni()).
              //   - nodogengikills.ini:    rules mixin (Engine.mixinRulesFileNames /
              //                            MixinRulesType.NoDogEngiKills), merged into rules
              //                            in loadRules() and required by the rules checksum.
              // (menulogo.png / creditscd.txt were also in ra2cd.mix but are pure branding —
              // intentionally NOT shipped; see AGENTS.md §4.2/§8.)
              // OpenYRWeb: also inject the Chinese ra2md.csf (if available) to enable
              // Traditional Chinese (zh-TW) localization regardless of the user's
              // original game assets. This CSF takes priority over any English CSF
              // in the mounted mix files because engine-overrides is added first.
              let t = new u.ResourceLoader(this.appResPath),
                i = [
                  "rulescd.ini",
                  "artcd.ini",
                  "soundcd.ini",
                  "mpmodescd.ini",
                  "mpteammd.ini",
                  "mpfreeforallmd.ini",
                  "ui.ini",
                  "nodogengikills.ini",
                  "ra2md.csf",
                ],
                r = new Ma.MemArchive();
              for (var s of i)
                try {
                  var a = await t.loadBinary("cd-overrides/" + s),
                    a = new c.DataStream(new DataView(a.buffer, a.byteOffset, a.byteLength));
                  r.addFile(new Vf.VirtualFile(a, s));
                } catch (e) {
                  console.warn("Missing engine override file: cd-overrides/" + s, e);
                }
              e.addArchive(r, "engine-overrides");
            }
            async loadMixes(t, i, r, s) {
              if (t.isCdn()) {
                var a = t.getCdnBaseUrl();
                s(this.strings.get("TS:Downloading"), a + f.Engine.rfsSettings.splashImgFileName);
                var n,
                  a = [A.ResourceType.Ini, A.ResourceType.Ui, A.ResourceType.Strings];
                let e = await i.loadResources(a, void 0, (e) => {
                  s(this.strings.get("TS:DownloadingPg", e));
                });
                s(this.strings.get("GUI:LoadingEx"));
                for (n of a) {
                  var o = i.getResourceFileName(n),
                    l = new h.MixFile(new c.DataStream(e.pop(n)));
                  r.addArchive(l, o);
                }
              } else {
                await r.loadImplicitMixFiles(f.Engine.getActiveEngine());
                a = await f.Engine.getCacheDir();
                if (a)
                  try {
                    await M.CdnResourceLoader.clearCache(a);
                  } catch (e) {
                    if (!(e instanceof I.StorageQuotaError)) throw e;
                  }
              }
            }
            async initUiCssVariables(t) {
              let i;
              var e = [
                ["pudlgbgn.shp", "dialogn.pal"],
                ["mnbttn.shp", "mainbttn.pal"],
                ["cue_i.pcx"],
                ["cce_i.pcx"],
                ["cce_il.pcx"],
                ["cce_ir.pcx"],
              ];
              let r = await this.convertImagesToPng(f.Engine.vfs, e);
              // OpenYRWeb: menulogo.png is an upstream-branding asset (originally in ra2cd.mix)
              // that we deliberately do NOT ship (AGENTS.md §4.2/§8). The engine hard-coded an
              // unconditional vfs.openFile here, which threw FileNotFoundError and aborted init.
              // Make it optional: if absent, --res-menu-logo simply stays unset and the neutral
              // CSS fallback (style.css) is used. Mirrors the per-image fallback below (l.505-509).
              try {
                r.set("menulogo.png", f.Engine.vfs.openFile("menulogo.png").asFile("image/png"));
              } catch (e) {
                if (!(e instanceof k.FileNotFoundError)) throw e;
                console.warn('Image "menulogo.png" not found in browser FS (branding asset intentionally not shipped).');
              }
              r.set("icons24.pcx", await this.generateIconSprite(f.Engine.vfs));
              var s,
                a = {
                  "--res-menu-logo": "menulogo.png",
                  "--res-icons-24": "icons24.pcx",
                  "--res-dlg-bgn": "pudlgbgn.shp",
                  "--res-mnbttn": "mnbttn.shp",
                  "--res-cue-i": "cue_i.pcx",
                  "--res-cce-i": "cce_i.pcx",
                  "--res-cce-il": "cce_il.pcx",
                  "--res-cce-ir": "cce_ir.pcx",
                };
              i = {};
              for (s of Object.keys(a)) {
                var n = r.get(a[s]);
                n
                  ? ((n = URL.createObjectURL(n)), (i[s] = `url("${n}")`))
                  : console.warn(`Image "${a[s]}" not found in browser FS`);
              }
              Object.keys(i).forEach((e) => {
                t.style.setProperty(e, i[e]);
              });
            }
            async loadSplashScreenBackground(t, i, e) {
              var r = f.Engine.rfsSettings.splashImgFileName;
              if (e.isCdn()) return e.getCdnBaseUrl() + r;
              {
                let e;
                if (i)
                  try {
                    e = await i.getRawFile(r, !1, "image/png");
                  } catch (e) {
                    e instanceof k.FileNotFoundError || console.warn("Failed to load splash image", e);
                  }
                if (t && !e)
                  try {
                    e = await t.getRawFile(r, !1, "image/png");
                  } catch (e) {
                    console.warn("Failed to load splash image", e);
                  }
                return e;
              }
            }
            async getBrowserFsHandle(e) {
              let t = [];
              var i;
              for (
                "fallback" !== e && l.support.adapter.native && t.push({ name: "native", module: void 0 }),
                  "native" !== e &&
                    (t.push({ name: "indexeddb", module: r.default }),
                    l.support.adapter.cache && t.push({ name: "cache", module: s.default }));
                (i = t.shift());
              )
                try {
                  console.info(`Loading storage adapter "${i.name}"...`);
                  let t = await l.getOriginPrivateDirectory(i.module);
                  try {
                    let e = await t.getFileHandle("browsercheck", { create: !0 });
                    if (!("function" == typeof e.createWritable)) throw new Error("createWritable not supported");
                    (await e.getFile()).name !== e.name && P.FileSystemUtil.polyfillGetFile();
                  } catch (e) {
                    if (
                      ("NotFoundError" === e.name &&
                        "indexeddb" === i.name &&
                        (await new Promise(() => {
                          (indexedDB.deleteDatabase("fileSystem"),
                            this.localPrefs.removeItem(R.StorageKey.GameRes),
                            location.reload());
                        })),
                      "QuotaExceededError" !== e.name)
                    )
                      throw e;
                  } finally {
                    try {
                      await t.removeEntry("browsercheck");
                    } catch (e) {}
                  }
                  return (console.info(`Storage adapter "${i.name}" loaded successfully.`), t);
                } catch (e) {
                  console.warn("Couldn't load FS adapter " + i.name, [e]);
                }
              throw new T.NoStorageError("No available FS adapters.");
            }
            async convertImagesToPng(i, e) {
              let r = new Map();
              for (var [s, a] of e) {
                let t;
                if (s.endsWith(".shp")) {
                  var n = new v.ShpFile(i.openFile(s));
                  if (!a) throw new Error(`No palette specified for image "${s}"`);
                  a = new m.Palette(i.openFile(a));
                  t = await S.ImageUtils.convertShpToPng(n, a);
                } else {
                  if (!s.endsWith(".pcx")) {
                    console.warn(`Unknown image type "${s}"`);
                    continue;
                  }
                  {
                    let e = new b.PcxFile(i.openFile(s));
                    t = await e.toPngBlob();
                  }
                }
                r.set(s, t);
              }
              return r;
            }
            async generateIconSprite(t) {
              let e = [
                "wouref.pcx",
                "wodref.pcx",
                "wouact.pcx",
                "wodact.pcx",
                "dnarrowr.pcx",
                "dnarrowp.pcx",
                "uparrowr.pcx",
                "uparrowp.pcx",
                "sbgript.pcx",
                "sbgripm.pcx",
                "sbgripb.pcx",
                "trakgrip.pcx",
              ];
              var i = e.map((e) => new b.PcxFile(t.openFile(e)));
              let r = new w.RgbaBitmap(24 * e.length, 24);
              for (let n = 0; n < i.length; n++) {
                var s = new w.RgbaBitmap(i[n].width, i[n].height, i[n].data);
                r.drawRgbaImage(s, 24 * n, 0);
              }
              var a = E.CanvasUtils.canvasFromRgbaImageData(r.data, r.width, r.height);
              return await E.CanvasUtils.canvasToBlob(a);
            }
          }),
        );
      },
    };
  },
);
