/**
 * GameScreen — 对局主屏（装载/锁步/HUD/UI/结束/错误处理）。
 *
 * 由 gui/screen/game/GameScreen.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { DataStream } from "data/DataStream"; // 已转换
import * as GservErrorModule from "network/GservError"; // 孪生
import { ScreenType as RootScreenType } from "gui/screen/ScreenType"; // 已转换
import { ScreenType as MenuScreenType } from "gui/screen/mainMenu/ScreenType"; // 已转换
import { sleep as sleepLib } from "@puzzl/core/lib/async/sleep"; // 孪生
import { GameStatus } from "game/Game"; // 已转换
import * as EngineModule from "engine/Engine"; // 孪生
import { SidebarModel } from "gui/screen/game/component/hud/viewmodel/SidebarModel"; // 已转换
import * as LockstepManagerModule from "network/gamestate/LockstepManager"; // 孪生
import { ActionSerializer } from "network/gamestate/ActionSerializer"; // 已转换
import { ActionFactory } from "game/action/ActionFactory"; // 已转换
import { ActionQueue } from "game/action/ActionQueue"; // 已转换
import { DevToolsApi } from "tools/DevToolsApi"; // 已转换
import * as GameAnimationLoopModule from "engine/GameAnimationLoop"; // 孪生
import { GameResultPopup, GameResultType } from "gui/screen/game/component/GameResultPopup"; // 已转换
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as SoloPlayTurnManagerModule from "network/gamestate/SoloPlayTurnManager"; // 孪生
import { SoundHandler } from "gui/screen/game/SoundHandler"; // 已转换
import * as LocalPrefsModule from "LocalPrefs"; // 孪生
import { WorldInteractionFactory } from "gui/screen/game/worldInteraction/WorldInteractionFactory"; // 已转换
import { CombatantUi } from "gui/screen/game/CombatantUi"; // 已转换
import { ObserverUi } from "gui/screen/game/ObserverUi"; // 已转换
import { GameMenu } from "gui/screen/game/GameMenu"; // 已转换
import { WorldView } from "gui/screen/game/WorldView"; // 已转换
import * as EvaModule from "engine/sound/Eva"; // 孪生
import * as EvaSpecsModule from "engine/sound/EvaSpecs"; // 孪生
import { NetStats } from "gui/screen/game/NetStats"; // 已转换
import { HudFactory } from "gui/screen/game/HudFactory"; // 已转换
import { Minimap } from "gui/screen/game/component/Minimap"; // 已转换
import { SideType } from "game/SideType"; // 已转换
import * as ReplayModule from "network/gamestate/Replay"; // 孪生
import * as ReplayRecorderModule from "network/gamestate/ReplayRecorder"; // 孪生
import { CombatantSidebarModel } from "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel"; // 已转换
import { ActionFactoryReg } from "game/action/ActionFactoryReg"; // 已转换
import { MessageList } from "gui/screen/game/component/hud/viewmodel/MessageList"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { ChatNetHandler } from "gui/screen/game/ChatNetHandler"; // 已转换
import { ChatTypingHandler } from "gui/screen/game/ChatTypingHandler"; // 已转换
import * as TaskModule from "@puzzl/core/lib/async/Task"; // 孪生
import * as IrcConnectionModule from "network/IrcConnection"; // 孪生
import * as cancellationModule from "@puzzl/core/lib/async/cancellation"; // 孪生
import * as gservConfigModule from "network/gservConfig"; // 孪生
import * as MusicModule from "engine/sound/Music"; // 孪生
import { TauntHandler } from "gui/screen/game/TauntHandler"; // 已转换
import { TauntPlayback } from "gui/screen/game/TauntPlayback"; // 已转换
import { ActionType } from "game/action/ActionType"; // 已转换
import { EventType } from "game/event/EventType"; // 已转换
import { ConnectionInfoScreen } from "gui/screen/game/gameMenu/ConnectionInfoScreen"; // 已转换
import { CommandBarButtonList } from "gui/screen/game/component/hud/commandBar/CommandBarButtonList"; // 已转换
import { CommandBarButtonType } from "gui/screen/game/component/hud/commandBar/CommandBarButtonType"; // 已转换
import * as ResourceLoaderModule from "engine/ResourceLoader"; // 孪生
import * as StorageQuotaErrorModule from "data/vfs/StorageQuotaError"; // 孪生
import * as FileNotFoundErrorModule from "data/vfs/FileNotFoundError"; // 孪生
import { isIpad } from "util/userAgent"; // 已转换
import * as IOErrorModule from "data/vfs/IOError"; // 孪生
import { RootScreen } from "gui/screen/RootScreen"; // 已转换
import {
  LoadingScreenApiFactory,
  LoadingScreenType,
} from "gui/screen/game/loadingScreen/LoadingScreenApiFactory"; // 已转换
import * as ReplayStorageErrorModule from "gui/replay/ReplayStorageError"; // 孪生
import * as MapFileModule from "data/MapFile"; // 孪生
import * as VirtualFileModule from "data/vfs/VirtualFile"; // 孪生
import { binaryStringToUint8Array } from "util/string"; // 已转换
import * as MapDigestModule from "engine/MapDigest"; // 孪生
import { MapSupport } from "engine/MapSupport"; // 已转换
import * as GameResModule from "network/gameres/GameRes"; // 孪生
import * as constantsModule from "game/gameopts/constants"; // 孪生
import * as MainMenuRouteModule from "gui/screen/mainMenu/MainMenuRoute"; // 孪生
import * as RootRouteModule from "gui/screen/RootRoute"; // 孪生
import * as ChatHistoryModule from "gui/chat/ChatHistory"; // 孪生
import * as ChatMessageFormatModule from "gui/chat/ChatMessageFormat"; // 孪生
import { MedianPing } from "gui/screen/game/MedianPing"; // 已转换
import { PingMonitor } from "gui/screen/game/PingMonitor"; // 已转换
import * as ShpFileModule from "data/ShpFile"; // 孪生
import * as PaletteModule from "data/Palette"; // 孪生
import * as ImageUtilsModule from "engine/gfx/ImageUtils"; // 孪生
import * as IsoCoordsModule from "engine/IsoCoords"; // 孪生
import { Coords } from "game/Coords"; // 已转换
import * as GameOptRandomGenModule from "game/gameopts/GameOptRandomGen"; // 孪生
import { GameLoader } from "gui/screen/game/GameLoader"; // 已转换
/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const Task: any = (TaskModule as any).Task;
const OperationCanceledError: any = (cancellationModule as any).OperationCanceledError;
const CancellationTokenSource: any = (cancellationModule as any).CancellationTokenSource;
const MusicType: any = (MusicModule as any).MusicType;
const GservError: any = (GservErrorModule as any).GservError;
const DownloadError: any = (ResourceLoaderModule as any).DownloadError;
const StorageQuotaError: any = (StorageQuotaErrorModule as any).StorageQuotaError;
const FileNotFoundError: any = (FileNotFoundErrorModule as any).FileNotFoundError;
const IOError: any = (IOErrorModule as any).IOError;
const ReplayStorageError: any = (ReplayStorageErrorModule as any).ReplayStorageError;
const MapFile: any = (MapFileModule as any).MapFile;
const VirtualFile: any = (VirtualFileModule as any).VirtualFile;
const MapDigest: any = (MapDigestModule as any).MapDigest;
const GameRes: any = (GameResModule as any).GameRes;
const ShpFile: any = (ShpFileModule as any).ShpFile;
const Palette: any = (PaletteModule as any).Palette;
const ImageUtils: any = (ImageUtilsModule as any).ImageUtils;
const IsoCoords: any = (IsoCoordsModule as any).IsoCoords;
const GameOptRandomGen: any = (GameOptRandomGenModule as any).GameOptRandomGen;
const Engine: any = (EngineModule as any).Engine;
const LocalPrefs: any = (LocalPrefsModule as any).LocalPrefs;
const StorageKey: any = (LocalPrefsModule as any).StorageKey ?? LocalPrefs;
const Replay: any = (ReplayModule as any).Replay;
const CON_INFO_THRESH_MILLIS: any = (constantsModule as any).CON_INFO_THRESH_MILLIS;
const OBS_COUNTRY_ID: any = (constantsModule as any).OBS_COUNTRY_ID;
const RANDOM_START_POS: any = (constantsModule as any).RANDOM_START_POS;
const LockstepManager: any = (LockstepManagerModule as any).LockstepManager;
const sleep = sleepLib;
const GameAnimationLoop: any = (GameAnimationLoopModule as any).GameAnimationLoop;
const SoloPlayTurnManager: any = (SoloPlayTurnManagerModule as any).SoloPlayTurnManager;
const Eva: any = (EvaModule as any).Eva;
const EvaSpecs: any = (EvaSpecsModule as any).EvaSpecs;
const ReplayRecorder: any = (ReplayRecorderModule as any).ReplayRecorder;
// 必须取模块命名空间上的类本身；整模块别名会让 SocketError 等为 undefined
const IrcConnection: any = (IrcConnectionModule as any).IrcConnection;
const MainMenuRoute: any = (MainMenuRouteModule as any).MainMenuRoute;
const RootRoute: any = (RootRouteModule as any).RootRoute;
const ChatHistory: any = (ChatHistoryModule as any).ChatHistory;
const ChatMessageFormat: any = (ChatMessageFormatModule as any).ChatMessageFormat;

/** 对局主屏。
   */
