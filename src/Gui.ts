/**
 * Gui — 图形界面总控：渲染器、场景、屏幕路由、声音、回放、网络服务。
 *
 * init 主流程（与孪生一致）：
 * 1) initRenderer（RendererError → alert 退出）+ 视口/全屏订阅；
 * 2) UiScene/Pointer/JsxRenderer/Toast/MessageBox/ErrorHandler；
 * 3) KeyBinds、回放存储、地图加载器、WOL/GSERV/Ladder 服务；
 * 4) Rules（Mod 加载失败可回退）、initSound；
 * 5) 主菜单屏 Map + GameMenu/Loading + GameScreen/ReplayScreen 注册；
 * 6) routeToInitialScreen（重连/GPU 档/补丁说明/音频权限/回放）。
 *
 * 由 Gui.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactNs from "react"; // 孪生（第三方）
import * as EngineNs from "engine/Engine"; // 孪生
import * as EngineTypeNs from "engine/EngineType"; // 已转换
import * as UiSceneNs from "gui/UiScene"; // 孪生
import * as RendererNs from "engine/gfx/Renderer"; // 孪生
import * as RulesNs from "game/rules/Rules"; // 孪生
import * as RootControllerNs from "gui/screen/RootController"; // 孪生
import * as MainMenuRootScreenNs from "gui/screen/mainMenu/MainMenuRootScreen"; // 孪生
import * as GameScreenNs from "gui/screen/game/GameScreen"; // 孪生
import * as gameMenuScreenTypeNs from "gui/screen/game/gameMenu/ScreenType"; // 孪生
import * as mainMenuScreenTypeNs from "gui/screen/mainMenu/ScreenType"; // 孪生
import * as rootScreenTypeNs from "gui/screen/ScreenType"; // 孪生
import * as MessageBoxApiNs from "gui/component/MessageBoxApi"; // 孪生
import * as WolConnectionNs from "network/WolConnection"; // 孪生
import * as GservConnectionNs from "network/GservConnection"; // 孪生
import * as ParserNs from "network/gameopt/Parser"; // 孪生
import * as SerializerNs from "network/gameopt/Serializer"; // 孪生
import * as ResourceLoaderNs from "engine/ResourceLoader"; // 已转换
import { ErrorHandler } from "ErrorHandler"; // 已转换
import * as ErrorDetailsBoxApiNs from "gui/component/ErrorDetailsBoxApi"; // 孪生
import * as UiAnimationLoopNs from "engine/UiAnimationLoop"; // 孪生
import * as LoggerNs from "util/Logger"; // 已转换
import * as DevToolsApiNs from "tools/DevToolsApi"; // 已转换
import * as JsxRendererNs from "gui/jsx/JsxRenderer"; // 孪生
import * as PointerNs from "gui/Pointer"; // 孪生
import * as SoundNs from "engine/sound/Sound"; // 已转换
import * as AudioSystemNs from "engine/sound/AudioSystem"; // 已转换
import * as MixerNs from "engine/sound/Mixer"; // 已转换
import * as SoundSpecsNs from "engine/sound/SoundSpecs"; // 已转换
import * as ChannelTypeNs from "engine/sound/ChannelType"; // 已转换
import * as LocalPrefsNs from "LocalPrefs"; // 已转换
import * as KeyBindsNs from "gui/screen/game/worldInteraction/keyboard/KeyBinds"; // 孪生
import * as ReplayManagerNs from "gui/ReplayManager"; // 孪生
import * as ReplayScreenNs from "gui/screen/replay/ReplayScreen"; // 孪生
import * as ReplayFileNotFoundErrorNs from "data/vfs/FileNotFoundError"; // 已转换
import * as MusicNs from "engine/sound/Music"; // 已转换
import * as MusicSpecsNs from "engine/sound/MusicSpecs"; // 已转换
import * as GameLoaderNs from "gui/screen/game/GameLoader"; // 孪生
import { BoxedVar } from "util/BoxedVar"; // 已转换
import * as VxlGeometryPoolNs from "engine/renderable/builder/vxlGeometry/VxlGeometryPool"; // 孪生
import * as VxlGeometryCacheNs from "engine/gfx/geometry/VxlGeometryCache"; // 孪生
import * as RendererErrorNs from "engine/gfx/RendererError"; // 孪生
import * as ReplayStorageFileSystemNs from "gui/replay/ReplayStorageFileSystem"; // 孪生
import * as ReplayStorageMemStorageNs from "gui/replay/ReplayStorageMemStorage"; // 孪生
import * as ReplayNs from "network/gamestate/Replay"; // 孪生
import * as StorageQuotaErrorNs from "data/vfs/StorageQuotaError"; // 已转换
import * as CanvasMetricsNs from "gui/CanvasMetrics"; // 孪生
import * as IOErrorNs from "data/vfs/IOError"; // 已转换
import * as CompositeDisposableNs from "util/disposable/CompositeDisposable"; // 已转换
import * as ToastApiNs from "gui/component/ToastApi"; // 孪生
import * as WolServiceNs from "network/WolService"; // 孪生
import * as HomeScreenNs from "gui/screen/mainMenu/main/HomeScreen"; // 孪生
import * as SkirmishScreenNs from "gui/screen/mainMenu/lobby/SkirmishScreen"; // 孪生
import * as SinglePlayerScreenNs from "gui/screen/mainMenu/main/SinglePlayerScreen"; // 孪生
import * as CampaignScreenNs from "gui/screen/mainMenu/campaign/CampaignScreen"; // 孪生
import * as CampaignResourcesNs from "gui/screen/mainMenu/campaign/CampaignResources"; // 孪生
import * as LoginScreenNs from "gui/screen/mainMenu/login/LoginScreen"; // 孪生
import * as NewAccountScreenNs from "gui/screen/mainMenu/newAccount/NewAccountScreen"; // 孪生
import * as CustomGameScreenNs from "gui/screen/mainMenu/customGame/CustomGameScreen"; // 孪生
import * as LobbyScreenNs from "gui/screen/mainMenu/lobby/LobbyScreen"; // 孪生
import * as MapSelScreenNs from "gui/screen/mainMenu/mapSel/MapSelScreen"; // 孪生
import * as ReplaySelScreenNs from "gui/screen/replay/ReplaySelScreen"; // 孪生
import * as ScoreScreenNs from "gui/screen/mainMenu/score/ScoreScreen"; // 孪生
import * as InfoAndCreditsScreenNs from "gui/screen/mainMenu/infoAndCredits/InfoAndCreditsScreen"; // 孪生
import * as CreditsScreenNs from "gui/screen/mainMenu/credits/CreditsScreen"; // 孪生
import * as OptionsScreenNs from "gui/screen/options/OptionsScreen"; // 孪生
import * as SoundOptsScreenNs from "gui/screen/options/SoundOptsScreen"; // 孪生
import * as KeyboardScreenNs from "gui/screen/options/KeyboardScreen"; // 孪生
import * as StorageScreenNs from "gui/screen/options/StorageScreen"; // 孪生
import * as PatchNotesScreenNs from "gui/screen/mainMenu/patchNotes/PatchNotesScreen"; // 孪生
import * as ExtensionsScreenNs from "gui/screen/mainMenu/extensions/ExtensionsScreen"; // 孪生
import * as GameMenuHomeScreenNs from "gui/screen/game/gameMenu/GameMenuHomeScreen"; // 孪生
import * as DiploScreenNs from "gui/screen/game/gameMenu/DiploScreen"; // 孪生
import * as ConnectionInfoScreenNs from "gui/screen/game/gameMenu/ConnectionInfoScreen"; // 孪生
import * as QuitConfirmScreenNs from "gui/screen/game/gameMenu/QuitConfirmScreen"; // 孪生
import * as LoadingScreenApiFactoryNs from "gui/screen/game/loadingScreen/LoadingScreenApiFactory"; // 孪生
import * as MapFileLoaderNs from "gui/screen/game/MapFileLoader"; // 孪生
import * as ModSelScreenNs from "gui/screen/mainMenu/modSel/ModSelScreen"; // 孪生
import * as ModManagerNs from "gui/screen/mainMenu/modSel/ModManager"; // 孪生
import * as QuickGameScreenNs from "gui/screen/mainMenu/quickGame/QuickGameScreen"; // 孪生
import * as WLadderServiceNs from "network/ladder/WLadderService"; // 已转换
import * as LadderScreenNs from "gui/screen/mainMenu/ladder/LadderScreen"; // 孪生
import * as WolConfigNs from "network/WolConfig"; // 孪生
import * as LadderRulesScreenNs from "gui/screen/mainMenu/ladderRules/LadderRulesScreen"; // 孪生
import { ClientApi } from "ClientApi"; // 已转换
import * as WGameResServiceNs from "network/WGameResService"; // 孪生
import * as MapTransferServiceNs from "network/MapTransferService"; // 孪生
import * as stringNs from "util/string"; // 已转换
import { RouteHelper } from "RouteHelper"; // 已转换
import * as workerHostNs from "worker/workerHost"; // 已转换

const Engine: any = (EngineNs as any).Engine;
const EngineType: any = (EngineTypeNs as any).EngineType;
const UiScene: any = (UiSceneNs as any).UiScene;
const Renderer: any = (RendererNs as any).Renderer;
const Rules: any = (RulesNs as any).Rules;
const RootController: any = (RootControllerNs as any).RootController;
const MainMenuRootScreen: any = (MainMenuRootScreenNs as any).MainMenuRootScreen;
const GameScreen: any = (GameScreenNs as any).GameScreen;
const GameMenuScreenType: any = (gameMenuScreenTypeNs as any).ScreenType;
const MainMenuScreenType: any = (mainMenuScreenTypeNs as any).ScreenType;
const RootScreenType: any = (rootScreenTypeNs as any).ScreenType;
const MessageBoxApi: any = (MessageBoxApiNs as any).MessageBoxApi;
const WolConnection: any = (WolConnectionNs as any).WolConnection;
const GservConnection: any = (GservConnectionNs as any).GservConnection;
const Parser: any = (ParserNs as any).Parser;
const Serializer: any = (SerializerNs as any).Serializer;
const ResourceLoader: any = (ResourceLoaderNs as any).ResourceLoader;
const ErrorDetailsBoxApi: any = (ErrorDetailsBoxApiNs as any).ErrorDetailsBoxApi;
const UiAnimationLoop: any = (UiAnimationLoopNs as any).UiAnimationLoop;
const AppLogger: any = (LoggerNs as any).AppLogger;
const DevToolsApi: any = (DevToolsApiNs as any).DevToolsApi;
const JsxRenderer: any = (JsxRendererNs as any).JsxRenderer;
const Pointer: any = (PointerNs as any).Pointer;
const Sound: any = (SoundNs as any).Sound;
const AudioSystem: any = (AudioSystemNs as any).AudioSystem;
const Mixer: any = (MixerNs as any).Mixer;
const SoundSpecs: any = (SoundSpecsNs as any).SoundSpecs;
const ChannelType: any = (ChannelTypeNs as any).ChannelType;
const StorageKey: any = LocalPrefsNs.StorageKey;
const KeyBinds: any = (KeyBindsNs as any).KeyBinds;
const ReplayManager: any = (ReplayManagerNs as any).ReplayManager;
const ReplayScreen: any = (ReplayScreenNs as any).ReplayScreen;
const ReplayFileNotFoundError: any = (ReplayFileNotFoundErrorNs as any).FileNotFoundError;
const Music: any = (MusicNs as any).Music;
const MusicSpecs: any = (MusicSpecsNs as any).MusicSpecs;
const GameLoader: any = (GameLoaderNs as any).GameLoader;
const VxlGeometryPool: any = (VxlGeometryPoolNs as any).VxlGeometryPool;
const VxlGeometryCache: any = (VxlGeometryCacheNs as any).VxlGeometryCache;
const RendererError: any = (RendererErrorNs as any).RendererError;
const ReplayStorageFileSystem: any = (ReplayStorageFileSystemNs as any).ReplayStorageFileSystem;
const ReplayStorageMemStorage: any = (ReplayStorageMemStorageNs as any).ReplayStorageMemStorage;
const Replay: any = (ReplayNs as any).Replay;
const StorageQuotaError: any = (StorageQuotaErrorNs as any).StorageQuotaError;
const CanvasMetrics: any = (CanvasMetricsNs as any).CanvasMetrics;
const IOError: any = (IOErrorNs as any).IOError;
const CompositeDisposable: any = (CompositeDisposableNs as any).CompositeDisposable;
const ToastApi: any = (ToastApiNs as any).ToastApi;
const WolService: any = (WolServiceNs as any).WolService;
const HomeScreen: any = (HomeScreenNs as any).HomeScreen;
const SkirmishScreen: any = (SkirmishScreenNs as any).SkirmishScreen;
const SinglePlayerScreen: any = (SinglePlayerScreenNs as any).SinglePlayerScreen;
const CampaignScreen: any = (CampaignScreenNs as any).CampaignScreen;
const CampaignResources: any = (CampaignResourcesNs as any).CampaignResources;
const LoginScreen: any = (LoginScreenNs as any).LoginScreen;
const NewAccountScreen: any = (NewAccountScreenNs as any).NewAccountScreen;
const CustomGameScreen: any = (CustomGameScreenNs as any).CustomGameScreen;
const LobbyScreen: any = (LobbyScreenNs as any).LobbyScreen;
const MapSelScreen: any = (MapSelScreenNs as any).MapSelScreen;
const ReplaySelScreen: any = (ReplaySelScreenNs as any).ReplaySelScreen;
const ScoreScreen: any = (ScoreScreenNs as any).ScoreScreen;
const InfoAndCreditsScreen: any = (InfoAndCreditsScreenNs as any).InfoAndCreditsScreen;
const CreditsScreen: any = (CreditsScreenNs as any).CreditsScreen;
const OptionsScreen: any = (OptionsScreenNs as any).OptionsScreen;
const SoundOptsScreen: any = (SoundOptsScreenNs as any).SoundOptsScreen;
const KeyboardScreen: any = (KeyboardScreenNs as any).KeyboardScreen;
const StorageScreen: any = (StorageScreenNs as any).StorageScreen;
const PatchNotesScreen: any = (PatchNotesScreenNs as any).PatchNotesScreen;
const ExtensionsScreen: any = (ExtensionsScreenNs as any).ExtensionsScreen;
const GameMenuHomeScreen: any = (GameMenuHomeScreenNs as any).GameMenuHomeScreen;
const DiploScreen: any = (DiploScreenNs as any).DiploScreen;
const ConnectionInfoScreen: any = (ConnectionInfoScreenNs as any).ConnectionInfoScreen;
const QuitConfirmScreen: any = (QuitConfirmScreenNs as any).QuitConfirmScreen;
const LoadingScreenApiFactory: any = (LoadingScreenApiFactoryNs as any).LoadingScreenApiFactory;
const MapFileLoader: any = (MapFileLoaderNs as any).MapFileLoader;
const ModSelScreen: any = (ModSelScreenNs as any).ModSelScreen;
const ModManager: any = (ModManagerNs as any).ModManager;
const QuickGameScreen: any = (QuickGameScreenNs as any).QuickGameScreen;
const WLadderService: any = (WLadderServiceNs as any).WLadderService;
const LadderScreen: any = (LadderScreenNs as any).LadderScreen;
const WolConfig: any = (WolConfigNs as any).WolConfig;
const ClientType: any = (WolConfigNs as any).ClientType; // ClientType 是模块顶层导出的枚举，不是 WolConfig 类的静态
const LadderRulesScreen: any = (LadderRulesScreenNs as any).LadderRulesScreen;
const WGameResService: any = (WGameResServiceNs as any).WGameResService;
const MapTransferService: any = (MapTransferServiceNs as any).MapTransferService;
const stringUtils: any = stringNs;
const workerHost: any = workerHostNs;

export class Gui {
  readonly appVersion: string;
  readonly appLocale?: string;
  readonly engineVersion: string;
  readonly engineModHash: string;
  readonly gpuTier: any;
  readonly config: any;
  readonly gameResConfig: any;
  readonly appResPath: string;
  readonly localPrefs: any;
  readonly generalOptions: any;
  readonly rootEl: HTMLElement;
  readonly viewport: any;
  readonly fullScreen: any;
  readonly strings: any;
  readonly cdnResourceLoader: any;
  readonly serverRegions: any;
  readonly runtimeVars: any;
  readonly sentry: any;
  readonly disposables = new CompositeDisposable();

  renderer?: any;
  uiScene?: any;
  pointer?: any;
  jsxRenderer?: any;
  toastApi?: any;
  messageBoxApi?: any;
  rootController?: any;
  canvasMetrics?: any;

  /** 全屏切换时按用户锁模式恢复指针锁定。 */
  readonly handleFullScreenChange = (full: boolean) => {
    full && this.pointer?.getUserLockMode() && this.pointer.lock();
  };

  /** 视口变化：同步渲染器/相机/JSX/消息框/当前屏/度量。 */
  readonly handleViewportChange = (size: { width: number; height: number }) => {
    let camera: any;
    (this.renderer?.setViewportSize(size.width, size.height),
      this.uiScene &&
        ((camera = UiScene.createCamera(this.viewport.value)),
        this.uiScene.setCamera(camera),
        this.uiScene.setViewport(this.viewport.value),
        this.jsxRenderer?.setCamera(camera),
        this.messageBoxApi?.updateViewport(this.viewport.value),
        this.rootController?.rerenderCurrentScreen(),
        this.canvasMetrics?.notifyViewportChange()));
  };

  constructor(
    appVersion: string,
    appLocale: string | undefined,
    engineVersion: string,
    engineModHash: string,
    gpuTier: any,
    config: any,
    gameResConfig: any,
    appResPath: string,
    localPrefs: any,
    generalOptions: any,
    rootEl: HTMLElement,
    viewport: any,
    fullScreen: any,
    strings: any,
    cdnResourceLoader: any,
    serverRegions: any,
    runtimeVars: any,
    sentry: any,
  ) {
    (this.appVersion = appVersion),
      (this.appLocale = appLocale),
      (this.engineVersion = engineVersion),
      (this.engineModHash = engineModHash),
      (this.gpuTier = gpuTier),
      (this.config = config),
      (this.gameResConfig = gameResConfig),
      (this.appResPath = appResPath),
      (this.localPrefs = localPrefs),
      (this.generalOptions = generalOptions),
      (this.rootEl = rootEl),
      (this.viewport = viewport),
      (this.fullScreen = fullScreen),
      (this.strings = strings),
      (this.cdnResourceLoader = cdnResourceLoader),
      (this.serverRegions = serverRegions),
      (this.runtimeVars = runtimeVars),
      (this.sentry = sentry);
  }

  /** 取根控制器（未初始化则抛错）。 */
  getRootController(): any {
    if (!this.rootController) throw new Error("Root controller is not initialized");
    return this.rootController;
  }

  /**
   * 完整初始化：渲染器 → 交互层 → 网络/规则/声音 → 屏幕注册 → 初始路由。
   * @param replayTarget - 可选回放目标（{replayId}|{replayUrl}）
   */
  async init(replayTarget?: any): Promise<void> {
    const strings: any = this.strings;
    let renderer: any, loop: any;
    try {
      ({ renderer, uiAnimationLoop: loop } = this.initRenderer(
        this.rootEl,
        this.viewport.value,
        this.config.devMode,
      ));
    } catch (e) {
      if (e instanceof RendererError)
        return (console.error(e.cause), void alert(strings.get("TS:RendererInitError")));
      throw e;
    }
    ((this.renderer = renderer),
      this.viewport.onChange.subscribe(this.handleViewportChange),
      this.disposables.add(() => this.viewport.onChange.unsubscribe(this.handleViewportChange)),
      this.fullScreen.onChange.subscribe(this.handleFullScreenChange),
      this.disposables.add(() => this.fullScreen.onChange.unsubscribe(this.handleFullScreenChange)));
    const gameResConfig = this.gameResConfig;
    const uiScene = UiScene.factory(this.viewport.value);
    const metrics = (this.canvasMetrics = new CanvasMetrics(renderer.getCanvas(), window));
    (metrics.init(), this.disposables.add(metrics));
    const pointer = (this.pointer = Pointer.factory(
      Engine.getImages().get(
        // YR-only — mouse cursor is always mouse.sha.
        "mouse.sha",
      ),
      Engine.getPalettes().get("mousepal.pal"),
      renderer,
      document,
      metrics,
      this.generalOptions.mouseAcceleration,
    ));
    (pointer.init(), this.disposables.add(pointer), uiScene.add(pointer.getSprite()));
    const jsxRenderer = (this.jsxRenderer = new JsxRenderer(
      Engine.getImages(),
      Engine.getPalettes(),
      uiScene.camera,
      pointer.pointerEvents,
    ));
    ((this.toastApi = new ToastApi(this.viewport, uiScene, jsxRenderer)),
      this.disposables.add(this.toastApi),
      (this.messageBoxApi = new MessageBoxApi(this.viewport.value, uiScene, jsxRenderer)));
    const errorDetailsBoxApi = new ErrorDetailsBoxApi(this.viewport, strings, this.rootEl);
    const errorHandler = new ErrorHandler(this.messageBoxApi, strings, errorDetailsBoxApi);
    const gameoptParser = new Parser();
    const gameoptSerializer = new Serializer();
    let rootController = (this.rootController = new RootController(this.serverRegions));
    let mpModes = Engine.getMpModes();
    const keyFileName = Engine.getFileNameVariant("keyboard.ini");
    const keyBinds = new KeyBinds(Engine.rfs?.getRootDirectory(), keyFileName, Engine.getIni(keyFileName));
    await keyBinds.load();
    const replayDir = await Engine.getReplayDir().catch((e: any) => {
      (console.error("Couldn't get replay directory", [e]),
        e instanceof StorageQuotaError ||
          e instanceof IOError ||
          e instanceof ReplayFileNotFoundError ||
          this.sentry?.captureException(
            Object.assign(new Error(`Couldn't get replay directory (${e.name})`), { cause: e }),
          ));
    });
    const replayStorage = replayDir
      ? new ReplayStorageFileSystem(replayDir, this.sentry)
      : new ReplayStorageMemStorage();
    const replayManager = new ReplayManager(replayStorage);
    const options = this.generalOptions;
    const mapLoaderRes = new ResourceLoader(this.config.mapsBaseUrl);
    const modLoaderRes = new ResourceLoader(this.appResPath);
    const modWebRes = new ResourceLoader(this.config.modsBaseUrl);
    const mapFileLoader = new MapFileLoader(mapLoaderRes, Engine.vfs);
    const wolLogger = AppLogger.get("wol");
    const wolConfig = WolConfig.factory(ClientType.Cdral2);
    let wolConnection: any = WolConnection.factory(wolLogger);
    const wolService = new WolService(wolConfig, wolConnection, this.appVersion, this.appLocale);
    (wolService.init(), this.disposables.add(wolService));
    const ladderService = new WLadderService(wolConfig);
    const wGameResService = new WGameResService(wolService, wolConfig);
    const mapTransferService = new MapTransferService(wolService);
    const gservLogger = AppLogger.get("gserv");
    const gservConnection = GservConnection.factory(gservLogger);
    const realMapList = Engine.getMapList();
    let mapList = realMapList;
    let modDir = await Engine.getModDir().catch((e: any) => {
      (console.error("Couldn't get mods directory", [e]),
        e instanceof StorageQuotaError ||
          e instanceof IOError ||
          e instanceof ReplayFileNotFoundError ||
          this.sentry?.captureException(
            Object.assign(new Error(`Couldn't get mods directory (${e.name})`), { cause: e }),
          ));
    });
    let modManager: any = modDir ? new ModManager(window.location, modDir, modLoaderRes) : void 0;
    const activeMod = Engine.getActiveMod();
    let modMeta: any = activeMod ? await modManager?.loadModMeta(activeMod) : void 0;
    let mapDir = await Engine.getMapDir().catch((e: any) => {
      console.error("Couldn't get map dir", [e]);
    });
    const iniLogger = AppLogger.get("ini");
    let rules: any;
    try {
      rules = new Rules(Engine.getRules(), iniLogger);
    } catch (e) {
      if (activeMod && modManager)
        return (
          console.error(e),
          renderer.addScene(uiScene),
          (this.uiScene = uiScene),
          this.rootEl.appendChild(uiScene.getHtmlContainer().getElement()),
          await this.messageBoxApi.alert(strings.get("TS:ModLoadError"), strings.get("GUI:Ok")),
          void modManager.loadMod(void 0)
        );
      throw e;
    }
    const { mixer, sound, music } = await this.initSound(rules, gameResConfig);
    const menuScreens = new Map()
      .set(
        MainMenuScreenType.Home,
        new HomeScreen(
          strings,
          this.fullScreen,
          this.appVersion,
          !(!Engine.rfs || !modDir),
          !Engine.getActiveMod() && this.config.quickMatchEnabled,
          this.messageBoxApi,
        ),
      )
      .set(
        MainMenuScreenType.Skirmish,
        new SkirmishScreen(rootController, errorHandler, this.messageBoxApi, strings, rules, jsxRenderer, mapFileLoader, mapList, mpModes, this.localPrefs),
      )
      .set(
        MainMenuScreenType.SinglePlayer,
        new SinglePlayerScreen(strings),
      )
      .set(
        MainMenuScreenType.Campaign,
        new CampaignScreen(rootController, strings, jsxRenderer, mapFileLoader, errorHandler, new CampaignResources(Engine.vfs)),
      )
      .set(
        MainMenuScreenType.Login,
        new LoginScreen(
          wolService,
          ladderService,
          wGameResService,
          mapTransferService,
          strings,
          jsxRenderer,
          this.messageBoxApi,
          this.serverRegions,
          this.config.serversUrl,
          this.config.breakingNewsUrl,
          wolLogger,
          errorHandler,
          this.localPrefs,
          rootController,
          this.config.devMode,
        ),
      )
      .set(
        MainMenuScreenType.NewAccount,
        new NewAccountScreen(
          this.appLocale,
          strings,
          jsxRenderer,
          this.messageBoxApi,
          this.serverRegions,
          errorHandler,
          this.localPrefs,
        ),
      )
      .set(
        MainMenuScreenType.QuickGame,
        new QuickGameScreen(
          this.config.unrankedQueueEnabled,
          this.engineVersion,
          this.engineModHash,
          this.appLocale,
          rules,
          wolService,
          wolConnection,
          ladderService,
          this.serverRegions,
          rootController,
          this.messageBoxApi,
          uiScene,
          jsxRenderer,
          strings,
          this.localPrefs,
          sound,
          errorHandler,
        ),
      )
      .set(
        MainMenuScreenType.Ladder,
        new LadderScreen(ladderService, jsxRenderer, errorHandler, this.messageBoxApi, this.serverRegions, strings, this.appLocale),
      )
      .set(
        MainMenuScreenType.CustomGame,
        new CustomGameScreen(this.engineModHash, strings, wolConnection, wolService, ladderService, jsxRenderer, sound, this.serverRegions, mapList, errorHandler),
      )
      .set(
        MainMenuScreenType.Lobby,
        new LobbyScreen(
          this.config.botsEnabled,
          this.engineModHash,
          modMeta,
          rootController,
          errorHandler,
          this.messageBoxApi,
          strings,
          uiScene,
          wolConnection,
          wolService,
          ladderService,
          mapTransferService,
          gservConnection,
          rules,
          gameoptParser,
          gameoptSerializer,
          jsxRenderer,
          mapFileLoader,
          mapList,
          mpModes,
          sound,
          this.localPrefs,
        ),
      )
      .set(
        MainMenuScreenType.MapSelection,
        new MapSelScreen(strings, jsxRenderer, mapFileLoader, errorHandler, this.messageBoxApi, this.localPrefs, mapList, mpModes, mapDir, this.sentry),
      )
      .set(
        MainMenuScreenType.ReplaySelection,
        new ReplaySelScreen(
          this.engineVersion,
          this.engineModHash,
          activeMod,
          this.config.oldClientsBaseUrl,
          rootController,
          strings,
          jsxRenderer,
          errorHandler,
          this.messageBoxApi,
          replayManager,
          uiScene,
          rules,
          this.sentry,
        ),
      )
      .set(MainMenuScreenType.Score, new ScoreScreen(strings, jsxRenderer, this.messageBoxApi, this.localPrefs, this.config, wolService))
      .set(MainMenuScreenType.InfoAndCredits, new InfoAndCreditsScreen(strings, this.config, this.messageBoxApi))
      .set(MainMenuScreenType.Credits, new CreditsScreen(strings, jsxRenderer))
      .set(
        MainMenuScreenType.Options,
        new OptionsScreen(strings, jsxRenderer, options, this.localPrefs, this.fullScreen, false, !!Engine.rfs, mixer, void 0),
      )
      .set(MainMenuScreenType.OptionsSound, new SoundOptsScreen(strings, jsxRenderer, mixer, void 0, this.localPrefs))
      .set(MainMenuScreenType.OptionsKeyboard, new KeyboardScreen(strings, jsxRenderer, keyBinds))
      .set(MainMenuScreenType.OptionsStorage, new StorageScreen(strings, jsxRenderer, this.messageBoxApi, Engine.rfs));
    (modManager &&
      menuScreens.set(
        MainMenuScreenType.ModSelection,
        new ModSelScreen(
          rootController,
          strings,
          jsxRenderer,
          errorHandler,
          this.messageBoxApi,
          modManager,
          Engine.getActiveMod(),
          this.config.modSdkUrl,
          modWebRes,
          this.sentry,
        ),
      ),
      menuScreens.set(MainMenuScreenType.PatchNotes, new PatchNotesScreen(strings, jsxRenderer, this.config.patchNotesUrl || "res/changelog.html")),
      menuScreens.set(MainMenuScreenType.Extensions, new ExtensionsScreen(strings, jsxRenderer, this.localPrefs)),
      this.config.ladderRulesUrl &&
        menuScreens.set(MainMenuScreenType.LadderRules, new LadderRulesScreen(strings, jsxRenderer, this.config.ladderRulesUrl)));
    ((modMeta = await this.getMainMenuVideoUrl(gameResConfig, modDir)),
      (wolConnection = new MainMenuRootScreen(
        menuScreens,
        uiScene,
        gameResConfig,
        strings,
        Engine.getImages(),
        jsxRenderer,
        modMeta,
        this.cdnResourceLoader,
        sound,
        music,
        this.sentry,
      )),
      (mapList = new (VxlGeometryCache as any)(await Engine.getCacheDir(), Engine.getActiveMod())));
    const vxlPool = new VxlGeometryPool(mapList, options.graphics.models.value);
    options.graphics.models.onChange.subscribe((quality: any) => {
      (vxlPool.setModelQuality(quality),
        vxlPool.clear(),
        vxlPool.clearStorage().catch((e: any) => console.warn("Couldn't clear VXL geocache", [e])));
    });
    menuScreens.get(MainMenuScreenType.OptionsStorage).setVxlGeometryPool(vxlPool);
    const realMapDir = mapDir;
    const gameMapDir = realMapDir;
    const gameMapList = realMapList;
    const speedCheat = new BoxedVar(false);
    const buildingImageDataCache = new Map();
    const actionLogger = AppLogger.get("action");
    const lockstepLogger = AppLogger.get("lockstep");
    const gameLoader = new GameLoader(
      this.appVersion,
      (workerHost as any).workerHostApi,
      this.cdnResourceLoader,
      modLoaderRes,
      rules,
      mpModes,
      sound,
      iniLogger,
      actionLogger,
      speedCheat,
      gameResConfig,
      vxlPool,
      buildingImageDataCache,
      this.runtimeVars.debugBotIndex,
      this.config.devMode,
    );
    let loadingKeys: any = new Map();
    const readySet = new Set();
    const taunts = new BoxedVar(Boolean(Number(this.localPrefs.getItem(StorageKey.TauntsEnabled) ?? "1")));
    const persistTaunts = (on: boolean) => {
      this.localPrefs.setItem(StorageKey.TauntsEnabled, String(Number(on)));
    };
    (taunts.onChange.subscribe(persistTaunts), this.disposables.add(() => taunts.onChange.unsubscribe(persistTaunts)));
    const gameMenuScreens = new Map()
      .set(GameMenuScreenType.Home, new GameMenuHomeScreen(strings, this.fullScreen))
      .set(GameMenuScreenType.Diplo, new DiploScreen(strings, jsxRenderer, renderer, rules, taunts, readySet))
      .set(GameMenuScreenType.ConnectionInfo, new ConnectionInfoScreen(strings, jsxRenderer))
      .set(GameMenuScreenType.QuitConfirm, new QuitConfirmScreen(strings, jsxRenderer))
      .set(GameMenuScreenType.Options, new OptionsScreen(strings, jsxRenderer, options, this.localPrefs, this.fullScreen, true, false, mixer, music))
      .set(GameMenuScreenType.OptionsSound, new SoundOptsScreen(strings, jsxRenderer, mixer, music, this.localPrefs))
      .set(GameMenuScreenType.OptionsKeyboard, new KeyboardScreen(strings, jsxRenderer, keyBinds));
    const loadingScreenApiFactory = new LoadingScreenApiFactory(rules, strings, uiScene, jsxRenderer, gameResConfig, gservConnection);
    const webglRenderer = renderer;
    const clientApi = new ClientApi();
    (window.dispatchEvent(new CustomEvent("CdApiReady", { detail: clientApi })), ((window as any).CdApi = clientApi));
    ((loadingKeys = new GameScreen(
      (workerHost as any).workerHostApi,
      gservConnection,
      ladderService,
      wolService,
      mapTransferService,
      this.engineVersion,
      this.engineModHash,
      errorHandler,
      gameMenuScreens,
      loadingScreenApiFactory,
      gameoptParser,
      gameoptSerializer,
      this.config,
      strings,
      webglRenderer,
      uiScene,
      this.runtimeVars,
      this.messageBoxApi,
      this.toastApi,
      loop,
      this.viewport,
      jsxRenderer,
      pointer,
      sound,
      music,
      mixer,
      keyBinds,
      options,
      this.localPrefs,
      actionLogger,
      lockstepLogger,
      replayManager,
      this.fullScreen,
      mapFileLoader,
      gameMapDir,
      gameMapList,
      gameLoader,
      vxlPool,
      buildingImageDataCache,
      readySet,
      taunts,
      speedCheat,
      this.sentry,
      clientApi.battleControl,
    )),
      (renderer = new ReplayScreen(
        this.engineVersion,
        this.engineModHash,
        errorHandler,
        gameMenuScreens,
        loadingScreenApiFactory,
        this.config,
        uiScene,
        strings,
        webglRenderer,
        uiScene,
        this.runtimeVars,
        this.messageBoxApi,
        loop,
        this.viewport,
        jsxRenderer,
        pointer,
        sound,
        music,
        keyBinds,
        options,
        actionLogger,
        this.fullScreen,
        mapFileLoader,
        gameLoader,
        vxlPool,
        buildingImageDataCache,
        () => {
          void 0 !== replayTarget
            ? (window.close(),
              (async () => {
                (await this.destroy(),
                  document.body.appendChild(document.createTextNode(strings.get("GUI:ReplayWindowClose"))));
              })())
            : rootController.goToScreen(RootScreenType.MainMenuRoot);
        },
        clientApi.battleControl,
      )));
    (rootController.addScreen(RootScreenType.MainMenuRoot, wolConnection as any),
      rootController.addScreen(RootScreenType.Game, loadingKeys as any),
      rootController.addScreen(RootScreenType.Replay, renderer as any),
      renderer as any,
      // 渲染场景与 HtmlContainer 挂载
      (loop as any).addScene?.(uiScene),
      (this.renderer as any).addScene(uiScene),
      (this.uiScene = uiScene),
      this.rootEl.appendChild(uiScene.getHtmlContainer().getElement()),
      await this.routeToInitialScreen(rootController as any, options as any, music as any, sound as any, replayTarget, replayManager));
  }

  /** 解析主菜单视频（CDN → mp4；本地 rfs/vfs 查找 → File；失败 ""）。 */
  async getMainMenuVideoUrl(gameResConfig: any, modDir: any): Promise<any> {
    let url: any;
    const fileName = Engine.rfsSettings.menuVideoFileName;
    if (gameResConfig.isCdn()) url = gameResConfig.getCdnBaseUrl() + fileName.replace(".webm", ".mp4");
    else
      try {
        let bytes: any;
        (modDir && (await modDir.containsEntry(fileName)) && (bytes = await modDir.getRawFile(fileName)),
          !bytes && (await Engine.rfs?.containsEntry(fileName)) && (bytes = await Engine.rfs.getRawFile(fileName)),
          !bytes && Engine.vfs?.fileExists(fileName) && (bytes = Engine.vfs.openFile(fileName).asFile()),
          (url = bytes
            ? new File([bytes], bytes.name, { type: "video/webm" })
            : (console.warn("Main menu video file not found in browser FS"), "")));
      } catch (e) {
        (console.error("Failed to read video file from browser FS"), (url = ""));
      }
    return url;
  }

  /**
   * 初始路由：重连确认 → GPU 档位确认/应用 → 补丁说明 →
   * 音频权限（需且未解锁时）→ 回放加载 → 目标屏。
   */
  async routeToInitialScreen(
    rootController: any,
    options: any,
    music: any,
    sound: any,
    replayTarget: any,
    replayManager: any,
  ): Promise<void> {
    let navigated = false;
    let rawConn = this.localPrefs.getItem(StorageKey.LastConnection);
    let conn: any;
    if (rawConn)
      try {
        conn = JSON.parse(rawConn);
      } catch (e) {
        console.error(`Unable to decode game params string "${rawConn}"`);
      }
    if (conn) {
      const reconnect = await this.messageBoxApi.confirm(
        this.strings.get("TS:ReconnectPrompt"),
        this.strings.get("TS:Reconnect"),
        this.strings.get("GUI:Quit"),
      );
      if (((navigated = true), reconnect)) return ((conn.create = false), void rootController.goToScreen(RootScreenType.Game, conn));
      this.localPrefs.removeItem(StorageKey.LastConnection);
    }
    const tier = this.gpuTier;
    (void 0 !== tier &&
      ((rawConn = this.localPrefs.getItem(StorageKey.LastGpuTier)),
      2 <= tier.tier
        ? void 0 !== rawConn && Number(rawConn) !== tier.tier
          ? ((await this.confirmHighGfxSettings()) &&
              (options.graphics.applyHighPreset(), this.localPrefs.setItem(StorageKey.Options, options.serialize())),
            (navigated = true))
          : void 0 === rawConn &&
            tier.isMobile &&
            (options.graphics.applyLowPreset(), this.localPrefs.setItem(StorageKey.Options, options.serialize()))
        : (void 0 === rawConn || 2 <= Number(rawConn)) &&
          ((await this.confirmLowGfxSettings()) &&
            (options.graphics.applyLowPreset(), this.localPrefs.setItem(StorageKey.Options, options.serialize())),
          (navigated = true)),
      this.localPrefs.setItem(StorageKey.LastGpuTier, "" + tier.tier)),
      void 0 === replayTarget &&
        this.config.patchNotesUrl &&
        ((rawConn = this.localPrefs.getItem(StorageKey.LastSeenPatch)) &&
          rawConn !== this.appVersion &&
          (await new Promise<void>((resolve) =>
            this.messageBoxApi.show(
              (ReactNs as any).default.createElement("iframe", { src: this.config.patchNotesUrl, className: "patch-notes" }),
              [{ label: this.strings.get("GUI:Continue"), onClick: resolve }],
              { className: "patch-notes-box" },
            ),
          ),
          (navigated = true)),
        (rawConn && rawConn === this.appVersion) ||
          this.localPrefs.setItem(StorageKey.LastSeenPatch, this.appVersion)),
      sound &&
        !navigated &&
        sound.audioSystem.isSuspended() &&
        (await new Promise<void>((resolve) =>
          this.messageBoxApi.show(
            this.strings.get("GUI:RequestAudioPermission"),
            this.strings.get("GUI:OK"),
            async () => {
              (await sound.audioSystem.initMusicLoop().catch((e: any) => console.error(e)), resolve(undefined));
            },
          ),
        )));
    let replay: any;
    if (void 0 !== replayTarget)
      try {
        if (void 0 !== replayTarget.replayId) {
          let list = await replayManager.loadList();
          const entry = list.find((e: any) => e.id === replayTarget.replayId);
          if (!entry) throw new Error(`Replay ID "${replayTarget.replayId}" not found`);
          replay = await replayManager.loadReplay(entry);
        } else {
          let url = new URL(replayTarget.replayUrl);
          let allowed = false;
          for (const host of this.config.replaysUrlWhitelist)
            if (url.hostname.endsWith(host)) {
              allowed = true;
              break;
            }
          if (!allowed)
            throw new Error(
              `Can't load replay from URL "${url.href}".` + "Domain is not within the allowed list of domains.",
            );
          const binary = await new ResourceLoader("").loadBinary(replayTarget.replayUrl);
          ((replay = new Replay()),
            replay.unserialize(stringUtils.uint8ArrayToBinaryString(binary), { name: "untitled.rpl", timestamp: Date.now() }),
            replay.engineVersion !== this.engineVersion &&
              (await this.loadReplayWithOldClient(url, replay.engineVersion), (replay = void 0)));
        }
      } catch (e) {
        (console.error("Failed to load replay", e),
          await this.messageBoxApi.alert(this.strings.get("GUI:ReplayError"), this.strings.get("GUI:Ok")));
      }
    replay ? rootController.goToScreen(RootScreenType.Replay, { replay }) : rootController.goToScreen(RootScreenType.MainMenuRoot);
  }

  /** 版本不匹配时跳旧客户端重放（无版本映射则 alert）。 */
  async loadReplayWithOldClient(url: URL, engineVersion: string): Promise<void> {
    let versions: any;
    const baseUrl: any = this.config["oldClientsBaseUrl"];
    if (baseUrl) {
      this.messageBoxApi.show(this.strings.get("GUI:LoadingEx"));
      try {
        let loader = new ResourceLoader(baseUrl);
        versions = await loader.loadJson("versions.json");
      } catch (e) {
        console.warn("Couldn't download client version list", e);
      } finally {
        this.messageBoxApi.destroy();
      }
    }
    let path: any;
    (versions && (path = versions[engineVersion]),
      path
        ? ((activeMod = (mod = Engine.getActiveMod()) ? `?${RouteHelper.modQueryStringName}=` + mod : ""),
          (mod = encodeURIComponent(url.href)),
          (window.location.href = `${baseUrl}v${path}/${activeMod}#/replay/` + mod))
        : await this.messageBoxApi.alert(
            this.strings.get("GUI:ReplayVersionMismatch", engineVersion),
            this.strings.get("GUI:Ok"),
          ));
    var activeMod: any, mod: any;
  }

  /** 低画质确认对话框（HTML 警告文案）。 */
  async confirmLowGfxSettings(): Promise<boolean> {
    return await this.messageBoxApi.confirm(
      (ReactNs as any).default.createElement("div", {
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

  /** 高画质切换确认。 */
  async confirmHighGfxSettings(): Promise<boolean> {
    return await this.messageBoxApi.confirm(
      this.strings.get("TS:RendererChangeDesc"),
      this.strings.get("GUI:Yes"),
      this.strings.get("GUI:No"),
    );
  }

  /**
   * 创建 Renderer + UiAnimationLoop 并挂右键/卸载/canvas mousedown 防护。
   * devMode 时 fps 默认开；返回 {renderer, uiAnimationLoop}。
   */
  initRenderer(host: HTMLElement, size: { width: number; height: number }, devMode: boolean): any {
    const { width, height } = size;
    const renderer = new Renderer(width, height);
    (renderer.init(host),
      this.disposables.add(renderer),
      DevToolsApi.registerVar("fps", this.runtimeVars.fps),
      this.disposables.add(() => DevToolsApi.unregisterVar("fps")),
      this.runtimeVars.fps.onChange.subscribe((on: boolean) => {
        on ? renderer.initStats(host) : renderer.destroyStats();
      }),
      devMode && (this.runtimeVars.fps.value = true),
      this.runtimeVars.fps.value && renderer.initStats(host));
    const loop = new UiAnimationLoop(renderer);
    return (
      loop.start(),
      this.disposables.add(loop),
      host.addEventListener("contextmenu", (e) => {
        ("A" === (e.target as HTMLElement).nodeName && (e.target as any).href.length) || e.preventDefault();
      }),
      devMode ||
        window.addEventListener("beforeunload", (e) => {
          this.rootController?.getCurrentScreen()?.preventUnload &&
            (e.preventDefault(), ((e as any).returnValue = ""));
        }),
      renderer.getCanvas().addEventListener("mousedown", (e) => {
        e.preventDefault();
      }),
      { renderer, uiAnimationLoop: loop }
    );
  }

  /**
   * 初始化混音器/音效/音乐：Mixer 优先读 LocalPrefs，失败用默认档；
   * 音乐仅在 rfs 含 musicDir 时创建。
   */
  async initSound(rules: any, _gameResConfig: any): Promise<{ mixer: any; sound: any; music: any }> {
    let mixer: any;
    const rawMixer = this.localPrefs.getItem(StorageKey.Mixer);
    if (rawMixer)
      try {
        mixer = new Mixer().unserialize(rawMixer);
      } catch (e) {
        console.warn("Failed to read mixer values from local storage", [e]);
      }
    mixer ||
      ((mixer = new Mixer()),
      mixer.setVolume(ChannelType.Master, 0.4),
      mixer.setVolume(ChannelType.CreditTicks, 0.2),
      mixer.setVolume(ChannelType.Music, 0.3),
      mixer.setVolume(ChannelType.Ambient, 0.3));
    const sound = new Sound(
      new AudioSystem(mixer),
      Engine.getSounds(),
      new SoundSpecs(Engine.getSoundIni()),
      rules.audioVisual,
      document,
    );
    (sound.initialize(), this.disposables.add(sound));
    let hasMusicDir: boolean;
    try {
      hasMusicDir = !!(await Engine.rfs?.containsEntry(Engine.rfsSettings.musicDir));
    } catch (e) {
      (console.error("Couldn't get music directory", [e]),
        e instanceof StorageQuotaError ||
          e instanceof IOError ||
          e instanceof ReplayFileNotFoundError ||
          this.sentry?.captureException(Object.assign(new Error(`Couldn't get music directory (${e.name})`), { cause: e })),
        (hasMusicDir = false));
    }
    let music: any;
    if (hasMusicDir) {
      ((music = new Music(
        sound.audioSystem,
        Engine.getThemes(),
        new MusicSpecs(Engine.getIni(Engine.getFileNameVariant("theme.ini"))),
      )),
        this.disposables.add(music));
      const rawMusic = this.localPrefs.getItem(StorageKey.MusicOpts);
      if (rawMusic)
        try {
          music.unserializeOptions(rawMusic);
        } catch (e) {
          console.warn("Failed to read music options from local storage", [e]);
        }
    }
    return { mixer, sound, music };
  }

  /** 销毁消息框/根控制器/场景/全部 disposable。 */
  async destroy(): Promise<void> {
    let container: any;
    (this.messageBoxApi && (this.messageBoxApi.destroy(), (this.messageBoxApi = void 0)),
      this.rootController && (await this.rootController.leaveCurrentScreen(), this.rootController.destroy()),
      this.uiScene &&
        ((container = this.uiScene.getHtmlContainer()?.getElement()) && this.rootEl.removeChild(container),
        this.uiScene.destroy()),
      this.disposables.dispose());
  }
}
