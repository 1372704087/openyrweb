// === Reconstructed SystemJS module: gui/screen/replay/ReplayScreen ===
// deps: ["engine/Engine","gui/screen/game/component/hud/viewmodel/SidebarModel","tools/DevToolsApi","engine/GameAnimationLoop","util/disposable/CompositeDisposable","gui/screen/game/SoundHandler","gui/screen/game/worldInteraction/WorldInteractionFactory","gui/screen/game/ObserverUi","gui/screen/game/GameMenu","gui/screen/game/WorldView","engine/sound/Eva","engine/sound/EvaSpecs","gui/screen/game/HudFactory","gui/screen/game/component/Minimap","game/SideType","network/gamestate/ReplayTurnManager","game/action/ActionFactory","game/action/ActionFactoryReg","gui/screen/game/component/hud/viewmodel/MessageList","engine/sound/Music","network/gamestate/replay/ChatMessageReplayEvent","engine/sound/SoundKey","engine/sound/ChannelType","network/gamestate/replay/TauntReplayEvent","gui/screen/game/TauntPlayback","gui/screen/game/component/hud/commandBar/CommandBarButtonType","util/userAgent","gui/screen/RootScreen","gui/screen/game/loadingScreen/LoadingScreenApiFactory","data/MapFile","engine/ResourceLoader","engine/MapDigest","gui/chat/ChatHistory"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/replay/ReplayScreen",
  [
    "engine/Engine",
    "gui/screen/game/component/hud/viewmodel/SidebarModel",
    "tools/DevToolsApi",
    "engine/GameAnimationLoop",
    "util/disposable/CompositeDisposable",
    "gui/screen/game/SoundHandler",
    "gui/screen/game/worldInteraction/WorldInteractionFactory",
    "gui/screen/game/ObserverUi",
    "gui/screen/game/GameMenu",
    "gui/screen/game/WorldView",
    "engine/sound/Eva",
    "engine/sound/EvaSpecs",
    "gui/screen/game/HudFactory",
    "gui/screen/game/component/Minimap",
    "game/SideType",
    "network/gamestate/ReplayTurnManager",
    "game/action/ActionFactory",
    "game/action/ActionFactoryReg",
    "gui/screen/game/component/hud/viewmodel/MessageList",
    "engine/sound/Music",
    "network/gamestate/replay/ChatMessageReplayEvent",
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "network/gamestate/replay/TauntReplayEvent",
    "gui/screen/game/TauntPlayback",
    "gui/screen/game/component/hud/commandBar/CommandBarButtonType",
    "util/userAgent",
    "gui/screen/RootScreen",
    "gui/screen/game/loadingScreen/LoadingScreenApiFactory",
    "data/MapFile",
    "engine/ResourceLoader",
    "engine/MapDigest",
    "gui/chat/ChatHistory",
  ],
  function (e, t) {
    "use strict";
    var E, C, x, l, A, m, f, y, T, O, c, h, M, R, u, P, I, k, B, d, N, v, b, j, L, D, S, i, F, _, U, H, G, r;
    t && t.id;
    return {
      setters: [
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
          l = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          m = e;
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
          O = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          u = e;
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
          d = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
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
          S = e;
        },
        function (e) {
          i = e;
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
      ],
      execute: function () {
        ((r = class extends i.RootScreen {
          constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f, y, T, v, b, S, w, E, C, x, O) {
            (super(),
              (this.engineVersion = e),
              (this.engineModHash = t),
              (this.errorHandler = i),
              (this.gameMenuSubScreens = r),
              (this.loadingScreenApiFactory = s),
              (this.config = a),
              (this.strings = n),
              (this.renderer = o),
              (this.uiScene = l),
              (this.runtimeVars = c),
              (this.messageBoxApi = h),
              (this.uiAnimationLoop = u),
              (this.viewport = d),
              (this.jsxRenderer = g),
              (this.pointer = p),
              (this.sound = m),
              (this.music = f),
              (this.keyBinds = y),
              (this.generalOptions = T),
              (this.actionLogger = v),
              (this.fullScreen = b),
              (this.mapFileLoader = S),
              (this.gameLoader = w),
              (this.vxlGeometryPool = E),
              (this.buildingImageDataCache = C),
              (this.leaveAction = x),
              (this.battleControlApi = O),
              (this.preventUnload = !0),
              (this.disposables = new A.CompositeDisposable()));
          }
          async onEnter(p) {
            ((this.params = p),
              this.disposables.add(() => (this.params = void 0)),
              this.pointer.lock(),
              this.pointer.setVisible(!1),
              await this.music?.play(d.MusicType.Loading));
            var { gameId: m, gameTimestamp: f, gameOpts: y, engineVersion: T, modHash: v } = p.replay;
            let e;
            if (
              (T !== this.engineVersion
                ? (e = this.strings.get("GUI:ReplayVersionMismatch", T))
                : v !== this.engineModHash && (e = this.strings.get("GUI:ReplayModMismatch")),
              e)
            )
              this.messageBoxApi.show(e, this.strings.get("GUI:Ok"), () => {
                this.leaveAction();
              });
            else {
              T = this.loadingScreenApiFactory.create(F.LoadingScreenType.Replay);
              ((this.loadingScreenApi = T), this.disposables.add(T, () => (this.loadingScreenApi = void 0)));
              let e;
              v = y.mapName;
              try {
                var b = await this.mapFileLoader.load(v);
                if (H.MapDigest.compute(b) !== y.mapDigest)
                  return void this.handleError("Map digest mismatch", this.strings.get("TS:MapMismatch", v));
                var S = new _.MapFile(b);
                e = await this.gameLoader.load(m, f, y, S, void 0, 1 === y.humanPlayers.length, T);
              } catch (e) {
                let t;
                return (
                  e.message?.match(/memory|allocation/i)
                    ? (t = this.strings.get("TS:GameInitOom"))
                    : e instanceof U.DownloadError
                      ? (t = this.strings.get("TS:MapNotFound", v))
                      : ((t = this.strings.get("TS:GameInitError")),
                        y.mapOfficial || (t += "\n\n" + this.strings.get("TS:CustomMapCrash"))),
                  void this.handleError(e, t)
                );
              }
              let { game: s, theater: t, hudSide: i, cameoFilenames: r } = e;
              ((this.game = s),
                (this.baseSpeed = this.game.speed.value),
                this.disposables.add(() => (this.game = void 0)),
                this.disposables.add(() => {
                  (E.Engine.unloadTheater(t.type), this.gameLoader.clearStaticCaches());
                }),
                this.disposables.add(s));
              T = new C.SidebarModel(s, p.replay);
              let a = new B.MessageList(s.rules.audioVisual.messageDuration, 6, void 0);
              v = new G.ChatHistory();
              ((this.sidebarModel = T),
                this.disposables.add(() => (this.sidebarModel = void 0)),
                (this.messageList = a),
                this.disposables.add(() => (this.messageList = void 0)));
              y = [
                D.CommandBarButtonType.ReplayRewind,
                D.CommandBarButtonType.ReplayPlay,
                D.CommandBarButtonType.ReplayPause,
                D.CommandBarButtonType.ReplaySpeed,
              ];
              ((this.hudFactory = new M.HudFactory(
                i,
                this.uiScene,
                T,
                a,
                v,
                s.debugText,
                this.runtimeVars.debugText,
                void 0,
                s.getCombatants(),
                s.stalemateDetectTrait,
                s.countdownTimer,
                r,
                this.jsxRenderer,
                this.strings,
                y,
              )),
                this.disposables.add(() => (this.hudFactory = void 0)));
              let n = this.hudFactory.create();
              this.hud = n;
              let o = (this.minimap = new R.Minimap(s, void 0, n.getTextColor(), s.rules.general.radar));
              (n.setMinimap(o),
                this.disposables.add(o, () => (this.minimap = void 0)),
                o.setPointerEvents(this.pointer.pointerEvents));
              y = { width: n.sidebarWidth, height: n.actionBarHeight };
              let l = new O.WorldView(
                  y,
                  s,
                  this.sound,
                  this.renderer,
                  this.runtimeVars,
                  o,
                  this.strings,
                  this.generalOptions,
                  this.vxlGeometryPool,
                  this.buildingImageDataCache,
                ),
                { worldScene: c, worldSound: h, renderableManager: u } = l.init(void 0, this.viewport.value, t);
              ((this.worldView = l), this.disposables.add(l, () => (this.worldView = void 0)), c.create3DObject());
              y = new I.ActionFactory();
              new k.ActionFactoryReg().register(y, s, void 0);
              let d = (this.gameTurnMgr = new P.ReplayTurnManager(s, p.replay, y, this.actionLogger));
              this.gameTurnMgr.init();
              let g = new L.TauntPlayback(this.sound.audioSystem, E.Engine.getTaunts());
              const w = (t) => {
                if (t instanceof N.ChatMessageReplayEvent) {
                  var i = t.payload;
                  let e = s.getPlayer(i.playerId);
                  var r = this.strings.get("TS:ReplayChatFrom", e.name) + " " + i.message,
                    i = e.color.asHexString();
                  a.addChatMessage(r, i);
                } else
                  t instanceof j.TauntReplayEvent &&
                    ((r = t.payload),
                    (i = s.getPlayer(r.playerId)),
                    (r = r.tauntNo),
                    g.playTaunt(i, r).catch((e) => console.error(e)));
              };
              (d.onReplayEvent.subscribe(w),
                this.disposables.add(() => d.onReplayEvent.unsubscribe(w)),
                this.onGameStart(s, o, a, c, h, u),
                x.DevToolsApi.registerCommand("reset", async () => {
                  (await this.onLeave(), await this.onEnter(p));
                }),
                x.DevToolsApi.registerVar("speed", s.desiredSpeed),
                this.disposables.add(
                  () => x.DevToolsApi.unregisterCommand("reset"),
                  () => x.DevToolsApi.unregisterVar("speed"),
                ));
            }
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
                this.worldView &&
                  (this.uiScene.add(e),
                  this.menu?.handleHudChange(e),
                  this.worldView.handleViewportChange(this.viewport.value),
                  this.playerUi?.handleHudChange(e),
                  this.initHudEvents(e, this.messageList)));
            }
          }
          onGameStart(i, e, t, r, s, a) {
            (this.loadingScreenApi?.dispose(), this.music?.play(d.MusicType.Normal));
            var n = new h.EvaSpecs(u.SideType.GDI).readIni(E.Engine.getIni(E.Engine.getFileNameVariant("eva.ini")));
            let o = new c.Eva(n, this.sound, this.renderer);
            (o.init(), this.disposables.add(o));
            try {
              this.initUi(i, r, s, o, a, e, t);
            } catch (e) {
              n = e.message?.match(/memory|allocation/i)
                ? this.strings.get("TS:GameInitOom")
                : this.strings.get("TS:GameInitError");
              return void this.handleError(e, n);
            }
            (this.renderer.removeScene(this.uiScene),
              this.renderer.addScene(r),
              this.renderer.addScene(this.uiScene),
              this.pointer.setVisible(!0),
              i.start(),
              (this.gameAnimationLoop = new l.GameAnimationLoop(void 0, this.renderer, this.sound, this.gameTurnMgr, {
                skipFrames: !0,
                skipBudgetMillis: 8,
                onError: this.config.devMode
                  ? void 0
                  : (e, t) =>
                      this.handleError(
                        e,
                        this.strings.get("TS:GameCrashed") +
                          (t || i.gameOpts.mapOfficial ? "" : "\n\n" + this.strings.get("TS:CustomMapCrash")),
                        t,
                      ),
              })),
              this.uiAnimationLoop.stop(),
              this.gameAnimationLoop.start());
          }
          initUi(e, t, i, r, s, a, n) {
            let o = new m.SoundHandler(e, i, r, this.sound, e.events, n, this.strings, void 0);
            if (
              (o.init(),
              this.disposables.add(o),
              n.onNewMessage.subscribe((e) => {
                e.animate && this.sound.play(v.SoundKey.IncomingMessage, b.ChannelType.Ui);
              }),
              S.isIpad())
            ) {
              let e = (e) => {
                this.sidebarModel.topTextLeftAlign = e;
              };
              (this.fullScreen.onChange.subscribe(e),
                this.disposables.add(() => this.fullScreen.onChange.unsubscribe(e)));
            }
            (this.uiScene.add(this.hud), this.initHudEvents(this.hud, n));
            let l = (this.menu = new T.GameMenu(this.gameMenuSubScreens, e, void 0, void 0, void 0, !0));
            (l.init(this.hud), this.initGameMenuEvents(l), this.disposables.add(l, () => (this.menu = void 0)));
            var c = e.getUnitSelection(),
              h = this.runtimeVars.freeCamera,
              u = this.runtimeVars.debugPaths,
              d = this.runtimeVars.debugText,
              g = this.config.devMode,
              g = new f.WorldInteractionFactory(
                void 0,
                e,
                c,
                s,
                this.uiScene,
                t,
                this.pointer,
                this.renderer,
                this.keyBinds,
                this.generalOptions,
                h,
                u,
                g,
                document,
                a,
                this.strings,
                this.hud.getTextColor(),
                d,
                this.battleControlApi,
              ),
              d = this.config.discordUrl;
            let p = (this.playerUi = new y.ObserverUi(
              e,
              void 0,
              this.sidebarModel,
              this.params.replay,
              this.renderer,
              t,
              this.sound,
              g,
              l,
              this.runtimeVars,
              this.strings,
              s,
              this.messageBoxApi,
              d,
            ));
            (p.onPlayerChange.subscribe(({ player: e, sidebarModel: t }) => {
              ((this.sidebarModel = t),
                this.rerenderHud(),
                this.worldView?.changeLocalPlayer(e),
                this.minimap.changeLocalPlayer(e));
            }),
              this.playerUi.init(this.hud),
              this.disposables.add(this.playerUi, () => (this.playerUi = void 0)));
          }
          initGameMenuEvents(e) {
            (e.onOpen.subscribe(() => {
              (this.pointer.unlock(), this.playerUi.worldInteraction.setEnabled(!1));
            }),
              e.onQuit.subscribe(async () => {
                (this.playerUi.dispose(), this.gameTurnMgr.dispose(), this.leaveAction());
              }),
              e.onCancel.subscribe(() => {
                (this.pointer.lock(), this.playerUi.worldInteraction.setEnabled(!0));
              }));
          }
          initHudEvents(e, t) {
            e.onCommandBarButtonClick.subscribe((e) => {
              switch ((this.sound.play(v.SoundKey.GenericClick, b.ChannelType.Ui), e)) {
                case D.CommandBarButtonType.ReplayRewind:
                  (async () => {
                    var e = this.params;
                    (await this.onLeave(), await this.onEnter(e));
                  })().catch((e) => console.error(e));
                  break;
                case D.CommandBarButtonType.ReplayPlay:
                  ((this.game.desiredSpeed.value = this.baseSpeed),
                    this.game.speed.value === Number.EPSILON
                      ? this.gameTurnMgr.doGameTurn(performance.now())
                      : this.game.speed.value !== this.baseSpeed &&
                        t.addSystemMessage(this.strings.get("TS:ReplaySpeedConfirm", "1x"), "grey"));
                  break;
                case D.CommandBarButtonType.ReplayPause:
                  this.game.desiredSpeed.value = Number.EPSILON;
                  break;
                case D.CommandBarButtonType.ReplaySpeed: {
                  this.game.speed.value === Number.EPSILON &&
                    ((this.game.desiredSpeed.value = this.baseSpeed), this.gameTurnMgr.doGameTurn(performance.now()));
                  let e = Math.floor(this.game.desiredSpeed.value / this.baseSpeed);
                  ((e = 16 === e ? 1 : 2 * e),
                    (this.game.desiredSpeed.value = e * this.baseSpeed),
                    t.addSystemMessage(this.strings.get("TS:ReplaySpeedConfirm", e + "x"), "grey"));
                  break;
                }
                default:
                  console.warn("Unhandled command type " + e);
              }
            });
          }
          async onLeave() {
            (this.pointer.unlock(),
              this.gameAnimationLoop &&
                (this.gameAnimationLoop.destroy(), (this.gameAnimationLoop = void 0), this.uiAnimationLoop.start()),
              this.hud && (this.uiScene.remove(this.hud), this.hud.destroy(), (this.hud = void 0)),
              this.gameTurnMgr?.dispose(),
              (this.gameTurnMgr = void 0),
              this.disposables.dispose());
          }
          handleError(e, t, i) {
            (this.gameTurnMgr && this.gameTurnMgr.setErrorState(),
              this.pointer.unlock(),
              this.errorHandler.handle(
                e,
                t,
                i
                  ? void 0
                  : () => {
                      this.leaveAction();
                    },
              ),
              i && this.playerUi?.dispose());
          }
        }),
          e("ReplayScreen", r));
      },
    };
  },
);