export class GameScreen extends RootScreen {
  /** Worker 宿主。*/
  workerHostApi: any;
  /** gserv?*/
  gservCon: any;
  /** gameres 服务。*/
  wgameresService: any;
  /** wol 服务。*/
  wolService: any;
  /** 地图传输。*/
  mapTransferService: any;
  /** 引擎版本。*/
  engineVersion: any;
  /** 引擎 mod hash?*/
  engineModHash: any;
  /** 错误处理器。*/
  errorHandler: any;
  /** 菜单子屏。*/
  gameMenuSubScreens: any;
  /** 加载屏工厂。*/
  loadingScreenApiFactory: any;
  /** 选项解析。*/
  gameOptsParser: any;
  /** 选项序列化。*/
  gameOptsSerializer: any;
  /** 配置。*/
  config: any;
  /** 字符串。*/
  strings: any;
  /** 渲染器。*/
  renderer: any;
  /** UI 场景。*/
  uiScene: any;
  /** 运行时开关。*/
  runtimeVars: any;
  /** 消息框。*/
  messageBoxApi: any;
  /** toast?*/
  toastApi: any;
  /** UI 动画循环。*/
  uiAnimationLoop: any;
  /** 视口。*/
  viewport: any;
  /** JSX 渲染器。*/
  jsxRenderer: any;
  /** 指针。*/
  pointer: any;
  /** 音效。*/
  sound: any;
  /** 音乐。*/
  music: any;
  /** 混音。*/
  mixer: any;
  /** 键位。*/
  keyBinds: any;
  /** 通用选项。*/
  generalOptions: any;
  /** 本地偏好。*/
  localPrefs: any;
  /** action 日志。*/
  actionLogger: any;
  /** lockstep 日志。*/
  lockstepLogger: any;
  /** 回放管理。*/
  replayManager: any;
  /** 全屏。*/
  fullScreen: any;
  /** 地图文件加载。*/
  mapFileLoader: any;
  /** 地图目录。*/
  mapDir: any;
  /** 地图列表。*/
  mapList: any;
  /** 游戏加载器。*/
  gameLoader: any;
  /** VXL 池。*/
  vxlGeometryPool: any;
  /** 建筑图缓存。*/
  buildingImageDataCache: any;
  /** 屏蔽玩家。*/
  mutedPlayers: any;
  /** taunt 开关。*/
  tauntsEnabled: any;
  /** 速度作弊。*/
  speedCheat: any;
  /** Sentry?*/
  sentry: any;
  /** 战斗控制 API?*/
  battleControlApi: any;
  /** 是否阻止 unload?*/
  preventUnload = true;
  /** 平均 ping?*/
  avgPing = new MedianPing();
  /** 释放容器。*/
  disposables = new CompositeDisposable();
  /** gserv 关闭回调。*/
  onGservClose: (e: any) => void;
  /** 返回目标。*/
  returnTo: any;
  /** 是否锦标赛。*/
  isTournament = false;
  /** 玩家名。*/
  playerName: string;
  /** 是否单机。*/
  isSinglePlayer = false;
  /** 加载。API?*/
  loadingScreenApi: any;
  /** 游戏。*/
  game: any;
  /** 调试地图。*/
  debugMapFile: any;
  /** 回放。*/
  replay: any;
  /** 回合管理。*/
  gameTurnMgr: any;
  /** lag 状态。*/
  lagState = false;
  /** HUD 工厂。*/
  hudFactory: any;
  /** HUD?*/
  hud: any;
  /** 小地图。*/
  minimap: any;
  /** 世界视图。*/
  worldView: any;
  /** 菜单。*/
  menu: any;
  /** 玩家/观察 UI?*/
  playerUi: any;
  /** 侧栏模型。*/
  sidebarModel: any;
  /** 聊天。*/
  chatTypingHandler: any;
  chatNetHandler: any;
  /** 玩家 UI 动画循环。*/
  gameAnimationLoop: any;
  /** 菜单暂停速度。*/
  pausedAtSpeed: any;
  /** 输入锁同步挂起。*/
  inputLockSyncSuspended = false;
  /** 输入锁同步回调。*/
  inputLockSyncHandler: (() => void) | undefined;
  /** 攻击目标标记 mesh?*/
  attackTargetMarkerMeshes: any[] | undefined;
  /** 渲染件管理（高亮用）*/
  renderableManager: any;

  /**
   * 构造：注入全部依赖。
   * @param workerHostApi Worker
   * @param gservCon gserv
   * @param wgameresService gameres
   * @param wolService wol
   * @param mapTransferService 地图传输
   * @param engineVersion 版本
   * @param engineModHash mod hash
   * @param errorHandler 错误
   * @param gameMenuSubScreens 菜单子屏
   * @param loadingScreenApiFactory 加载屏工。
   * @param gameOptsParser 解析
   * @param gameOptsSerializer 序列。
   * @param config 配置
   * @param strings 字符。
   * @param renderer 渲染
   * @param uiScene UI 场景
   * @param runtimeVars 运行。
   * @param messageBoxApi 消息。
   * @param toastApi toast
   * @param uiAnimationLoop UI 循环
   * @param viewport 视口
   * @param jsxRenderer JSX
   * @param pointer 指针
   * @param sound 音效
   * @param music 音乐
   * @param mixer 混音
   * @param keyBinds 键位
   * @param generalOptions 选项
   * @param localPrefs 偏好
   * @param actionLogger action 日志
   * @param lockstepLogger lockstep 日志
   * @param replayManager 回放管理
   * @param fullScreen 全屏
   * @param mapFileLoader 地图加载
   * @param mapDir 地图目录
   * @param mapList 地图列表
   * @param gameLoader 游戏加载
   * @param vxlGeometryPool VXL ?   * @param buildingImageDataCache 建筑图缓。
   * @param mutedPlayers 屏蔽
   * @param tauntsEnabled taunt
   * @param speedCheat 速度
   * @param sentry Sentry
   * @param battleControlApi 控制
   */
  constructor(
    workerHostApi: any,
    gservCon: any,
    wgameresService: any,
    wolService: any,
    mapTransferService: any,
    engineVersion: any,
    engineModHash: any,
    errorHandler: any,
    gameMenuSubScreens: any,
    loadingScreenApiFactory: any,
    gameOptsParser: any,
    gameOptsSerializer: any,
    config: any,
    strings: any,
    renderer: any,
    uiScene: any,
    runtimeVars: any,
    messageBoxApi: any,
    toastApi: any,
    uiAnimationLoop: any,
    viewport: any,
    jsxRenderer: any,
    pointer: any,
    sound: any,
    music: any,
    mixer: any,
    keyBinds: any,
    generalOptions: any,
    localPrefs: any,
    actionLogger: any,
    lockstepLogger: any,
    replayManager: any,
    fullScreen: any,
    mapFileLoader: any,
    mapDir: any,
    mapList: any,
    gameLoader: any,
    vxlGeometryPool: any,
    buildingImageDataCache: any,
    mutedPlayers: any,
    tauntsEnabled: any,
    speedCheat: any,
    sentry: any,
    battleControlApi: any,
  ) {
    super();
    this.workerHostApi = workerHostApi;
    this.gservCon = gservCon;
    this.wgameresService = wgameresService;
    this.wolService = wolService;
    this.mapTransferService = mapTransferService;
    this.engineVersion = engineVersion;
    this.engineModHash = engineModHash;
    this.errorHandler = errorHandler;
    this.gameMenuSubScreens = gameMenuSubScreens;
    this.loadingScreenApiFactory = loadingScreenApiFactory;
    this.gameOptsParser = gameOptsParser;
    this.gameOptsSerializer = gameOptsSerializer;
    this.config = config;
    this.strings = strings;
    this.renderer = renderer;
    this.uiScene = uiScene;
    this.runtimeVars = runtimeVars;
    this.messageBoxApi = messageBoxApi;
    this.toastApi = toastApi;
    this.uiAnimationLoop = uiAnimationLoop;
    this.viewport = viewport;
    this.jsxRenderer = jsxRenderer;
    this.pointer = pointer;
    this.sound = sound;
    this.music = music;
    this.mixer = mixer;
    this.keyBinds = keyBinds;
    this.generalOptions = generalOptions;
    this.localPrefs = localPrefs;
    this.actionLogger = actionLogger;
    this.lockstepLogger = lockstepLogger;
    this.replayManager = replayManager;
    this.fullScreen = fullScreen;
    this.mapFileLoader = mapFileLoader;
    this.mapDir = mapDir;
    this.mapList = mapList;
    this.gameLoader = gameLoader;
    this.vxlGeometryPool = vxlGeometryPool;
    this.buildingImageDataCache = buildingImageDataCache;
    this.mutedPlayers = mutedPlayers;
    this.tauntsEnabled = tauntsEnabled;
    this.speedCheat = speedCheat;
    this.sentry = sentry;
    this.battleControlApi = battleControlApi;
    this.preventUnload = true;
    this.avgPing = new MedianPing();
    this.disposables = new CompositeDisposable();
    this.onGservClose = (e: any) => {
      if (this.replay) {
        this.replay.finish(this.game.currentTick);
        this.saveReplay(this.replay);
      }
      this.handleError(e, this.strings.get("TXT_YOURE_DISCON"));
      if (this.game) {
        this.sendGameRes(this.game, {
          disconnect: true,
          desync: false,
          quit: false,
          finished: false,
        });
      }
    };
  }

