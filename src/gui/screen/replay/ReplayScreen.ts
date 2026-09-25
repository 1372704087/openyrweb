/**
 * ReplayScreen — 回放根屏幕（加载回放并驱动观战 HUD）。
 *
 * 版本/mod 校验 → 加载地图与对局 → HUD/世界/回放回合管理；
 * 命令栏：Rewind/Play/Pause/Speed。preventUnload=true。
 *
 * 由 gui/screen/replay/ReplayScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { Engine } from "engine/Engine"; // 已转换
import { SidebarModel } from "gui/screen/game/component/hud/viewmodel/SidebarModel"; // 已转换
import { DevToolsApi } from "tools/DevToolsApi"; // 已转换
import { GameAnimationLoop } from "engine/GameAnimationLoop"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { SoundHandler } from "gui/screen/game/SoundHandler"; // 已转换
import { WorldInteractionFactory } from "gui/screen/game/worldInteraction/WorldInteractionFactory"; // 已转换
import { ObserverUi } from "gui/screen/game/ObserverUi"; // 已转换
import { GameMenu } from "gui/screen/game/GameMenu"; // 已转换
import { WorldView } from "gui/screen/game/WorldView"; // 已转换
import { Eva } from "engine/sound/Eva"; // 已转换
import { EvaSpecs } from "engine/sound/EvaSpecs"; // 已转换
import { HudFactory } from "gui/screen/game/HudFactory"; // 已转换
import { Minimap } from "gui/screen/game/component/Minimap"; // 已转换
import { SideType } from "game/SideType"; // 已转换
import { ReplayTurnManager } from "network/gamestate/ReplayTurnManager"; // 已转换
import { ActionFactory } from "game/action/ActionFactory"; // 已转换
import { ActionFactoryReg } from "game/action/ActionFactoryReg"; // 已转换
import { MessageList } from "gui/screen/game/component/hud/viewmodel/MessageList"; // 已转换
import { MusicType } from "engine/sound/Music"; // 已转换
import { ChatMessageReplayEvent } from "network/gamestate/replay/ChatMessageReplayEvent"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { TauntReplayEvent } from "network/gamestate/replay/TauntReplayEvent"; // 已转换
import { TauntPlayback } from "gui/screen/game/TauntPlayback"; // 已转换
import { CommandBarButtonType } from "gui/screen/game/component/hud/commandBar/CommandBarButtonType"; // 已转换
import { isIpad } from "util/userAgent"; // 已转换
import { RootScreen } from "gui/screen/RootScreen"; // 孪生（本组内一并转换）
import { LoadingScreenApiFactory, LoadingScreenType } from "gui/screen/game/loadingScreen/LoadingScreenApiFactory"; // 已转换
import { MapFile } from "data/MapFile"; // 已转换
import { DownloadError } from "engine/ResourceLoader"; // 已转换
import { MapDigest } from "engine/MapDigest"; // 已转换
import { ChatHistory } from "gui/chat/ChatHistory"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ReplayScreen extends RootScreen {
  engineVersion: any;
  engineModHash: any;
  errorHandler: any;
  gameMenuSubScreens: any;
  loadingScreenApiFactory: any;
  config: any;
  strings: any;
  renderer: any;
  uiScene: any;
  runtimeVars: any;
  messageBoxApi: any;
  uiAnimationLoop: any;
  viewport: any;
  jsxRenderer: any;
  pointer: any;
  sound: any;
  music: any;
  keyBinds: any;
  generalOptions: any;
  actionLogger: any;
  fullScreen: any;
  mapFileLoader: any;
  gameLoader: any;
  vxlGeometryPool: any;
  buildingImageDataCache: any;
  leaveAction: any;
  battleControlApi: any;
  preventUnload: boolean;
  disposables: CompositeDisposable;
  params?: any;
  loadingScreenApi?: any;
  game?: any;
  baseSpeed?: any;
  sidebarModel?: any;
  messageList?: any;
  hudFactory?: any;
  hud?: any;
  minimap?: any;
  worldView?: any;
  gameTurnMgr?: any;
  gameAnimationLoop?: any;
  menu?: any;
  playerUi?: any;

  constructor(
    engineVersion: any,
    engineModHash: any,
    errorHandler: any,
    gameMenuSubScreens: any,
    loadingScreenApiFactory: any,
    config: any,
    _unusedUiSubScreens: any,
    strings: any,
    renderer: any,
    uiScene: any,
    runtimeVars: any,
    messageBoxApi: any,
    uiAnimationLoop: any,
    viewport: any,
    jsxRenderer: any,
    pointer: any,
    sound: any,
    music: any,
    keyBinds: any,
    generalOptions: any,
    actionLogger: any,
    fullScreen: any,
    mapFileLoader: any,
    gameLoader: any,
    vxlGeometryPool: any,
    buildingImageDataCache: any,
    leaveAction: any,
    battleControlApi: any,
  ) {
    super();
    this.engineVersion = engineVersion;
    this.engineModHash = engineModHash;
    this.errorHandler = errorHandler;
    this.gameMenuSubScreens = gameMenuSubScreens;
    this.loadingScreenApiFactory = loadingScreenApiFactory;
    this.config = config;
    this.strings = strings;
    this.renderer = renderer;
    this.uiScene = uiScene;
    this.runtimeVars = runtimeVars;
    this.messageBoxApi = messageBoxApi;
    this.uiAnimationLoop = uiAnimationLoop;
    this.viewport = viewport;
    this.jsxRenderer = jsxRenderer;
    this.pointer = pointer;
    this.sound = sound;
    this.music = music;
    this.keyBinds = keyBinds;
    this.generalOptions = generalOptions;
    this.actionLogger = actionLogger;
    this.fullScreen = fullScreen;
    this.mapFileLoader = mapFileLoader;
    this.gameLoader = gameLoader;
    this.vxlGeometryPool = vxlGeometryPool;
    this.buildingImageDataCache = buildingImageDataCache;
    this.leaveAction = leaveAction;
    this.battleControlApi = battleControlApi;
    this.preventUnload = true;
    this.disposables = new CompositeDisposable();
  }

  async onEnter(params: any): Promise<void> {
    this.params = params;
    this.disposables.add(() => (this.params = void 0));
    this.pointer.lock();
    this.pointer.setVisible(false);
    await this.music?.play(MusicType.Loading);
    var { gameId, gameTimestamp, gameOpts, engineVersion, modHash } =
      params.replay;
    let mismatch: string | undefined;
    if (engineVersion !== this.engineVersion)
      mismatch = this.strings.get(
        "GUI:ReplayVersionMismatch",
        engineVersion,
      );
    else if (modHash !== this.engineModHash)
      mismatch = this.strings.get("GUI:ReplayModMismatch");
    if (mismatch) {
      this.messageBoxApi.show(mismatch, this.strings.get("GUI:Ok"), () => {
        this.leaveAction();
      });
      return;
    }
    const loadingApi = this.loadingScreenApiFactory.create(
      LoadingScreenType.Replay,
    );
    this.loadingScreenApi = loadingApi;
    this.disposables.add(loadingApi, () => (this.loadingScreenApi = void 0));
    let loaded: any;
    const mapName = gameOpts.mapName;
    try {
      var bytes = await this.mapFileLoader.load(mapName);
      if (MapDigest.compute(bytes) !== gameOpts.mapDigest) {
        this.handleError(
          "Map digest mismatch",
          this.strings.get("TS:MapMismatch", mapName),
        );
        return;
      }
      var mapFile = new MapFile(bytes);
      loaded = await this.gameLoader.load(
        gameId,
        gameTimestamp,
        gameOpts,
        mapFile,
        void 0,
        1 === gameOpts.humanPlayers.length,
        loadingApi,
      );
    } catch (e: any) {
      let message: string;
      if (e.message?.match(/memory|allocation/i))
        message = this.strings.get("TS:GameInitOom");
      else if (e instanceof DownloadError)
        message = this.strings.get("TS:MapNotFound", mapName);
      else {
        message = this.strings.get("TS:GameInitError");
        if (!gameOpts.mapOfficial)
          message += "\n\n" + this.strings.get("TS:CustomMapCrash");
      }
      this.handleError(e, message);
      return;
    }
    let { game, theater, hudSide, cameoFilenames } = loaded;
    this.game = game;
    this.baseSpeed = this.game.speed.value;
    this.disposables.add(() => (this.game = void 0));
    this.disposables.add(() => {
      Engine.unloadTheater(theater.type);
      this.gameLoader.clearStaticCaches();
    });
    this.disposables.add(game);
    const sidebar = new SidebarModel(game, params.replay);
    let messages = new MessageList(
      game.rules.audioVisual.messageDuration,
      6,
      void 0,
    );
    const chatHistory = new ChatHistory();
    this.sidebarModel = sidebar;
    this.disposables.add(() => (this.sidebarModel = void 0));
    this.messageList = messages;
    this.disposables.add(() => (this.messageList = void 0));
    const cmdButtons = [
      CommandBarButtonType.ReplayRewind,
      CommandBarButtonType.ReplayPlay,
      CommandBarButtonType.ReplayPause,
      CommandBarButtonType.ReplaySpeed,
    ];
    this.hudFactory = new HudFactory(
      hudSide,
      this.uiScene,
      sidebar,
      messages,
      chatHistory,
      game.debugText,
      this.runtimeVars.debugText,
      void 0,
      game.getCombatants(),
      game.stalemateDetectTrait,
      game.countdownTimer,
      cameoFilenames,
      this.jsxRenderer,
      this.strings,
      cmdButtons,
    );
    this.disposables.add(() => (this.hudFactory = void 0));
    let hud = this.hudFactory.create();
    this.hud = hud;
    let minimap = (this.minimap = new Minimap(
      game,
      void 0,
      hud.getTextColor(),
      game.rules.general.radar,
    ));
    hud.setMinimap(minimap);
    this.disposables.add(minimap, () => (this.minimap = void 0));
    minimap.setPointerEvents(this.pointer.pointerEvents);
    const worldSize = {
      width: hud.sidebarWidth,
      height: hud.actionBarHeight,
    };
    let worldView = new WorldView(
      worldSize,
      game,
      this.sound,
      this.renderer,
      this.runtimeVars,
      minimap,
      this.strings,
      this.generalOptions,
      this.vxlGeometryPool,
      this.buildingImageDataCache,
    );
    const { worldScene, worldSound, renderableManager } = worldView.init(
      void 0,
      this.viewport.value,
      theater,
    );
    this.worldView = worldView;
    this.disposables.add(worldView, () => (this.worldView = void 0));
    worldScene.create3DObject();
    const actionFactory = new ActionFactory();
    new ActionFactoryReg().register(actionFactory, game, void 0);
    this.gameTurnMgr = new ReplayTurnManager(
      game,
      params.replay,
      actionFactory,
      this.actionLogger,
    );
    this.gameTurnMgr.init();
    const taunts = new TauntPlayback(
      this.sound.audioSystem,
      Engine.getTaunts(),
    );
    const onReplayEvent = (ev: any) => {
      if (ev instanceof ChatMessageReplayEvent) {
        var payload = ev.payload;
        let player = game.getPlayer(payload.playerId);
        var text =
          this.strings.get("TS:ReplayChatFrom", player.name) +
          " " +
          payload.message;
        var color = player.color.asHexString();
        messages.addChatMessage(text, color);
      } else if (ev instanceof TauntReplayEvent) {
        const tauntPayload = ev.payload;
        const player = game.getPlayer(tauntPayload.playerId);
        const no = tauntPayload.tauntNo;
        taunts.playTaunt(player, no).catch((e) => console.error(e));
      }
    };
    this.gameTurnMgr.onReplayEvent.subscribe(onReplayEvent);
    this.disposables.add(() =>
      this.gameTurnMgr.onReplayEvent.unsubscribe(onReplayEvent),
    );
    this.onGameStart(
      game,
      minimap,
      messages,
      worldScene,
      worldSound,
      renderableManager,
    );
    DevToolsApi.registerCommand("reset", async () => {
      await this.onLeave();
      await this.onEnter(params);
    });
    DevToolsApi.registerVar("speed", game.desiredSpeed);
    this.disposables.add(
      () => DevToolsApi.unregisterCommand("reset"),
      () => DevToolsApi.unregisterVar("speed"),
    );
  }

  onViewportChange(): void {
    this.loadingScreenApi?.updateViewport();
    this.rerenderHud();
  }

  rerenderHud(): void {
    if (!this.hud) return;
    this.uiScene.remove(this.hud);
    this.hud.destroy();
    this.hudFactory.setSidebarModel(this.sidebarModel);
    let hud = this.hudFactory.create();
    this.hud = hud;
    hud.setMinimap(this.minimap);
    if (this.worldView) {
      this.uiScene.add(hud);
      this.menu?.handleHudChange(hud);
      this.worldView.handleViewportChange(this.viewport.value);
      this.playerUi?.handleHudChange(hud);
      this.initHudEvents(hud, this.messageList);
    }
  }

  onGameStart(
    game: any,
    minimap: any,
    messages: any,
    worldScene: any,
    worldSound: any,
    renderableManager: any,
  ): void {
    this.loadingScreenApi?.dispose();
    void this.music?.play(MusicType.Normal);
    var evaIni = new EvaSpecs(SideType.GDI).readIni(
      Engine.getIni(Engine.getFileNameVariant("eva.ini")),
    );
    let eva = new Eva(evaIni, this.sound, this.renderer);
    eva.init();
    this.disposables.add(eva);
    try {
      this.initUi(
        game,
        worldScene,
        worldSound,
        eva,
        renderableManager,
        minimap,
        messages,
      );
    } catch (e: any) {
      const message = e.message?.match(/memory|allocation/i)
        ? this.strings.get("TS:GameInitOom")
        : this.strings.get("TS:GameInitError");
      this.handleError(e, message);
      return;
    }
    this.renderer.removeScene(this.uiScene);
    this.renderer.addScene(worldScene);
    this.renderer.addScene(this.uiScene);
    this.pointer.setVisible(true);
    game.start();
    this.gameAnimationLoop = new GameAnimationLoop(
      void 0,
      this.renderer,
      this.sound,
      this.gameTurnMgr,
      {
        skipFrames: true,
        skipBudgetMillis: 8,
        onError: this.config.devMode
          ? void 0
          : (e: any, inGame: boolean) =>
              this.handleError(
                e,
                this.strings.get("TS:GameCrashed") +
                  (inGame || game.gameOpts.mapOfficial
                    ? ""
                    : "\n\n" + this.strings.get("TS:CustomMapCrash")),
                inGame,
              ),
      },
    );
    this.uiAnimationLoop.stop();
    this.gameAnimationLoop.start();
  }

  initUi(
    game: any,
    worldScene: any,
    worldSound: any,
    eva: any,
    renderableManager: any,
    minimap: any,
    messages: any,
  ): void {
    // 构造器形参 (game, worldSound, eva, ...)：第 2/3 参不是 worldScene/worldSound
    let soundHandler = new SoundHandler(
      game,
      worldSound,
      eva,
      this.sound,
      game.events,
      messages,
      this.strings,
      void 0,
    );
    soundHandler.init();
    this.disposables.add(soundHandler);
    messages.onNewMessage.subscribe((msg: any) => {
      if (msg.animate)
        this.sound.play(SoundKey.IncomingMessage, ChannelType.Ui);
    });
    if (isIpad()) {
      let onChange = (align: any) => {
        this.sidebarModel.topTextLeftAlign = align;
      };
      this.fullScreen.onChange.subscribe(onChange);
      this.disposables.add(() =>
        this.fullScreen.onChange.unsubscribe(onChange),
      );
    }
    this.uiScene.add(this.hud);
    this.initHudEvents(this.hud, messages);
    let menu = (this.menu = new GameMenu(
      this.gameMenuSubScreens,
      game,
      void 0,
      void 0,
      void 0,
      true,
    ));
    menu.init(this.hud);
    this.initGameMenuEvents(menu);
    this.disposables.add(menu, () => (this.menu = void 0));
    var selection = game.getUnitSelection();
    var freeCamera = this.runtimeVars.freeCamera;
    var debugPaths = this.runtimeVars.debugPaths;
    var debugText = this.runtimeVars.debugText;
    var devMode = this.config.devMode;
    const worldInteraction = new WorldInteractionFactory(
      void 0,
      game,
      selection,
      renderableManager,
      this.uiScene,
      worldScene,
      this.pointer,
      this.renderer,
      this.keyBinds,
      this.generalOptions,
      freeCamera,
      debugPaths,
      devMode,
      document,
      minimap,
      this.strings,
      this.hud.getTextColor(),
      debugText,
      this.battleControlApi,
    );
    const discordUrl = this.config.discordUrl;
    let playerUi = (this.playerUi = new ObserverUi(
      game,
      void 0,
      this.sidebarModel,
      this.params.replay,
      this.renderer,
      worldScene,
      this.sound,
      worldInteraction,
      menu,
      this.runtimeVars,
      this.strings,
      renderableManager,
      this.messageBoxApi,
      discordUrl,
    ));
    playerUi.onPlayerChange.subscribe(
      ({ player, sidebarModel }: any) => {
        this.sidebarModel = sidebarModel;
        this.rerenderHud();
        this.worldView?.changeLocalPlayer(player);
        this.minimap.changeLocalPlayer(player);
      },
    );
    this.playerUi.init(this.hud);
    this.disposables.add(this.playerUi, () => (this.playerUi = void 0));
  }

  initGameMenuEvents(menu: any): void {
    menu.onOpen.subscribe(() => {
      this.pointer.unlock();
      this.playerUi.worldInteraction.setEnabled(false);
    });
    menu.onQuit.subscribe(async () => {
      this.playerUi.dispose();
      this.gameTurnMgr.dispose();
      this.leaveAction();
    });
    menu.onCancel.subscribe(() => {
      this.pointer.lock();
      this.playerUi.worldInteraction.setEnabled(true);
    });
  }

  initHudEvents(hud: any, messages: any): void {
    hud.onCommandBarButtonClick.subscribe((cmd: any) => {
      this.sound.play(SoundKey.GenericClick, ChannelType.Ui);
      switch (cmd) {
        case CommandBarButtonType.ReplayRewind:
          (async () => {
            var p = this.params;
            await this.onLeave();
            await this.onEnter(p);
          })().catch((e) => console.error(e));
          break;
        case CommandBarButtonType.ReplayPlay:
          this.game.desiredSpeed.value = this.baseSpeed;
          if (this.game.speed.value === Number.EPSILON)
            this.gameTurnMgr.doGameTurn(performance.now());
          else if (this.game.speed.value !== this.baseSpeed)
            messages.addSystemMessage(
              this.strings.get("TS:ReplaySpeedConfirm", "1x"),
              "grey",
            );
          break;
        case CommandBarButtonType.ReplayPause:
          this.game.desiredSpeed.value = Number.EPSILON;
          break;
        case CommandBarButtonType.ReplaySpeed: {
          if (this.game.speed.value === Number.EPSILON) {
            this.game.desiredSpeed.value = this.baseSpeed;
            this.gameTurnMgr.doGameTurn(performance.now());
          }
          let mult = Math.floor(
            this.game.desiredSpeed.value / this.baseSpeed,
          );
          mult = 16 === mult ? 1 : 2 * mult;
          this.game.desiredSpeed.value = mult * this.baseSpeed;
          messages.addSystemMessage(
            this.strings.get("TS:ReplaySpeedConfirm", mult + "x"),
            "grey",
          );
          break;
        }
        default:
          console.warn("Unhandled command type " + cmd);
      }
    });
  }

  async onLeave(): Promise<void> {
    this.pointer.unlock();
    if (this.gameAnimationLoop) {
      this.gameAnimationLoop.destroy();
      this.gameAnimationLoop = void 0;
      this.uiAnimationLoop.start();
    }
    if (this.hud) {
      this.uiScene.remove(this.hud);
      this.hud.destroy();
      this.hud = void 0;
    }
    this.gameTurnMgr?.dispose();
    this.gameTurnMgr = void 0;
    this.disposables.dispose();
  }

  handleError(e: any, message: string, keepUi?: boolean): void {
    if (this.gameTurnMgr) this.gameTurnMgr.setErrorState();
    this.pointer.unlock();
    this.errorHandler.handle(
      e,
      message,
      keepUi
        ? void 0
        : () => {
            this.leaveAction();
          },
    );
    if (keepUi) this.playerUi?.dispose();
  }
}
