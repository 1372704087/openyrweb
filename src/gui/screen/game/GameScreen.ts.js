// === Reconstructed SystemJS module: gui/screen/game/GameScreen ===
// deps: ["data/DataStream","network/GservError","gui/screen/ScreenType","gui/screen/mainMenu/ScreenType","@puzzl/core/lib/async/sleep","game/Game","engine/Engine","gui/screen/game/component/hud/viewmodel/SidebarModel","network/gamestate/LockstepManager","network/gamestate/ActionSerializer","game/action/ActionFactory","game/action/ActionQueue","tools/DevToolsApi","engine/GameAnimationLoop","gui/screen/game/component/GameResultPopup","gui/jsx/jsx","util/disposable/CompositeDisposable","network/gamestate/SoloPlayTurnManager","gui/screen/game/SoundHandler","LocalPrefs","gui/screen/game/worldInteraction/WorldInteractionFactory","gui/screen/game/CombatantUi","gui/screen/game/ObserverUi","gui/screen/game/GameMenu","gui/screen/game/WorldView","engine/sound/Eva","engine/sound/EvaSpecs","gui/screen/game/NetStats","gui/screen/game/HudFactory","gui/screen/game/component/Minimap","game/SideType","network/gamestate/Replay","network/gamestate/ReplayRecorder","gui/screen/game/component/hud/viewmodel/CombatantSidebarModel","game/action/ActionFactoryReg","gui/screen/game/component/hud/viewmodel/MessageList","engine/sound/SoundKey","engine/sound/ChannelType","gui/screen/game/ChatNetHandler","gui/screen/game/ChatTypingHandler","@puzzl/core/lib/async/Task","network/IrcConnection","@puzzl/core/lib/async/cancellation","network/gservConfig","engine/sound/Music","gui/screen/game/TauntHandler","gui/screen/game/TauntPlayback","game/action/ActionType","game/event/EventType","gui/screen/game/gameMenu/ConnectionInfoScreen","gui/screen/game/component/hud/commandBar/CommandBarButtonList","gui/screen/game/component/hud/commandBar/CommandBarButtonType","engine/ResourceLoader","data/vfs/StorageQuotaError","data/vfs/FileNotFoundError","util/userAgent","data/vfs/IOError","gui/screen/RootScreen","gui/screen/game/loadingScreen/LoadingScreenApiFactory","gui/replay/ReplayStorageError","data/MapFile","data/vfs/VirtualFile","util/string","engine/MapDigest","engine/MapSupport","network/gameres/GameRes","game/gameopts/constants","gui/screen/mainMenu/MainMenuRoute","gui/screen/RootRoute","gui/chat/ChatHistory","gui/chat/ChatMessageFormat","gui/screen/game/MedianPing","gui/screen/game/PingMonitor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/GameScreen",
  [
    "data/DataStream",
    "network/GservError",
    "gui/screen/ScreenType",
    "gui/screen/mainMenu/ScreenType",
    "@puzzl/core/lib/async/sleep",
    "game/Game",
    "engine/Engine",
    "gui/screen/game/component/hud/viewmodel/SidebarModel",
    "network/gamestate/LockstepManager",
    "network/gamestate/ActionSerializer",
    "game/action/ActionFactory",
    "game/action/ActionQueue",
    "tools/DevToolsApi",
    "engine/GameAnimationLoop",
    "gui/screen/game/component/GameResultPopup",
    "gui/jsx/jsx",
    "util/disposable/CompositeDisposable",
    "network/gamestate/SoloPlayTurnManager",
    "gui/screen/game/SoundHandler",
    "LocalPrefs",
    "gui/screen/game/worldInteraction/WorldInteractionFactory",
    "gui/screen/game/CombatantUi",
    "gui/screen/game/ObserverUi",
    "gui/screen/game/GameMenu",
    "gui/screen/game/WorldView",
    "engine/sound/Eva",
    "engine/sound/EvaSpecs",
    "gui/screen/game/NetStats",
    "gui/screen/game/HudFactory",
    "gui/screen/game/component/Minimap",
    "game/SideType",
    "network/gamestate/Replay",
    "network/gamestate/ReplayRecorder",
    "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel",
    "game/action/ActionFactoryReg",
    "gui/screen/game/component/hud/viewmodel/MessageList",
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "gui/screen/game/ChatNetHandler",
    "gui/screen/game/ChatTypingHandler",
    "@puzzl/core/lib/async/Task",
    "network/IrcConnection",
    "@puzzl/core/lib/async/cancellation",
    "network/gservConfig",
    "engine/sound/Music",
    "gui/screen/game/TauntHandler",
    "gui/screen/game/TauntPlayback",
    "game/action/ActionType",
    "game/event/EventType",
    "gui/screen/game/gameMenu/ConnectionInfoScreen",
    "gui/screen/game/component/hud/commandBar/CommandBarButtonList",
    "gui/screen/game/component/hud/commandBar/CommandBarButtonType",
    "engine/ResourceLoader",
    "data/vfs/StorageQuotaError",
    "data/vfs/FileNotFoundError",
    "util/userAgent",
    "data/vfs/IOError",
    "gui/screen/RootScreen",
    "gui/screen/game/loadingScreen/LoadingScreenApiFactory",
    "gui/replay/ReplayStorageError",
    "data/MapFile",
    "data/vfs/VirtualFile",
    "util/string",
    "engine/MapDigest",
    "engine/MapSupport",
    "network/gameres/GameRes",
    "game/gameopts/constants",
    "gui/screen/mainMenu/MainMenuRoute",
    "gui/screen/RootRoute",
    "gui/chat/ChatHistory",
    "gui/chat/ChatMessageFormat",
    "gui/screen/game/MedianPing",
    "gui/screen/game/PingMonitor",
    "data/ShpFile",
    "data/Palette",
    "engine/gfx/ImageUtils",
    "engine/IsoCoords",
    "game/Coords",
    "game/gameopts/GameOptRandomGen",
  ],
  function (e, t) {
    "use strict";
    var h,
      s,
      n,
      o,
      u,
      y,
      A,
      T,
      d,
      v,
      b,
      S,
      w,
      c,
      l,
      g,
      W,
      E,
      M,
      C,
      R,
      P,
      I,
      k,
      x,
      p,
      m,
      a,
      O,
      B,
      f,
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
      i,
      r,
      re,
      se,
      ae,
      ne,
      oe,
      le,
      ce,
      he,
      ue,
      de,
      ge,
      pe,
      me,
      fe,
      ye,
      Te,
      ve,
      be,
      Se,
      _ShpFileMod,
      _PaletteMod,
      _ImageUtilsMod,
      _IsoCoords,
      _Coords,
      _GameOptRandomGen;
    t && t.id;
    return {
      setters: [
        function (e) {
          h = e;
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
        function (e) {
          u = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          d = e;
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
          c = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          W = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          C = e;
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
          x = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          f = e;
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
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          re = e;
        },
        function (e) {
          se = e;
        },
        function (e) {
          ae = e;
        },
        function (e) {
          ne = e;
        },
        function (e) {
          oe = e;
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
          be = e;
        },
        function (e) {
          _ShpFileMod = e;
        },
        function (e) {
          _PaletteMod = e;
        },
        function (e) {
          _ImageUtilsMod = e;
        },
        function (e) {
          _IsoCoords = e;
        },
        function (e) {
          _Coords = e;
        },
        function (e) {
          _GameOptRandomGen = e;
        },
      ],
      execute: function () {
        ((Se = class extends ae.RootScreen {
          constructor(
            e,
            t,
            i,
            r,
            s,
            a,
            n,
            o,
            l,
            c,
            h,
            u,
            d,
            g,
            p,
            m,
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
          ) {
            (super(),
              (this.workerHostApi = e),
              (this.gservCon = t),
              (this.wgameresService = i),
              (this.wolService = r),
              (this.mapTransferService = s),
              (this.engineVersion = a),
              (this.engineModHash = n),
              (this.errorHandler = o),
              (this.gameMenuSubScreens = l),
              (this.loadingScreenApiFactory = c),
              (this.gameOptsParser = h),
              (this.gameOptsSerializer = u),
              (this.config = d),
              (this.strings = g),
              (this.renderer = p),
              (this.uiScene = m),
              (this.runtimeVars = f),
              (this.messageBoxApi = y),
              (this.toastApi = T),
              (this.uiAnimationLoop = v),
              (this.viewport = b),
              (this.jsxRenderer = S),
              (this.pointer = w),
              (this.sound = E),
              (this.music = C),
              (this.mixer = x),
              (this.keyBinds = O),
              (this.generalOptions = A),
              (this.localPrefs = M),
              (this.actionLogger = R),
              (this.lockstepLogger = P),
              (this.replayManager = I),
              (this.fullScreen = k),
              (this.mapFileLoader = B),
              (this.mapDir = N),
              (this.mapList = j),
              (this.gameLoader = L),
              (this.vxlGeometryPool = D),
              (this.buildingImageDataCache = F),
              (this.mutedPlayers = _),
              (this.tauntsEnabled = U),
              (this.speedCheat = H),
              (this.sentry = G),
              (this.battleControlApi = V),
              (this.preventUnload = !0),
              (this.avgPing = new ve.MedianPing()),
              (this.disposables = new W.CompositeDisposable()),
              (this.onGservClose = (e) => {
                (this.replay && (this.replay.finish(this.game.currentTick), this.saveReplay(this.replay)),
                  this.handleError(e, this.strings.get("TXT_YOURE_DISCON")),
                  this.game && this.sendGameRes(this.game, { disconnect: !0, desync: !1, quit: !1, finished: !1 }));
              }));
          }
          async onEnter(d) {
            (this.pointer.lock(), this.pointer.setVisible(!1), await this.music?.play($.MusicType.Loading));
            let e = new K.CancellationTokenSource();
            this.disposables.add(() => e.cancel());
            let i = e.token,
              g;
            ((this.returnTo = d.returnTo), (this.isTournament = d.tournament));
            var p = (this.playerName = d.playerName),
              m = (this.isSinglePlayer = d.create && d.singlePlayer);
            if (m) g = d.gameOpts;
            else {
              var r = this.wolService.getCredentials();
              if (!r || r.user !== p)
                return (
                  this.localPrefs.removeItem(C.StorageKey.LastConnection),
                  void this.controller?.goToScreen(n.ScreenType.MainMenuRoot, {
                    route: new me.MainMenuRoute(o.ScreenType.Login, {
                      forceUser: p,
                      afterLogin: (e) => new fe.RootRoute(n.ScreenType.Game, d),
                    }),
                  })
                );
              (this.wolService.setAutoReconnect(!0), this.gservCon.onClose.subscribe(this.onGservClose));
              try {
                g = await this.connectToServerInstance(d, r, i);
              } catch (e) {
                return void this.handleGservConError(e);
              }
              let { returnTo: e, ...t } = d;
              this.localPrefs.setItem(C.StorageKey.LastConnection, JSON.stringify(t));
            }
            this.config.devMode
              ? (this.runtimeVars.cheatsEnabled.value = this.isSinglePlayer)
              : this.isSinglePlayer || (this.runtimeVars.cheatsEnabled.value = !1);
            let t;
            try {
              var s = await this.transferAndLoadMapFile(d, g.mapName, g.mapDigest, i);
              (g.mapOfficial || ((this.debugMapFile = s), this.disposables.add(() => (this.debugMapFile = void 0))),
                (t = new le.MapFile(s)));
              var f = de.MapSupport.check(t, this.strings);
              if (f) return void this.handleError(f, f);
            } catch (e) {
              return void this.handleMapLoadError(e, g.mapName);
            }
            f = this.loadingScreenApiFactory.create(
              m ? ne.LoadingScreenType.SinglePlayer : ne.LoadingScreenType.MultiPlayer,
            );
            if (
              ((this.loadingScreenApi = f),
              this.disposables.add(f, () => (this.loadingScreenApi = void 0)),
              this.disposables.add(() => this.gameLoader.clearStaticCaches()),
              !i.isCancelled())
            ) {
              // OpenYRWeb: decode map preview for loading screen
              try {
                var pg = t.decodePreviewImage();
                var pv = document.createElement("canvas");
                pv.width = pg ? pg.width : 160;
                pv.height = pg ? pg.height : 120;
                var px = pv.getContext("2d");
                if (px && pg) {
                  // Draw map preview image
                  var pi = px.createImageData(pg.width, pg.height),
                    pd = pi.data,
                    sd = pg.data,
                    si = 0,
                    di = 0;
                  for (; si < sd.length; si += 3) {
                    (pd[di] = sd[si]), (pd[di + 1] = sd[si + 1]), (pd[di + 2] = sd[si + 2]), (pd[di + 3] = 255);
                    di += 4;
                  }
                  px.putImageData(pi, 0, 0);
                  // Draw player start dots
                  try {
                    var pdColors = f.rules ? [...f.rules.getMultiplayerColors().values()] : null,
                      pdSlots = new Map(),
                      pdAddSlot = function(e) { if (e && e.startPos >= 0) pdSlots.set(e.startPos, e); };
                    g.humanPlayers && g.humanPlayers.forEach(pdAddSlot);
                    g.aiPlayers && g.aiPlayers.forEach(pdAddSlot);
                    // Resolve random positions using GameOptRandomGen
                    try {
                      var pdRng = _GameOptRandomGen.GameOptRandomGen.factory(d.gameId, d.timestamp);
                      var pdLocsArr = t.startingLocations;
                      // Must consume same PRNG state as GameFactory.create: colors → countries → startLocations
                      var pdColorMap = pdRng.generateColors(g);
                      pdRng.generateCountries(g, f.rules);
                      var pdResolved = pdRng.generateStartLocations(g, pdLocsArr);
                      pdResolved.forEach(function(posIdx, player) {
                        if (player && posIdx >= 0 && !pdSlots.has(posIdx)) pdSlots.set(posIdx, player);
                      });
                      // Resolve random colors using the color map
                      var pdResolveColorId = function(player) {
                        if (!player) return -1;
                        if (player.colorId >= 0) return player.colorId;
                        if (pdColorMap && pdColorMap.has(player)) return pdColorMap.get(player);
                        return -1;
                      };
                    } catch (e) { console.warn("[MapPrev] Failed to resolve random positions", e); }
                    var pdLocs = t.startingLocations,
                      pdClen = pdColors ? pdColors.length : 0;
                    var pdScale = pv.width / 160;
                    var pdMmpbScale = Math.max(0.5, 0.8 * pdScale);
                    var pdDotSize = Math.max(3, 4 * pdScale);
                    // Load mmpb.shp + unitdes.pal for player position markers
                    var pdShp = new _ShpFileMod.ShpFile(A.Engine.vfs.openFile("mmpb.shp")),
                      pdPal = new _PaletteMod.Palette(A.Engine.vfs.openFile("unitdes.pal")),
                      pdShpImg = pdShp.getImage(0),
                      pdShpCanvas = null,
                      pdShpRefData = null;
                    if (pdShpImg) {
                      pdShpCanvas = document.createElement("canvas");
                      pdShpCanvas.width = pdShpImg.width; pdShpCanvas.height = pdShpImg.height;
                      var pdShpCtx = pdShpCanvas.getContext("2d");
                      if (pdShpCtx) {
                        var pdShpData = pdShpCtx.createImageData(pdShpImg.width, pdShpImg.height),
                          pdShpPix = pdShpData.data, pdShpSrc = pdShpImg.imageData;
                        for (var pdShpI = 0; pdShpI < pdShpSrc.length; pdShpI++) {
                          var pdShpC = pdPal.getColor(pdShpSrc[pdShpI]);
                          pdShpPix[pdShpI*4] = pdShpC.r; pdShpPix[pdShpI*4+1] = pdShpC.g; pdShpPix[pdShpI*4+2] = pdShpC.b;
                          pdShpPix[pdShpI*4+3] = pdShpSrc[pdShpI] ? 255 : 0;
                        }
                        pdShpCtx.putImageData(pdShpData, 0, 0);
                        pdShpRefData = pdShpCtx.getImageData(0, 0, pdShpImg.width, pdShpImg.height);
                      }
                    }
                    // Cache tinted mmpb canvases per colorId
                    var pdTintedCache = new Map();
                    var pdGetTintedMmpb = function(colorObj) {
                      if (!pdShpRefData || !colorObj) return pdShpCanvas;
                      var key = colorObj.asHexString();
                      if (pdTintedCache.has(key)) return pdTintedCache.get(key);
                      var c = document.createElement("canvas");
                      c.width = pdShpRefData.width; c.height = pdShpRefData.height;
                      var ctx = c.getContext("2d");
                      if (!ctx) return pdShpCanvas;
                      var imgData = ctx.createImageData(pdShpRefData.width, pdShpRefData.height),
                        src = pdShpRefData.data, dst = imgData.data,
                        pr = colorObj.r, pg = colorObj.g, pb = colorObj.b;
                      for (var i = 0; i < src.length; i += 4) {
                        var a = src[i+3];
                        if (a > 0) {
                          var lum = Math.min(1, (src[i] + src[i+1] + src[i+2]) / (3 * 255) * 3);
                          dst[i] = pr * lum; dst[i+1] = pg * lum; dst[i+2] = pb * lum; dst[i+3] = 255;
                        }
                      }
                      ctx.putImageData(imgData, 0, 0);
                      pdTintedCache.set(key, c);
                      return c;
                    };
                    // Initialize IsoCoords with a temporary origin (save/restore global state)
                    var pdOldOrigin = _IsoCoords.IsoCoords.worldOrigin;
                    _IsoCoords.IsoCoords.init({ x: 0, y: (t.fullSize.width * _Coords.Coords.getWorldTileSize()) / 2 });
                    var pdOrigin = _IsoCoords.IsoCoords.worldToScreen(0, 0),
                      pdOriginSt = _IsoCoords.IsoCoords.screenToScreenTile(pdOrigin.x, pdOrigin.y);
                    for (var pdi = 0; pdi < pdLocs.length; pdi++) {
                      var pdl = pdLocs[pdi], pdp = pdSlots.get(pdi),
                        pdScreen = _IsoCoords.IsoCoords.tileToScreen(pdl.x, pdl.y),
                        pdSt = _IsoCoords.IsoCoords.screenToScreenTile(pdScreen.x, pdScreen.y);
                      pdSt.x += pdOriginSt.x;
                      pdSt.y += pdOriginSt.y;
                      var pdLocal = t.localSize,
                        pdSx = pv.width / (2 * pdLocal.width),
                        pdSy = pv.height / pdLocal.height / 2,
                        pdcx = (pdSt.x - 2 * pdLocal.x) * pdSx,
                        pdcy = (pdSt.y - 2 * pdLocal.y) * pdSy;
                      var pdIdx = pdp ? (typeof pdResolveColorId === "function" ? pdResolveColorId(pdp) : (pdp.colorId >= 0 ? pdp.colorId : -1)) : -1;
                      var pdColor = pdIdx >= 0 && pdColors && pdIdx < pdClen ? pdColors[pdIdx] : null;
                      var pdTargetCanvas = pdGetTintedMmpb(pdColor);
                      if (pdp && pdTargetCanvas) {
                        // Draw mmpb.shp tinted to player's color, centered on position
                        px.drawImage(pdTargetCanvas,
                          Math.round(pdcx - pdTargetCanvas.width * pdMmpbScale / 2),
                          Math.round(pdcy - pdTargetCanvas.height * pdMmpbScale / 2),
                          Math.round(pdTargetCanvas.width * pdMmpbScale),
                          Math.round(pdTargetCanvas.height * pdMmpbScale));
                      } else {
                        // Empty slot: black dot
                        var pdR = (pdDotSize + 0.5) * 0.75;
                        px.fillStyle = "rgb(0,0,0)";
                        px.fillRect(Math.round(pdcx - pdR) + 1, Math.round(pdcy - pdR), Math.round(pdR * 2), Math.round(pdR * 2));
                      }
                    }
                    if (pdOldOrigin !== void 0) _IsoCoords.IsoCoords.worldOrigin = pdOldOrigin;
                  } catch (e) {
                    console.warn("[MapPrev] Failed to draw start dots", e);
                  }
                }
                if (!f.mapPreviewUrl) f.mapPreviewUrl = pv.toDataURL();
              } catch (e) {
                console.warn("Failed to create map preview for loading screen", e);
              }
              let u;
              try {
                u = await this.gameLoader.load(d.gameId, d.timestamp, g, t, p, this.isSinglePlayer, f, i);
              } catch (e) {
                return void this.handleGameLoadError(e, d, g);
              }
              if (!i.isCancelled()) {
                let { game: i, theater: e, hudSide: t, cameoFilenames: r } = u;
                ((this.game = i),
                  // OpenYRWeb debug-only: expose the live game for headless verification.
                  // Removed before any public release. No-op when undefined.
                  ((typeof window !== "undefined" ? (window.__yrwebGame = i) : 0),
                  this.disposables.add(() => {
                    typeof window !== "undefined" && delete window.__yrwebGame;
                  })),
                  this.disposables.add(
                    i,
                    () => (this.game = void 0),
                    () => A.Engine.unloadTheater(e.type),
                  ));
                let s = i.getPlayerByName(p),
                  a;
                try {
                  a = this.loadUi(i, e, s, t, r);
                } catch (e) {
                  f = e.message?.match(/memory|allocation/i)
                    ? this.strings.get("TS:GameInitOom")
                    : this.strings.get("TS:GameInitError") +
                      (i.gameOpts.mapOfficial ? "" : "\n\n" + this.strings.get("TS:CustomMapCrash"));
                  return void this.handleGameError(e, f, i);
                }
                let n = new b.ActionFactory();
                new D.ActionFactoryReg().register(n, i, p);
                let o = new S.ActionQueue(),
                  l = (this.replay = new N.Replay());
                (this.disposables.add(() => (this.replay = void 0)),
                  l.init(i.id, i.startTimestamp, g, this.engineVersion, this.engineModHash));
                let c = new j.ReplayRecorder(
                  l,
                  i.getPlayerNumber(s),
                  i.gameOpts.humanPlayers,
                  new v.ActionSerializer(),
                );
                if (this.isSinglePlayer) this.gameTurnMgr = new E.SoloPlayTurnManager(i, s, o, this.actionLogger, c);
                else {
                  this.lagState = !1;
                  let e = this.initLockstep(i, s, n, o, c);
                  if (s.isObserver)
                    try {
                      e.setPassiveMode(!0);
                    } catch (e) {
                      if (e instanceof z.IrcConnection.SocketError) return;
                      throw e;
                    }
                  else
                    this.disposables.add(
                      i.events.subscribe(X.EventType.PlayerDefeated, (e) => {
                        e.target === s && s.isObserver && this.gameTurnMgr.setPassiveMode?.(!0);
                      }),
                    );
                  this.gameTurnMgr = e;
                }
                this.gameTurnMgr.init();
                let h = () => {
                  if (i.status !== y.GameStatus.Started)
                    try {
                      this.onGameStart(s, i, a, o, n, l, c);
                    } catch (e) {
                      var t = e.message?.match(/memory|allocation/i)
                        ? this.strings.get("TS:GameInitOom")
                        : this.strings.get("TS:GameInitError") +
                          (i.gameOpts.mapOfficial ? "" : "\n\n" + this.strings.get("TS:CustomMapCrash"));
                      this.handleGameError(e, t, i);
                    }
                };
                if (m)
                  (h(),
                    w.DevToolsApi.registerCommand("reset", async () => {
                      (await this.onLeave(), await this.onEnter(d));
                    }),
                    w.DevToolsApi.registerVar("speed", i.desiredSpeed),
                    this.disposables.add(
                      () => w.DevToolsApi.unregisterCommand("reset"),
                      () => w.DevToolsApi.unregisterVar("speed"),
                    ),
                    // ============ [CHEAT] 调试作弊系统 开始 ============
                    // 按 F10 打开作弊菜单，提供无限金钱、秒建造、科技全开、地图全开等功能
                    // 后续删除作弊时，删除从本注释到 "[CHEAT] 调试作弊系统 结束" 之间的整块代码
                    w.DevToolsApi.registerVar("cheats", this.runtimeVars.cheatsEnabled),
                    this.disposables.add(() => w.DevToolsApi.unregisterVar("cheats")),
                    (() => {
                      let _cheatMenu = null, _cheatInfMoneyTimer = null, _cheatInfSuperWeaponTimer = null;
                      const _cheatState = { infMoney: false, fastBuild: false, allTech: false, mapRevealed: false, bypassBuildLimit: false, infSuperWeapon: false };
                      const _gs = this;
                      function _destroyCheatMenu() {
                        if (_cheatMenu) { _cheatMenu.remove(); _cheatMenu = null; }
                      }
                      function _createCheatMenu() {
                        if (_cheatMenu) { _destroyCheatMenu(); return; }
                        const g = i, lp = s, rv = _gs.runtimeVars, sc = _gs.speedCheat;
                        const el = document.createElement("div");
                        el.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:rgba(0,0,0,0.92);border:2px solid #f60;border-radius:8px;padding:20px 28px;font-family:monospace;color:#fff;min-width:320px;user-select:none;";
                        const title = document.createElement("div");
                        title.textContent = "调试作弊菜单";
                        title.style.cssText = "text-align:center;font-size:18px;font-weight:bold;color:#f60;margin-bottom:16px;border-bottom:1px solid #333;padding-bottom:10px;";
                        el.appendChild(title);
                        function addToggle(label, getter, onToggle) {
                          const row = document.createElement("div");
                          row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:6px 0;";
                          const lbl = document.createElement("span");
                          lbl.textContent = label; lbl.style.fontSize = "14px";
                          const btn = document.createElement("button");
                          btn.style.cssText = "padding:4px 14px;border:1px solid #888;border-radius:4px;cursor:pointer;font-family:monospace;font-size:13px;min-width:60px;";
                          const refresh = () => {
                            const on = getter();
                            btn.textContent = on ? "ON" : "OFF";
                            btn.style.background = on ? "#2a5a2a" : "#5a2a2a";
                            btn.style.color = on ? "#6f6" : "#f66";
                            btn.style.borderColor = on ? "#4a4" : "#a44";
                          };
                          btn.addEventListener("click", () => { onToggle(); refresh(); });
                          refresh(); row.appendChild(lbl); row.appendChild(btn); el.appendChild(row);
                          return refresh;
                        }
                        function addBtn(label, onClick) {
                          const row = document.createElement("div");
                          row.style.cssText = "padding:6px 0;";
                          const btn = document.createElement("button");
                          btn.textContent = label;
                          btn.style.cssText = "width:100%;padding:6px 12px;border:1px solid #888;border-radius:4px;cursor:pointer;font-family:monospace;font-size:13px;background:#2a3a5a;color:#adf;";
                          btn.addEventListener("click", onClick);
                          row.appendChild(btn); el.appendChild(row);
                        }
                        function addSeparator() {
                          const sep = document.createElement("div");
                          sep.style.cssText = "border-top:1px solid #333;margin:6px 0;";
                          el.appendChild(sep);
                        }
                        // [CHEAT] 无限金钱：每200ms增加50000金钱
                        addToggle("无限金钱", () => _cheatState.infMoney, () => {
                          _cheatState.infMoney = !_cheatState.infMoney;
                          if (_cheatState.infMoney) {
                            if (!_cheatInfMoneyTimer) _cheatInfMoneyTimer = setInterval(() => { if (g.status === 1) lp.credits += 50000; }, 200);
                          } else { if (_cheatInfMoneyTimer) { clearInterval(_cheatInfMoneyTimer); _cheatInfMoneyTimer = null; } }
                        });
                        // [CHEAT] 秒建造：设置speedCheat为true，建造速度变为极快
                        addToggle("秒建造", () => _cheatState.fastBuild, () => { _cheatState.fastBuild = !_cheatState.fastBuild; sc.value = _cheatState.fastBuild; });
                        // [CHEAT] 突破建造限制：允许超过单位的buildLimit数量限制
                        addToggle("突破建造限制", () => _cheatState.bypassBuildLimit, () => {
                          _cheatState.bypassBuildLimit = !_cheatState.bypassBuildLimit;
                          const prod = lp.production;
                          if (prod) prod.cheatsBypassBuildLimits = _cheatState.bypassBuildLimit;
                        });
                        // [CHEAT] 无限超级武器：所有超级武器瞬间冷却，可无限使用
                        addToggle("无限超级武器", () => _cheatState.infSuperWeapon, () => {
                          _cheatState.infSuperWeapon = !_cheatState.infSuperWeapon;
                          if (_cheatState.infSuperWeapon) {
                            if (!_cheatInfSuperWeaponTimer) _cheatInfSuperWeaponTimer = setInterval(() => {
                              if (g.status === 1 && lp.superWeaponsTrait) {
                                for (const sw of lp.superWeaponsTrait.getAll()) {
                                  sw.chargeTicks = 0;
                                  sw.status = 2; // SuperWeaponStatus.Ready
                                }
                              }
                            }, 100);
                          } else {
                            if (_cheatInfSuperWeaponTimer) { clearInterval(_cheatInfSuperWeaponTimer); _cheatInfSuperWeaponTimer = null; }
                          }
                        });
                        addSeparator();
                        // [CHEAT] 一次性增加10万金钱
                        addBtn("增加 100,000 金钱", () => { lp.credits += 100000; });
                        // [CHEAT] 地图全开：揭示整个地图的战争迷雾
                        addBtn("地图全开", () => { g.mapShroudTrait.revealMap(lp, g); _cheatState.mapRevealed = true; });
                        // [CHEAT] 科技全开：设置maxTechLevel=99，添加所有阵营科技，跳过工厂和前置建筑检查
                        addBtn("科技全开", () => {
                          const prod = lp.production;
                          if (prod) {
                            prod.maxTechLevel = 99;
                            prod.addStolenTech(0); // GDI
                            prod.addStolenTech(1); // Nod
                            prod.addStolenTech(2); // ThirdSide
                            prod.cheatsBypassPrereqs = true; // 跳过工厂和前置建筑检查
                            _cheatState.allTech = true;
                          }
                        });
                        addSeparator();
                        // [CHEAT] 一键全部开启：同时启用无限金钱、秒建造、地图全开、科技全开
                        addBtn("一键全部开启", () => {
                          rv.cheatsEnabled.value = true;
                          if (!_cheatState.infMoney) { _cheatState.infMoney = true; if (!_cheatInfMoneyTimer) _cheatInfMoneyTimer = setInterval(() => { if (g.status === 1) lp.credits += 50000; }, 200); }
                          if (!_cheatState.fastBuild) { _cheatState.fastBuild = true; sc.value = true; }
                          g.mapShroudTrait.revealMap(lp, g); _cheatState.mapRevealed = true;
                          const prod = lp.production;
                          if (prod) {
                            prod.maxTechLevel = 99;
                            prod.addStolenTech(0); prod.addStolenTech(1); prod.addStolenTech(2);
                            prod.cheatsBypassPrereqs = true;
                            prod.cheatsBypassBuildLimits = true;
                            _cheatState.allTech = true;
                            _cheatState.bypassBuildLimit = true;
                          }
                          if (!_cheatState.infSuperWeapon) { _cheatState.infSuperWeapon = true; if (!_cheatInfSuperWeaponTimer) _cheatInfSuperWeaponTimer = setInterval(() => { if (g.status === 1 && lp.superWeaponsTrait) { for (const sw of lp.superWeaponsTrait.getAll()) { sw.chargeTicks = 0; sw.status = 2; } } }, 100); }
                          _destroyCheatMenu(); _createCheatMenu();
                        });
                        addSeparator();
                        // [CHEAT] 设置选中单位为一星 / 三星
                        // 后续删除作弊功能时，同步删除 CombatantUi.ts.js 中的 setSelectedVeteranLevel 方法
                        addBtn("选中单位一星", () => { rv.cheatsEnabled.value = true; _gs.playerUi.setSelectedVeteranLevel(1); });
                        addBtn("选中单位三星", () => { rv.cheatsEnabled.value = true; _gs.playerUi.setSelectedVeteranLevel(2); });
                        // [CHEAT] 结束
                        const hint = document.createElement("div");
                        hint.textContent = "按 F10 关闭菜单";
                        hint.style.cssText = "text-align:center;font-size:11px;color:#666;margin-top:12px;";
                        el.appendChild(hint);
                        document.body.appendChild(el); _cheatMenu = el;
                      }
                      const _onF10Key = (ev) => { if (ev.key === "F10") { ev.preventDefault(); _createCheatMenu(); } };
                      document.addEventListener("keydown", _onF10Key);
                      this.disposables.add(
                        () => { document.removeEventListener("keydown", _onF10Key); _destroyCheatMenu(); if (_cheatInfMoneyTimer) { clearInterval(_cheatInfMoneyTimer); _cheatInfMoneyTimer = null; } if (_cheatInfSuperWeaponTimer) { clearInterval(_cheatInfSuperWeaponTimer); _cheatInfSuperWeaponTimer = null; } }
                      );
                    }).call(this));
                    // ============ [CHEAT] 调试作弊系统 结束 ============
                else if (this.gservCon.isOpen()) {
                  let e = (e) => this.gameTurnMgr.setRate(e);
                  (this.gservCon.onRateChange.subscribe(e),
                    this.disposables.add(() => this.gservCon.onRateChange.unsubscribe(e)),
                    this.gservCon.onGameStart.subscribe(h),
                    this.disposables.add(() => this.gservCon.onGameStart.unsubscribe(h)),
                    this.gservCon.sendLoadedPercent(100));
                }
              }
            }
          }
          async connectToServerInstance(e, t, i) {
            let r = !1,
              s = new V.Task(async (e) => {
                (await u.sleep(1e3),
                  e.isCancelled() || (this.messageBoxApi.show(this.strings.get("TXT_CONNECTING")), (r = !0)));
              });
            s.start();
            try {
              var a, n, o;
              (await this.gservCon.connect(e.gservUrl),
                await this.gservCon.cvers(this.engineVersion),
                await this.gservCon.login(t.user, t.pass),
                i.throwIfCancelled(),
                e.create
                  ? ((a = this.gameOptsSerializer.serializeOptions(e.gameOpts)),
                    ({ gameId: n, timestamp: o } = e),
                    await this.gservCon.createGame(
                      n,
                      o,
                      a,
                      this.engineVersion,
                      this.engineModHash,
                      e.createPrivateGame,
                    ),
                    console.log(`Created game instance with id ${e.gameId}.`),
                    this.localPrefs.removeItem(C.StorageKey.LastConnection))
                  : (await this.joinGame(e.gameId, 5, i), console.log("Joined game instance with id " + e.gameId)));
              var l = await this.gservCon.gameOpts();
              return this.gameOptsParser.parseOptions(l);
            } catch (e) {
              throw (this.gservCon.isOpen() || (r = !1), e);
            } finally {
              (s.cancel(), r && this.messageBoxApi.destroy());
            }
          }
          async joinGame(e, i, r) {
            if (i) {
              let t;
              for (; i--;)
                try {
                  return (
                    console.log(`Attempting to join game with id ${e}...`, i + " retries left"),
                    r.throwIfCancelled(),
                    void (await this.gservCon.joinGame(e, this.engineVersion, this.engineModHash))
                  );
                } catch (e) {
                  if (!(e instanceof s.GservError && e.code === s.GservError.Code.InstanceNonExistent)) throw e;
                  ((t = e), await u.sleep(3e3));
                }
              throw (this.localPrefs.removeItem(C.StorageKey.LastConnection), t);
            }
            await this.gservCon.joinGame(e, this.engineVersion, this.engineModHash);
          }
          async transferAndLoadMapFile(t, i, r, s) {
            let a;
            if ((t.create && t.singlePlayer) || !t.mapTransfer) a = await this.mapFileLoader.load(i, s);
            else {
              if ((this.messageBoxApi.show(this.strings.get("GUI:MapTransfer")), t.create))
                ((a = await this.mapFileLoader.load(i, s)),
                  this.mapTransferService.getUrl()
                    ? await this.mapTransferService.putMap(a.getBytes(), t.gameId, s)
                    : this.gservCon.sendMap(a.readAsString()));
              else {
                let e;
                if (
                  ((e = this.mapTransferService.getUrl()
                    ? await this.mapTransferService.getMap(t.gameId, s)
                    : he.binaryStringToUint8Array(await this.gservCon.getMap())),
                  (a = ce.VirtualFile.fromBytes(e, i)),
                  ue.MapDigest.compute(a) !== r)
                )
                  throw new ie.DownloadError("Transferred map is corrupt");
                if (this.mapDir && !(await this.mapDir.containsEntry(i)))
                  try {
                    (await this.mapDir.writeFile(a), this.mapList.addFromMapFile(a));
                  } catch (e) {
                    console.error("Map couldn't be saved", [e]);
                  }
              }
              this.messageBoxApi.destroy();
            }
            return a;
          }
          loadUi(e, t, i, r, s) {
            var a = i.isObserver ? new T.SidebarModel(e) : new L.CombatantSidebarModel(i, e),
              n = new F.MessageList(e.rules.audioVisual.messageDuration, 6, i),
              o = new ye.ChatHistory();
            ((this.sidebarModel = a), this.disposables.add(() => (this.sidebarModel = void 0)));
            let l = A.Engine.getUiIni(),
              c = new ee.CommandBarButtonList();
            (i.isObserver ||
              c.fromIni(
                l.getOrCreateSection(this.isSinglePlayer ? "AdvancedCommandBar" : "MultiplayerAdvancedCommandBar"),
              ),
              this.config.discordUrl && c.buttons.push(te.CommandBarButtonType.BugReport),
              (this.hudFactory = new O.HudFactory(
                r,
                this.uiScene,
                a,
                n,
                o,
                e.debugText,
                this.runtimeVars.debugText,
                i,
                e.getCombatants(),
                e.stalemateDetectTrait,
                e.countdownTimer,
                s,
                this.jsxRenderer,
                this.strings,
                c.buttons,
              )),
              this.disposables.add(() => (this.hudFactory = void 0)));
            let h = this.hudFactory.create();
            this.hud = h;
            let u = (this.minimap = new B.Minimap(e, i, h.getTextColor(), e.rules.general.radar));
            (h.setMinimap(u),
              this.disposables.add(u, () => (this.minimap = void 0)),
              u.setPointerEvents(this.pointer.pointerEvents));
            let d = !1,
              g = new Date();
            var p = g.getMonth() + 1,
              a = g.getDate();
            4 !== p || 1 !== a || this.isTournament || (d = !0);
            a = { width: h.sidebarWidth, height: h.actionBarHeight };
            let m = new x.WorldView(
                a,
                e,
                this.sound,
                this.renderer,
                this.runtimeVars,
                u,
                this.strings,
                this.generalOptions,
                this.vxlGeometryPool,
                this.buildingImageDataCache,
                d,
              ),
              f = m.init(i, this.viewport.value, t);
            return (
              (this.worldView = m),
              this.disposables.add(m, () => (this.worldView = void 0)),
              f.worldScene.create3DObject(),
              { worldViewInitResult: f, messageList: n, chatHistory: o, minimap: u }
            );
          }
          initLockstep(t, e, i, r, s) {
            const a = this.runtimeVars.debugGameState.value;
            let n,
              o = new h.DataStream();
            a &&
              (n = (e) => {
                o.byteLength < 10485760 && o.writeString(e + "\n");
              });
            let l = new d.LockstepManager(
                t,
                this.gservCon,
                this.gameOptsParser,
                this.gameOptsSerializer,
                new v.ActionSerializer(),
                i,
                r,
                () => {
                  (this.gservCon.onClose.unsubscribe(this.onGservClose),
                    this.gservCon.close(),
                    this.handleGameError(
                      "desync_error",
                      this.strings.get("TS:DesyncDetected"),
                      t,
                      a
                        ? async () => {
                            let i, r;
                            try {
                              let t = JSON.stringify(l.debugGameStateHistory, void 0, 2);
                              (this.workerHostApi.queueTask(async (e) => {
                                i = await e.compressFile(t, "statedump.json");
                              }),
                                this.workerHostApi.queueTask(async (e) => {
                                  r = await e.compressFile(new Uint8Array(o.buffer, 0, o.byteLength), "lockstep.log");
                                }),
                                await this.workerHostApi.waitForTasks());
                            } catch (e) {
                              console.error("Failed to export debug data", e);
                            } finally {
                              this.workerHostApi.dispose();
                            }
                            return { stateDump: i, debugLog: r };
                          }
                        : void 0,
                    ));
                },
                this.actionLogger,
                this.lockstepLogger,
                n,
                s,
                a,
              ),
              c;
            return (
              l.onLagStateChange.subscribe((e) => {
                ((this.lagState = e),
                  c?.cancel(),
                  (c = void 0),
                  e
                    ? ((c = new V.Task(async (e) => {
                        (await u.sleep(q.CON_INFO_THRESH_MILLIS, e),
                          e.isCancelled() ||
                            this.menu?.openConnectionInfo(t.getCombatants(), this.gservCon, this.chatNetHandler));
                      })),
                      c.start().catch((e) => {
                        if (!(e instanceof K.OperationCanceledError)) throw e;
                      }),
                      this.disposables.add(() => c?.cancel()))
                    : this.menu?.getCurrentScreen() instanceof J.ConnectionInfoScreen && this.menu.close());
              }),
              l
            );
          }
          onViewportChange() {
            (this.loadingScreenApi?.updateViewport(), this.rerenderHud());
          }
          rerenderHud() {
            if (this.hud) {
              (this.uiScene.remove(this.hud), this.hud.destroy(), this.hudFactory.setSidebarModel(this.sidebarModel));
              let e = this.hudFactory.create();
              ((this.hud = e),
                e.setMinimap(this.minimap),
                this.playerUi &&
                  (this.uiScene.add(e),
                  this.menu?.handleHudChange(e),
                  this.worldView.handleViewportChange(this.viewport.value),
                  this.playerUi.handleHudChange(e),
                  this.chatTypingHandler &&
                    this.initHudChatTypingEvents(this.chatTypingHandler, this.chatNetHandler, e)));
            }
          }
          onGameStart(e, r, t, i, s, a, n) {
            (this.localPrefs.removeItem(C.StorageKey.LastConnection),
              this.loadingScreenApi?.dispose(),
              this.music?.play($.MusicType.Normal));
            var o = new m.EvaSpecs(e.country?.side ?? f.SideType.GDI).readIni(
              A.Engine.getIni(A.Engine.getFileNameVariant("eva.ini")),
            );
            let l = new p.Eva(o, this.sound, this.renderer);
            (l.init(),
              this.disposables.add(l),
              this.initUi(e, r, n, i, s, this.hud, l, t),
              this.renderer.removeScene(this.uiScene),
              this.renderer.addScene(t.worldViewInitResult.worldScene),
              this.renderer.addScene(this.uiScene),
              this.pointer.setVisible(!0),
              r.onEnd.subscribe(() => this.onGameEnd(r, e, l, a)),
              r.start(),
              this.isSinglePlayer || this.initNetStats(e),
              (this.gameAnimationLoop = new c.GameAnimationLoop(e, this.renderer, this.sound, this.gameTurnMgr, {
                skipFrames: !this.isSinglePlayer,
                onError: this.config.devMode
                  ? void 0
                  : (e, t) => {
                      var i;
                      e instanceof z.IrcConnection.SocketError ||
                        ((i = e.message?.match(/memory|allocation/i)
                          ? this.strings.get("TS:GameCrashOom")
                          : this.strings.get("TS:GameCrashed") +
                            (t || r.gameOpts.mapOfficial ? "" : "\n\n" + this.strings.get("TS:CustomMapCrash"))),
                        this.handleGameError(e, i, r, void 0, t));
                    },
              })),
              this.uiAnimationLoop.stop(),
              this.gameAnimationLoop.start());
          }
          initNetStats(t) {
            let i,
              r = new be.PingMonitor(this.gameTurnMgr, this.gservCon, this.avgPing);
            this.disposables.add(r);
            let e = (e) => {
              (i?.dispose(),
                r.setPingInterval(e ? 1e3 : 1e4),
                e && ((i = new a.NetStats(this.gameTurnMgr, t, this.renderer, r)), i.init(), this.disposables.add(i)));
            };
            (e(this.runtimeVars.fps.value),
              r.monitor(),
              this.runtimeVars.fps.onChange.subscribe(e),
              this.disposables.add(() => {
                this.runtimeVars.fps.onChange.unsubscribe(e);
              }));
          }
          initUi(i, r, s, e, t, a, n, o) {
            let { worldViewInitResult: l, messageList: c, chatHistory: h, minimap: u } = o;
            var { worldScene: d, worldSound: g, superWeaponFxHandler: p, beaconFxHandler: m, renderableManager: f } = l;
            let y = new M.SoundHandler(r, g, n, this.sound, r.events, c, this.strings, i);
            if (
              (y.init(),
              this.disposables.add(y),
              c.onNewMessage.subscribe((e) => {
                e.animate && this.sound.play(_.SoundKey.IncomingMessage, U.ChannelType.Ui);
              }),
              re.isIpad())
            ) {
              let e = (e) => {
                this.sidebarModel.topTextLeftAlign = e;
              };
              (this.fullScreen.onChange.subscribe(e),
                this.disposables.add(() => this.fullScreen.onChange.unsubscribe(e)));
            }
            this.uiScene.add(a);
            let T = (this.menu = new k.GameMenu(
              this.gameMenuSubScreens,
              r,
              i,
              h,
              this.isSinglePlayer ? void 0 : this.gservCon,
              this.isSinglePlayer,
              this.isTournament,
            ));
            (T.init(a), this.initGameMenuEvents(T, n, r, i, e, t), this.disposables.add(T, () => (this.menu = void 0)));
            var v = r.getUnitSelection(),
              b = this.runtimeVars.freeCamera,
              S = this.runtimeVars.debugPaths,
              w = this.runtimeVars.debugText,
              g = this.config.devMode,
              w = new R.WorldInteractionFactory(
                i,
                r,
                v,
                f,
                this.uiScene,
                d,
                this.pointer,
                this.renderer,
                this.keyBinds,
                this.generalOptions,
                b,
                S,
                g,
                document,
                u,
                this.strings,
                a.getTextColor(),
                w,
                this.battleControlApi,
              );
            let E;
            this.isSinglePlayer ||
              ((C = new Y.TauntPlayback(this.sound.audioSystem, A.Engine.getTaunts())),
              (E = new Q.TauntHandler(this.gservCon, i, r, s, this.tauntsEnabled, C, this.mutedPlayers)),
              E.init(),
              this.disposables.add(E));
            var C = this.config.discordUrl;
            if (i.isObserver) {
              let e = (this.playerUi = new I.ObserverUi(
                r,
                void 0,
                this.sidebarModel,
                void 0,
                this.renderer,
                d,
                this.sound,
                w,
                T,
                this.runtimeVars,
                this.strings,
                f,
                this.messageBoxApi,
                C,
              ));
              e.onPlayerChange.subscribe(({ player: e, sidebarModel: t }) => {
                ((this.sidebarModel = t),
                  this.rerenderHud(),
                  this.worldView?.changeLocalPlayer(e),
                  this.minimap.changeLocalPlayer(e));
              });
            } else
              this.playerUi = new P.CombatantUi(
                r,
                i,
                this.isSinglePlayer,
                e,
                t,
                this.sidebarModel,
                this.renderer,
                d,
                y,
                c,
                this.sound,
                n,
                w,
                T,
                this.pointer,
                this.runtimeVars,
                this.speedCheat,
                this.strings,
                E,
                f,
                p,
                m,
                this.messageBoxApi,
                C,
              );
            if (
              (this.playerUi.init(a),
              this.disposables.add(this.playerUi, () => (this.playerUi = void 0)),
              !this.isSinglePlayer)
            ) {
              ((m = this.wolService.getConnection()),
                (C = new Map(r.getNonNeutralPlayers().map((e) => [e.name, e.color.asHexString()]))),
                (C = new Te.ChatMessageFormat(this.strings, i.name, C)));
              let t = new H.ChatNetHandler(this.gservCon, m, c, h, C, i, r, s, this.mutedPlayers);
              (t.init(), this.disposables.add(t));
              let e = this.playerUi.worldInteraction;
              C = new G.ChatTypingHandler(e.keyboardHandler, e.arrowScrollHandler, c, h);
              ((e.chatTypingHandler = C),
                (this.chatTypingHandler = C),
                (this.chatNetHandler = t),
                this.disposables.add(() => (this.chatTypingHandler = this.chatNetHandler = void 0)),
                this.initHudChatTypingEvents(C, t, a),
                T.onSendMessage.subscribe((e) => {
                  e.value.length && t.submitMessage(e.value, e.recipient);
                }));
              const x = (e) => {
                r.getPlayerByName(e).isObserver && c.addSystemMessage(this.strings.get("TXT_LEFT_GAME", e), "grey");
              };
              (this.gservCon.onPlayerDisconnect.subscribe(x),
                this.disposables.add(() => this.gservCon.onPlayerDisconnect.unsubscribe(x)));
              const O = () => {
                c.addSystemMessage(this.strings.get("TS:ChatRestricted"), "white");
              };
              (this.gservCon.onPrivMsgNotAllowed.subscribe(O),
                this.disposables.add(() => this.gservCon.onPrivMsgNotAllowed.unsubscribe(O)));
            }
          }
          initHudChatTypingEvents(t, i, e) {
            (e.onMessageCancel.subscribe(() => {
              t.endTyping();
            }),
              e.onMessageSubmit.subscribe((e) => {
                (t.endTyping(), e.value.length && i.submitMessage(e.value, e.recipient));
              }));
          }
          initGameMenuEvents(e, t, i, r, s, a) {
            (e.onOpen.subscribe(() => {
              (this.pointer.unlock(),
                this.playerUi.worldInteraction.setEnabled(!1),
                this.isSinglePlayer &&
                  ((this.pausedAtSpeed = i.speed.value),
                  (i.desiredSpeed.value = Number.EPSILON),
                  this.mixer.setMuted(U.ChannelType.Effect, !0),
                  this.mixer.setMuted(U.ChannelType.Ambient, !0)));
            }),
              e.onQuit.subscribe(async () => {
                this.controller &&
                  (this.isSinglePlayer &&
                    this.pausedAtSpeed &&
                    (this.mixer.setMuted(U.ChannelType.Effect, !1), this.mixer.setMuted(U.ChannelType.Ambient, !1)),
                  r.isObserver || t.play("EVA_BattleControlTerminated"),
                  this.pointer.lock(),
                  this.pointer.setVisible(!1),
                  this.playerUi.dispose(),
                  r.isObserver ||
                    this.isSinglePlayer ||
                    this.lagState ||
                    (s.push(a.create(Z.ActionType.ResignGame)),
                    await new Promise((e) => {
                      this.gameTurnMgr.onActionsSent.subscribeOnce(() => e());
                    })),
                  this.gservCon.onClose.unsubscribe(this.onGservClose),
                  this.gservCon.close(),
                  this.gameTurnMgr.dispose(),
                  this.replay && (this.replay.finish(this.game.currentTick), this.saveReplay(this.replay)),
                  this.isSinglePlayer || this.sendGameRes(i, { disconnect: !1, desync: !1, quit: !0, finished: !1 }),
                  r.isObserver || this.logGame(i, !1),
                  await u.sleep(2e3),
                  this.controller?.goToScreen(n.ScreenType.MainMenuRoot, {
                    route: new me.MainMenuRoute(o.ScreenType.Score, {
                      game: i,
                      localPlayer: r,
                      isQuit: !0,
                      singlePlayer: this.isSinglePlayer,
                      tournament: this.isTournament,
                      returnTo: this.returnTo ?? new me.MainMenuRoute(o.ScreenType.Home),
                    }),
                  }));
              }),
              e.onObserve.subscribe(() => {
                (this.pointer.lock(),
                  this.playerUi.worldInteraction.setEnabled(!0),
                  s.push(a.create(Z.ActionType.ObserveGame)),
                  this.logGame(i, !1));
              }),
              e.onCancel.subscribe(() => {
                (this.pointer.lock(),
                  this.playerUi.worldInteraction.setEnabled(!0),
                  this.isSinglePlayer &&
                    this.pausedAtSpeed &&
                    ((i.desiredSpeed.value = this.pausedAtSpeed),
                    this.gameTurnMgr.doGameTurn(performance.now()),
                    (this.pausedAtSpeed = void 0),
                    this.mixer.setMuted(U.ChannelType.Effect, !1),
                    this.mixer.setMuted(U.ChannelType.Ambient, !1)));
              }));
          }
          async onGameEnd(e, t, i, r) {
            var s = !t.defeated || e.alliances.getAllies(t).some((e) => !e.defeated);
            let [a] = this.jsxRenderer.render(
              g.jsx(l.GameResultPopup, {
                type: s && !t.isObserver ? l.GameResultType.MpVictory : l.GameResultType.MpDefeat,
                viewport: this.viewport.value,
              }),
            );
            (this.pointer.setVisible(!1),
              this.playerUi.dispose(),
              this.gservCon.onClose.unsubscribe(this.onGservClose),
              this.gservCon.close(),
              this.uiScene.add(a),
              t.isObserver || i.play(s ? "EVA_YouAreVictorious" : "EVA_YouHaveLost", !0),
              r.finish(e.currentTick),
              this.saveReplay(r),
              this.isSinglePlayer ||
                this.sendGameRes(e, {
                  disconnect: !1,
                  desync: !1,
                  quit: !1,
                  finished: !e.alliances.getHostilePlayers().length,
                }),
              t.isObserver || this.logGame(e, s),
              await u.sleep(5e3),
              this.uiScene.remove(a),
              a.destroy(),
              this.controller?.goToScreen(n.ScreenType.MainMenuRoot, {
                route: new me.MainMenuRoute(o.ScreenType.Score, {
                  game: e,
                  localPlayer: t,
                  isQuit: !1,
                  singlePlayer: this.isSinglePlayer,
                  tournament: this.isTournament,
                  returnTo: this.returnTo ?? new me.MainMenuRoute(o.ScreenType.Home),
                }),
              }));
          }
          logGame(e, t) {
            window.gtag?.("event", "game_finish", {
              singlePlayer: Number(this.isSinglePlayer),
              numPlayers:
                e.gameOpts.humanPlayers.filter((e) => e.countryId !== pe.OBS_COUNTRY_ID).length +
                e.gameOpts.aiPlayers.filter((e) => !!e).length,
              won: Number(t),
              tournament: Number(this.isTournament),
              duration: e.currentTime,
            });
          }
          async onLeave() {
            (this.pointer.unlock(),
              this.gameAnimationLoop &&
                (this.gameAnimationLoop.destroy(), (this.gameAnimationLoop = void 0), this.uiAnimationLoop.start()),
              this.hud && (this.uiScene.remove(this.hud), this.hud.destroy(), (this.hud = void 0)),
              this.gameTurnMgr?.dispose(),
              (this.gameTurnMgr = void 0),
              this.disposables.dispose(),
              this.isSinglePlayer ||
                (this.wolService.setAutoReconnect(!1),
                this.gservCon.onClose.unsubscribe(this.onGservClose),
                this.gservCon.close()));
          }
          handleGservConError(t) {
            if (!(t instanceof K.OperationCanceledError)) {
              let e;
              if (t instanceof s.GservError && t.code === s.GservError.Code.InstanceNonExistent)
                e = this.strings.get("WOL:InstanceNotFound");
              else if (t instanceof s.GservError && t.code === s.GservError.Code.BadLogin)
                e = this.strings.get("TXT_BADPASS");
              else if (t instanceof s.GservError && t.code === s.GservError.Code.AlreadyLoggedIn)
                e = this.strings.get("WOL:AlreadyLoggedIn");
              else if (t instanceof s.GservError && t.code === s.GservError.Code.OutdatedClient)
                e = this.strings.get("TXT_YOURGAME_OUTDATED");
              else if (t instanceof s.GservError && t.code === s.GservError.Code.TooManyLoginAttempts)
                e = this.strings.get("WOL:TooManyLoginAttempts");
              else if (t instanceof s.GservError && t.code === s.GservError.Code.CreatedTooManyInstances)
                e = this.strings.get("WOL:CreatedTooManyInstances");
              else if (t instanceof s.GservError && t.code === s.GservError.Code.InstanceNotAllowed)
                e = this.strings.get("WOL:InstanceNotAllowed");
              else if (t instanceof s.GservError && t.code === s.GservError.Code.InstanceAlreadyStarted)
                e = this.strings.get("WOL:GameAlreadyStarted");
              else if (t instanceof s.GservError && t.code === s.GservError.Code.InstanceVersMismatch)
                e = this.strings.get("TXT_MISMATCH");
              else {
                if (t instanceof z.IrcConnection.SocketError) return;
                t instanceof z.IrcConnection.ConnectError
                  ? (e = this.strings.get("TS:ConnectFailed"))
                  : ((e = this.strings.get("WOL:MatchBadParameters")),
                    t instanceof s.GservError
                      ? this.sendDebugInfo(new Error("Gserv error " + t.code, { cause: t }))
                      : t instanceof z.IrcConnection.NoReplyError ||
                        this.sendDebugInfo(
                          new Error(`Failed to connect to game instance (${t.message ?? t.name})`, { cause: t }),
                        ));
              }
              this.handleError(t, e);
            }
          }
          handleMapLoadError(t, i) {
            if (!(t instanceof K.OperationCanceledError || t instanceof z.IrcConnection.SocketError)) {
              let e;
              ((e =
                t instanceof ie.DownloadError
                  ? 404 === t.statusCode
                    ? this.strings.get("TS:MapNotFound", i)
                    : this.strings.get("TS:MapDownloadFailed", i)
                  : ("string" == typeof t ? t : t.message)?.match(/memory|allocation/i)
                    ? this.strings.get("TS:GameInitOom")
                    : t instanceof z.IrcConnection.NoReplyError
                      ? this.strings.get("TS:MapDownloadFailed", i)
                      : this.strings.get("TXT_MAP_ERROR")),
                this.handleError(t, e));
            }
          }
          handleGameLoadError(i, r, s) {
            if (!(i instanceof K.OperationCanceledError || i instanceof z.IrcConnection.SocketError)) {
              let t;
              if (i instanceof ie.DownloadError) t = this.strings.get("TS:AssetLoadError");
              else if (i instanceof se.IOError) t = this.strings.get("ts:storage_io_error");
              else {
                let e = "string" == typeof i ? i : i.message;
                if (e?.match(/memory|allocation/i)) t = this.strings.get("TS:GameInitOom");
                else {
                  ((t = this.strings.get("TS:GameInitError")),
                    s.mapOfficial || (t += "\n\n" + this.strings.get("TS:CustomMapCrash")));
                  let e = new N.Replay();
                  (e.init(r.gameId, r.timestamp, s, this.engineVersion, this.engineModHash),
                    (e.debugInfo = i instanceof Error ? i.stack : i),
                    e.finish(0),
                    this.sendDebugInfo(
                      new Error(`Game init failed (${"string" == typeof i ? i : (i.message ?? i.name)})`, { cause: i }),
                      { gameId: r.gameId, replay: e, map: this.debugMapFile, official: s.mapOfficial },
                    ));
                }
              }
              this.handleError(i, t);
            }
          }
          handleGameError(e, t, i, r, s) {
            const a = this.replay;
            (a &&
              ((a.name += " (crashdump)"),
              (a.debugInfo = e instanceof Error ? e.stack : e),
              "desync_error" === e &&
                (a.debugInfo +=
                  "\nConstants: " +
                  [Math.E, Math.LN10, Math.LN2, Math.LOG10E, Math.LOG2E, Math.PI, Math.SQRT1_2, Math.SQRT2].join(",")),
              a.finish(i.currentTick),
              this.saveReplay(a)),
              this.handleError(e, t, s),
              this.sendDebugInfo(
                e,
                { gameId: i.id, replay: a, map: this.debugMapFile, official: i.gameOpts.mapOfficial },
                r,
              ),
              "desync_error" === e && this.sendGameRes(i, { disconnect: !1, desync: !0, quit: !1, finished: !1 }));
          }
          sendDebugInfo(t, { gameId: i, replay: r, map: s, official: a } = {}, n) {
            this.sentry &&
              !t.message?.match(/out of memory|buffer allocation|WebGLRenderingContext/i) &&
              (async () => {
                let e = n ? await n() : void 0;
                this.sentry.captureException(t, (t) => {
                  if (
                    (i && t.setTag("gameId", i),
                    t.setTag("nick", this.playerName),
                    t.setTag("tournament", this.isTournament),
                    e?.stateDump && t.addAttachment({ filename: "statedump.7z", data: e.stateDump }),
                    e?.debugLog && t.addAttachment({ filename: "lockstep_log.7z", data: e.debugLog }),
                    r)
                  )
                    try {
                      t.addAttachment({ filename: r.name + N.Replay.extension, data: r.serialize() });
                    } catch (e) {
                      t.setExtra("replayError", e);
                    }
                  return (
                    s &&
                      (t.addAttachment({ filename: s.filename, data: s.getBytes() }), t.setTag("mapName", s.filename)),
                    void 0 !== a && t.setTag("officialMap", a),
                    t
                  );
                });
              })().catch((e) => console.error("Failed sending error to sentry", e));
          }
          handleError(e, t, i) {
            (this.gameTurnMgr && this.gameTurnMgr.setErrorState(), this.pointer.unlock());
            let r = () => {
              (this.wolService.closeWolConnection(),
                !this.isSinglePlayer &&
                  this.gservCon.isOpen() &&
                  (this.gservCon.onClose.unsubscribe(this.onGservClose), this.gservCon.close()));
            };
            (this.errorHandler.handle(
              e,
              t,
              i
                ? void 0
                : () => {
                    (r(), this.controller?.goToScreen(n.ScreenType.MainMenuRoot));
                  },
            ),
              i && (r(), this.playerUi?.dispose()));
          }
          saveReplay(t) {
            (async () => {
              try {
                await this.replayManager.saveReplay(t);
              } catch (e) {
                (e instanceof i.StorageQuotaError ||
                  e instanceof se.IOError ||
                  e instanceof r.FileNotFoundError ||
                  e instanceof oe.ReplayStorageError ||
                  this.sendDebugInfo(e, { replay: t, gameId: this.game?.id }),
                  console.error(e),
                  this.toastApi.push(this.strings.get("GUI:SaveReplayError")));
              }
            })();
          }
          sendGameRes(i, r) {
            (async () => {
              if (this.wgameresService.getUrl())
                try {
                  let e = new ge.GameRes().fromGame(i, this.isTournament, this.getGameResClientInfo(r));
                  var t = e.toBinary();
                  await this.wgameresService.sendGameResPacket(t);
                } catch (e) {
                  console.error(e);
                }
            })();
          }
          getGameResClientInfo(e) {
            return {
              clientVers: this.engineVersion,
              avgFps: 0,
              avgRtt: this.avgPing.calculate() ?? 0,
              outOfSync: e.desync,
              gameSku: this.wolService.getConfig().getClientSku(),
              accountName: this.playerName,
              suddenDisconnect: e.disconnect,
              quit: e.quit,
              finished: e.finished,
              pingsRecv: 0,
              pingsSent: 0,
            };
          }
        }),
          e("GameScreen", Se));
      },
    };
  },
);