  /**
   * 进入：校验凭。装载地图/创建加载。启动对局。
   * @param params 进入参数
   */
  async onEnter(params: any): Promise<void> {
    this.pointer.lock();
    this.pointer.setVisible(false);
    await this.music?.play(MusicType.Loading);
    const cancelSource = new CancellationTokenSource();
    this.disposables.add(() => cancelSource.cancel());
    const token = cancelSource.token;
    this.returnTo = params.returnTo;
    this.isTournament = params.tournament;
    const playerName = (this.playerName = params.playerName);
    const isSinglePlayer = (this.isSinglePlayer = params.create && params.singlePlayer);
    let gameOpts: any;
    if (isSinglePlayer) {
      gameOpts = params.gameOpts;
    } else {
      const creds = this.wolService.getCredentials();
      if (!creds || creds.user !== playerName) {
        this.localPrefs.removeItem(StorageKey.LastConnection);
        this.controller?.goToScreen(RootScreenType.MainMenuRoot, {
          route: new MainMenuRoute(MenuScreenType.Login, {
            forceUser: playerName,
            afterLogin: (_e: any) => new RootRoute(RootScreenType.Game, params),
          }),
        });
        return;
      }
      this.wolService.setAutoReconnect(true);
      this.gservCon.onClose.subscribe(this.onGservClose);
      try {
        gameOpts = await this.connectToServerInstance(params, creds, token);
      } catch (e) {
        this.handleGservConError(e);
        return;
      }
      const { returnTo: _drop, ...rest } = params;
      this.localPrefs.setItem(StorageKey.LastConnection, JSON.stringify(rest));
    }
    if (this.config.devMode) {
      this.runtimeVars.cheatsEnabled.value = this.isSinglePlayer;
    } else if (!this.isSinglePlayer) {
      this.runtimeVars.cheatsEnabled.value = false;
    }
    let mapFile: any;
    try {
      mapFile = await this.transferAndLoadMapFile(
        params,
        gameOpts.mapName,
        gameOpts.mapDigest,
        token,
      );
      if (!gameOpts.mapOfficial) {
        this.debugMapFile = mapFile;
        this.disposables.add(() => (this.debugMapFile = void 0));
      }
      const MapFileCtor = MapFile;
      mapFile = new MapFileCtor(mapFile);
      const supportError = MapSupport.check(mapFile, this.strings);
      if (supportError) {
        this.handleError(supportError, supportError);
        return;
      }
      // 校验占用出生点的玩家数不超过地图出生点数，避免 "Map has fewer starting locations than players" 崩溃
      // 占用规则与 GameOptRandomGen.generateStartLocations 一致：非观战玩家各占 1 个，
      // 观战者仅在其 startPos 固定时额外占 1 个（会写入固定位置列表）。
      const allPlayers = (gameOpts.humanPlayers || [])
        .concat(gameOpts.aiPlayers || [])
        .filter((pl: any) => !!pl);
      const consumers = allPlayers.filter(
        (pl: any) =>
          pl.countryId !== OBS_COUNTRY_ID || pl.startPos !== RANDOM_START_POS,
      ).length;
      if (consumers > mapFile.startingLocations.length) {
        const msg =
          "地图出生点不足：当前配置需要 " +
          consumers +
          " 个出生点，地图仅提供 " +
          mapFile.startingLocations.length +
          " 个。请减少玩家数量或更换更大的地图。";
        this.handleError(msg, msg);
        return;
      }
    } catch (e) {
      this.handleMapLoadError(e, gameOpts.mapName);
      return;
    }
    const loading = this.loadingScreenApiFactory.create(
      this.isSinglePlayer ? LoadingScreenType.SinglePlayer : LoadingScreenType.MultiPlayer,
      this.isSinglePlayer && gameOpts.campaignId
        ? this.buildCampaignLoadingInfo(gameOpts)
        : void 0,
    );
    this.loadingScreenApi = loading;
    this.disposables.add(loading, () => (this.loadingScreenApi = void 0));
    this.disposables.add(() => this.gameLoader.clearStaticCaches());
    if (token.isCancelled()) return;
    // decode map preview for loading screen
    try {
      const preview = mapFile.decodePreviewImage();
      const canvas = document.createElement("canvas");
      canvas.width = preview ? preview.width : 160;
      canvas.height = preview ? preview.height : 120;
      const ctx = canvas.getContext("2d");
      if (ctx && preview) {
        this.drawMapPreview(ctx, preview, canvas, mapFile, gameOpts, loading, params);
      }
      if (!loading.mapPreviewUrl) loading.mapPreviewUrl = canvas.toDataURL();
    } catch (e) {
      console.warn("Failed to create map preview for loading screen", e);
    }
    let loadResult: any;
    try {
      loadResult = await this.gameLoader.load(
        params.gameId,
        params.timestamp,
        gameOpts,
        mapFile,
        playerName,
        this.isSinglePlayer,
        loading,
        token,
      );
    } catch (e) {
      this.handleGameLoadError(e, params, gameOpts);
      return;
    }
    if (token.isCancelled()) return;
    const { game, theater, hudSide, cameoFilenames } = loadResult;
    this.game = game;
    // debug-only: expose the live game for headless verification.
    // Removed before any public release. No-op when undefined.
    (typeof window !== "undefined" ? ((window as any).__yrwebGame = game) : 0);
    this.disposables.add(() => {
      if (typeof window !== "undefined") delete (window as any).__yrwebGame;
    });
    this.disposables.add(
      game,
      () => (this.game = void 0),
      () => Engine.unloadTheater(theater.type),
    );
    const local = game.getPlayerByName(playerName);
    let uiContext: any;
    try {
      uiContext = this.loadUi(game, theater, local, hudSide, cameoFilenames);
    } catch (e: any) {
      const text = e.message?.match(/memory|allocation/i)
        ? this.strings.get("TS:GameInitOom")
        : this.strings.get("TS:GameInitError") +
          (game.gameOpts.mapOfficial ? "" : "\n\n" + this.strings.get("TS:CustomMapCrash"));
      this.handleGameError(e, text, game);
      return;
    }
    const factory = new ActionFactory();
    new ActionFactoryReg().register(factory, game, playerName);
    const queue = new ActionQueue();
    this.replay = new Replay();
    this.disposables.add(() => (this.replay = void 0));
    this.replay.init(
      game.id,
      game.startTimestamp,
      gameOpts,
      this.engineVersion,
      this.engineModHash,
    );
    const recorder = new ReplayRecorder(
      this.replay,
      game.getPlayerNumber(local),
      game.gameOpts.humanPlayers,
      new ActionSerializer(),
    );
    if (this.isSinglePlayer) {
      this.gameTurnMgr = new SoloPlayTurnManager(
        game,
        local,
        queue,
        this.actionLogger,
        recorder,
      );
    } else {
      this.lagState = false;
      const lockstep = this.initLockstep(
        game,
        local,
        factory,
        queue,
        recorder,
      );
      if (local.isObserver) {
        try {
          lockstep.setPassiveMode(true);
        } catch (e) {
          if (e instanceof IrcConnection.SocketError) return;
          throw e;
        }
      } else {
        this.disposables.add(
          game.events.subscribe(EventType.PlayerDefeated, (e: any) => {
            if (e.target === local && local.isObserver) {
              this.gameTurnMgr.setPassiveMode?.(true);
            }
          }),
        );
      }
      this.gameTurnMgr = lockstep;
    }
    this.gameTurnMgr.init();
    const tryStart = () => {
      if (game.status === GameStatus.Started) return;
      try {
        this.onGameStart(local, game, uiContext, queue, factory, this.replay, recorder);
      } catch (e: any) {
        const text = e.message?.match(/memory|allocation/i)
          ? this.strings.get("TS:GameInitOom")
          : this.strings.get("TS:GameInitError") +
            (game.gameOpts.mapOfficial ? "" : "\n\n" + this.strings.get("TS:CustomMapCrash"));
        this.handleGameError(e, text, game);
      }
    };
    if (isSinglePlayer) {
      tryStart();
      DevToolsApi.registerCommand("reset", async () => {
        await this.onLeave();
        await this.onEnter(params);
      });
      DevToolsApi.registerVar("speed", game.desiredSpeed);
      this.disposables.add(
        () => DevToolsApi.unregisterCommand("reset"),
        () => DevToolsApi.unregisterVar("speed"),
      );
      // ============ [CHEAT] 调试作弊系统 开始 ============
      // 按 F10 打开作弊菜单，提供无限金钱、秒建造、科技全开、科技增强、地图全开等功能
      // 后续删除作弊时，删除从本注释到 "[CHEAT] 调试作弊系统 结束" 之间的整块代码
      DevToolsApi.registerVar("cheats", this.runtimeVars.cheatsEnabled);
      this.disposables.add(() => DevToolsApi.unregisterVar("cheats"));
      this.setupCheatMenu(game, local);
      // ============ [CHEAT] 调试作弊系统 结束 ============
    } else if (this.gservCon.isOpen()) {
      const onRate = (rate: number) => this.gameTurnMgr.setRate(rate);
      this.gservCon.onRateChange.subscribe(onRate);
      this.disposables.add(() => this.gservCon.onRateChange.unsubscribe(onRate));
      this.gservCon.onGameStart.subscribe(tryStart);
      this.disposables.add(() => this.gservCon.onGameStart.unsubscribe(tryStart));
      this.gservCon.sendLoadedPercent(100);
    }
  }

  /**
   * 地图预览：底图 + 出生点标记。
   * @param ctx 2d
   * @param preview 预览像素
   * @param canvas 预览 canvas
   * @param mapFile 地图
   * @param gameOpts 选项
   * @param loading 加载屏
   * @param params 进入参数
   */
  private drawMapPreview = (
    ctx: CanvasRenderingContext2D,
    preview: any,
    canvas: HTMLCanvasElement,
    mapFile: any,
    gameOpts: any,
    loading: any,
    params: any,
  ): void => {
    // Draw map preview image
    const imageData = ctx.createImageData(preview.width, preview.height);
    const dst = imageData.data;
    const src = preview.data;
    let si = 0;
    let di = 0;
    for (; si < src.length; si += 3) {
      dst[di] = src[si];
      dst[di + 1] = src[si + 1];
      dst[di + 2] = src[si + 2];
      dst[di + 3] = 255;
      di += 4;
    }
    ctx.putImageData(imageData, 0, 0);
    // Draw player start dots
    try {
      const colors = loading.rules
        ? [...loading.rules.getMultiplayerColors().values()]
        : null;
      const slots = new Map<number, any>();
      const addSlot = (pl: any) => {
        if (pl && pl.startPos >= 0) slots.set(pl.startPos, pl);
      };
      gameOpts.humanPlayers && gameOpts.humanPlayers.forEach(addSlot);
      gameOpts.aiPlayers && gameOpts.aiPlayers.forEach(addSlot);
      // Resolve random positions using GameOptRandomGen
      let resolveColorId: (p: any) => number = () => -1;
      try {
        const rng = GameOptRandomGen.factory(params.gameId, params.timestamp);
        // Must consume same PRNG state as GameFactory.create: colors ?countries ?startLocations
        const colorMap = rng.generateColors(gameOpts);
        rng.generateCountries(gameOpts, loading.rules);
        const resolved = rng.generateStartLocations(gameOpts, mapFile.startingLocations);
        resolved.forEach((posIdx: number, player: any) => {
          if (player && posIdx >= 0 && !slots.has(posIdx)) slots.set(posIdx, player);
        });
        // Resolve random colors using the color map
        resolveColorId = (player: any) => {
          if (!player) return -1;
          if (player.colorId >= 0) return player.colorId;
          if (colorMap && colorMap.has(player)) return colorMap.get(player);
          return -1;
        };
      } catch (e) {
        console.warn("[MapPrev] Failed to resolve random positions", e);
      }
      const locs = mapFile.startingLocations;
      const colorCount = colors ? colors.length : 0;
      const scale = canvas.width / 160;
      const mmpbScale = Math.max(0.5, 0.8 * scale);
      // Load mmpb.shp + unitdes.pal for player position markers
      const shp = new ShpFile(Engine.vfs.openFile("mmpb.shp"));
      const pal = new Palette(Engine.vfs.openFile("unitdes.pal"));
      const shpImg = shp.getImage(0);
      let shpRefData: ImageData | null = null;
      // 孪生：无色/无 data 时回退返回未染色原图画布（而非 null）
      let shpCanvas: HTMLCanvasElement | null = null;
      if (shpImg) {
        shpCanvas = document.createElement("canvas");
        shpCanvas.width = shpImg.width;
        shpCanvas.height = shpImg.height;
        const shpCtx = shpCanvas.getContext("2d");
        if (shpCtx) {
          const data = shpCtx.createImageData(shpImg.width, shpImg.height);
          const pix = data.data;
          const srcPix = shpImg.imageData;
          for (let i = 0; i < srcPix.length; i++) {
            const c = pal.getColor(srcPix[i]);
            pix[i * 4] = c.r;
            pix[i * 4 + 1] = c.g;
            pix[i * 4 + 2] = c.b;
            pix[i * 4 + 3] = srcPix[i] ? 255 : 0;
          }
          shpCtx.putImageData(data, 0, 0);
          shpRefData = shpCtx.getImageData(0, 0, shpImg.width, shpImg.height);
        }
      }
      // Cache tinted mmpb canvases per colorId
      const tintedCache = new Map<string, HTMLCanvasElement>();
      const getTinted = (colorObj: any): HTMLCanvasElement | null => {
        if (!shpRefData || !colorObj) return shpCanvas;
        const key = colorObj.asHexString();
        if (tintedCache.has(key)) return tintedCache.get(key)!;
        const c = document.createElement("canvas");
        c.width = shpRefData.width;
        c.height = shpRefData.height;
        const cctx = c.getContext("2d");
        if (!cctx) return shpCanvas;
        const img = cctx.createImageData(shpRefData.width, shpRefData.height);
        const s = shpRefData.data;
        const d = img.data;
        const pr = colorObj.r;
        const pg = colorObj.g;
        const pb = colorObj.b;
        for (let i = 0; i < s.length; i += 4) {
          const a = s[i + 3];
          if (a > 0) {
            const lum = Math.min(1, ((s[i] + s[i + 1] + s[i + 2]) / (3 * 255)) * 3);
            d[i] = pr * lum;
            d[i + 1] = pg * lum;
            d[i + 2] = pb * lum;
            d[i + 3] = 255;
          }
        }
        cctx.putImageData(img, 0, 0);
        tintedCache.set(key, c);
        return c;
      };
      // Initialize IsoCoords with a temporary origin (save/restore global state)
      const oldOrigin = IsoCoords.worldOrigin;
      IsoCoords.init({
        x: 0,
        y: (mapFile.fullSize.width * Coords.getWorldTileSize()) / 2,
      });
      const origin = IsoCoords.worldToScreen(0, 0);
      const originSt = IsoCoords.screenToScreenTile(origin.x, origin.y);
      for (let i = 0; i < locs.length; i++) {
        const loc = locs[i];
        const slot = slots.get(i);
        const screen = IsoCoords.tileToScreen(loc.x, loc.y);
        const st = IsoCoords.screenToScreenTile(screen.x, screen.y);
        st.x += originSt.x;
        st.y += originSt.y;
        const local = mapFile.localSize;
        const sx = canvas.width / (2 * local.width);
        const sy = canvas.height / local.height / 2;
        const cx = (st.x - 2 * local.x) * sx;
        const cy = (st.y - 2 * local.y) * sy;
        const colorIdx = slot ? resolveColorId(slot) : -1;
        const color = colorIdx >= 0 && colors && colorIdx < colorCount ? colors[colorIdx] : null;
        const target = getTinted(color);
        if (slot && target) {
          // Draw mmpb.shp tinted to player's color, centered on position
          ctx.drawImage(
            target,
            Math.round(cx - (target.width * mmpbScale) / 2),
            Math.round(cy - (target.height * mmpbScale) / 2),
            Math.round(target.width * mmpbScale),
            Math.round(target.height * mmpbScale),
          );
        } else {
          // Empty slot: black dot（孪生半径含 +0.5）
          const r = (Math.max(3, 4 * scale) + 0.5) * 0.75;
          ctx.fillStyle = "rgb(0,0,0)";
          ctx.fillRect(
            Math.round(cx - r) + 1,
            Math.round(cy - r),
            Math.round(r * 2),
            Math.round(r * 2),
          );
        }
      }
      if (oldOrigin !== void 0) IsoCoords.worldOrigin = oldOrigin;
    } catch (e) {
      console.warn("[MapPrev] Failed to draw start dots", e);
    }
  };

