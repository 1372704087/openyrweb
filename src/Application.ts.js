// === Reconstructed SystemJS module: Application ===
// deps: ["fontfaceobserver","detect-gpu","@puzzl/core/lib/async/cancellation","engine/Engine","engine/EngineType","gui/component/SplashScreen","network/WolConnection","network/gameopt/Parser","Config","util/Routing","tools/LobbyFormTester","tools/VxlTester","tools/ShpTester","tools/BuildingTester","data/IniFile","util/time","engine/ResourceLoader","ConsoleVars","util/Logger","tools/DevToolsApi","tools/VehicleTester","tools/InfantryTester","tools/AircraftTester","tools/SoundTester","LocalPrefs","gui/FullScreen","version","data/Strings","network/ServerRegions","gui/screen/options/GeneralOptions","engine/gameRes/GameResConfig","gui/component/BasicErrorBoxApi","engine/gameRes/GameRes","engine/gameRes/importError/FileNotFoundError","engine/gameRes/importError/ArchiveDownloadError","engine/gameRes/importError/InvalidArchiveError","engine/gameRes/importError/ArchiveExtractionError","engine/gameRes/importError/ChecksumError","engine/gameRes/importError/NoStorageError","data/MapFile","gui/component/ImageContext","util/BoxedVar","gui/replay/ReplayStorageFileSystem","gui/replay/ReplayStorageMigration","data/vfs/StorageQuotaError","Gui","data/vfs/IOError","network/WolService","data/vfs/FileNotFoundError","RouteHelper","data/CsfFile","util/Sentry","engine/gameRes/importError/NoWebAssemblyError","network/WolConfig"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "Application",
  [
    "fontfaceobserver",
    "detect-gpu",
    "@puzzl/core/lib/async/cancellation",
    "engine/Engine",
    "engine/EngineType",
    "gui/component/SplashScreen",
    "network/WolConnection",
    "network/gameopt/Parser",
    "Config",
    "util/Routing",
    "tools/LobbyFormTester",
    "tools/VxlTester",
    "tools/ShpTester",
    "tools/BuildingTester",
    "data/IniFile",
    "util/time",
    "engine/ResourceLoader",
    "ConsoleVars",
    "util/Logger",
    "tools/DevToolsApi",
    "tools/VehicleTester",
    "tools/InfantryTester",
    "tools/AircraftTester",
    "tools/SoundTester",
    "LocalPrefs",
    "gui/FullScreen",
    "version",
    "data/Strings",
    "network/ServerRegions",
    "gui/screen/options/GeneralOptions",
    "engine/gameRes/GameResConfig",
    "gui/component/BasicErrorBoxApi",
    "engine/gameRes/GameRes",
    "engine/gameRes/importError/FileNotFoundError",
    "engine/gameRes/importError/ArchiveDownloadError",
    "engine/gameRes/importError/InvalidArchiveError",
    "engine/gameRes/importError/ArchiveExtractionError",
    "engine/gameRes/importError/ChecksumError",
    "engine/gameRes/importError/NoStorageError",
    "data/MapFile",
    "gui/component/ImageContext",
    "util/BoxedVar",
    "gui/replay/ReplayStorageFileSystem",
    "gui/replay/ReplayStorageMigration",
    "data/vfs/StorageQuotaError",
    "Gui",
    "data/vfs/IOError",
    "network/WolService",
    "data/vfs/FileNotFoundError",
    "RouteHelper",
    "data/CsfFile",
    "util/Sentry",
    "engine/gameRes/importError/NoWebAssemblyError",
    "network/WolConfig",
  ],
  function (e, t) {
    "use strict";
    var h,
      i,
      s,
      u,
      d,
      g,
      p,
      m,
      r,
      a,
      n,
      o,
      l,
      c,
      f,
      y,
      T,
      v,
      b,
      S,
      w,
      E,
      C,
      x,
      O,
      A,
      M,
      R,
      P,
      I,
      k,
      B,
      N,
      j,
      L,
      D,
      F,
      _,
      U,
      H,
      G,
      V,
      W,
      z,
      K,
      q,
      $,
      Q,
      Y,
      Z,
      X,
      J,
      ee,
      te,
      ie;
    t && t.id;
    return {
      setters: [
        function (e) {
          h = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          a = e;
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
          c = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
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
          j = e;
        },
        function (e) {
          L = e;
        },
        function (e) {
          D = e;
        },
        function (e) {
          F = e;
        },
        function (e) {
          _ = e;
        },
        function (e) {
          U = e;
        },
        function (e) {
          H = e;
        },
        function (e) {
          G = e;
        },
        function (e) {
          V = e;
        },
        function (e) {
          W = e;
        },
        function (e) {
          z = e;
        },
        function (e) {
          K = e;
        },
        function (e) {
          q = e;
        },
        function (e) {
          $ = e;
        },
        function (e) {
          Q = e;
        },
        function (e) {
          Y = e;
        },
        function (e) {
          Z = e;
        },
        function (e) {
          X = e;
        },
        function (e) {
          J = e;
        },
        function (e) {
          ee = e;
        },
        function (e) {
          te = e;
        },
      ],
      execute: function () {
        (e(
          "Application",
          (ie = class ie {
            constructor() {
              this.viewport = new V.BoxedVar({ x: 0, y: 0, width: 0, height: 0 });
            }
            getVersion() {
              return M.version;
            }
            getEngineVersion() {
              return u.Engine.getVersion();
            }
            getEngineModHash() {
              return u.Engine.getModHash();
            }
            async main() {
              try {
                await this.loadConfig();
              } catch (e) {
                return void console.error("Missing config.ini. Please see README.md");
              }
              var t = this.config.defaultLocale;
              let i;
              try {
                ((i = await this.loadTranslations(t)), (this.locale = t));
              } catch (e) {
                return void console.error(`Missing translation ${t}.`, e);
              }
              let r = new R.Strings(i);
              try {
                this.checkGlobalLibs();
              } catch (e) {
                return (console.error(e), void alert(r.get("TS:DownloadFailed")));
              }
              this.localPrefs = new O.LocalPrefs(localStorage);
              var s = document.getElementById("ra2web-root");
              if (!s) throw new Error("Missing root element");
              ((this.rootEl = s),
                (this.runtimeVars = new v.ConsoleVars()),
                S.DevToolsApi.registerCommand("help", () => {
                  (console.info("Available commands: "),
                    [...S.DevToolsApi.listCommands()].forEach((e) => console.info("> " + e)),
                    console.info("Available variables: "),
                    [...S.DevToolsApi.listVars()].forEach((e) => console.info("> " + e)));
                }),
                S.DevToolsApi.registerVar("freecamera", this.runtimeVars.freeCamera),
                S.DevToolsApi.registerCommand("version", () => {
                  (console.info("Client version: " + this.getVersion()),
                    console.info("Engine version: " + this.getEngineVersion()),
                    console.info("Mod hash: " + u.Engine.getModHash()));
                }),
                this.runtimeVars.forceResolution.onChange.subscribe((e) => {
                  var t, i;
                  e?.match(/^\d+x\d+$/) &&
                    (([t, i] = e.split("x").map(Number)), this.setPreferredViewportSize({ width: t, height: i }));
                }),
                S.DevToolsApi.registerVar("forcesize", this.runtimeVars.forceResolution),
                S.DevToolsApi.registerVar("debug_wireframes", this.runtimeVars.debugWireframes),
                S.DevToolsApi.registerVar("debug_paths", this.runtimeVars.debugPaths),
                S.DevToolsApi.registerVar("debug_text", this.runtimeVars.debugText),
                S.DevToolsApi.registerVar("debug_bot", this.runtimeVars.debugBotIndex),
                this.initLogging(),
                (this.fullScreen = new A.FullScreen(document)),
                this.fullScreen.init(),
                this.fullScreen.onChange.subscribe((e) => {
                  (this.onFullScreenChange(e), this.updateViewportSize(e));
                }),
                window.addEventListener("resize", () => this.updateViewportSize(this.fullScreen.isFullScreen())),
                this.updateViewportSize(this.fullScreen.isFullScreen()));
              let a = new g.SplashScreen(this.viewport.value.width, this.viewport.value.height);
              ((this.splashScreen = a),
                a.render(this.rootEl),
                a.setLoadingText(r.get("GUI:LoadingEx")),
                a.setCopyrightText(r.get("TXT_COPYRIGHT") + "\n" + r.get("GUI:WWBrand")),
                a.setDisclaimerText(r.get("TS:Disclaimer")));
              var e = y.sleep(this.config.devMode ? 0 : 5e3);
              (this.loadGpuBenchmarkData()
                .then((e) => (this.gpuTier = e))
                .catch((e) => this.sentry?.captureException(e)),
                u.Engine.setActiveEngine(d.EngineType.YurisRevenge));
              var n = new URLSearchParams(location.search).get(Z.RouteHelper.modQueryStringName) || void 0;
              let o = this.loadGameResConfig(this.localPrefs);
              try {
                let { configToPersist: e, cdnResLoader: t } = await new N.GameRes(
                  this.getVersion(),
                  u.Engine.getActiveEngine(),
                  n,
                  this.localPrefs,
                  r,
                  s,
                  a,
                  this.viewport,
                  this.config,
                  ie.resPath,
                  this.sentry,
                ).init(
                  o,
                  (e, t) => this.handleGameResLoadError(e, t),
                  (e, t) => this.handleGameResImportError(e, t),
                );
                (e &&
                  (e.isCdn()
                    ? this.localPrefs.removeItem(O.StorageKey.GameRes)
                    : this.localPrefs.setItem(O.StorageKey.GameRes, e.serialize()),
                  (o = e)),
                  (this.cdnResourceLoader = t));
              } catch (e) {
                return (
                  console.error(e),
                  a.setLoadingText(""),
                  a.setBackgroundImage(""),
                  void this.handleGameResLoadError(e, r, !0)
                );
              }
              ((this.gameResConfig = o),
                window.gtag?.("event", "app_init", {
                  res: this.gameResConfig.source,
                  modName: u.Engine.getActiveMod() || "<none>",
                }),
                (G.ImageContext.cdnBaseUrl = this.gameResConfig.isCdn() ? this.gameResConfig.getCdnBaseUrl() : void 0),
                (G.ImageContext.vfs = u.Engine.vfs));
              try {
                let e = new X.CsfFile(u.Engine.vfs.openFile(u.Engine.getFileNameVariant("ra2.csf")));
                var l,
                  c = e.getIsoLocale();
                if (void 0 !== c && c !== t)
                  try {
                    ((i = await this.loadTranslations(c)), (this.locale = c));
                  } catch (e) {
                    console.warn(`Failed to load translation ${c}. Falling back to ${t}.`, e);
                  }
                ((r = this.strings = new R.Strings(e)),
                  r.fromJson(i),
                  u.Engine.loadRules(),
                  this.sentry?.configureScope((e) => {
                    (e.setTag("mod", u.Engine.getActiveMod() || "<none>"),
                      e.setExtra("mod", u.Engine.getActiveMod() || "<none>"),
                      e.setExtra("modHash", u.Engine.getModHash()));
                  }),
                  window.AudioContext ||
                    ((l = await SystemJS.import("web-audio-polyfill.js")), (window.AudioContext = l.AudioContext)));
              } catch (e) {
                return (
                  console.error(e),
                  a.setLoadingText(""),
                  a.setBackgroundImage(""),
                  void this.handleGameResLoadError(e, r, !0)
                );
              }
              try {
                (await new h.default("Fira Sans Condensed").load(),
                  await new h.default("Fira Sans Condensed", { weight: "bold" }).load());
              } catch (e) {
                console.error("Failed to load font", e);
              }
              try {
                await this.migrateReplayStorage(this.localPrefs, a, r);
              } catch (e) {
                (a.setLoadingText(""),
                  e instanceof K.StorageQuotaError ||
                    e instanceof $.IOError ||
                    e instanceof Y.FileNotFoundError ||
                    this.sentry?.captureException(new Error("Failed to migrate replays to new storage", { cause: e })),
                  console.error("Failed to migrate replays to new storage", e));
              }
              (await e, a.destroy(), (this.splashScreen = void 0), this.initRouting());
            }
            async loadTranslations(e) {
              return await new T.ResourceLoader(ie.resPath).loadJson(`locale/${e}.json?v=` + this.getVersion());
            }
            checkGlobalLibs() {
              var t, i;
              for ([t, i] of new Map([
                ["THREE", () => window.THREE],
                ["Octree", () => window.Octree],
                ["SimplexNoise", () => window.SimplexNoise],
                ["LightningStrike", () => window.THREE.LightningStrike],
                ["TrailRenderer", () => window.THREE.TrailRenderer],
                ["SPE", () => window.SPE],
                ["GrowingPacker", () => window.GrowingPacker],
                ["lzo1x", () => window.lzo1x],
              ])) {
                let e = !1;
                try {
                  void 0 !== i() && (e = !0);
                } catch (e) {}
                if (!e) throw new Error(`Library "${t}" was not found on window scope`);
              }
            }
            async loadConfig() {
              let e = await new T.ResourceLoader("").loadText("config.ini");
              if (e.startsWith("<")) throw new Error("Config download failed. Response looks like an HTML document.");
              var t = new f.IniFile().fromString(e);
              ((this.config = new r.Config()), this.config.load(t));
            }
            initLogging() {
              (b.AppLogger.useDefaults(),
                this.config.debugLogging && (this.runtimeVars.debugLogging.value = this.config.debugLogging),
                S.DevToolsApi.registerVar("debug_logging", this.runtimeVars.debugLogging));
              var e = (e) => {
                var t;
                if ("string" != typeof e) b.AppLogger.setLevel(e ? b.AppLogger.DEBUG : b.AppLogger.INFO);
                else for (t of e.split(",")) b.AppLogger.get(t).setLevel(b.AppLogger.DEBUG);
              };
              (e(!1),
                this.runtimeVars.debugLogging.value && e(this.runtimeVars.debugLogging.value),
                this.runtimeVars.debugLogging.onChange.subscribe(e),
                this.config.debugGameState && (this.runtimeVars.debugGameState.value = this.config.debugGameState),
                S.DevToolsApi.registerVar("debug_game_state", this.runtimeVars.debugGameState));
              e = this.config.sentry;
              if (e)
                try {
                  ((this.sentry = new J.Sentry()), this.sentry.init(e, this.getVersion()));
                } catch (e) {
                  console.error(e);
                }
            }
            loadGameResConfig(e) {
              var t = e.getItem(O.StorageKey.GameRes);
              if (t) {
                let e = new k.GameResConfig(this.config.gameresBaseUrl ?? "");
                return (e.unserialize(t), e.isCdn() && !e.getCdnBaseUrl() ? void 0 : e);
              }
            }
            async handleGameResLoadError(e, t, i = !1) {
              let r = new B.BasicErrorBoxApi(this.viewport, t, this.rootEl),
                s = t.get("ts:import_load_files_failed");
              (e instanceof _.ChecksumError
                ? (s += "\n\n" + t.get("ts:import_checksum_mismatch", e.file))
                : e instanceof j.FileNotFoundError
                  ? (s += "\n\n" + t.get("ts:import_file_not_found", e.file))
                  : e instanceof T.DownloadError || e.message?.match(/XHR error|Failed to fetch/i)
                    ? (s += "\n\n" + t.get("ts:downloadfailed"))
                    : e instanceof U.NoStorageError
                      ? (s += "\n\n" + t.get("ts:import_no_storage"))
                      : e.message?.match(/out of memory|allocation/i)
                        ? (s += "\n\n" + t.get("ts:gameinitoom"))
                        : "QuotaExceededError" === e.name || e instanceof K.StorageQuotaError
                          ? (s += "\n\n" + t.get("ts:storage_quota_exceeded"))
                          : e instanceof $.IOError
                            ? ((s += "\n\n" + t.get("ts:storage_io_error")), (i = !0))
                            : e instanceof Y.FileNotFoundError ||
                              this.sentry?.captureException(
                                new Error(`Game res load failed (${e.message ?? e.name})`, { cause: e }),
                              ),
                await r.show(s, i));
            }
            async handleGameResImportError(e, t) {
              let i = new B.BasicErrorBoxApi(this.viewport, t, this.rootEl),
                r = t.get("ts:import_failed");
              (e instanceof j.FileNotFoundError
                ? (r += "\n\n" + t.get("ts:import_file_not_found", e.file))
                : e instanceof D.InvalidArchiveError
                  ? (r += "\n\n" + t.get("ts:import_invalid_archive"))
                  : e instanceof F.ArchiveExtractionError
                    ? e.cause?.message?.match(/out of memory|allocation/i)
                      ? (r += "\n\n" + t.get("ts:import_out_of_memory"))
                      : ((r += "\n\n" + t.get("ts:import_archive_extract_failed")),
                        this.sentry?.captureException(
                          new Error(`Game res import failed (${e.message ?? e.name})`, { cause: e }),
                        ))
                    : e instanceof ee.NoWebAssemblyError
                      ? (r += "\n\n" + t.get("ts:import_no_web_assembly"))
                      : e instanceof _.ChecksumError
                        ? (r += "\n\n" + t.get("ts:import_checksum_mismatch", e.file))
                        : e instanceof T.DownloadError ||
                            e.message?.match(
                              /XHR error|Failed to fetch|CompileError: WebAssembly|SystemJS|NetworkError|Load failed/i,
                            )
                          ? (r += "\n\n" + t.get("ts:downloadfailed"))
                          : e instanceof L.ArchiveDownloadError
                            ? (r = t.get("ts:import_archive_download_failed", e.url))
                            : e instanceof U.NoStorageError
                              ? (r += "\n\n" + t.get("ts:import_no_storage"))
                              : e.message?.match(/out of memory|allocation/i) ||
                                  e.name.match(/NS_ERROR_FAILURE|NS_ERROR_OUT_OF_MEMORY/)
                                ? (r += "\n\n" + t.get("ts:import_out_of_memory"))
                                : "QuotaExceededError" === e.name || e instanceof K.StorageQuotaError
                                  ? (r += "\n\n" + t.get("ts:storage_quota_exceeded"))
                                  : e instanceof $.IOError ||
                                    e instanceof Y.FileNotFoundError ||
                                    "AbortError" === e.name ||
                                    this.sentry?.captureException(
                                      new Error("Game res import failed " + (e.message ?? e.name), { cause: e }),
                                    ),
                await i.show(r));
            }
            async loadGpuBenchmarkData() {
              let r = !1;
              var e = await i.getGPUTier({
                override: {
                  loadBenchmarks: async (t) => {
                    let i = new s.CancellationTokenSource();
                    var e = setTimeout(() => i.cancel(), 5e3);
                    try {
                      let e = await new T.ResourceLoader("").loadJson(
                        "https://unpkg.com/detect-gpu@5.0.42/dist/benchmarks/" + t,
                        i.token,
                      );
                      return (e.shift(), e);
                    } catch (e) {
                      throw ((r = !0), e);
                    } finally {
                      clearTimeout(e);
                    }
                  },
                },
              });
              return r ? void 0 : e;
            }
            async migrateReplayStorage(e, t, i) {
              var r,
                s = await u.Engine.getReplayDir();
              s &&
                ((r = new W.ReplayStorageFileSystem(s, this.sentry)),
                await new z.ReplayStorageMigration(t, i, s, e, r).migrate());
            }
            initRouting() {
              let e = new a.Routing(),
                h;
              (e.addRoute("*", async () => {
                h && (await h.destroy());
              }),
                e.addRoute("/", async () => {
                  var e = new P.ServerRegions();
                  ((this.gui = await this.initGui(e, this.strings)), (h = this));
                }),
                e.addRoute("/game", async (i) => {
                  let r = new P.ServerRegions();
                  if (((this.gui = await this.initGui(r, this.strings)), this.gui)) {
                    let e = this.gui.getRootController();
                    if (((h = this), await y.sleep(1e3), 1 < i.length))
                      throw new Error("Unsupported number of URL parameters");
                    var s = p.WolConnection.factory(b.AppLogger.get("net")),
                      a = te.WolConfig.factory(te.ClientType.Cdral2);
                    let t = new Q.WolService(a, s, this.getVersion(), this.locale);
                    r.load(await t.loadServerList(this.config.serversUrl));
                    var n = this.localPrefs.getItem(O.StorageKey.PreferredServerRegion),
                      o = n && r.isAvailable(n) ? r.get(n) : r.getFirstAvailable();
                    r.setSelectedRegion(o.id);
                    var {
                      gameId: l,
                      gameTimestamp: c,
                      gservUrl: a,
                      playerName: s,
                      gameOpts: n,
                      tournament: o = !1,
                    } = Z.RouteHelper.extractGameParams(i[0]);
                    n
                      ? ((n = new m.Parser().parseOptions(n)), e.createGame(l, c, a, s, n, !1, o))
                      : e.joinGame(l, c, a, s, o);
                  }
                }),
                e.addRoute("/replay", async (e) => {
                  h = this;
                  var [t] = e;
                  let i;
                  if (void 0 !== t) {
                    let e = decodeURIComponent(t);
                    i = e.match(/^https?:\/\//i) ? { replayUrl: e } : { replayId: t };
                  }
                  t = new P.ServerRegions();
                  this.gui = await this.initGui(t, this.strings, i);
                }),
                e.addRoute("/lobbytest", async () => {
                  if (!u.Engine.vfs) throw new Error("Original game files must be provided.");
                  (n.LobbyFormTester.main(this.rootEl, this.strings), (h = n.LobbyFormTester));
                }),
                e.addRoute("/vxltest", async () => {
                  if (!u.Engine.vfs) throw new Error("Original game files must be provided.");
                  (o.VxlTester.main(u.Engine.vfs, this.runtimeVars), (h = o.VxlTester));
                }),
                e.addRoute("/shptest", async () => {
                  if (!u.Engine.vfs) throw new Error("Original game files must be provided.");
                  var e = new H.MapFile(u.Engine.vfs.openFile("mp03t4.map"));
                  (l.ShpTester.main(u.Engine.vfs, e, this.rootEl, this.strings), (h = l.ShpTester));
                }),
                e.addRoute("/buildtest", async () => {
                  if (!u.Engine.vfs) throw new Error("Original game files must be provided.");
                  (c.BuildingTester.main(this.runtimeVars), (h = c.BuildingTester));
                }),
                e.addRoute("/vehicletest", async () => {
                  if (!u.Engine.vfs) throw new Error("Original game files must be provided.");
                  (w.VehicleTester.main(this.runtimeVars), (h = w.VehicleTester));
                }),
                e.addRoute("/airtest", async () => {
                  if (!u.Engine.vfs) throw new Error("Original game files must be provided.");
                  (C.AircraftTester.main(this.runtimeVars), (h = C.AircraftTester));
                }),
                e.addRoute("/inftest", async () => {
                  if (!u.Engine.vfs) throw new Error("Original game files must be provided.");
                  (E.InfantryTester.main(this.runtimeVars), (h = E.InfantryTester));
                }),
                e.addRoute("/soundtest", async () => {
                  if (!u.Engine.vfs) throw new Error("Original game files must be provided.");
                  (x.SoundTester.main(u.Engine.vfs, this.runtimeVars), (h = x.SoundTester));
                }),
                e.init());
            }
            async initGui(e, i, t) {
              var r = this.localPrefs.getItem(O.StorageKey.Options);
              let s;
              if (r)
                try {
                  s = new I.GeneralOptions().unserialize(r);
                } catch (e) {
                  console.warn("Couldn't read options from local storage", [e]);
                }
              (s ||
                ((s = new I.GeneralOptions()),
                (s.graphics.resolution.value = {
                  width: this.config.viewport.width,
                  height: this.config.viewport.height,
                })),
                this.setPreferredViewportSize(s.graphics.resolution.value),
                s.graphics.resolution.onChange.subscribe((e) => {
                  this.setPreferredViewportSize(e);
                }));
              let a = new q.Gui(
                this.getVersion(),
                this.locale,
                this.getEngineVersion(),
                this.getEngineModHash(),
                this.gpuTier,
                this.config,
                this.gameResConfig,
                ie.resPath,
                this.localPrefs,
                s,
                this.rootEl,
                this.viewport,
                this.fullScreen,
                i,
                this.cdnResourceLoader,
                e,
                this.runtimeVars,
                this.sentry,
              );
              try {
                await a.init(t);
              } catch (e) {
                console.error("Failed to initialize GUI", [e]);
                let t;
                return (
                  e instanceof K.StorageQuotaError || e instanceof $.IOError || e instanceof Y.FileNotFoundError
                    ? (t = i.get("TS:GUIInitFSError"))
                    : ((t = i.get("TS:GUIInitUnknownError")),
                      this.sentry?.captureException(new Error(`Failed to initialize GUI (${e.name})`, { cause: e }))),
                  void alert(t)
                );
              }
              return a;
            }
            setPreferredViewportSize(e) {
              ((this.config.viewport.width = e?.width ?? Number.POSITIVE_INFINITY),
                (this.config.viewport.height = e?.height ?? Number.POSITIVE_INFINITY),
                this.updateViewportSize(this.fullScreen.isFullScreen()));
            }
            onFullScreenChange(e) {
              navigator.keyboard &&
                (e
                  ? navigator.keyboard
                      .lock(["Escape", ...(this.config.devMode ? [] : ["F5", "F12"]), "F11"])
                      ?.catch?.((e) => console.warn("Keyboard lock failed", e))
                  : navigator.keyboard.unlock());
            }
            updateViewportSize(e) {
              let t, i;
              ((i = e
                ? ((t = window.innerWidth), window.innerHeight)
                : ((t = Math.min(window.innerWidth, this.config.viewport.width)),
                  Math.min(window.innerHeight, this.config.viewport.height))),
                (t = Math.max(800, t - (t % 2))),
                (i = Math.max(600, i - (i % 2))),
                this.setViewportSize(t, i),
                this.splashScreen?.setSize(t, i));
            }
            setViewportSize(e, t) {
              this.viewport.value = { x: this.viewport.value.x, y: this.viewport.value.y, width: e, height: t };
            }
            async destroy() {
              (await this.gui?.destroy(),
                (this.gui = void 0),
                this.splashScreen && (this.splashScreen.destroy(), (this.splashScreen = void 0)));
            }
          }),
        ),
          (ie.resPath = "res/"));
      },
    };
  },
);
