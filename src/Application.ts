/**
 * Application — 应用根控制器：配置/字体/GPU/GameRes/路由/GUI 生命周期。
 *
 * main 主流程（与孪生一致）：
 * 1) loadConfig（失败仅 console.error 退出）；
 * 2) loadTranslations(defaultLocale) → Strings → checkGlobalLibs；
 * 3) LocalPrefs、根元素、DevTools 命令/变量注册、日志、FullScreen、Splash；
 * 4) GPU tier 异步探测 + Engine 激活 + GameRes.init（失败走错误框）；
 * 5) CSF 翻译覆盖 / 字体 / 回放存储迁移 → initRouting。
 * 路由挂 "/"、"/game"、"/replay" 与全部 *test 调试入口。
 *
 * 由 Application.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
// @ts-ignore 孪生 any-shim：裸模块无 ambient
import * as FontFaceObserver from "fontfaceobserver"; // 孪生（第三方）
// @ts-ignore 孪生 any-shim：裸模块无 ambient
import * as DetectGpu from "detect-gpu"; // 孪生（第三方）
import * as Cancellation from "@puzzl/core/lib/async/cancellation"; // 孪生
import * as EngineNs from "engine/Engine"; // 孪生
import * as EngineTypeNs from "engine/EngineType"; // 已转换
import * as SplashScreenNs from "gui/component/SplashScreen"; // 孪生
import * as WolConnectionNs from "network/WolConnection"; // 孪生
import * as ParserNs from "network/gameopt/Parser"; // 孪生
import { Config } from "Config"; // 已转换
import * as RoutingNs from "util/Routing"; // 已转换
import * as LobbyFormTesterNs from "tools/LobbyFormTester"; // 已转换
import * as VxlTesterNs from "tools/VxlTester"; // 已转换
import * as ShpTesterNs from "tools/ShpTester"; // 已转换
import * as BuildingTesterNs from "tools/BuildingTester"; // 已转换
import * as IniFileNs from "data/IniFile"; // 已转换
import * as timeNs from "util/time"; // 已转换
import * as ResourceLoaderNs from "engine/ResourceLoader"; // 已转换
import { ConsoleVars } from "ConsoleVars"; // 已转换
import * as LoggerNs from "util/Logger"; // 已转换
import * as DevToolsApiNs from "tools/DevToolsApi"; // 已转换
import * as VehicleTesterNs from "tools/VehicleTester"; // 已转换
import * as InfantryTesterNs from "tools/InfantryTester"; // 已转换
import * as AircraftTesterNs from "tools/AircraftTester"; // 已转换
import * as SoundTesterNs from "tools/SoundTester"; // 已转换
import * as LocalPrefsNs from "LocalPrefs"; // 已转换
import * as FullScreenNs from "gui/FullScreen"; // 孪生
import * as versionNs from "version"; // 已转换
import * as StringsNs from "data/Strings"; // 已转换
import * as ServerRegionsNs from "network/ServerRegions"; // 孪生
import * as GeneralOptionsNs from "gui/screen/options/GeneralOptions"; // 孪生
import * as GameResConfigNs from "engine/gameRes/GameResConfig"; // 已转换
import * as BasicErrorBoxApiNs from "gui/component/BasicErrorBoxApi"; // 孪生
import * as GameResNs from "engine/gameRes/GameRes"; // 已转换
import * as FileNotFoundErrorImportNs from "engine/gameRes/importError/FileNotFoundError"; // 已转换
import * as ArchiveDownloadErrorNs from "engine/gameRes/importError/ArchiveDownloadError"; // 已转换
import * as InvalidArchiveErrorNs from "engine/gameRes/importError/InvalidArchiveError"; // 已转换
import * as ArchiveExtractionErrorNs from "engine/gameRes/importError/ArchiveExtractionError"; // 已转换
import * as ChecksumErrorNs from "engine/gameRes/importError/ChecksumError"; // 已转换
import * as NoStorageErrorNs from "engine/gameRes/importError/NoStorageError"; // 已转换
import * as MapFileNs from "data/MapFile"; // 已转换
import * as ImageContextNs from "gui/component/ImageContext"; // 孪生
import { BoxedVar } from "util/BoxedVar"; // 已转换
import * as ReplayStorageFileSystemNs from "gui/replay/ReplayStorageFileSystem"; // 孪生
import * as ReplayStorageMigrationNs from "gui/replay/ReplayStorageMigration"; // 孪生
import * as StorageQuotaErrorNs from "data/vfs/StorageQuotaError"; // 已转换
import { Gui } from "Gui"; // 已转换
import * as IOErrorNs from "data/vfs/IOError"; // 已转换
import * as WolServiceNs from "network/WolService"; // 孪生
import * as FileNotFoundErrorNs from "data/vfs/FileNotFoundError"; // 已转换
import { RouteHelper } from "RouteHelper"; // 已转换
import * as CsfFileNs from "data/CsfFile"; // 已转换
import * as SentryNs from "util/Sentry"; // 已转换
import * as NoWebAssemblyErrorNs from "engine/gameRes/importError/NoWebAssemblyError"; // 已转换
import * as WolConfigNs from "network/WolConfig"; // 孪生
import * as ExtensionHostNs from "extensions/ExtensionHost"; // 孪生

const Engine: any = (EngineNs as any).Engine;
const EngineType: any = (EngineTypeNs as any).EngineType;
const SplashScreen: any = (SplashScreenNs as any).SplashScreen;
const WolConnection: any = (WolConnectionNs as any).WolConnection;
const Parser: any = (ParserNs as any).Parser;
const Routing: any = (RoutingNs as any).Routing;
const LobbyFormTester: any = (LobbyFormTesterNs as any).LobbyFormTester;
const VxlTester: any = (VxlTesterNs as any).VxlTester;
const ShpTester: any = (ShpTesterNs as any).ShpTester;
const BuildingTester: any = (BuildingTesterNs as any).BuildingTester;
const IniFile: any = (IniFileNs as any).IniFile;
const time: any = timeNs;
const ResourceLoader: any = (ResourceLoaderNs as any).ResourceLoader;
const DownloadError: any = (ResourceLoaderNs as any).DownloadError;
const AppLogger: any = (LoggerNs as any).AppLogger;
const DevToolsApi: any = (DevToolsApiNs as any).DevToolsApi;
const VehicleTester: any = (VehicleTesterNs as any).VehicleTester;
const InfantryTester: any = (InfantryTesterNs as any).InfantryTester;
const AircraftTester: any = (AircraftTesterNs as any).AircraftTester;
const SoundTester: any = (SoundTesterNs as any).SoundTester;
const LocalPrefs: any = (LocalPrefsNs as any).LocalPrefs;
const StorageKey: any = LocalPrefsNs.StorageKey;
const FullScreen: any = (FullScreenNs as any).FullScreen;
const version: any = (versionNs as any).version ?? versionNs;
const Strings: any = (StringsNs as any).Strings;
const ServerRegions: any = (ServerRegionsNs as any).ServerRegions;
const GeneralOptions: any = (GeneralOptionsNs as any).GeneralOptions;
const GameResConfig: any = (GameResConfigNs as any).GameResConfig;
const BasicErrorBoxApi: any = (BasicErrorBoxApiNs as any).BasicErrorBoxApi;
const GameRes: any = (GameResNs as any).GameRes;
const ImportFileNotFoundError: any = (FileNotFoundErrorImportNs as any).FileNotFoundError;
const ArchiveDownloadError: any = (ArchiveDownloadErrorNs as any).ArchiveDownloadError;
const InvalidArchiveError: any = (InvalidArchiveErrorNs as any).InvalidArchiveError;
const ArchiveExtractionError: any = (ArchiveExtractionErrorNs as any).ArchiveExtractionError;
const ChecksumError: any = (ChecksumErrorNs as any).ChecksumError;
const NoStorageError: any = (NoStorageErrorNs as any).NoStorageError;
const MapFile: any = (MapFileNs as any).MapFile;
const ImageContext: any = (ImageContextNs as any).ImageContext;
const ReplayStorageFileSystem: any = (ReplayStorageFileSystemNs as any).ReplayStorageFileSystem;
const ReplayStorageMigration: any = (ReplayStorageMigrationNs as any).ReplayStorageMigration;
const StorageQuotaError: any = (StorageQuotaErrorNs as any).StorageQuotaError;
const IOError: any = (IOErrorNs as any).IOError;
const WolService: any = (WolServiceNs as any).WolService;
const FileNotFoundError: any = (FileNotFoundErrorNs as any).FileNotFoundError;
const CsfFile: any = (CsfFileNs as any).CsfFile;
const Sentry: any = (SentryNs as any).Sentry;
const NoWebAssemblyError: any = (NoWebAssemblyErrorNs as any).NoWebAssemblyError;
const WolConfig: any = (WolConfigNs as any).WolConfig;
const ClientType: any = (WolConfigNs as any).ClientType; // 模块级枚举，不是 WolConfig 类静态
const ExtensionHost: any = (ExtensionHostNs as any).ExtensionHost;

declare const window: any;
declare const SystemJS: any;
declare const navigator: any;

export class Application {
  /** 资源根路径（静态，与孪生 ie.resPath 一致）。 */
  static resPath = "res/";

  /** 逻辑视口（BoxedVar，随窗口/全屏更新）。 */
  viewport = new BoxedVar({ x: 0, y: 0, width: 0, height: 0 });
  /** 应用配置（loadConfig 后可用）。 */
  config!: Config;
  /** 本地偏好包装。 */
  localPrefs: any;
  /** 根元素。 */
  rootEl?: HTMLElement;
  /** 运行时调试变量。 */
  runtimeVars: ConsoleVars;
  /** 当前语言包 JSON。 */
  locale?: string;
  /** 字符串表（loadTranslations 后可用）。 */
  strings: any;
  /** Splash 屏。 */
  splashScreen: any;
  /** GPU tier 探测结果。 */
  gpuTier: any;
  /** GameRes 配置。 */
  gameResConfig: any;
  /** CDN 资源加载器。 */
  cdnResourceLoader: any;
  /** 全屏控制器。 */
  fullScreen: any;
  /** Sentry 客户端。 */
  sentry: any;
  /** 当前 Gui 实例。 */
  gui: Gui | undefined;

  constructor() {
    this.viewport = new BoxedVar({ x: 0, y: 0, width: 0, height: 0 });
    // 孪生构造仅初始化 viewport；runtimeVars 在 main 中 new ConsoleVars()。
    this.runtimeVars = undefined!;
  }

  /** 客户端版本号。 */
  getVersion(): string {
    return version;
  }

  /** 引擎版本号。 */
  getEngineVersion(): string {
    return Engine.getVersion();
  }

  /** 引擎 Mod 散列。 */
  getEngineModHash(): string {
    return Engine.getModHash();
  }

  /**
   * 应用入口：配置 → 翻译 → 全局库检查 → 本地偏好/DevTools/全屏 →
   * Splash → GPU/GameRes → CSF/字体/回放迁移 → 路由。
   */
  async main(): Promise<void> {
    try {
      await this.loadConfig();
    } catch (e) {
      return void console.error("Missing config.ini. Please see README.md");
    }
    const locale = this.config.defaultLocale;
    let translations: any;
    try {
      ((translations = await this.loadTranslations(locale)), (this.locale = locale));
    } catch (e) {
      return void console.error(`Missing translation ${locale}.`, e);
    }
    let strings: any = new Strings(translations);
    try {
      this.checkGlobalLibs();
    } catch (e) {
      return (console.error(e), void alert(strings.get("TS:DownloadFailed")));
    }
    this.localPrefs = new LocalPrefs(localStorage);
    const root = document.getElementById("ra2web-root");
    if (!root) throw new Error("Missing root element");
    ((this.rootEl = root),
      (this.runtimeVars = new ConsoleVars()),
      DevToolsApi.registerCommand("help", () => {
        (console.info("Available commands: "),
          [...DevToolsApi.listCommands()].forEach((c) => console.info("> " + c)),
          console.info("Available variables: "),
          [...DevToolsApi.listVars()].forEach((v) => console.info("> " + v)));
      }),
      DevToolsApi.registerVar("freecamera", this.runtimeVars.freeCamera),
      DevToolsApi.registerCommand("version", () => {
        (console.info("Client version: " + this.getVersion()),
          console.info("Engine version: " + this.getEngineVersion()),
          console.info("Mod hash: " + Engine.getModHash()));
      }),
      this.runtimeVars.forceResolution.onChange.subscribe((value: string | undefined) => {
        let w: number, h: number;
        value?.match(/^\d+x\d+$/) &&
          (([w, h] = value.split("x").map(Number)), this.setPreferredViewportSize({ width: w, height: h }));
      }),
      DevToolsApi.registerVar("forcesize", this.runtimeVars.forceResolution),
      DevToolsApi.registerVar("debug_wireframes", this.runtimeVars.debugWireframes),
      DevToolsApi.registerVar("debug_paths", this.runtimeVars.debugPaths),
      DevToolsApi.registerVar("debug_text", this.runtimeVars.debugText),
      DevToolsApi.registerVar("debug_bot", this.runtimeVars.debugBotIndex),
      this.initLogging(),
      (this.fullScreen = new FullScreen(document)),
      this.fullScreen.init(),
      this.fullScreen.onChange.subscribe((full: boolean) => {
        (this.onFullScreenChange(full), this.updateViewportSize(full));
      }),
      window.addEventListener("resize", () => this.updateViewportSize(this.fullScreen.isFullScreen())),
      this.updateViewportSize(this.fullScreen.isFullScreen()));
    const splash = new SplashScreen(this.viewport.value.width, this.viewport.value.height);
    ((this.splashScreen = splash),
      splash.render(this.rootEl),
      splash.setLoadingText(strings.get("GUI:LoadingEx")),
      splash.setCopyrightText(strings.get("TXT_COPYRIGHT") + "\n" + strings.get("GUI:WWBrand")),
      splash.setDisclaimerText(strings.get("TS:Disclaimer")));
    const delay = time.sleep(this.config.devMode ? 0 : 5e3);
    (this.loadGpuBenchmarkData()
      .then((tier) => (this.gpuTier = tier))
      .catch((e) => this.sentry?.captureException(e)),
      Engine.setActiveEngine(EngineType.YurisRevenge));
    const modParam = new URLSearchParams(location.search).get(RouteHelper.modQueryStringName) || void 0;
    let resConfig = this.loadGameResConfig(this.localPrefs);
    try {
      let {
        configToPersist: persisted,
        cdnResLoader,
      } = await new GameRes(
        this.getVersion(),
        Engine.getActiveEngine(),
        modParam,
        this.localPrefs,
        strings,
        root,
        splash,
        this.viewport,
        this.config,
        Application.resPath,
        this.sentry,
      ).init(
        resConfig,
        (e: any, s: any) => this.handleGameResLoadError(e, s),
        (e: any, s: any) => this.handleGameResImportError(e, s),
      );
      (persisted &&
        (persisted.isCdn()
          ? this.localPrefs.removeItem(StorageKey.GameRes)
          : this.localPrefs.setItem(StorageKey.GameRes, persisted.serialize()),
        (resConfig = persisted)),
        (this.cdnResourceLoader = cdnResLoader));
    } catch (e) {
      return (
        console.error(e),
        splash.setLoadingText(""),
        splash.setBackgroundImage(""),
        void this.handleGameResLoadError(e, strings, true)
      );
    }
    ((this.gameResConfig = resConfig),
      window.gtag?.("event", "app_init", {
        res: this.gameResConfig.source,
        modName: Engine.getActiveMod() || "<none>",
      }),
      (ImageContext.cdnBaseUrl = this.gameResConfig.isCdn() ? this.gameResConfig.getCdnBaseUrl() : void 0),
      (ImageContext.vfs = Engine.vfs));
    try {
      let csf = new CsfFile(Engine.vfs.openFile(Engine.getFileNameVariant("ra2.csf")));
      let isoLocale: string | undefined;
      const fallbackLocale = locale;
      isoLocale = csf.getIsoLocale();
      if (void 0 !== isoLocale && isoLocale !== fallbackLocale)
        try {
          ((translations = await this.loadTranslations(isoLocale)), (this.locale = isoLocale));
        } catch (e) {
          console.warn(`Failed to load translation ${isoLocale}. Falling back to ${fallbackLocale}.`, e);
        }
      ((strings = this.strings = new Strings(csf)),
        strings.fromJson(translations),
        Engine.loadRules(),
        this.sentry?.configureScope((scope: any) => {
          (scope.setTag("mod", Engine.getActiveMod() || "<none>"),
            scope.setExtra("mod", Engine.getActiveMod() || "<none>"),
            scope.setExtra("modHash", Engine.getModHash()));
        }),
        window.AudioContext ||
          ((isoLocale = void 0), // 保持 let 作用域：polyfill 分支用 isoLocale 槽位无意义——用独立变量
          // 实际孪生用局部 l：与上面 isomorphic let 同槽；此处改独立绑定避免类型冲突
          void 0));
      if (!window.AudioContext) {
        const poly = await SystemJS.import("web-audio-polyfill.js");
        (window.AudioContext = poly.AudioContext);
      }
    } catch (e) {
      return (
        console.error(e),
        splash.setLoadingText(""),
        splash.setBackgroundImage(""),
        void this.handleGameResLoadError(e, strings, true)
      );
    }
    try {
      (await new (FontFaceObserver as any).default("Fira Sans Condensed").load(),
        await new (FontFaceObserver as any).default("Fira Sans Condensed", { weight: "bold" }).load());
    } catch (e) {
      console.error("Failed to load font", e);
    }
    try {
      await this.migrateReplayStorage(this.localPrefs, splash, strings);
    } catch (e) {
      (splash.setLoadingText(""),
        e instanceof StorageQuotaError ||
          e instanceof IOError ||
          e instanceof FileNotFoundError ||
          this.sentry?.captureException(Object.assign(new Error("Failed to migrate replays to new storage"), { cause: e })),
        console.error("Failed to migrate replays to new storage", e));
    }
    (await delay, splash.destroy(), (this.splashScreen = void 0), this.initRouting());
  }

  /** 按 locale 加载 language JSON（带版本 query）。 */
  async loadTranslations(locale: string): Promise<any> {
    return await new ResourceLoader(Application.resPath).loadJson(`locale/${locale}.json?v=` + this.getVersion());
  }

  /**
   * 校验 window 上的全局库（THREE/Octree/…/lzo1x）；
   * 任一缺失 throw（访问器抛错也视为缺失）。
   */
  checkGlobalLibs(): void {
    let name: string, getter: () => any;
    for ([name, getter] of new Map<string, () => any>([
      ["THREE", () => window.THREE],
      ["Octree", () => window.Octree],
      ["SimplexNoise", () => window.SimplexNoise],
      ["LightningStrike", () => window.THREE.LightningStrike],
      ["TrailRenderer", () => window.THREE.TrailRenderer],
      ["SPE", () => window.SPE],
      ["GrowingPacker", () => window.GrowingPacker],
      ["lzo1x", () => window.lzo1x],
    ])) {
      let ok = false;
      try {
        void 0 !== getter() && (ok = true);
      } catch (e) {}
      if (!ok) throw new Error(`Library "${name}" was not found on window scope`);
    }
  }

  /** 下载 config.ini 并解析进 Config；HTML 错误页抛错。 */
  async loadConfig(): Promise<void> {
    const text = await new ResourceLoader("").loadText("config.ini");
    if (text.startsWith("<")) throw new Error("Config download failed. Response looks like an HTML document.");
    const parsed = new IniFile().fromString(text);
    ((this.config = new Config()), this.config.load(parsed));
  }

  /** 初始化日志级别 / debug 开关 DevTools 注册 / Sentry。 */
  initLogging(): void {
    (AppLogger.useDefaults(),
      this.config.debugLogging && ((this.runtimeVars.debugLogging as any).value = this.config.debugLogging),
      DevToolsApi.registerVar("debug_logging", this.runtimeVars.debugLogging));
    const applyLevel = (level: any) => {
      let part: string;
      if ("string" != typeof level) AppLogger.setLevel(level ? AppLogger.DEBUG : AppLogger.INFO);
      else for (part of level.split(",")) AppLogger.get(part).setLevel(AppLogger.DEBUG);
    };
    (applyLevel(false),
      this.runtimeVars.debugLogging.value && applyLevel((this.runtimeVars.debugLogging as any).value),
      this.runtimeVars.debugLogging.onChange.subscribe(applyLevel),
      this.config.debugGameState && ((this.runtimeVars.debugGameState as any).value = this.config.debugGameState),
      DevToolsApi.registerVar("debug_game_state", this.runtimeVars.debugGameState));
    const sentryConfig = this.config.sentry;
    if (sentryConfig)
      try {
        ((this.sentry = new Sentry()), this.sentry.init(sentryConfig, this.getVersion()));
      } catch (e) {
        console.error(e);
      }
  }

  /** 从 LocalPrefs 读 GameRes 配置；CDN 无 base → undefined。 */
  loadGameResConfig(prefs: any): any {
    const raw = prefs.getItem(StorageKey.GameRes);
    if (raw) {
      const cfg = new GameResConfig(this.config.gameresBaseUrl ?? "");
      return (cfg.unserialize(raw), cfg.isCdn() && !cfg.getCdnBaseUrl() ? void 0 : cfg);
    }
  }

  /**
   * GameRes 加载错误框：按错误类型拼接本地化文案与 details，show 可重试。
   * @param isFinal - true 时隐藏重试（孪生第三参 i）
   */
  async handleGameResLoadError(e: any, strings: any, isFinal?: boolean): Promise<void> {
    const box = new BasicErrorBoxApi(this.viewport, strings, this.rootEl);
    let message = strings.get("ts:import_load_files_failed");
    let final = isFinal;
    const details: any = {
      type: e.constructor ? e.constructor.name : e.name || "Unknown",
      errorMessage: e.message || "",
      stack: e.stack || "",
    };
    (e instanceof ChecksumError
      ? ((message += "\n\n" + strings.get("ts:import_checksum_mismatch", e.file)), (details.file = e.file))
      : e instanceof ImportFileNotFoundError
        ? ((message += "\n\n" + strings.get("ts:import_file_not_found", e.file)), (details.file = e.file))
        : e instanceof DownloadError || e.message?.match(/XHR error|Failed to fetch/i)
          ? (message += "\n\n" + strings.get("ts:downloadfailed"))
          : e instanceof NoStorageError
            ? (message += "\n\n" + strings.get("ts:import_no_storage"))
            : e.message?.match(/out of memory|allocation/i)
              ? (message += "\n\n" + strings.get("ts:gameinitoom"))
              : "QuotaExceededError" === e.name || e instanceof StorageQuotaError
                ? (message += "\n\n" + strings.get("ts:storage_quota_exceeded"))
                : e instanceof IOError
                  ? ((message += "\n\n" + strings.get("ts:storage_io_error")), (final = true))
                  : e instanceof FileNotFoundError ||
                    this.sentry?.captureException(
                      Object.assign(new Error(`Game res load failed (${e.message ?? e.name})`), { cause: e }),
                    ),
      await box.show(message, final, details));
  }

  /** GameRes 导入错误框（不重试，孪生第二参 false）。 */
  async handleGameResImportError(e: any, strings: any): Promise<void> {
    const box = new BasicErrorBoxApi(this.viewport, strings, this.rootEl);
    let message = strings.get("ts:import_failed");
    const details: any = {
      type: e.constructor ? e.constructor.name : e.name || "Unknown",
      errorMessage: e.message || "",
      stack: e.stack || "",
    };
    (e instanceof ImportFileNotFoundError
      ? ((message += "\n\n" + strings.get("ts:import_file_not_found", e.file)), (details.file = e.file))
      : e instanceof InvalidArchiveError
        ? (message += "\n\n" + strings.get("ts:import_invalid_archive"))
        : e instanceof ArchiveExtractionError
          ? e.cause?.message?.match(/out of memory|allocation/i)
            ? (message += "\n\n" + strings.get("ts:import_out_of_memory"))
            : ((message += "\n\n" + strings.get("ts:import_archive_extract_failed")),
              this.sentry?.captureException(
                Object.assign(new Error(`Game res import failed (${e.message ?? e.name})`), { cause: e }),
              ))
          : e instanceof NoWebAssemblyError
            ? (message += "\n\n" + strings.get("ts:import_no_web_assembly"))
            : e instanceof ChecksumError
              ? ((message += "\n\n" + strings.get("ts:import_checksum_mismatch", e.file)), (details.file = e.file))
              : e instanceof DownloadError ||
                e.message?.match(
                  /XHR error|Failed to fetch|CompileError: WebAssembly|SystemJS|NetworkError|Load failed/i,
                )
                ? (message += "\n\n" + strings.get("ts:downloadfailed"))
                : e instanceof ArchiveDownloadError
                  ? (message = strings.get("ts:import_archive_download_failed", e.url))
                  : e instanceof NoStorageError
                    ? (message += "\n\n" + strings.get("ts:import_no_storage"))
                    : e.message?.match(/out of memory|allocation/i) ||
                        e.name.match(/NS_ERROR_FAILURE|NS_ERROR_OUT_OF_MEMORY/)
                      ? (message += "\n\n" + strings.get("ts:import_out_of_memory"))
                      : "QuotaExceededError" === e.name || e instanceof StorageQuotaError
                        ? (message += "\n\n" + strings.get("ts:storage_quota_exceeded"))
                        : e instanceof IOError ||
                          e instanceof FileNotFoundError ||
                          "AbortError" === e.name ||
                          this.sentry?.captureException(
                            Object.assign(new Error("Game res import failed " + (e.message ?? e.name)), { cause: e }),
                          ),
      await box.show(message, false, details));
  }

  /** GPU tier 探测（内联 benchmark，5s 超时取消；失败返回 undefined）。 */
  async loadGpuBenchmarkData(): Promise<any> {
    let failed = false;
    const result = await (DetectGpu as any).getGPUTier({
      override: {
        loadBenchmarks: async (file: string) => {
          const source = new (Cancellation as any).CancellationTokenSource();
          const timer = setTimeout(() => source.cancel(), 5e3);
          try {
            const list = await new ResourceLoader("").loadJson(
              "https://unpkg.com/detect-gpu@5.0.42/dist/benchmarks/" + file,
              source.token,
            );
            return (list.shift(), list);
          } catch (e) {
            throw ((failed = true), e);
          } finally {
            clearTimeout(timer);
          }
        },
      },
    });
    return failed ? void 0 : result;
  }

  /** 把回放目录迁移到 FileSystem 存储（无目录则跳过）。 */
  async migrateReplayStorage(prefs: any, splash: any, strings: any): Promise<void> {
    const dir = await Engine.getReplayDir();
    dir &&
      ((await new ReplayStorageMigration(splash, strings, dir, prefs, new ReplayStorageFileSystem(dir, this.sentry)).migrate()));
  }

  /** 注册 hash 路由：/、/game、/replay、/lobbytest 等；`*` 先销毁上一实例。 */
  initRouting(): void {
    const routing = new Routing();
    let current: any;
    (routing.addRoute("*", async () => {
      current && (await current.destroy());
    }),
      routing.addRoute("/", async () => {
        const regions = new ServerRegions();
        ((this.gui = await this.initGui(regions, this.strings)), (current = this));
      }),
      routing.addRoute("/game", async (params: string[]) => {
        const regions = new ServerRegions();
        if (((this.gui = await this.initGui(regions, this.strings)), this.gui)) {
          const rootController = this.gui.getRootController();
          if (((current = this), await time.sleep(1e3), 1 < params.length))
            throw new Error("Unsupported number of URL parameters");
          const connection = WolConnection.factory(AppLogger.get("net"));
          const cfg = WolConfig.factory(ClientType.Cdral2);
          const wolService = new WolService(cfg, connection, this.getVersion(), this.locale);
          regions.load(await wolService.loadServerList(this.config.serversUrl));
          const preferred = this.localPrefs.getItem(StorageKey.PreferredServerRegion);
          const chosen = preferred && regions.isAvailable(preferred) ? regions.get(preferred) : regions.getFirstAvailable();
          regions.setSelectedRegion(chosen.id);
          let {
            gameId,
            gameTimestamp,
            gservUrl,
            playerName,
            gameOpts,
            tournament = false,
          } = RouteHelper.extractGameParams(params[0]);
          gameOpts
            ? ((gameOpts = new Parser().parseOptions(gameOpts)), rootController.createGame(gameId, gameTimestamp, gservUrl, playerName, gameOpts, false, tournament))
            : rootController.joinGame(gameId, gameTimestamp, gservUrl, playerName, tournament);
        }
      }),
      routing.addRoute("/replay", async (params: string[]) => {
        current = this;
        let raw = params[0];
        let target: any;
        if (void 0 !== raw) {
          let decoded = decodeURIComponent(raw);
          target = decoded.match(/^https?:\/\//i) ? { replayUrl: decoded } : { replayId: raw };
        }
        const regions = new ServerRegions();
        this.gui = await this.initGui(regions, this.strings, target);
      }),
      routing.addRoute("/lobbytest", async () => {
        if (!Engine.vfs) throw new Error("Original game files must be provided.");
        (LobbyFormTester.main(this.rootEl, this.strings), (current = LobbyFormTester));
      }),
      routing.addRoute("/vxltest", async () => {
        if (!Engine.vfs) throw new Error("Original game files must be provided.");
        (VxlTester.main(Engine.vfs, this.runtimeVars), (current = VxlTester));
      }),
      routing.addRoute("/shptest", async () => {
        if (!Engine.vfs) throw new Error("Original game files must be provided.");
        const map = new MapFile(Engine.vfs.openFile("mp03t4.map"));
        (ShpTester.main(Engine.vfs, map, this.rootEl, this.strings), (current = ShpTester));
      }),
      routing.addRoute("/buildtest", async () => {
        if (!Engine.vfs) throw new Error("Original game files must be provided.");
        (BuildingTester.main(this.runtimeVars), (current = BuildingTester));
      }),
      routing.addRoute("/vehicletest", async () => {
        if (!Engine.vfs) throw new Error("Original game files must be provided.");
        (VehicleTester.main(this.runtimeVars), (current = VehicleTester));
      }),
      routing.addRoute("/airtest", async () => {
        if (!Engine.vfs) throw new Error("Original game files must be provided.");
        (AircraftTester.main(this.runtimeVars), (current = AircraftTester));
      }),
      routing.addRoute("/inftest", async () => {
        if (!Engine.vfs) throw new Error("Original game files must be provided.");
        (InfantryTester.main(this.runtimeVars), (current = InfantryTester));
      }),
      routing.addRoute("/soundtest", async () => {
        if (!Engine.vfs) throw new Error("Original game files must be provided.");
        (SoundTester.main(Engine.vfs, this.runtimeVars), (current = SoundTester));
      }),
      routing.init());
  }

  /**
   * 创建并初始化 Gui：读 Options、绑定 ExtensionHost、分辨率订阅、
   * init 失败按存储类错误/未知错误 alert 后返回 undefined。
   */
  async initGui(regions: any, strings: any, replayTarget?: any): Promise<Gui | undefined> {
    const raw = this.localPrefs.getItem(StorageKey.Options);
    let options: any;
    if (raw)
      try {
        options = new GeneralOptions().unserialize(raw);
      } catch (e) {
        console.warn("Couldn't read options from local storage", [e]);
      }
    (options ||
      ((options = new GeneralOptions()),
      (options.graphics.resolution.value = {
        width: this.config.viewport.width,
        height: this.config.viewport.height,
      })),
      ExtensionHost.bindConfig(
        ExtensionHost.createConfigFromStorage(this.localPrefs.getItem(StorageKey.Extensions)),
      ),
      this.setPreferredViewportSize(options.graphics.resolution.value),
      options.graphics.resolution.onChange.subscribe((value: any) => {
        this.setPreferredViewportSize(value);
      }));
    const gui = new Gui(
      this.getVersion(),
      this.locale,
      this.getEngineVersion(),
      this.getEngineModHash(),
      this.gpuTier,
      this.config,
      this.gameResConfig,
      Application.resPath,
      this.localPrefs,
      options,
      this.rootEl,
      this.viewport,
      this.fullScreen,
      strings,
      this.cdnResourceLoader,
      regions,
      this.runtimeVars,
      this.sentry,
    );
    try {
      await gui.init(replayTarget);
    } catch (e) {
      console.error("Failed to initialize GUI", [e]);
      let message;
      return (
        e instanceof StorageQuotaError || e instanceof IOError || e instanceof FileNotFoundError
          ? (message = strings.get("TS:GUIInitFSError"))
          : ((message = strings.get("TS:GUIInitUnknownError")),
            this.sentry?.captureException(Object.assign(new Error(`Failed to initialize GUI (${e.name})`), { cause: e }))),
        void alert(message)
      );
    }
    return gui;
  }

  /** 把首选分辨率写入 config.viewport 并刷新实际视口。 */
  setPreferredViewportSize(size: { width?: number; height?: number }): void {
    ((this.config.viewport.width = size?.width ?? Number.POSITIVE_INFINITY),
      (this.config.viewport.height = size?.height ?? Number.POSITIVE_INFINITY),
      this.updateViewportSize(this.fullScreen.isFullScreen()));
  }

  /** 全屏时锁定/解锁 Esc、F11（非 dev 还锁 F5/F12）。 */
  onFullScreenChange(full: boolean): void {
    navigator.keyboard &&
      (full
        ? navigator.keyboard
            .lock(["Escape", ...(this.config.devMode ? [] : ["F5", "F12"]), "F11"])
            ?.catch?.((e: any) => console.warn("Keyboard lock failed", e))
        : navigator.keyboard.unlock());
  }

  /** 按全屏与否计算实际宽高（偶数对齐、最小 800×600）并同步 Splash。 */
  updateViewportSize(full: boolean): void {
    let w: number, h: number;
    ((h = full
      ? ((w = window.innerWidth), window.innerHeight)
      : ((w = Math.min(window.innerWidth, this.config.viewport.width)),
        Math.min(window.innerHeight, this.config.viewport.height))),
      (w = Math.max(800, w - (w % 2))),
      (h = Math.max(600, h - (h % 2))),
      this.setViewportSize(w, h),
      this.splashScreen?.setSize(w, h));
  }

  /** 写视口宽高（保留 x/y）。 */
  setViewportSize(width: number, height: number): void {
    this.viewport.value = { x: this.viewport.value.x, y: this.viewport.value.y, width, height };
  }

  /** 销毁 GUI 与 Splash。 */
  async destroy(): Promise<void> {
    (await this.gui?.destroy(),
      (this.gui = void 0),
      this.splashScreen && (this.splashScreen.destroy(), (this.splashScreen = void 0)));
  }
}

// 构造贴孪生：仅初始化 viewport。上面 constructor 中的重复赋值已收敛。