  /**
   * 连接并创。加入 gserv 游戏实例。
   * @param params 进入参数
   * @param creds 凭据
   * @param token 取消
   */
  async connectToServerInstance(params: any, creds: any, token: any): Promise<any> {
    let showConnecting = false;
    const task = new Task(async (t: any) => {
      await sleep(1e3);
      if (t.isCancelled()) return;
      this.messageBoxApi.show(this.strings.get("TXT_CONNECTING"));
      showConnecting = true;
    });
    task.start();
    try {
      await this.gservCon.connect(params.gservUrl);
      await this.gservCon.cvers(this.engineVersion);
      await this.gservCon.login(creds.user, creds.pass);
      token.throwIfCancelled();
      if (params.create) {
        const serialized = this.gameOptsSerializer.serializeOptions(params.gameOpts);
        const { gameId, timestamp } = params;
        await this.gservCon.createGame(
          gameId,
          timestamp,
          serialized,
          this.engineVersion,
          this.engineModHash,
          params.createPrivateGame,
        );
        console.log(`Created game instance with id ${params.gameId}.`);
        this.localPrefs.removeItem(StorageKey.LastConnection);
      } else {
        await this.joinGame(params.gameId, 5, token);
        console.log("Joined game instance with id " + params.gameId);
      }
      const raw = await this.gservCon.gameOpts();
      return this.gameOptsParser.parseOptions(raw);
    } catch (e) {
      if (!this.gservCon.isOpen()) showConnecting = false;
      throw e;
    } finally {
      task.cancel();
      if (showConnecting) this.messageBoxApi.destroy();
    }
  }

  /**
   * 加入实例（重试）   * @param gameId id
   * @param retries 重试次数
   * @param token 取消
   */
  async joinGame(gameId: any, retries: number, token: any): Promise<void> {
    if (retries) {
      let last: any;
      while (retries--) {
        try {
          console.log(
            `Attempting to join game with id ${gameId}...`,
            retries + " retries left",
          );
          token.throwIfCancelled();
          await this.gservCon.joinGame(
            gameId,
            this.engineVersion,
            this.engineModHash,
          );
          return;
        } catch (e) {
          if (
            !(e instanceof GservError && e.code === GservError.Code.InstanceNonExistent)
          ) {
            throw e;
          }
          last = e;
          await sleep(3e3);
        }
      }
      this.localPrefs.removeItem(StorageKey.LastConnection);
      throw last;
    }
    await this.gservCon.joinGame(gameId, this.engineVersion, this.engineModHash);
  }

  /**
   * 传输/加载地图。
   * @param params 进入参数
   * @param mapName 地图。
   * @param mapDigest 摘要
   * @param token 取消
   */
  async transferAndLoadMapFile(
    params: any,
    mapName: string,
    mapDigest: string,
    token: any,
  ): Promise<any> {
    let file: any;
    if ((params.create && params.singlePlayer) || !params.mapTransfer) {
      file = await this.mapFileLoader.load(mapName, token);
    } else {
      this.messageBoxApi.show(this.strings.get("GUI:MapTransfer"));
      if (params.create) {
        file = await this.mapFileLoader.load(mapName, token);
        if (this.mapTransferService.getUrl()) {
          await this.mapTransferService.putMap(file.getBytes(), params.gameId, token);
        } else {
          this.gservCon.sendMap(file.readAsString());
        }
      } else {
        const bytes = this.mapTransferService.getUrl()
          ? await this.mapTransferService.getMap(params.gameId, token)
          : binaryStringToUint8Array(await this.gservCon.getMap());
        file = VirtualFile.fromBytes(bytes, mapName);
        if (MapDigest.compute(file) !== mapDigest) {
          throw new DownloadError("Transferred map is corrupt");
        }
        if (this.mapDir && !(await this.mapDir.containsEntry(mapName))) {
          try {
            await this.mapDir.writeFile(file);
            this.mapList.addFromMapFile(file);
          } catch (e) {
            console.error("Map couldn't be saved", [e]);
          }
        }
      }
      this.messageBoxApi.destroy();
    }
    return file;
  }

  /**
   * 构建 HUD/小地。世界视图。
   * @param game 游戏
   * @param theater theater
   * @param local 玩家
   * @param hudSide 阵营
   * @param cameoFilenames cameo
   */
  loadUi(game: any, theater: any, local: any, hudSide: any, cameoFilenames: any): any {
    const sidebarModel = local.isObserver
      ? new SidebarModel(game)
      : new CombatantSidebarModel(local, game);
    const messageList = new MessageList(
      game.rules.audioVisual.messageDuration,
      6,
      local,
    );
    const chatHistory = new ChatHistory();
    this.sidebarModel = sidebarModel;
    this.disposables.add(() => (this.sidebarModel = void 0));
    const uiIni = Engine.getUiIni();
    const commandBar = new CommandBarButtonList();
    if (!local.isObserver) {
      commandBar.fromIni(
        uiIni.getOrCreateSection(
          this.isSinglePlayer ? "AdvancedCommandBar" : "MultiplayerAdvancedCommandBar",
        ),
      );
    }
    if (this.config.discordUrl) {
      commandBar.buttons.push(CommandBarButtonType.BugReport);
    }
    this.hudFactory = new HudFactory(
      hudSide,
      this.uiScene,
      sidebarModel,
      messageList,
      chatHistory,
      game.debugText,
      this.runtimeVars.debugText,
      local,
      game.getCombatants(),
      game.stalemateDetectTrait,
      game.countdownTimer,
      cameoFilenames,
      this.jsxRenderer,
      this.strings,
      commandBar.buttons,
    );
    this.disposables.add(() => (this.hudFactory = void 0));
    const hud = this.hudFactory.create();
    this.hud = hud;
    const minimap = (this.minimap = new Minimap(
      game,
      local,
      hud.getTextColor(),
      game.rules.general.radar,
    ));
    hud.setMinimap(minimap);
    this.disposables.add(minimap, () => (this.minimap = void 0));
    minimap.setPointerEvents(this.pointer.pointerEvents);
    // 4/1 愚人节（非锦标赛。
          const now = new Date();
    const aprilFools =
      now.getMonth() + 1 === 4 && now.getDate() === 1 && !this.isTournament;
    const gutter = { width: hud.sidebarWidth, height: hud.actionBarHeight };
    const worldView = new WorldView(
      gutter,
      game,
      this.sound,
      this.renderer,
      this.runtimeVars,
      minimap,
      this.strings,
      this.generalOptions,
      this.vxlGeometryPool,
      this.buildingImageDataCache,
      aprilFools,
    );
    const worldViewInitResult = worldView.init(local, this.viewport.value, theater);
    this.worldView = worldView;
    this.disposables.add(worldView, () => (this.worldView = void 0));
    worldViewInitResult.worldScene.create3DObject();
    return {
      worldViewInitResult,
      messageList,
      chatHistory,
      minimap,
    };
  }

  /**
   * 创建 lockstep 回合管理。
   * @param game 游戏
   * @param local 玩家
   * @param factory 工厂
   * @param queue 队列
   * @param recorder 录制
   */
  initLockstep(game: any, local: any, factory: any, queue: any, recorder: any): any {
    const debugLog = this.runtimeVars.debugGameState.value;
    let writeLog: ((line: string) => void) | undefined;
    const logStream = new DataStream();
    if (debugLog) {
      writeLog = (line: string) => {
        if (logStream.byteLength < 10485760) logStream.writeString(line + "\n");
      };
    }
    const lockstep = new LockstepManager(
      game,
      this.gservCon,
      this.gameOptsParser,
      this.gameOptsSerializer,
      new ActionSerializer(),
      factory,
      queue,
      () => {
        this.gservCon.onClose.unsubscribe(this.onGservClose);
        this.gservCon.close();
        this.handleGameError(
          "desync_error",
          this.strings.get("TS:DesyncDetected"),
          game,
          debugLog
            ? async () => {
                let stateDump: any;
                let debugLogOut: any;
                try {
                  const json = JSON.stringify(
                    lockstep.debugGameStateHistory,
                    void 0,
                    2,
                  );
                  this.workerHostApi.queueTask(async (w: any) => {
                    stateDump = await w.compressFile(json, "statedump.json");
                  });
                  this.workerHostApi.queueTask(async (w: any) => {
                    debugLogOut = await w.compressFile(
                      new Uint8Array(logStream.buffer, 0, logStream.byteLength),
                      "lockstep.log",
                    );
                  });
                  await this.workerHostApi.waitForTasks();
                } catch (e) {
                  console.error("Failed to export debug data", e);
                } finally {
                  this.workerHostApi.dispose();
                }
                return { stateDump, debugLog: debugLogOut };
              }
            : void 0,
        );
      },
      this.actionLogger,
      this.lockstepLogger,
      writeLog,
      recorder,
      debugLog,
    );
    let lagTask: any;
    lockstep.onLagStateChange.subscribe((lag: boolean) => {
      this.lagState = lag;
      lagTask?.cancel();
      lagTask = void 0;
      if (lag) {
        lagTask = new Task(async (t: any) => {
          await sleep(CON_INFO_THRESH_MILLIS, t);
          if (t.isCancelled()) return;
          this.menu?.openConnectionInfo(
            game.getCombatants(),
            this.gservCon,
            this.chatNetHandler,
          );
        });
        lagTask.start().catch((e: any) => {
          if (!(e instanceof OperationCanceledError)) throw e;
        });
        this.disposables.add(() => lagTask?.cancel());
      } else if (
        this.menu?.getCurrentScreen() instanceof ConnectionInfoScreen
      ) {
        this.menu.close();
      }
    });
    return lockstep;
  }

