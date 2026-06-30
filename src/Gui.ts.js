// === Reconstructed SystemJS module: Gui ===
// deps: ["react","engine/Engine","engine/EngineType","gui/UiScene","engine/gfx/Renderer","game/rules/Rules","gui/screen/RootController","gui/screen/mainMenu/MainMenuRootScreen","gui/screen/game/GameScreen","gui/screen/game/gameMenu/ScreenType","gui/screen/mainMenu/ScreenType","gui/screen/ScreenType","gui/component/MessageBoxApi","network/WolConnection","network/GservConnection","network/gameopt/Parser","network/gameopt/Serializer","engine/ResourceLoader","ErrorHandler","engine/UiAnimationLoop","util/Logger","tools/DevToolsApi","gui/jsx/JsxRenderer","gui/Pointer","engine/sound/Sound","engine/sound/AudioSystem","engine/sound/Mixer","engine/sound/SoundSpecs","engine/sound/ChannelType","LocalPrefs","gui/screen/game/worldInteraction/keyboard/KeyBinds","gui/ReplayManager","gui/screen/replay/ReplayScreen","data/vfs/FileNotFoundError","engine/sound/Music","engine/sound/MusicSpecs","gui/screen/game/GameLoader","util/BoxedVar","engine/renderable/builder/vxlGeometry/VxlGeometryPool","engine/gfx/geometry/VxlGeometryCache","engine/gfx/RendererError","gui/replay/ReplayStorageFileSystem","gui/replay/ReplayStorageMemStorage","network/gamestate/Replay","data/vfs/StorageQuotaError","gui/CanvasMetrics","data/vfs/IOError","util/disposable/CompositeDisposable","gui/component/ToastApi","network/WolService","gui/screen/mainMenu/main/HomeScreen","gui/screen/mainMenu/lobby/SkirmishScreen","gui/screen/mainMenu/login/LoginScreen","gui/screen/mainMenu/newAccount/NewAccountScreen","gui/screen/mainMenu/customGame/CustomGameScreen","gui/screen/mainMenu/lobby/LobbyScreen","gui/screen/mainMenu/mapSel/MapSelScreen","gui/screen/replay/ReplaySelScreen","gui/screen/mainMenu/score/ScoreScreen","gui/screen/mainMenu/infoAndCredits/InfoAndCreditsScreen","gui/screen/mainMenu/credits/CreditsScreen","gui/screen/options/OptionsScreen","gui/screen/options/SoundOptsScreen","gui/screen/options/KeyboardScreen","gui/screen/options/StorageScreen","gui/screen/mainMenu/patchNotes/PatchNotesScreen","gui/screen/game/gameMenu/GameMenuHomeScreen","gui/screen/game/gameMenu/DiploScreen","gui/screen/game/gameMenu/ConnectionInfoScreen","gui/screen/game/gameMenu/QuitConfirmScreen","gui/screen/game/loadingScreen/LoadingScreenApiFactory","gui/screen/game/MapFileLoader","gui/screen/mainMenu/modSel/ModSelScreen","gui/screen/mainMenu/modSel/ModManager","gui/screen/mainMenu/quickGame/QuickGameScreen","network/ladder/WLadderService","gui/screen/mainMenu/ladder/LadderScreen","network/WolConfig","gui/screen/mainMenu/ladderRules/LadderRulesScreen","ClientApi","network/WGameResService","network/MapTransferService","util/string","RouteHelper","worker/workerHost"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "Gui",
  [
    "react",
    "engine/Engine",
    "engine/EngineType",
    "gui/UiScene",
    "engine/gfx/Renderer",
    "game/rules/Rules",
    "gui/screen/RootController",
    "gui/screen/mainMenu/MainMenuRootScreen",
    "gui/screen/game/GameScreen",
    "gui/screen/game/gameMenu/ScreenType",
    "gui/screen/mainMenu/ScreenType",
    "gui/screen/ScreenType",
    "gui/component/MessageBoxApi",
    "network/WolConnection",
    "network/GservConnection",
    "network/gameopt/Parser",
    "network/gameopt/Serializer",
    "engine/ResourceLoader",
    "ErrorHandler",
    "engine/UiAnimationLoop",
    "util/Logger",
    "tools/DevToolsApi",
    "gui/jsx/JsxRenderer",
    "gui/Pointer",
    "engine/sound/Sound",
    "engine/sound/AudioSystem",
    "engine/sound/Mixer",
    "engine/sound/SoundSpecs",
    "engine/sound/ChannelType",
    "LocalPrefs",
    "gui/screen/game/worldInteraction/keyboard/KeyBinds",
    "gui/ReplayManager",
    "gui/screen/replay/ReplayScreen",
    "data/vfs/FileNotFoundError",
    "engine/sound/Music",
    "engine/sound/MusicSpecs",
    "gui/screen/game/GameLoader",
    "util/BoxedVar",
    "engine/renderable/builder/vxlGeometry/VxlGeometryPool",
    "engine/gfx/geometry/VxlGeometryCache",
    "engine/gfx/RendererError",
    "gui/replay/ReplayStorageFileSystem",
    "gui/replay/ReplayStorageMemStorage",
    "network/gamestate/Replay",
    "data/vfs/StorageQuotaError",
    "gui/CanvasMetrics",
    "data/vfs/IOError",
    "util/disposable/CompositeDisposable",
    "gui/component/ToastApi",
    "network/WolService",
    "gui/screen/mainMenu/main/HomeScreen",
    "gui/screen/mainMenu/lobby/SkirmishScreen",
    "gui/screen/mainMenu/login/LoginScreen",
    "gui/screen/mainMenu/newAccount/NewAccountScreen",
    "gui/screen/mainMenu/customGame/CustomGameScreen",
    "gui/screen/mainMenu/lobby/LobbyScreen",
    "gui/screen/mainMenu/mapSel/MapSelScreen",
    "gui/screen/replay/ReplaySelScreen",
    "gui/screen/mainMenu/score/ScoreScreen",
    "gui/screen/mainMenu/infoAndCredits/InfoAndCreditsScreen",
    "gui/screen/mainMenu/credits/CreditsScreen",
    "gui/screen/options/OptionsScreen",
    "gui/screen/options/SoundOptsScreen",
    "gui/screen/options/KeyboardScreen",
    "gui/screen/options/StorageScreen",
    "gui/screen/mainMenu/patchNotes/PatchNotesScreen",
    "gui/screen/game/gameMenu/GameMenuHomeScreen",
    "gui/screen/game/gameMenu/DiploScreen",
    "gui/screen/game/gameMenu/ConnectionInfoScreen",
    "gui/screen/game/gameMenu/QuitConfirmScreen",
    "gui/screen/game/loadingScreen/LoadingScreenApiFactory",
    "gui/screen/game/MapFileLoader",
    "gui/screen/mainMenu/modSel/ModSelScreen",
    "gui/screen/mainMenu/modSel/ModManager",
    "gui/screen/mainMenu/quickGame/QuickGameScreen",
    "network/ladder/WLadderService",
    "gui/screen/mainMenu/ladder/LadderScreen",
    "network/WolConfig",
    "gui/screen/mainMenu/ladderRules/LadderRulesScreen",
    "ClientApi",
    "network/WGameResService",
    "network/MapTransferService",
    "util/string",
    "RouteHelper",
    "worker/workerHost",
  ],
  function (e, t) {
    "use strict";
    var p,
      G,
      V,
      W,
      o,
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
      ie,
      re,
      se,
      l,
      ae,
      c,
      ne,
      oe,
      h,
      u,
      d,
      g,
      m,
      le,
      ce,
      he,
      ue,
      de,
      f,
      y,
      ge,
      pe,
      me,
      fe,
      ye,
      Te,
      ve,
      T,
      be,
      Se,
      we,
      v,
      Ee,
      Ce,
      xe,
      Oe,
      Ae,
      Me,
      Re,
      Pe,
      Ie,
      ke,
      Be,
      Ne,
      je,
      Le,
      De,
      Fe,
      _e,
      Ue,
      He,
      Ge,
      Ve,
      We,
      ze,
      Ke,
      qe,
      $e,
      Qe,
      Ye,
      Ze,
      Xe,
      Je,
      et,
      tt,
      it,
      b,
      S,
      rt,
      i;
    t && t.id;
    return {
      setters: [
        function (e) {
          p = e;
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
          o = e;
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
        function (e) {
          ie = e;
        },
        function (e) {
          re = e;
        },
        function (e) {
          se = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          ae = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          ne = e;
        },
        function (e) {
          oe = e;
        },
        function (e) {
          h = e;
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
          m = e;
        },
        function (e) {
          le = e;
        },
        function (e) {
          ce = e;
        },
        function (e) {
          he = e;
        },
        function (e) {
          ue = e;
        },
        function (e) {
          de = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          ge = e;
        },
        function (e) {
          pe = e;
        },
        function (e) {
          me = e;
        },
        function (e) {
          fe = e;
        },
        function (e) {
          ye = e;
        },
        function (e) {
          Te = e;
        },
        function (e) {
          ve = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          be = e;
        },
        function (e) {
          Se = e;
        },
        function (e) {
          we = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          Ee = e;
        },
        function (e) {
          Ce = e;
        },
        function (e) {
          xe = e;
        },
        function (e) {
          Oe = e;
        },
        function (e) {
          Ae = e;
        },
        function (e) {
          Me = e;
        },
        function (e) {
          Re = e;
        },
        function (e) {
          Pe = e;
        },
        function (e) {
          Ie = e;
        },
        function (e) {
          ke = e;
        },
        function (e) {
          Be = e;
        },
        function (e) {
          Ne = e;
        },
        function (e) {
          je = e;
        },
        function (e) {
          Le = e;
        },
        function (e) {
          De = e;
        },
        function (e) {
          Fe = e;
        },
        function (e) {
          _e = e;
        },
        function (e) {
          Ue = e;
        },
        function (e) {
          He = e;
        },
        function (e) {
          Ge = e;
        },
        function (e) {
          Ve = e;
        },
        function (e) {
          We = e;
        },
        function (e) {
          ze = e;
        },
        function (e) {
          Ke = e;
        },
        function (e) {
          qe = e;
        },
        function (e) {
          $e = e;
        },
        function (e) {
          Qe = e;
        },
        function (e) {
          Ye = e;
        },
        function (e) {
          Ze = e;
        },
        function (e) {
          Xe = e;
        },
        function (e) {
          Je = e;
        },
        function (e) {
          et = e;
        },
        function (e) {
          tt = e;
        },
        function (e) {
          it = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          rt = e;
        },
      ],
      execute: function () {
        e(
          "Gui",
          (i = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f, y) {
              ((this.appVersion = e),
                (this.appLocale = t),
                (this.engineVersion = i),
                (this.engineModHash = r),
                (this.gpuTier = s),
                (this.config = a),
                (this.gameResConfig = n),
                (this.appResPath = o),
                (this.localPrefs = l),
                (this.generalOptions = c),
                (this.rootEl = h),
                (this.viewport = u),
                (this.fullScreen = d),
                (this.strings = g),
                (this.cdnResourceLoader = p),
                (this.serverRegions = m),
                (this.runtimeVars = f),
                (this.sentry = y),
                (this.disposables = new v.CompositeDisposable()),
                (this.handleFullScreenChange = (e) => {
                  e && this.pointer?.getUserLockMode() && this.pointer.lock();
                }),
                (this.handleViewportChange = (e) => {
                  var t;
                  (this.renderer?.setViewportSize(e.width, e.height),
                    this.uiScene &&
                      ((t = W.UiScene.createCamera(this.viewport.value)),
                      this.uiScene.setCamera(t),
                      this.uiScene.setViewport(this.viewport.value),
                      this.jsxRenderer?.setCamera(t),
                      this.messageBoxApi?.updateViewport(this.viewport.value),
                      this.rootController?.rerenderCurrentScreen(),
                      this.canvasMetrics?.notifyViewportChange()));
                }));
            }
            getRootController() {
              if (!this.rootController) throw new Error("Root controller is not initialized");
              return this.rootController;
            }
            async init(e) {
              let t = this.strings,
                i,
                r;
              try {
                ({ renderer: i, uiAnimationLoop: r } = this.initRenderer(
                  this.rootEl,
                  this.viewport.value,
                  this.config.devMode,
                ));
              } catch (e) {
                if (e instanceof ye.RendererError)
                  return (console.error(e.cause), void alert(t.get("TS:RendererInitError")));
                throw e;
              }
              ((this.renderer = i),
                this.viewport.onChange.subscribe(this.handleViewportChange),
                this.disposables.add(() => this.viewport.onChange.unsubscribe(this.handleViewportChange)),
                this.fullScreen.onChange.subscribe(this.handleFullScreenChange),
                this.disposables.add(() => this.fullScreen.onChange.unsubscribe(this.handleFullScreenChange)));
              var s = this.gameResConfig;
              let a = W.UiScene.factory(this.viewport.value),
                n = (this.canvasMetrics = new Se.CanvasMetrics(i.getCanvas(), window));
              (n.init(), this.disposables.add(n));
              let o = (this.pointer = oe.Pointer.factory(
                G.Engine.getImages().get(
                  // OpenYRWeb: YR-only — mouse cursor is always mouse.sha.
                  "mouse.sha",
                ),
                G.Engine.getPalettes().get("mousepal.pal"),
                i,
                document,
                n,
                this.generalOptions.mouseAcceleration,
              ));
              (o.init(), this.disposables.add(o), a.add(o.getSprite()));
              var l = (this.jsxRenderer = new ne.JsxRenderer(
                G.Engine.getImages(),
                G.Engine.getPalettes(),
                a.camera,
                o.pointerEvents,
              ));
              ((this.toastApi = new Ee.ToastApi(this.viewport, a, l)),
                this.disposables.add(this.toastApi),
                (this.messageBoxApi = new X.MessageBoxApi(this.viewport.value, a, l)));
              var c = new se.ErrorHandler(this.messageBoxApi, t),
                h = new te.Parser(),
                u = new ie.Serializer();
              let d = (this.rootController = new K.RootController(this.serverRegions));
              var g = G.Engine.getMpModes(),
                p = G.Engine.getFileNameVariant("keyboard.ini");
              let m = new ce.KeyBinds(G.Engine.rfs?.getRootDirectory(), p, G.Engine.getIni(p));
              await m.load();
              var f = await G.Engine.getReplayDir().catch((e) => {
                  (console.error("Couldn't get replay directory", [e]),
                    e instanceof be.StorageQuotaError ||
                      e instanceof we.IOError ||
                      e instanceof de.FileNotFoundError ||
                      this.sentry?.captureException(
                        new Error(`Couldn't get replay directory (${e.name})`, { cause: e }),
                      ));
                }),
                y = f ? new Te.ReplayStorageFileSystem(f, this.sentry) : new ve.ReplayStorageMemStorage(),
                T = new he.ReplayManager(y);
              let v = this.generalOptions;
              var b = new re.ResourceLoader(this.config.mapsBaseUrl),
                S = new re.ResourceLoader(this.appResPath),
                w = new re.ResourceLoader(this.config.modsBaseUrl),
                E = new Ke.MapFileLoader(b, G.Engine.vfs),
                C = ae.AppLogger.get("wol"),
                x = Xe.WolConfig.factory(Xe.ClientType.Cdral2),
                O = J.WolConnection.factory(C);
              let A = new Ce.WolService(x, O, this.appVersion, this.appLocale);
              (A.init(), this.disposables.add(A));
              var M = new Ye.WLadderService(x),
                R = new tt.WGameResService(A, x),
                P = new it.MapTransferService(A),
                I = ae.AppLogger.get("gserv"),
                k = ee.GservConnection.factory(I),
                B = G.Engine.getMapList(),
                N = await G.Engine.getModDir().catch((e) => {
                  (console.error("Couldn't get mods directory", [e]),
                    e instanceof be.StorageQuotaError ||
                      e instanceof we.IOError ||
                      e instanceof de.FileNotFoundError ||
                      this.sentry?.captureException(
                        new Error(`Couldn't get mods directory (${e.name})`, { cause: e }),
                      ));
                });
              let j = N ? new $e.ModManager(window.location, N, S) : void 0;
              var L = G.Engine.getActiveMod(),
                p = L ? await j?.loadModMeta(L) : void 0,
                f = await G.Engine.getMapDir().catch((e) => {
                  console.error("Couldn't get map dir", [e]);
                }),
                y = ae.AppLogger.get("ini");
              let D;
              try {
                D = new z.Rules(G.Engine.getRules(), y);
              } catch (e) {
                if (L && j)
                  return (
                    console.error(e),
                    i.addScene(a),
                    (this.uiScene = a),
                    this.rootEl.appendChild(a.getHtmlContainer().getElement()),
                    await this.messageBoxApi.alert(t.get("TS:ModLoadError"), t.get("GUI:Ok")),
                    void j.loadMod(void 0)
                  );
                throw e;
              }
              var { mixer: b, sound: x, music: I } = await this.initSound(D, s);
              let F = new Map()
                .set(
                  Y.ScreenType.Home,
                  new xe.HomeScreen(
                    t,
                    this.fullScreen,
                    this.appVersion,
                    !(!G.Engine.rfs || !N),
                    !G.Engine.getActiveMod() && this.config.quickMatchEnabled,
                    this.messageBoxApi,
                  ),
                )
                .set(
                  Y.ScreenType.Skirmish,
                  new Oe.SkirmishScreen(d, c, this.messageBoxApi, t, D, l, E, B, g, this.localPrefs),
                )
                .set(
                  Y.ScreenType.Login,
                  new Ae.LoginScreen(
                    A,
                    M,
                    R,
                    P,
                    t,
                    l,
                    this.messageBoxApi,
                    this.serverRegions,
                    this.config.serversUrl,
                    this.config.breakingNewsUrl,
                    C,
                    c,
                    this.localPrefs,
                    d,
                    this.config.devMode,
                  ),
                )
                .set(
                  Y.ScreenType.NewAccount,
                  new Me.NewAccountScreen(
                    this.appLocale,
                    t,
                    l,
                    this.messageBoxApi,
                    this.serverRegions,
                    c,
                    this.localPrefs,
                  ),
                )
                .set(
                  Y.ScreenType.QuickGame,
                  new Qe.QuickGameScreen(
                    this.config.unrankedQueueEnabled,
                    this.engineVersion,
                    this.engineModHash,
                    this.appLocale,
                    D,
                    A,
                    O,
                    M,
                    this.serverRegions,
                    d,
                    this.messageBoxApi,
                    a,
                    l,
                    t,
                    this.localPrefs,
                    x,
                    c,
                  ),
                )
                .set(
                  Y.ScreenType.Ladder,
                  new Ze.LadderScreen(M, l, c, this.messageBoxApi, this.serverRegions, t, this.appLocale),
                )
                .set(
                  Y.ScreenType.CustomGame,
                  new Re.CustomGameScreen(this.engineModHash, t, O, A, M, l, x, this.serverRegions, B, c),
                )
                .set(
                  Y.ScreenType.Lobby,
                  new Pe.LobbyScreen(
                    this.config.botsEnabled,
                    this.engineModHash,
                    p,
                    d,
                    c,
                    this.messageBoxApi,
                    t,
                    a,
                    O,
                    A,
                    M,
                    P,
                    k,
                    D,
                    h,
                    u,
                    l,
                    E,
                    B,
                    g,
                    x,
                    this.localPrefs,
                  ),
                )
                .set(
                  Y.ScreenType.MapSelection,
                  new Ie.MapSelScreen(t, l, E, c, this.messageBoxApi, this.localPrefs, B, g, f, this.sentry),
                )
                .set(
                  Y.ScreenType.ReplaySelection,
                  new ke.ReplaySelScreen(
                    this.engineVersion,
                    this.engineModHash,
                    L,
                    this.config.oldClientsBaseUrl,
                    d,
                    t,
                    l,
                    c,
                    this.messageBoxApi,
                    T,
                    a,
                    D,
                    this.sentry,
                  ),
                )
                .set(Y.ScreenType.Score, new Be.ScoreScreen(t, l, this.messageBoxApi, this.localPrefs, this.config, A))
                .set(Y.ScreenType.InfoAndCredits, new Ne.InfoAndCreditsScreen(t, this.config, this.messageBoxApi))
                .set(Y.ScreenType.Credits, new je.CreditsScreen(t, l))
                .set(
                  Y.ScreenType.Options,
                  new Le.OptionsScreen(t, l, v, this.localPrefs, this.fullScreen, !1, !!G.Engine.rfs),
                )
                .set(Y.ScreenType.OptionsSound, new De.SoundOptsScreen(t, l, b, void 0, this.localPrefs))
                .set(Y.ScreenType.OptionsKeyboard, new Fe.KeyboardScreen(t, l, m))
                .set(Y.ScreenType.OptionsStorage, new _e.StorageScreen(t, l, this.messageBoxApi, G.Engine.rfs));
              (j &&
                F.set(
                  Y.ScreenType.ModSelection,
                  new qe.ModSelScreen(
                    d,
                    t,
                    l,
                    c,
                    this.messageBoxApi,
                    j,
                    G.Engine.getActiveMod(),
                    this.config.modSdkUrl,
                    w,
                    this.sentry,
                  ),
                ),
                this.config.patchNotesUrl &&
                  F.set(Y.ScreenType.PatchNotes, new Ue.PatchNotesScreen(t, l, this.config.patchNotesUrl)),
                this.config.ladderRulesUrl &&
                  F.set(Y.ScreenType.LadderRules, new Je.LadderRulesScreen(t, l, this.config.ladderRulesUrl)));
              ((p = await this.getMainMenuVideoUrl(s, N)),
                (O = new q.MainMenuRootScreen(
                  F,
                  a,
                  s,
                  t,
                  G.Engine.getImages(),
                  l,
                  p,
                  this.cdnResourceLoader,
                  x,
                  I,
                  this.sentry,
                )),
                (M = new fe.VxlGeometryCache(await G.Engine.getCacheDir(), G.Engine.getActiveMod())));
              let _ = new me.VxlGeometryPool(M, v.graphics.models.value);
              v.graphics.models.onChange.subscribe((e) => {
                (_.setModelQuality(e),
                  _.clear(),
                  _.clearStorage().catch((e) => console.warn("Couldn't clear VXL geocache", [e])));
              });
              ((L = new pe.BoxedVar(!1)),
                (w = new Map()),
                (N = ae.AppLogger.get("action")),
                (p = ae.AppLogger.get("lockstep")),
                (M = new ge.GameLoader(
                  this.appVersion,
                  rt.workerHostApi,
                  this.cdnResourceLoader,
                  S,
                  D,
                  g,
                  x,
                  y,
                  N,
                  L,
                  s,
                  _,
                  w,
                  this.runtimeVars.debugBotIndex,
                  this.config.devMode,
                )),
                (S = new Set()));
              let U = new pe.BoxedVar(Boolean(Number(this.localPrefs.getItem(le.StorageKey.TauntsEnabled) ?? "1")));
              const H = (e) => {
                this.localPrefs.setItem(le.StorageKey.TauntsEnabled, String(Number(e)));
              };
              (U.onChange.subscribe(H), this.disposables.add(() => U.onChange.unsubscribe(H)));
              ((y = new Map()
                .set(Q.ScreenType.Home, new He.GameMenuHomeScreen(t, this.fullScreen))
                .set(Q.ScreenType.Diplo, new Ge.DiploScreen(t, l, i, g, U, S))
                .set(Q.ScreenType.ConnectionInfo, new Ve.ConnectionInfoScreen(t, l))
                .set(Q.ScreenType.QuitConfirm, new We.QuitConfirmScreen(t))
                .set(Q.ScreenType.Options, new Le.OptionsScreen(t, l, v, this.localPrefs, this.fullScreen, !0, !1))
                .set(Q.ScreenType.OptionsSound, new De.SoundOptsScreen(t, l, b, I, this.localPrefs))
                .set(Q.ScreenType.OptionsKeyboard, new Fe.KeyboardScreen(t, l, m))),
                (g = new ze.LoadingScreenApiFactory(D, t, a, l, s, k)),
                (s = new et.ClientApi()));
              (window.dispatchEvent(new CustomEvent("CdApiReady", { detail: s })), (window.CdApi = s));
              ((L = new $.GameScreen(
                rt.workerHostApi,
                k,
                R,
                A,
                P,
                this.engineVersion,
                this.engineModHash,
                c,
                y,
                g,
                h,
                u,
                this.config,
                t,
                i,
                a,
                this.runtimeVars,
                this.messageBoxApi,
                this.toastApi,
                r,
                this.viewport,
                l,
                o,
                x,
                I,
                b,
                m,
                v,
                this.localPrefs,
                N,
                p,
                T,
                this.fullScreen,
                E,
                f,
                B,
                M,
                _,
                w,
                S,
                U,
                L,
                this.sentry,
                s.battleControl,
              )),
                (s = new ue.ReplayScreen(
                  this.engineVersion,
                  this.engineModHash,
                  c,
                  y,
                  g,
                  this.config,
                  t,
                  i,
                  a,
                  this.runtimeVars,
                  this.messageBoxApi,
                  r,
                  this.viewport,
                  l,
                  o,
                  x,
                  I,
                  m,
                  v,
                  N,
                  this.fullScreen,
                  E,
                  M,
                  _,
                  w,
                  () => {
                    void 0 !== e
                      ? (window.close(),
                        (async () => {
                          (await this.destroy(),
                            document.body.appendChild(document.createTextNode(t.get("GUI:ReplayWindowClose"))));
                        })())
                      : d.goToScreen(Z.ScreenType.MainMenuRoot);
                  },
                  s.battleControl,
                )));
              (d.addScreen(Z.ScreenType.MainMenuRoot, O),
                d.addScreen(Z.ScreenType.Game, L),
                d.addScreen(Z.ScreenType.Replay, s),
                i.addScene(a),
                (this.uiScene = a),
                this.rootEl.appendChild(a.getHtmlContainer().getElement()),
                await this.routeToInitialScreen(d, v, I, x, e, T));
            }
            async getMainMenuVideoUrl(e, t) {
              let i,
                r = G.Engine.rfsSettings.menuVideoFileName;
              if (e.isCdn()) i = e.getCdnBaseUrl() + r.replace(".webm", ".mp4");
              else
                try {
                  let e;
                  (t && (await t.containsEntry(r)) && (e = await t.getRawFile(r)),
                    !e && (await G.Engine.rfs?.containsEntry(r)) && (e = await G.Engine.rfs.getRawFile(r)),
                    !e && G.Engine.vfs?.fileExists(r) && (e = G.Engine.vfs.openFile(r).asFile()),
                    (i = e
                      ? new File([e], e.name, { type: "video/webm" })
                      : (console.warn("Main menu video file not found in browser FS"), "")));
                } catch (e) {
                  (console.error("Failed to read video file from browser FS"), (i = ""));
                }
              return i;
            }
            async routeToInitialScreen(e, t, i, r, s, a) {
              let n = !1;
              var o = this.localPrefs.getItem(le.StorageKey.LastConnection);
              let l;
              if (o)
                try {
                  l = JSON.parse(o);
                } catch (e) {
                  console.error(`Unable to decode game params string "${o}"`);
                }
              if (l) {
                var c = await this.messageBoxApi.confirm(
                  this.strings.get("TS:ReconnectPrompt"),
                  this.strings.get("TS:Reconnect"),
                  this.strings.get("GUI:Quit"),
                );
                if (((n = !0), c)) return ((l.create = !1), void e.goToScreen(Z.ScreenType.Game, l));
                this.localPrefs.removeItem(le.StorageKey.LastConnection);
              }
              o = this.gpuTier;
              (void 0 !== o &&
                ((c = this.localPrefs.getItem(le.StorageKey.LastGpuTier)),
                2 <= o.tier
                  ? void 0 !== c && Number(c) !== o.tier
                    ? ((await this.confirmHighGfxSettings()) &&
                        (t.graphics.applyHighPreset(), this.localPrefs.setItem(le.StorageKey.Options, t.serialize())),
                      (n = !0))
                    : void 0 === c &&
                      o.isMobile &&
                      (t.graphics.applyLowPreset(), this.localPrefs.setItem(le.StorageKey.Options, t.serialize()))
                  : (void 0 === c || 2 <= Number(c)) &&
                    ((await this.confirmLowGfxSettings()) &&
                      (t.graphics.applyLowPreset(), this.localPrefs.setItem(le.StorageKey.Options, t.serialize())),
                    (n = !0)),
                this.localPrefs.setItem(le.StorageKey.LastGpuTier, "" + o.tier)),
                void 0 === s &&
                  this.config.patchNotesUrl &&
                  ((o = this.localPrefs.getItem(le.StorageKey.LastSeenPatch)) &&
                    o !== this.appVersion &&
                    (await new Promise((e) =>
                      this.messageBoxApi.show(
                        p.default.createElement("iframe", { src: this.config.patchNotesUrl, className: "patch-notes" }),
                        [{ label: this.strings.get("GUI:Continue"), onClick: e }],
                        { className: "patch-notes-box" },
                      ),
                    ),
                    (n = !0)),
                  (o && o === this.appVersion) ||
                    this.localPrefs.setItem(le.StorageKey.LastSeenPatch, this.appVersion)),
                i &&
                  !n &&
                  r.audioSystem.isSuspended() &&
                  (await new Promise((e) =>
                    this.messageBoxApi.show(
                      this.strings.get("GUI:RequestAudioPermission"),
                      this.strings.get("GUI:OK"),
                      async () => {
                        (await r.audioSystem.initMusicLoop().catch((e) => console.error(e)), e());
                      },
                    ),
                  )));
              let h;
              if (void 0 !== s)
                try {
                  if (void 0 !== s.replayId) {
                    let e = await a.loadList();
                    var u = e.find((e) => e.id === s.replayId);
                    if (!u) throw new Error(`Replay ID "${s.replayId}" not found`);
                    h = await a.loadReplay(u);
                  } else {
                    let e = new URL(s.replayUrl),
                      t = !1;
                    for (var d of this.config.replaysUrlWhitelist)
                      if (e.hostname.endsWith(d)) {
                        t = !0;
                        break;
                      }
                    if (!t)
                      throw new Error(
                        `Can't load replay from URL "${e.href}".` + "Domain is not within the allowed list of domains.",
                      );
                    var g = await new re.ResourceLoader("").loadBinary(s.replayUrl);
                    ((h = new T.Replay()),
                      h.unserialize(b.uint8ArrayToBinaryString(g), { name: "untitled.rpl", timestamp: Date.now() }),
                      h.engineVersion !== this.engineVersion &&
                        (await this.loadReplayWithOldClient(e, h.engineVersion), (h = void 0)));
                  }
                } catch (e) {
                  (console.error("Failed to load replay", e),
                    await this.messageBoxApi.alert(this.strings.get("GUI:ReplayError"), this.strings.get("GUI:Ok")));
                }
              h ? e.goToScreen(Z.ScreenType.Replay, { replay: h }) : e.goToScreen(Z.ScreenType.MainMenuRoot);
            }
            async loadReplayWithOldClient(e, t) {
              let i;
              var r,
                s,
                a = this.config["oldClientsBaseUrl"];
              if (a) {
                this.messageBoxApi.show(this.strings.get("GUI:LoadingEx"));
                try {
                  let e = new re.ResourceLoader(a);
                  i = await e.loadJson("versions.json");
                } catch (e) {
                  console.warn("Couldn't download client version list", e);
                } finally {
                  this.messageBoxApi.destroy();
                }
              }
              let n;
              (i && (n = i[t]),
                n
                  ? ((r = (s = G.Engine.getActiveMod()) ? `?${S.RouteHelper.modQueryStringName}=` + s : ""),
                    (s = encodeURIComponent(e.href)),
                    (window.location.href = `${a}v${n}/${r}#/replay/` + s))
                  : await this.messageBoxApi.alert(
                      this.strings.get("GUI:ReplayVersionMismatch", t),
                      this.strings.get("GUI:Ok"),
                    ));
            }
            async confirmLowGfxSettings() {
              return await this.messageBoxApi.confirm(
                p.default.createElement("div", {
                  dangerouslySetInnerHTML: {
                    __html: this.strings
                      .get("TS:RendererWarning")
                      .replace(/\n/g, "<br />")
                      .replace(
                        "{link}",
                        '<a href="https://www.windowsdigitals.com/force-chrome-firefox-game-to-use-nvidia-gpu-integrated-graphics/" target="_blank" rel="noreferrer noopener">',
                      )
                      .replace("{/link}", "</a>"),
                  },
                }),
                this.strings.get("TS:RendererUseLow"),
                this.strings.get("TS:RendererIgnore"),
              );
            }
            async confirmHighGfxSettings() {
              return await this.messageBoxApi.confirm(
                this.strings.get("TS:RendererChangeDesc"),
                this.strings.get("GUI:Yes"),
                this.strings.get("GUI:No"),
              );
            }
            initRenderer(t, e, i) {
              var { width: r, height: s } = e;
              let a = new o.Renderer(r, s);
              (a.init(t),
                this.disposables.add(a),
                c.DevToolsApi.registerVar("fps", this.runtimeVars.fps),
                this.disposables.add(() => c.DevToolsApi.unregisterVar("fps")),
                this.runtimeVars.fps.onChange.subscribe((e) => {
                  e ? a.initStats(t) : a.destroyStats();
                }),
                i && (this.runtimeVars.fps.value = !0),
                this.runtimeVars.fps.value && a.initStats(t));
              let n = new l.UiAnimationLoop(a);
              return (
                n.start(),
                this.disposables.add(n),
                t.addEventListener("contextmenu", (e) => {
                  ("A" === e.target.nodeName && e.target.href.length) || e.preventDefault();
                }),
                i ||
                  window.addEventListener("beforeunload", (e) => {
                    this.rootController?.getCurrentScreen()?.preventUnload &&
                      (e.preventDefault(), (e.returnValue = ""));
                  }),
                a.getCanvas().addEventListener("mousedown", (e) => {
                  e.preventDefault();
                }),
                { renderer: a, uiAnimationLoop: n }
              );
            }
            async initSound(e, t) {
              let i;
              var r = this.localPrefs.getItem(le.StorageKey.Mixer);
              if (r)
                try {
                  i = new d.Mixer().unserialize(r);
                } catch (e) {
                  console.warn("Failed to read mixer values from local storage", [e]);
                }
              i ||
                ((i = new d.Mixer()),
                i.setVolume(m.ChannelType.Master, 0.4),
                i.setVolume(m.ChannelType.CreditTicks, 0.2),
                i.setVolume(m.ChannelType.Music, 0.3),
                i.setVolume(m.ChannelType.Ambient, 0.3));
              let s = new h.Sound(
                new u.AudioSystem(i),
                G.Engine.getSounds(),
                new g.SoundSpecs(G.Engine.getSoundIni()),
                e.audioVisual,
                document,
              );
              (s.initialize(), this.disposables.add(s));
              let a;
              try {
                a = !!(await G.Engine.rfs?.containsEntry(G.Engine.rfsSettings.musicDir));
              } catch (e) {
                (console.error("Couldn't get music directory", [e]),
                  e instanceof be.StorageQuotaError ||
                    e instanceof we.IOError ||
                    e instanceof de.FileNotFoundError ||
                    this.sentry?.captureException(new Error(`Couldn't get music directory (${e.name})`, { cause: e })),
                  (a = !1));
              }
              let n;
              if (a) {
                ((n = new f.Music(
                  s.audioSystem,
                  G.Engine.getThemes(),
                  new y.MusicSpecs(G.Engine.getIni(G.Engine.getFileNameVariant("theme.ini"))),
                )),
                  this.disposables.add(n));
                r = this.localPrefs.getItem(le.StorageKey.MusicOpts);
                if (r)
                  try {
                    n.unserializeOptions(r);
                  } catch (e) {
                    console.warn("Failed to read music options from local storage", [e]);
                  }
              }
              return { mixer: i, sound: s, music: n };
            }
            async destroy() {
              var e;
              (this.messageBoxApi && (this.messageBoxApi.destroy(), (this.messageBoxApi = void 0)),
                this.rootController && (await this.rootController.leaveCurrentScreen(), this.rootController.destroy()),
                this.uiScene &&
                  ((e = this.uiScene.getHtmlContainer()?.getElement()) && this.rootEl.removeChild(e),
                  this.uiScene.destroy()),
                this.disposables.dispose());
            }
          }),
        );
      },
    };
  },
);