  /** 视口变化。*/
  onViewportChange(): void {
    this.loadingScreenApi?.updateViewport();
    this.rerenderHud();
  }

  /** 重建 HUD?*/
  rerenderHud(): void {
    if (!this.hud) return;
    this.uiScene.remove(this.hud);
    this.hud.destroy();
    this.hudFactory.setSidebarModel(this.sidebarModel);
    const hud = this.hudFactory.create();
    this.hud = hud;
    hud.setMinimap(this.minimap);
    if (!this.playerUi) return;
    this.uiScene.add(hud);
    this.menu?.handleHudChange(hud);
    this.worldView.handleViewportChange(this.viewport.value);
    this.playerUi.handleHudChange(hud);
    if (this.chatTypingHandler) {
      this.initHudChatTypingEvents(this.chatTypingHandler, this.chatNetHandler, hud);
    }
  }

  /**
   * 对局真正开始：EVA、场景切换、动画循环、输入锁。
   * @param local 玩家
   * @param game 游戏
   * @param uiContext loadUi 结果
   * @param queue 队列
   * @param factory 工厂
   * @param replay 回放
   * @param recorder 录制
   */
  onGameStart(
    local: any,
    game: any,
    uiContext: any,
    queue: any,
    factory: any,
    replay: any,
    recorder: any,
  ): void {
    this.localPrefs.removeItem(StorageKey.LastConnection);
    this.loadingScreenApi?.dispose();
    this.music?.play(MusicType.Normal);
    const specs = new EvaSpecs(local.country?.side ?? SideType.GDI).readIni(
      Engine.getIni(Engine.getFileNameVariant("eva.ini")),
    );
    const eva = new Eva(specs, this.sound, this.renderer);
    eva.init();
    this.disposables.add(eva);
    this.initUi(
      local,
      game,
      recorder,
      queue,
      factory,
      this.hud,
      eva,
      uiContext,
    );
    this.renderer.removeScene(this.uiScene);
    this.renderer.addScene(uiContext.worldViewInitResult.worldScene);
    this.renderer.addScene(this.uiScene);
    this.pointer.setVisible(true);
    game.onEnd.subscribe(() => this.onGameEnd(game, local, eva, replay));
    game.start();
    if (!this.isSinglePlayer) this.initNetStats(local);
    this.gameAnimationLoop = new GameAnimationLoop(
      game,
      this.renderer,
      this.sound,
      this.gameTurnMgr,
      {
        skipFrames: !this.isSinglePlayer,
        onError: this.config.devMode
          ? void 0
          : (e: any, isCustom: any) => {
              if (e instanceof IrcConnection.SocketError) return;
              const text = e.message?.match(/memory|allocation/i)
                ? this.strings.get("TS:GameCrashOom")
                : this.strings.get("TS:GameCrashed") +
                  (isCustom || game.gameOpts.mapOfficial
                    ? ""
                    : "\n\n" + this.strings.get("TS:CustomMapCrash"));
              this.handleGameError(e, text, game, void 0, isCustom);
            },
      },
    );
    this.uiAnimationLoop.stop();
    this.gameAnimationLoop.start();
    // 触发器 DisableUserInput/EnableUserInput 桥接 —
    // 轮询 game.inputLocked 状态并同步 WorldInteraction（锁定期间玩家无法操控单位）
    // 菜单打开时挂起同步，避免与菜单自身的 setEnabled 冲突。
    this.inputLockSyncSuspended = false;
    this.inputLockSyncHandler = () => {
      if (this.inputLockSyncSuspended) return;
      const g = this.game;
      if (!g) return;
      // MoveAndCenterView: 消费相机移动请求并平滑移动视野
      if (g.pendingCameraMove) {
        const pm = g.pendingCameraMove;
        g.pendingCameraMove = void 0;
        this.moveCameraToWaypoint(pm.waypoint, pm.speed);
      }
      // FlashSmall/Medium/Large/FlashTeam: 消费单元高亮请求
      if (g.pendingUnitFlash) {
        const pf = g.pendingUnitFlash;
        g.pendingUnitFlash = void 0;
        this.flashUnits(pf.ids, pf.cycles);
      }
  // 脚本化小队攻击指定路点：渲染脉冲目标标记
      this.updateAttackTargetMarkers();
      if (!this.playerUi?.worldInteraction) return;
      const locked = !!g.inputLocked;
      const interaction = this.playerUi.worldInteraction;
      if (interaction.isEnabled() !== !locked) {
        interaction.setEnabled(!locked);
        // 锁定玩家操控期间隐藏鼠标指针（RA2 过场/演出行为）
        this.pointer.setVisible(!locked);
      }
    };
    this.renderer.onFrame.subscribe(this.inputLockSyncHandler);
    this.disposables.add(() => {
      this.renderer.onFrame.unsubscribe(this.inputLockSyncHandler);
      this.disposeAttackTargetMarkers();
    });
  }

  // 触发器 MoveAndCenterView — 相机平滑移动到指定路点（参考临时源码 smoothstep 动画）
  /**
   * 平滑移动镜头到路点。
   * @param waypoint 路点
   * @param speed 速度
   */
  moveCameraToWaypoint(waypoint: any, speed?: number): void {
    const interaction = this.playerUi?.worldInteraction;
    if (!interaction || !this.game) return;
    const tile = this.game.map?.getTileAtWaypoint(waypoint);
    if (!tile) return;
    const target = interaction.minimapHandler?.mapPanningHelper?.computeCameraPanFromTile(
      tile.rx,
      tile.ry,
    );
    const cameraPan = interaction.worldScene?.cameraPan;
    if (!target || !cameraPan) return;
    const from = cameraPan.getPan();
    const duration = Math.max(180, 1100 - Math.max(1, speed || 1) * 180);
    const start = performance.now();
    let cancelled = false;
    const step = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / duration);
      const ease = t * t * (3 - 2 * t);
      cameraPan.setPan({
        x: from.x + (target.x - from.x) * ease,
        y: from.y + (target.y - from.y) * ease,
      });
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    this.disposables.add(() => (cancelled = true));
  }

  // 触发器 FlashSmall/Medium/Large/FlashTeam — 高亮指定单元（对齐临时源码 renderable.highlight）
  /**
   * 高亮单位。
   * @param ids id 列表
   * @param cycles 次数
   */
  flashUnits(ids: number[], cycles?: number): void {
    if (!ids || !ids.length || !this.game) return;
    for (const id of ids) {
      const obj = this.game.getObjectById(id);
      if (!obj) continue;
      const r = this.renderableManager?.getRenderableByGameObject(obj);
      if (!r) continue;
      try {
        if (cycles && r.highlightAnimRunner) r.highlightAnimRunner.animate(cycles);
        else r.highlight?.();
      } catch {
        // ignore
      }
    }
  }
  // 脚本化小队攻击指定路点 — 目标标记渲染（脉冲红色光环）
  /** 同步攻击目标标记。
   */
  updateAttackTargetMarkers(): void {
    const game = this.game;
    if (!game) return;
    const scene = this.playerUi?.worldInteraction?.worldScene;
    if (!scene) return;
    let arr = game.attackTargetMarkers;
    if (!arr) return;
    const tick = game.currentTick;
    if (arr.some((m: any) => m.expireTick <= tick)) {
      game.attackTargetMarkers = arr.filter((m: any) => m.expireTick > tick);
    }
    arr = game.attackTargetMarkers;
    const meshes = this.attackTargetMarkerMeshes || (this.attackTargetMarkerMeshes = []);
    for (let i = meshes.length - 1; i >= 0; i--) {
      const mm = meshes[i];
      if (
        !arr.some(
          (m: any) =>
            m.rx === mm.rx && m.ry === mm.ry && m.teamName === mm.teamName,
        )
      ) {
        scene.scene.remove(mm.mesh);
        mm.mesh.geometry?.dispose?.();
        mm.mesh.material?.dispose?.();
        meshes.splice(i, 1);
      }
    }
    for (const m of arr) {
      if (
        meshes.some(
          (mm: any) =>
            mm.rx === m.rx && mm.ry === m.ry && mm.teamName === m.teamName,
        )
      ) {
        continue;
      }
      const mesh = this.createAttackMarkerMesh(scene, m);
      if (mesh) meshes.push({ rx: m.rx, ry: m.ry, teamName: m.teamName, mesh });
    }
    const t = performance.now() / 450;
    for (const mm of meshes) {
      const ph = t + mm.rx * 1.7 + mm.ry * 0.9;
      const s = 0.8 + 0.2 * Math.sin(ph);
      mm.mesh.scale.set(s, s, s);
      mm.mesh.material.opacity = 0.55 + 0.35 * Math.sin(ph);
    }
  }

  /**
   * 创建攻击标记环。
   * @param scene 世界场景
   * @param marker 标记
   */
  createAttackMarkerMesh(scene: any, marker: any): any {
    try {
      const geo = new THREE.RingGeometry(88, 128, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: 16728063,
        transparent: true,
        opacity: 0.7,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(marker.rx * 256, 4, marker.ry * 256);
      scene.scene.add(mesh);
      return mesh;
    } catch {
      return void 0;
    }
  }

  /** 释放攻击标记。*/
  disposeAttackTargetMarkers(): void {
    const scene = this.playerUi?.worldInteraction?.worldScene;
    const meshes = this.attackTargetMarkerMeshes;
    this.attackTargetMarkerMeshes = void 0;
    if (!scene || !meshes) return;
    for (const mm of meshes) {
      scene.scene.remove(mm.mesh);
      mm.mesh.geometry?.dispose?.();
      mm.mesh.material?.dispose?.();
    }
  }
  // 战役加载画面信息（参考临时源。UKe / CampaignScreen 任务表）
  /**
   * 战役加载屏信息。
   * @param gameOpts 选项
   */
  buildCampaignLoadingInfo(gameOpts: any): any {
    const parts = String(gameOpts.campaignId || "").split("-");
    const side = parts[0] || "training";
    const order = Number(parts[1]) || 1;
    const prefix = (gameOpts.mapName || "").slice(0, 5).toUpperCase();
    const imgPrefix =
      side === "training" ? "LS800B" : side === "allied" ? "LS800A" : "LS800S";
    const loadingPath =
      "campaign/ui/loading/" +
      (imgPrefix + String(order).padStart(2, "0")).toLowerCase() +
      ".png";
    // 本地没有战役 UI 图时不要请求 404，让 LoadingScreen 只显示标。简。进度。
          const hasLoadingImage = !!Engine.vfs && Engine.vfs.fileExists(loadingPath);
    return {
      side,
      uiNameKey: "Name:" + prefix,
      loadMessageKey: "LoadMsg:" + prefix,
      loadBriefingKey: side === "training" ? void 0 : "LoadBrief:" + prefix,
      loadingImage: hasLoadingImage ? loadingPath : void 0,
    };
  }

  /**
   * 网络 FPS/Ping 面板。
   * @param local 玩家
   */
  initNetStats(local: any): void {
    let netStats: any;
    const monitor = new PingMonitor(this.gameTurnMgr, this.gservCon, this.avgPing);
    this.disposables.add(monitor);
    const sync = (enabled: boolean) => {
      netStats?.dispose();
      monitor.setPingInterval(enabled ? 1e3 : 1e4);
      if (enabled) {
        netStats = new NetStats(this.gameTurnMgr, local, this.renderer, monitor);
        netStats.init();
        this.disposables.add(netStats);
      }
    };
    sync(this.runtimeVars.fps.value);
    monitor.monitor();
    this.runtimeVars.fps.onChange.subscribe(sync);
    this.disposables.add(() => {
      this.runtimeVars.fps.onChange.unsubscribe(sync);
    });
  }

  /**
   * 初始化游戏内 UI（音。菜单/交互/聊天）   * @param local 玩家
   * @param game 游戏
   * @param recorder 录制
   * @param queue 队列
   * @param factory 工厂
   * @param hud HUD
   * @param eva EVA
   * @param uiContext loadUi 结果
   */
  initUi(
    local: any,
    game: any,
    recorder: any,
    queue: any,
    factory: any,
    hud: any,
    eva: any,
    uiContext: any,
  ): void {
    const { worldViewInitResult, messageList, chatHistory, minimap } = uiContext;
    const {
      worldScene,
      worldSound,
      superWeaponFxHandler,
      beaconFxHandler,
      renderableManager,
    } = worldViewInitResult;
    // 触发。Flash* 高亮单元用（?gameObject 查渲染实体）
      this.renderableManager = renderableManager;
    const soundHandler = new SoundHandler(
      game,
      worldSound,
      eva,
      this.sound,
      game.events,
      messageList,
      this.strings,
      local,
    );
    soundHandler.init();
    this.disposables.add(soundHandler);
    messageList.onNewMessage.subscribe((msg: any) => {
      if (msg.animate) this.sound.play(SoundKey.IncomingMessage, ChannelType.Ui);
    });
    if (isIpad()) {
      const onFs = (value: boolean) => {
        this.sidebarModel.topTextLeftAlign = value;
      };
      this.fullScreen.onChange.subscribe(onFs);
      this.disposables.add(() => this.fullScreen.onChange.unsubscribe(onFs));
    }
    this.uiScene.add(hud);
    const menu = (this.menu = new GameMenu(
      this.gameMenuSubScreens,
      game,
      local,
      chatHistory,
      this.isSinglePlayer ? void 0 : this.gservCon,
      this.isSinglePlayer,
      this.isTournament,
    ));
    menu.init(hud);
    this.initGameMenuEvents(menu, eva, game, local, queue, factory);
    this.disposables.add(menu, () => (this.menu = void 0));
    const selection = game.getUnitSelection();
    const freeCamera = this.runtimeVars.freeCamera;
    const debugPaths = this.runtimeVars.debugPaths;
    const debugText = this.runtimeVars.debugText;
    const devMode = this.config.devMode;
    const factoryInteraction = new WorldInteractionFactory(
      local,
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
      hud.getTextColor(),
      debugText,
      this.battleControlApi,
    );
    let tauntHandler: any;
    if (!this.isSinglePlayer) {
      const playback = new TauntPlayback(
        this.sound.audioSystem,
        Engine.getTaunts(),
      );
      tauntHandler = new TauntHandler(
        this.gservCon,
        local,
        game,
        recorder,
        this.tauntsEnabled,
        playback,
        this.mutedPlayers,
      );
      tauntHandler.init();
      this.disposables.add(tauntHandler);
    }
    const discordUrl = this.config.discordUrl;
    if (local.isObserver) {
      const observerUi = (this.playerUi = new ObserverUi(
        game,
        void 0,
        this.sidebarModel,
        void 0,
        this.renderer,
        worldScene,
        this.sound,
        factoryInteraction,
        menu,
        this.runtimeVars,
        this.strings,
        renderableManager,
        this.messageBoxApi,
        discordUrl,
      ));
      observerUi.onPlayerChange.subscribe(({ player, sidebarModel }: any) => {
        this.sidebarModel = sidebarModel;
        this.rerenderHud();
        this.worldView?.changeLocalPlayer(player);
        this.minimap.changeLocalPlayer(player);
      });
    } else {
      this.playerUi = new CombatantUi(
        game,
        local,
        this.isSinglePlayer,
        queue,
        factory,
        this.sidebarModel,
        this.renderer,
        worldScene,
        soundHandler,
        messageList,
        this.sound,
        eva,
        factoryInteraction,
        menu,
        this.pointer,
        this.runtimeVars,
        this.speedCheat,
        this.strings,
        tauntHandler,
        renderableManager,
        superWeaponFxHandler,
        beaconFxHandler,
        this.messageBoxApi,
        discordUrl,
      );
    }
    this.playerUi.init(hud);
    this.disposables.add(this.playerUi, () => (this.playerUi = void 0));
    if (this.isSinglePlayer) return;
    const wol = this.wolService.getConnection();
    const colors = new Map(
      game.getNonNeutralPlayers().map((p: any) => [p.name, p.color.asHexString()]),
    );
    const format = new ChatMessageFormat(this.strings, local.name, colors);
    const chatNet = new ChatNetHandler(
      this.gservCon,
      wol,
      messageList,
      chatHistory,
      format,
      local,
      game,
      recorder,
      this.mutedPlayers,
    );
    chatNet.init();
    this.disposables.add(chatNet);
    const interaction = this.playerUi.worldInteraction;
    const typing = new ChatTypingHandler(
      interaction.keyboardHandler,
      interaction.arrowScrollHandler,
      messageList,
      chatHistory,
    );
    interaction.chatTypingHandler = typing;
    this.chatTypingHandler = typing;
    this.chatNetHandler = chatNet;
    this.disposables.add(
      () => (this.chatTypingHandler = this.chatNetHandler = void 0),
    );
    this.initHudChatTypingEvents(typing, chatNet, hud);
    menu.onSendMessage.subscribe((msg: any) => {
      if (msg.value.length) chatNet.submitMessage(msg.value, msg.recipient);
    });
    const onDisconnect = (name: string) => {
      if (game.getPlayerByName(name).isObserver) {
        messageList.addSystemMessage(this.strings.get("TXT_LEFT_GAME", name), "grey");
      }
    };
    this.gservCon.onPlayerDisconnect.subscribe(onDisconnect);
    this.disposables.add(() =>
      this.gservCon.onPlayerDisconnect.unsubscribe(onDisconnect),
    );
    const onNoPriv = () => {
      messageList.addSystemMessage(this.strings.get("TS:ChatRestricted"), "white");
    };
    this.gservCon.onPrivMsgNotAllowed.subscribe(onNoPriv);
    this.disposables.add(() => this.gservCon.onPrivMsgNotAllowed.unsubscribe(onNoPriv));
  }

  /**
   * HUD 聊天输入事件。
   * @param typing 输入处理
   * @param chatNet 聊天网络
   * @param hud HUD
   */
  initHudChatTypingEvents(typing: any, chatNet: any, hud: any): void {
    hud.onMessageCancel.subscribe(() => {
      typing.endTyping();
    });
    hud.onMessageSubmit.subscribe((msg: any) => {
      typing.endTyping();
      if (msg.value.length) chatNet.submitMessage(msg.value, msg.recipient);
    });
  }

  /**
   * 菜单打开/退。观察/取消。
   * @param menu 菜单
   * @param eva EVA
   * @param game 游戏
   * @param local 玩家
   * @param queue 队列
   * @param factory 工厂
   */
  initGameMenuEvents(menu: any, eva: any, game: any, local: any, queue: any, factory: any): void {
    menu.onOpen.subscribe(() => {
      this.inputLockSyncSuspended = true;
      this.pointer.unlock();
      this.playerUi.worldInteraction.setEnabled(false);
      if (this.isSinglePlayer) {
        this.pausedAtSpeed = game.speed.value;
        game.desiredSpeed.value = Number.EPSILON;
        this.mixer.setMuted(ChannelType.Effect, true);
        this.mixer.setMuted(ChannelType.Ambient, true);
      }
    });
    menu.onQuit.subscribe(async () => {
      if (!this.controller) return;
      if (this.isSinglePlayer && this.pausedAtSpeed) {
        this.mixer.setMuted(ChannelType.Effect, false);
        this.mixer.setMuted(ChannelType.Ambient, false);
      }
      if (!local.isObserver) eva.play("EVA_BattleControlTerminated");
      this.pointer.lock();
      this.pointer.setVisible(false);
      this.playerUi.dispose();
      if (!local.isObserver && !this.isSinglePlayer && !this.lagState) {
        queue.push(factory.create(ActionType.ResignGame));
        await new Promise<void>((resolve) => {
          this.gameTurnMgr.onActionsSent.subscribeOnce(() => resolve());
        });
      }
      this.gservCon.onClose.unsubscribe(this.onGservClose);
      this.gservCon.close();
      this.gameTurnMgr.dispose();
      if (this.replay) {
        this.replay.finish(this.game.currentTick);
        this.saveReplay(this.replay);
      }
      if (!this.isSinglePlayer) {
        this.sendGameRes(game, {
          disconnect: false,
          desync: false,
          quit: true,
          finished: false,
        });
      }
      if (!local.isObserver) this.logGame(game, false);
      await sleep(2e3);
      this.controller?.goToScreen(RootScreenType.MainMenuRoot, {
        route: new MainMenuRoute(MenuScreenType.Score, {
          game,
          localPlayer: local,
          isQuit: true,
          singlePlayer: this.isSinglePlayer,
          tournament: this.isTournament,
          returnTo: this.returnTo ?? new MainMenuRoute(MenuScreenType.Home),
        }),
      });
    });
    menu.onObserve.subscribe(() => {
      this.pointer.lock();
      this.playerUi.worldInteraction.setEnabled(true);
      queue.push(factory.create(ActionType.ObserveGame));
      this.logGame(game, false);
    });
    menu.onCancel.subscribe(() => {
      this.pointer.lock();
      this.inputLockSyncSuspended = false;
      this.playerUi.worldInteraction.setEnabled(true);
      if (this.isSinglePlayer && this.pausedAtSpeed) {
        game.desiredSpeed.value = this.pausedAtSpeed;
        this.gameTurnMgr.doGameTurn(performance.now());
        this.pausedAtSpeed = void 0;
        this.mixer.setMuted(ChannelType.Effect, false);
        this.mixer.setMuted(ChannelType.Ambient, false);
      }
    });
  }

  /**
   * 对局结束弹窗与跳转。
   * @param game 游戏
   * @param local 玩家
   * @param eva EVA
   * @param replay 回放
   */
  async onGameEnd(game: any, local: any, eva: any, replay: any): Promise<void> {
    // 单人战役：胜负只看本地玩家是否判负；多人沿用"盟友存活即算我方胜利"规则。
    // 否则战役里玩家被打败但 AI 盟友（如 Civie1/Other1）未败时会错误显示"任务完成"。
    const victory = game.gameOpts.campaignId
      ? !local.defeated
      : !local.defeated || game.alliances.getAllies(local).some((p: any) => !p.defeated);
    const [popup] = this.jsxRenderer.render(
      jsx(GameResultPopup, {
        type:
          victory && !local.isObserver ? GameResultType.MpVictory : GameResultType.MpDefeat,
        viewport: this.viewport.value,
      }),
    );
    this.pointer.setVisible(false);
    this.playerUi.dispose();
    this.gservCon.onClose.unsubscribe(this.onGservClose);
    this.gservCon.close();
    this.uiScene.add(popup);
    if (!local.isObserver) {
      eva.play(victory ? "EVA_YouAreVictorious" : "EVA_YouHaveLost", true);
    }
    replay.finish(game.currentTick);
    this.saveReplay(replay);
    if (!this.isSinglePlayer) {
      this.sendGameRes(game, {
        disconnect: false,
        desync: false,
        quit: false,
        finished: !game.alliances.getHostilePlayers().length,
      });
    }
    if (!local.isObserver) this.logGame(game, victory);
    await sleep(5e3);
    this.uiScene.remove(popup);
    popup.destroy();
    this.controller?.goToScreen(RootScreenType.MainMenuRoot, {
      route: new MainMenuRoute(MenuScreenType.Score, {
        game,
        localPlayer: local,
        isQuit: false,
        singlePlayer: this.isSinglePlayer,
        tournament: this.isTournament,
        returnTo: this.returnTo ?? new MainMenuRoute(MenuScreenType.Home),
      }),
    });
  }

  /**
   * GA 埋点。
   * @param game 游戏
   * @param won 是否胜利
   */
  logGame(game: any, won: boolean): void {
    (window as any).gtag?.("event", "game_finish", {
      singlePlayer: Number(this.isSinglePlayer),
      numPlayers:
        game.gameOpts.humanPlayers.filter(
          (p: any) => p.countryId !== OBS_COUNTRY_ID,
        ).length +
        game.gameOpts.aiPlayers.filter((p: any) => !!p).length,
      won: Number(won),
      tournament: Number(this.isTournament),
      duration: game.currentTime,
    });
  }

  /** 离开清理。*/
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
    if (this.isSinglePlayer) return;
    this.wolService.setAutoReconnect(false);
    this.gservCon.onClose.unsubscribe(this.onGservClose);
    this.gservCon.close();
  }

  /**
   * gserv 连接错误文案。
   * @param e 错误
   */
  handleGservConError(e: any): void {
    if (e instanceof OperationCanceledError) return;
    let text: any;
    if (e instanceof GservError && e.code === GservError.Code.InstanceNonExistent) {
      text = this.strings.get("WOL:InstanceNotFound");
    } else if (e instanceof GservError && e.code === GservError.Code.BadLogin) {
      text = this.strings.get("TXT_BADPASS");
    } else if (e instanceof GservError && e.code === GservError.Code.AlreadyLoggedIn) {
      text = this.strings.get("WOL:AlreadyLoggedIn");
    } else if (e instanceof GservError && e.code === GservError.Code.OutdatedClient) {
      text = this.strings.get("TXT_YOURGAME_OUTDATED");
    } else if (e instanceof GservError && e.code === GservError.Code.TooManyLoginAttempts) {
      text = this.strings.get("WOL:TooManyLoginAttempts");
    } else if (
      e instanceof GservError &&
      e.code === GservError.Code.CreatedTooManyInstances
    ) {
      text = this.strings.get("WOL:CreatedTooManyInstances");
    } else if (e instanceof GservError && e.code === GservError.Code.InstanceNotAllowed) {
      text = this.strings.get("WOL:InstanceNotAllowed");
    } else if (
      e instanceof GservError &&
      e.code === GservError.Code.InstanceAlreadyStarted
    ) {
      text = this.strings.get("WOL:GameAlreadyStarted");
    } else if (e instanceof GservError && e.code === GservError.Code.InstanceVersMismatch) {
      text = this.strings.get("TXT_MISMATCH");
    } else {
      if (e instanceof IrcConnection.SocketError) return;
      if (e instanceof IrcConnection.ConnectError) {
        text = this.strings.get("TS:ConnectFailed");
      } else {
        text = this.strings.get("WOL:MatchBadParameters");
        if (e instanceof GservError) {
          this.sendDebugInfo(Object.assign(new Error("Gserv error " + e.code), { cause: e }));
        } else if (!(e instanceof IrcConnection.NoReplyError)) {
          this.sendDebugInfo(
            Object.assign(
              new Error(`Failed to connect to game instance (${e.message ?? e.name})`),
              { cause: e },
            ),
          );
        }
      }
    }
    this.handleError(e, text);
  }

  /**
   * 地图加载错误。
   * @param e 错误
   * @param mapName 地图。
   */
  handleMapLoadError(e: any, mapName: string): void {
    if (
      e instanceof OperationCanceledError ||
      e instanceof IrcConnection.SocketError
    ) {
      return;
    }
    let text: any;
    if (e instanceof DownloadError) {
      text =
        e.statusCode === 404
          ? this.strings.get("TS:MapNotFound", mapName)
          : this.strings.get("TS:MapDownloadFailed", mapName);
    } else if ((typeof e === "string" ? e : e.message)?.match(/memory|allocation/i)) {
      text = this.strings.get("TS:GameInitOom");
    } else if (e instanceof IrcConnection.NoReplyError) {
      text = this.strings.get("TS:MapDownloadFailed", mapName);
    } else {
      text = this.strings.get("TXT_MAP_ERROR");
    }
    this.handleError(e, text, void 0, { context: { MapName: mapName } });
  }

  /**
   * 游戏资源装载错误。
   * @param e 错误
   * @param params 进入参数
   * @param gameOpts 选项
   */
  handleGameLoadError(e: any, params: any, gameOpts: any): void {
    if (
      e instanceof OperationCanceledError ||
      e instanceof IrcConnection.SocketError
    ) {
      return;
    }
    let text: any;
    if (e instanceof DownloadError) {
      text = this.strings.get("TS:AssetLoadError");
    } else if (e instanceof IOError) {
      text = this.strings.get("ts:storage_io_error");
    } else {
      const msg = typeof e === "string" ? e : e.message;
      if (msg?.match(/memory|allocation/i)) {
        text = this.strings.get("TS:GameInitOom");
      } else {
        text = this.strings.get("TS:GameInitError");
        if (!gameOpts.mapOfficial) text += "\n\n" + this.strings.get("TS:CustomMapCrash");
        const replay = new Replay();
        replay.init(
          params.gameId,
          params.timestamp,
          gameOpts,
          this.engineVersion,
          this.engineModHash,
        );
        replay.debugInfo = e instanceof Error ? e.stack : e;
        replay.finish(0);
        this.sendDebugInfo(
          Object.assign(
            new Error(
              `Game init failed (${typeof e === "string" ? e : e.message ?? e.name})`,
            ),
            { cause: e },
          ),
          {
            gameId: params.gameId,
            replay,
            map: this.debugMapFile,
            official: gameOpts.mapOfficial,
          },
        );
      }
    }
    const extraDetails = {
      context: {
        GameId: params.gameId,
        Timestamp: new Date(params.timestamp).toISOString(),
        MapName: gameOpts.mapName || "N/A",
        MapOfficial: gameOpts.mapOfficial ? "Yes" : "No",
        EngineVersion: this.engineVersion,
      },
    };
    this.handleError(e, text, void 0, extraDetails);
  }

  /**
   * 对局中崩溃。
   * @param e 错误
   * @param text 文案
   * @param game 游戏
   * @param buildDump 附加 dump
   * @param isCustom 自定义图
   */
  handleGameError(e: any, text: string, game: any, buildDump?: () => Promise<any>, isCustom?: boolean): void {
    const replay = this.replay;
    if (replay) {
      replay.name += " (crashdump)";
      replay.debugInfo = e instanceof Error ? e.stack : e;
      if (e === "desync_error") {
        replay.debugInfo +=
          "\nConstants: " +
          [
            Math.E,
            Math.LN10,
            Math.LN2,
            Math.LOG10E,
            Math.LOG2E,
            Math.PI,
            Math.SQRT1_2,
            Math.SQRT2,
          ].join(",");
      }
      replay.finish(game.currentTick);
      this.saveReplay(replay);
    }
    this.handleError(e, text, isCustom, {
      context: {
        GameId: game.id,
        CurrentTick: game.currentTick,
        MapName: (game.gameOpts && game.gameOpts.mapName) || "N/A",
        MapOfficial: game.gameOpts && game.gameOpts.mapOfficial ? "Yes" : "No",
        PlayerName: this.playerName,
      },
    });
    this.sendDebugInfo(
      e,
      {
        gameId: game.id,
        replay,
        map: this.debugMapFile,
        official: game.gameOpts.mapOfficial,
      },
      buildDump,
    );
    if (e === "desync_error") {
      this.sendGameRes(game, {
        disconnect: false,
        desync: true,
        quit: false,
        finished: false,
      });
    }
  }

  /**
   * Sentry 附件上报。
   * @param error 错误
   * @param extras 附件
   * @param buildDump dump 工厂
   */
  sendDebugInfo(
    error: any,
    extras: { gameId?: any; replay?: any; map?: any; official?: boolean } = {},
    buildDump?: () => Promise<any>,
  ): void {
    if (!this.sentry) return;
    if (error.message?.match(/out of memory|buffer allocation|WebGLRenderingContext/i)) {
      return;
    }
    void (async () => {
      const dump = buildDump ? await buildDump() : void 0;
      this.sentry.captureException(error, (scope: any) => {
        if (extras.gameId) scope.setTag("gameId", extras.gameId);
        scope.setTag("nick", this.playerName);
        scope.setTag("tournament", this.isTournament);
        if (dump?.stateDump) {
          scope.addAttachment({ filename: "statedump.7z", data: dump.stateDump });
        }
        if (dump?.debugLog) {
          scope.addAttachment({ filename: "lockstep_log.7z", data: dump.debugLog });
        }
        if (extras.replay) {
          try {
            scope.addAttachment({
              filename: extras.replay.name + Replay.extension,
              data: extras.replay.serialize(),
            });
          } catch (e) {
            scope.setExtra("replayError", e);
          }
        }
        if (extras.map) {
          scope.addAttachment({
            filename: extras.map.filename,
            data: extras.map.getBytes(),
          });
          scope.setTag("mapName", extras.map.filename);
        }
        if (extras.official !== void 0) scope.setTag("officialMap", extras.official);
        return scope;
      });
    })().catch((e) => console.error("Failed sending error to sentry", e));
  }

  /**
   * 通用错误入口。
   * @param error 错误
   * @param message 文案
   * @param silent 是否不返回主菜单
   * @param extraDetails 附加详情
   */
  handleError(error: any, message: string, silent?: boolean, extraDetails?: any): void {
    if (this.gameTurnMgr) this.gameTurnMgr.setErrorState();
    this.pointer.unlock();
    const closeNet = () => {
      this.wolService.closeWolConnection();
      if (!this.isSinglePlayer && this.gservCon.isOpen()) {
        this.gservCon.onClose.unsubscribe(this.onGservClose);
        this.gservCon.close();
      }
    };
    // 构建详细错误信息
    const details: any = {
      type:
        error && error.constructor && error.constructor.name !== "String"
          ? error.constructor.name
          : typeof error === "string"
            ? "Error"
            : (error && error.name) || "Unknown",
      errorMessage:
        error && error.message
          ? error.message
          : typeof error === "string"
            ? error
            : "",
      stack: error && error.stack ? error.stack : "",
    };
    // 合并额外的上下文信息
    if (extraDetails?.context) details.context = extraDetails.context;
    if (extraDetails?.file) details.file = extraDetails.file;
    const onDone = silent
      ? void 0
      : () => {
          closeNet();
          this.controller?.goToScreen(RootScreenType.MainMenuRoot);
        };
    if (this.errorHandler.handleWithDetails) {
      this.errorHandler.handleWithDetails(error, message, details, onDone);
    } else {
      this.errorHandler.handle(error, message, onDone);
    }
    if (silent) {
      closeNet();
      this.playerUi?.dispose();
    }
  }

  /**
   * 异步保存回放。
   * @param replay 回放
   */
  saveReplay(replay: any): void {
    void (async () => {
      try {
        await this.replayManager.saveReplay(replay);
      } catch (e) {
        if (
          !(
            e instanceof StorageQuotaError ||
            e instanceof IOError ||
            e instanceof FileNotFoundError ||
            e instanceof ReplayStorageError
          )
        ) {
          this.sendDebugInfo(e, { replay, gameId: this.game?.id });
        }
        console.error(e);
        this.toastApi.push(this.strings.get("GUI:SaveReplayError"));
      }
    })();
  }

  /**
   * 异步上报 gameres?   * @param game 游戏
   * @param flags 标志
   */
  sendGameRes(game: any, flags: any): void {
    void (async () => {
      if (!this.wgameresService.getUrl()) return;
      try {
        const packet = new GameRes()
          .fromGame(game, this.isTournament, this.getGameResClientInfo(flags))
          .toBinary();
        await this.wgameresService.sendGameResPacket(packet);
      } catch (e) {
        console.error(e);
      }
    })();
  }

  /**
   * gameres 客户端信息。
   * @param flags 标志
   */
  getGameResClientInfo(flags: any): any {
    return {
      clientVers: this.engineVersion,
      avgFps: 0,
      avgRtt: this.avgPing.calculate() ?? 0,
      outOfSync: flags.desync,
      gameSku: this.wolService.getConfig().getClientSku(),
      accountName: this.playerName,
      suddenDisconnect: flags.disconnect,
      quit: flags.quit,
      finished: flags.finished,
      pingsRecv: 0,
      pingsSent: 0,
    };
  }

  /**
   * 单机 F10 作弊菜单。
   * @param game 游戏
   * @param local 玩家
   */
  private setupCheatMenu = (game: any, local: any): void => {
      // ============ [CHEAT] 调试作弊系统 开。============
    let menuEl: HTMLElement | null = null;
    let moneyTimer: any = null;
    let swTimer: any = null;
    const state = {
      infMoney: false,
      fastBuild: false,
      allTech: false,
      techBoost: false,
      mapRevealed: false,
      bypassBuildLimit: false,
      infSuperWeapon: false,
      buildAnywhere: false,
    };
    const self = this;
    const destroy = () => {
      if (menuEl) {
        menuEl.remove();
        menuEl = null;
      }
    };
    const create = () => {
      if (menuEl) {
        destroy();
        return;
      }
      const el = document.createElement("div");
      el.style.cssText =
        "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:rgba(0,0,0,0.92);border:2px solid #f60;border-radius:8px;padding:20px 28px;font-family:monospace;color:#fff;min-width:320px;user-select:none;";
      const title = document.createElement("div");
      title.textContent = "调试作弊菜单";
      title.style.cssText =
        "text-align:center;font-size:18px;font-weight:bold;color:#f60;margin-bottom:16px;border-bottom:1px solid #333;padding-bottom:10px;";
      el.appendChild(title);
      const addToggle = (label: string, getter: () => boolean, onToggle: () => void) => {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:6px 0;";
        const lbl = document.createElement("span");
        lbl.textContent = label;
        lbl.style.fontSize = "14px";
        const btn = document.createElement("button");
        btn.style.cssText =
          "padding:4px 14px;border:1px solid #888;border-radius:4px;cursor:pointer;font-family:monospace;font-size:13px;min-width:60px;";
        const refresh = () => {
          const on = getter();
          btn.textContent = on ? "ON" : "OFF";
          btn.style.background = on ? "#2a5a2a" : "#5a2a2a";
          btn.style.color = on ? "#6f6" : "#f66";
          btn.style.borderColor = on ? "#4a4" : "#a44";
        };
        btn.addEventListener("click", () => {
          onToggle();
          refresh();
        });
        refresh();
        row.appendChild(lbl);
        row.appendChild(btn);
        el.appendChild(row);
        return refresh;
      };
      const addBtn = (label: string, onClick: () => void) => {
        const row = document.createElement("div");
        row.style.cssText = "padding:6px 0;";
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.style.cssText =
          "width:100%;padding:6px 12px;border:1px solid #888;border-radius:4px;cursor:pointer;font-family:monospace;font-size:13px;background:#2a3a5a;color:#adf;";
        btn.addEventListener("click", onClick);
        row.appendChild(btn);
        el.appendChild(row);
      };
      const addSep = () => {
        const sep = document.createElement("div");
        sep.style.cssText = "border-top:1px solid #333;margin:6px 0;";
        el.appendChild(sep);
      };
      // [CHEAT] 无限金钱：每200ms增加50000金钱
      addToggle("无限金钱", () => state.infMoney, () => {
        state.infMoney = !state.infMoney;
        if (state.infMoney) {
          if (!moneyTimer) {
            moneyTimer = setInterval(() => {
              if (game.status === 1) local.credits += 50000;
            }, 200);
          }
        } else if (moneyTimer) {
          clearInterval(moneyTimer);
          moneyTimer = null;
        }
      });
      // [CHEAT] 秒建造：设置speedCheat为true，建造速度变为极快
      addToggle("秒建造", () => state.fastBuild, () => {
        state.fastBuild = !state.fastBuild;
        self.speedCheat.value = state.fastBuild;
      });
      // [CHEAT] 突破建造限制：允许超过单位的buildLimit数量限制
      addToggle("突破建造限制", () => state.bypassBuildLimit, () => {
        state.bypassBuildLimit = !state.bypassBuildLimit;
        const prod = local.production;
        if (prod) prod.cheatsBypassBuildLimits = state.bypassBuildLimit;
      });
      // [CHEAT] 随处建造：无视地形（水面/斜坡等）与相邻建筑要求，任意位置放置建筑
      addToggle("随处建造", () => state.buildAnywhere, () => {
        state.buildAnywhere = !state.buildAnywhere;
        const prod = local.production;
        if (prod) prod.cheatsBuildAnywhere = state.buildAnywhere;
      });
      // [CHEAT] 无限超级武器：所有超级武器瞬间冷却，可无限使用
      addToggle("无限超级武器", () => state.infSuperWeapon, () => {
        state.infSuperWeapon = !state.infSuperWeapon;
        if (state.infSuperWeapon) {
          if (!swTimer) {
            swTimer = setInterval(() => {
              if (game.status === 1 && local.superWeaponsTrait) {
                for (const sw of local.superWeaponsTrait.getAll()) {
                  sw.chargeTicks = 0;
                  sw.status = 2; // SuperWeaponStatus.Ready
                }
              }
            }, 100);
          }
        } else if (swTimer) {
          clearInterval(swTimer);
          swTimer = null;
        }
      });
      addSep();
      // [CHEAT] 一次性增加10万金钱
      addBtn("增加 100,000 金钱", () => {
        local.credits += 100000;
      });
      // [CHEAT] 地图全开：揭示整个地图的战争迷雾
      addBtn("地图全开", () => {
        game.mapShroudTrait.revealMap(local, game);
        state.mapRevealed = true;
      });
      // [CHEAT] 科技全开：设置maxTechLevel=99，添加所有阵营科技，跳过工厂和前置建筑检查
      addBtn("科技全开", () => {
        const prod = local.production;
        if (prod) {
          prod.maxTechLevel = 99;
          prod.addStolenTech(0); // GDI
          prod.addStolenTech(1); // Nod
          prod.addStolenTech(2); // ThirdSide
          prod.cheatsBypassPrereqs = true; // 跳过工厂和前置建筑检查
          state.allTech = true;
        }
      });
      // [CHEAT] 科技增强：允许建造科技等级-1及以下的隐藏单位（与科技全开相互独立，可单独开启）
      addToggle("科技增强", () => state.techBoost, () => {
        state.techBoost = !state.techBoost;
        const prod = local.production;
        if (prod) prod.cheatsBypassTechLevel = state.techBoost;
        // 立即刷新侧边栏，使隐藏单位即时显示/隐藏
        const sm = self.sidebarModel;
        if (sm && typeof sm.updateAvailableObjects === "function" && game) {
          sm.updateAvailableObjects(game.art);
        }
      });
      addSep();
      // [CHEAT] 一键全部开启
      addBtn("一键全部开启", () => {
        self.runtimeVars.cheatsEnabled.value = true;
        if (!state.infMoney) {
          state.infMoney = true;
          if (!moneyTimer) {
            moneyTimer = setInterval(() => {
              if (game.status === 1) local.credits += 50000;
            }, 200);
          }
        }
        if (!state.fastBuild) {
          state.fastBuild = true;
          self.speedCheat.value = true;
        }
        game.mapShroudTrait.revealMap(local, game);
        state.mapRevealed = true;
        const prod = local.production;
        if (prod) {
          prod.maxTechLevel = 99;
          prod.addStolenTech(0);
          prod.addStolenTech(1);
          prod.addStolenTech(2);
          prod.cheatsBypassPrereqs = true;
          prod.cheatsBypassTechLevel = true;
          prod.cheatsBypassBuildLimits = true;
          state.allTech = true;
          state.techBoost = true;
          state.bypassBuildLimit = true;
        }
        if (!state.buildAnywhere) {
          state.buildAnywhere = true;
          if (prod) prod.cheatsBuildAnywhere = true;
        }
        if (!state.infSuperWeapon) {
          state.infSuperWeapon = true;
          if (!swTimer) {
            swTimer = setInterval(() => {
              if (game.status === 1 && local.superWeaponsTrait) {
                for (const sw of local.superWeaponsTrait.getAll()) {
                  sw.chargeTicks = 0;
                  sw.status = 2;
                }
              }
            }, 100);
          }
        }
        destroy();
        create();
      });
      addSep();
      // [CHEAT] 设置选中单位为一星 / 三星
                        // 后续删除作弊功能时，同步删除 CombatantUi.ts.js 中的 setSelectedVeteranLevel 方法
      addBtn("选中单位一星", () => {
        self.runtimeVars.cheatsEnabled.value = true;
        self.playerUi.setSelectedVeteranLevel(1);
      });
      addBtn("选中单位三星", () => {
        self.runtimeVars.cheatsEnabled.value = true;
        self.playerUi.setSelectedVeteranLevel(2);
      });
      // [CHEAT] 结束
      const hint = document.createElement("div");
      hint.textContent = "按 F10 关闭菜单";
      hint.style.cssText =
        "text-align:center;font-size:11px;color:#666;margin-top:12px;";
      el.appendChild(hint);
      document.body.appendChild(el);
      menuEl = el;
    };
    const onF10 = (ev: KeyboardEvent) => {
      if (ev.key === "F10") {
        ev.preventDefault();
        create();
      }
    };
    document.addEventListener("keydown", onF10);
    this.disposables.add(() => {
      document.removeEventListener("keydown", onF10);
      destroy();
      if (moneyTimer) {
        clearInterval(moneyTimer);
        moneyTimer = null;
      }
      if (swTimer) {
        clearInterval(swTimer);
        swTimer = null;
      }
    });
      // ============ [CHEAT] 调试作弊系统 结束 ============
  };
}
