/**
 * GameRes — 游戏资源总控：存储适配、迁移、资源加载、UI CSS 变量、VPL。
 *
 * init 主流程（与孪生一致）：
 * 1) 读取/迁移浏览器 FS 到 native OPFS（失败回退 fallback 适配器）；
 * 2) 探测本地是否已有完整 YR MIX 集，是则自动选 Local；
 * 3) 无配置或加载失败时走 GameResBoxApi 提示（URL / File / 目录 / CDN / 一键）；
 * 4) loadResources：CDN 走 manifest + CdnResourceLoader，本地先校验 MIX 完整性；
 * 5) IOError 时按 opfs_unreliable 分支 reload 或清空存储根。
 *
 * 由 engine/gameRes/GameRes.ts.js 逆向翻译为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as FilesystemAccess from "file-system-access"; // 孪生（any-shim，未转换）
// @ts-ignore 孪生 any-shim：裸模块名 "LocalPrefs" 无 ambient 声明（modules.d.ts 未覆盖）
import * as LocalPrefs from "LocalPrefs"; // 孪生（未转换）
import * as IndexeddbAdapter from "file-system-access/lib/adapters/indexeddb"; // 孪生（any-shim，未转换）
import * as CacheAdapter from "file-system-access/lib/adapters/cache"; // 孪生（any-shim，未转换）
import { DataStream } from "data/DataStream"; // 已转换
import { MixFile } from "data/MixFile"; // 已转换
import * as Engine from "engine/Engine"; // 孪生（any-shim，未转换）
import * as EngineType from "engine/EngineType"; // 孪生（any-shim，未转换）
import * as ResourceLoaderNs from "engine/ResourceLoader"; // 孪生（any-shim，未转换）
import { AppLogger } from "util/Logger"; // 已转换
import { GameResConfig } from "engine/gameRes/GameResConfig"; // 已转换
import { ChecksumError } from "engine/gameRes/importError/ChecksumError"; // 已转换
import { FileNotFoundError as ImportFileNotFoundError } from "engine/gameRes/importError/FileNotFoundError"; // 已转换
import { NoStorageError } from "engine/gameRes/importError/NoStorageError"; // 已转换
import { Crc32 } from "data/Crc32"; // 已转换
import { Palette } from "data/Palette"; // 已转换
import { ShpFile } from "data/ShpFile"; // 已转换
import { PcxFile } from "data/PcxFile"; // 已转换
import * as ImageUtils from "engine/gfx/ImageUtils"; // 孪生（any-shim，未转换）
import { Bitmap, RgbaBitmap } from "data/Bitmap"; // 已转换
import * as CanvasUtils from "engine/gfx/CanvasUtils"; // 孪生（any-shim，未转换）
import * as GameResBoxApiNs from "gui/component/GameResBoxApi"; // 孪生（any-shim，未转换）
import { GameResSource } from "engine/gameRes/GameResSource"; // 已转换
import { RealFileSystem } from "data/vfs/RealFileSystem"; // 已转换
import * as resourceConfigs from "engine/resourceConfigs"; // 孪生（any-shim，未转换）
import { CdnResourceLoader, CdnManifestData } from "engine/gameRes/CdnResourceLoader"; // 已转换
import { FileSystemUtil } from "engine/gameRes/FileSystemUtil"; // 已转换
import { StorageQuotaError } from "data/vfs/StorageQuotaError"; // 已转换
import { FileNotFoundError } from "data/vfs/FileNotFoundError"; // 已转换
import { IOError } from "data/vfs/IOError"; // 已转换
import { GameResImporter } from "engine/gameRes/GameResImporter"; // 已转换
import { MemArchive } from "data/vfs/MemArchive"; // 已转换
import { VirtualFile } from "data/vfs/VirtualFile"; // 已转换
import { paletteShaderLib } from "engine/gfx/material/paletteShaderLib"; // 已转换

declare const THREE: any;

/** ResourceLoader 基类（孪生命名空间导出）。 */
const ResourceLoaderBase: any = (ResourceLoaderNs as any).ResourceLoader;
/** GameResBoxApi 类（孪生命名空间导出）。 */
const GameResBoxApiClass: any = (GameResBoxApiNs as any).GameResBoxApi;

/** 应用启动配置（构造注入）。 */
export interface GameResAppConfig {
  /** 游戏归档下载 URL。 */
  gameResArchiveUrl?: string;
  /** 扩展归档下载 URL。 */
  gameResExpansionArchiveUrl?: string;
  /** CDN 基地址（本地资源缺失时的远程来源）。 */
  gameresBaseUrl?: string;
  /** CORS 代理解析（hostname → 代理前缀；Importer 使用）。 */
  getCorsProxy?(hostname: string): string | undefined;
}

/** 本地偏好存储接口。 */
export interface GameResLocalPrefs {
  /** 读取偏好项。 */
  getItem(key: string): string | null;
  /** 写入偏好项。 */
  setItem(key: string, value: string): void;
  /** 删除偏好项。 */
  removeItem(key: string): void;
}

/** 字符串表接口。 */
export interface GameResStrings {
  /** 取本地化文案。 */
  get(key: string, ...args: any[]): string;
}

/** 启动画面（splash）接口。 */
export interface GameResSplashScreen {
  /** 设置加载文案。 */
  setLoadingText(text: string): void;
  /** 设置背景图 URL。 */
  setBackgroundImage(url: string): void;
}

/** Sentry 式异常上报（可选）。 */
export interface GameResSentry {
  /** 上报异常。 */
  captureException(ex: any): void;
}

/** promptForGameRes 返回值：URL | File/Dir 句柄 | { oneClick } | null（CDN）。 */
export type GameResPromptResult = URL | { kind: string; getFile?: any } | { oneClick: true } | null | undefined;

/** VFS 初始化返回的虚拟文件系统最小接口。 */
export interface VfsLike {
  /** 按名打开文件。 */
  openFile(name: string): any;
  /** 加载独立 INI 等文件。 */
  loadStandaloneFiles(opts: { exclude: string[] }): Promise<void>;
  /** 加载额外 MIX。 */
  loadExtraMixFiles(engine: any): Promise<void>;
  /** 加载隐式 MIX 列表。 */
  loadImplicitMixFiles(engine: any): Promise<void>;
  /** 追加归档。 */
  addArchive(archive: any, name?: string): void;
}

/** RFS 目录最小接口（keys/removeEntry）。 */
export interface RootDirLike {
  /** 枚举键。 */
  keys(): { next(): Promise<{ value?: string }>; [Symbol.asyncIterator](): AsyncIterator<string> } & AsyncIterable<string>;
  /** 递归删除条目。 */
  removeEntry(name: string, opts?: { recursive?: boolean }): Promise<void>;
  /** 列出条目名。 */
  listEntries?(): Promise<string[]>;
}

/** 带混合资源的目录句柄（Engine.initRfs 返回）。 */
export interface ResDirLike {
  /** 根目录。 */
  getRootDirectory(): any;
  /** 添加子目录。 */
  addDirectory(dir: any): void;
  /** 按名取/建子目录。 */
  getOrCreateDirectory?(name: string, create?: boolean): Promise<any>;
}

/** 进度回调：(text?, imageUrl|Blob?)。 */
export type GameResProgressFn = (text?: string, image?: string | Blob | undefined) => void;

/** 需要展示错误后的处理回调。 */
export type GameResErrorFn = (err: unknown, strings: GameResStrings) => Promise<void>;

export class GameRes {
  /** 应用版本号。 */
  appVersion: string;
  /** 引擎类型（YR-only）。 */
  engineType: any;
  /** 模组名（可选）。 */
  modName?: string;
  /** 本地偏好存储。 */
  localPrefs: GameResLocalPrefs;
  /** 字符串表。 */
  strings: GameResStrings;
  /** 根 DOM 元素。 */
  rootEl: HTMLElement;
  /** 启动画面。 */
  splashScreen: GameResSplashScreen;
  /** 视口/画布宿主元素。 */
  viewport: HTMLElement;
  /** 应用配置。 */
  appConfig: GameResAppConfig;
  /** 应用静态资源根路径（cd-overrides 等）。 */
  appResPath: string;
  /** 可选异常上报。 */
  sentry?: GameResSentry;

  constructor(
    appVersion: string,
    engineType: any,
    modName: string | undefined,
    localPrefs: GameResLocalPrefs,
    strings: GameResStrings,
    rootEl: HTMLElement,
    splashScreen: GameResSplashScreen,
    viewport: HTMLElement,
    appConfig: GameResAppConfig,
    appResPath: string,
    sentry?: GameResSentry,
  ) {
    this.appVersion = appVersion;
    this.engineType = engineType;
    this.modName = modName;
    this.localPrefs = localPrefs;
    this.strings = strings;
    this.rootEl = rootEl;
    this.splashScreen = splashScreen;
    this.viewport = viewport;
    this.appConfig = appConfig;
    this.appResPath = appResPath;
    this.sentry = sentry;
  }

  /**
   * 初始化：选存储 → 迁移 → 可选自动 Local → 导入/CDN 加载循环。
   *
   * @param config 已持久化的资源配置（可空）。
   * @param onFatal 加载失败时的展示回调。
   * @param onPrompt 导入失败后展示导入 UI 的回调。
   * @returns 需持久化的 config（仅本地探测/新建时）与 CDN loader（非 CDN 为 undefined）。
   */
  async init(config: GameResConfig | undefined | null, onFatal: GameResErrorFn, onPrompt: GameResErrorFn): Promise<{
    configToPersist?: GameResConfig;
    cdnResLoader?: CdnResourceLoader | undefined;
  }> {
    let resourcesLoaded = false;
    let shouldPersist = false;
    let objectUrl: string | undefined;
    // 进度助手：可选文案 + 可选背景（string 或 Blob → objectURL，Blob 时记 objectUrl 便于后续 revoke）
    const setProgress: GameResProgressFn = (text?: string, image?: string | Blob) => {
      if (text) this.splashScreen.setLoadingText(text);
      if (image) {
        const url = "string" == typeof image ? image : (objectUrl = URL.createObjectURL(image));
        this.splashScreen.setBackgroundImage(url);
      }
    };
    let nativeHandle: any;

    try {
      nativeHandle = await this.getBrowserFsHandle("native");
    } catch (e) {
      if (!(e instanceof NoStorageError)) throw e;
    }

    let migrated = false;
    try {
      migrated = !!nativeHandle && (await this.migrateStorageToNative(nativeHandle, setProgress));
    } catch (e) {
      console.warn("Storage migration to native failed", e);
      const migErr = new Error("Failed to migrate files to native file system");
      (migErr as { cause?: unknown }).cause = e;
      this.sentry?.captureException(migErr);
      migrated = false;
    } finally {
      setProgress(this.strings.get("GUI:LoadingEx"));
    }

    let rfs: any;
    let fallbackHandle: any;
    try {
      const handle = migrated ? nativeHandle : await this.getBrowserFsHandle("fallback");
      fallbackHandle = handle;
      if (handle) rfs = await (Engine as any).Engine.initRfs(handle);
    } catch (e) {
      if (!(e instanceof NoStorageError)) throw e;
      console.warn("No storage adapters available.");
    }

    // 本地已有完整 YR MIX：自动 Local 配置
    if (!config && rfs && (await this.lookForGameFiles(rfs.getRootDirectory()))) {
      config = new GameResConfig("");
      config.source = GameResSource.Local;
      shouldPersist = true;
    }

    let resDir: ResDirLike | undefined;
    if (rfs) {
      const modDirHandle = await (Engine as any).Engine.getModDir();
      resDir = await this.loadMod(rfs, modDirHandle);
    }
    if (rfs) rfs.addDirectory(await (Engine as any).Engine.getMapDir());

    let cdnResLoader: CdnResourceLoader | undefined;
    if (config) {
      const bg = await this.loadSplashScreenBackground(rfs ? rfs.getRootDirectory() : undefined, resDir, config);
      if ("string" == typeof bg) {
        this.splashScreen.setBackgroundImage(bg);
      } else if (bg) {
        objectUrl = URL.createObjectURL(bg);
        this.splashScreen.setBackgroundImage(objectUrl);
      }
      try {
        cdnResLoader = await this.loadResources(rfs, config, setProgress);
        resourcesLoaded = true;
      } catch (e) {
        console.error("Failed to load initial game resources");
        console.error(e);
        this.splashScreen.setLoadingText("");
        this.splashScreen.setBackgroundImage("");
        if (e instanceof IOError && fallbackHandle) {
          if ("1" === this.localPrefs.getItem("opfs_unreliable")) {
            console.warn("GameRes: OPFS unreliable — reloading to switch to IndexedDB");
            location.reload();
            await new Promise(() => {});
          } else {
            console.warn("GameRes: clearing all files from storage due to persistent IOError...");
            await this._clearStorageRoot(fallbackHandle);
          }
        }
        await onFatal(e, this.strings);
      }
    }

    const box = new GameResBoxApiClass(this.viewport, this.strings, this.rootEl);
    let archiveUrl = this.appConfig.gameResArchiveUrl;
    for (; !resourcesLoaded; ) {
      this.splashScreen.setLoadingText("");
      this.splashScreen.setBackgroundImage("");
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = void 0;
      }
      const promptResult: GameResPromptResult = await box.promptForGameRes(
        archiveUrl,
        !!this.appConfig.gameresBaseUrl && !this.modName,
        this.appConfig.gameResArchiveUrl,
        this.appConfig.gameResExpansionArchiveUrl,
      );
      config = new GameResConfig(this.appConfig.gameresBaseUrl ?? "");
      shouldPersist = true;

      let sourceKind: GameResSource;
      // one-click sentinel: download both exes + extract the 6 mixes.
      const oneClick = promptResult && "object" == typeof promptResult && !0 === (promptResult as any).oneClick;
      if (oneClick) {
        sourceKind = GameResSource.Archive;
      } else if (promptResult) {
        if (promptResult instanceof URL) {
          sourceKind = GameResSource.Archive;
          archiveUrl = promptResult.toString();
        } else if ("file" === (promptResult as any).kind) {
          sourceKind = GameResSource.Archive;
        } else {
          if ("directory" !== (promptResult as any).kind) {
            throw new Error("Unexpected FileSystemHandle type " + (promptResult as any).kind);
          }
          sourceKind = GameResSource.Local;
        }
      } else {
        sourceKind = GameResSource.Cdn;
      }
      config.source = sourceKind;

      if (sourceKind !== GameResSource.Cdn) {
        try {
          if (!rfs) throw new NoStorageError("No storage adapters available");
          // one-click = import RA2 exe then YR exe sequentially. Each
          // GameResImporter.import() fetches its URL and extracts ONLY the required
          // mix files (7z x <archive> <mixFile> per wanted file). RA2 exe yields
          // ra2/language/multi.mix; YR exe yields ra2md/langmd/multimd/expandmd01.mix.
          if (oneClick) {
            const importer = new GameResImporter(this.appConfig, this.strings, this.sentry);
            const cb: GameResProgressFn = (text, image) => {
              setProgress(text, image);
              if (text) console.info(text);
            };
            const urls: string[] = [];
            if (this.appConfig.gameResArchiveUrl) urls.push(this.appConfig.gameResArchiveUrl);
            if (this.appConfig.gameResExpansionArchiveUrl) urls.push(this.appConfig.gameResExpansionArchiveUrl);
            for (const u of urls) {
              await importer.import(new URL(u), rfs.getRootDirectory(), this.engineType, cb);
            }
          } else {
            await new GameResImporter(this.appConfig, this.strings, this.sentry).import(
              promptResult,
              rfs.getRootDirectory(),
              this.engineType,
              (text, image) => {
                setProgress(text, image);
                if (text) console.info(text);
              },
            );
          }
          console.info("Game assets successfully imported.");
        } catch (e) {
          console.error("Failed to import game assets");
          console.error(e);
          this.splashScreen.setLoadingText("");
          this.splashScreen.setBackgroundImage("");
          await onPrompt(e, this.strings);
          continue;
        } finally {
          this.splashScreen.setLoadingText("");
        }
      }

      try {
        this.splashScreen.setLoadingText(this.strings.get("GUI:LoadingEx"));
        cdnResLoader = await this.loadResources(rfs, config, setProgress);
        resourcesLoaded = true;
      } catch (e) {
        console.error("Failed to load game assets");
        console.error(e);
        this.splashScreen.setLoadingText("");
        this.splashScreen.setBackgroundImage("");
        if (e instanceof IOError && fallbackHandle) {
          if ("1" === this.localPrefs.getItem("opfs_unreliable")) {
            console.warn("GameRes: OPFS unreliable — reloading to switch to IndexedDB");
            location.reload();
            await new Promise(() => {});
          } else {
            console.warn("GameRes: clearing all files from storage due to persistent IOError...");
            await this._clearStorageRoot(fallbackHandle);
          }
        }
        await onFatal(e, this.strings);
      }
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    return { configToPersist: shouldPersist ? config : void 0, cdnResLoader };
  }

  /**
   * 清空存储根目录下全部条目（损坏 OPFS 自愈：下次导入写全新页）。
   *
   * @param root 根目录句柄。
   */
  async _clearStorageRoot(root: any): Promise<void> {
    try {
      for await (const key of root.keys()) {
        try {
          await root.removeEntry(key, { recursive: !0 });
          console.debug('_clearStorageRoot: removed "' + key + '"');
        } catch (e) {
          // individual delete errors are non-fatal
        }
      }
      console.warn("_clearStorageRoot: all files cleared from storage");
    } catch (e) {
      console.warn("_clearStorageRoot: failed to clear storage", e);
    }
  }

  /**
   * 若配置了模组名且目录存在，则挂载模组目录并激活 Engine 模组。
   *
   * @param root 资源根（addDirectory 目标）。
   * @param modDirHandle 模组父目录句柄。
   * @returns 模组子目录句柄；不存在/未配置时 undefined。
   */
  async loadMod(root: any, modDirHandle: any): Promise<any> {
    let name = this.modName;
    let dir: any;
    if (name) {
      if (await modDirHandle.containsEntry(name)) {
        console.info(`Loading mod "${name}"...`);
        dir = await modDirHandle.getDirectory(name);
        root.addDirectory(dir);
        (Engine as any).Engine.setActiveMod(name);
      } else {
        console.info(`Mod "${name}" not found. Ignoring.`);
        name = this.modName = void 0;
      }
    }
    return dir;
  }

  /**
   * 探测根目录是否已含完整 YR 必需 MIX 集（YR-only，无引擎分支）。
   *
   * @param root 根目录句柄。
   * @returns 六个必需文件均在则 true。
   */
  async lookForGameFiles(root: any): Promise<boolean> {
    const required = [
      "language.mix",
      "langmd.mix",
      "multi.mix",
      "multimd.mix",
      "ra2.mix",
      "ra2md.mix",
    ];
    const list = await root.listEntries();
    return required.every((n) => list.includes(n));
  }

  /**
   * 将旧 fallback 存储（IndexedDB/Cache）迁移到 native OPFS。
   *
   * 中断标记 _storage_migration_pending 存在时先清目标再走迁移；
   * 旧存储已有内容且 LastGpuTier 已设置时才执行拷贝；空间不足则跳过。
   *
   * @param target native 目录句柄。
   * @param onProgress 进度回调。
   * @returns 是否完成迁移（true=已迁移/可直接用 native；false=跳过或失败）。
   */
  async migrateStorageToNative(target: any, onProgress: GameResProgressFn): Promise<boolean> {
    const pendingKey = "_storage_migration_pending";
    if (this.localPrefs.getItem(pendingKey)) {
      // 上次迁移中断：清空目标目录后重试
      for await (const key of target.keys()) await target.removeEntry(key, { recursive: !0 });
      this.localPrefs.removeItem(pendingKey);
    } else if (!!(await target.keys().next()).value) {
      // 目标已有内容 → 视为已迁移
      return !0;
    }
    if (void 0 === this.localPrefs.getItem(LocalPrefs.StorageKey.LastGpuTier)) {
      // 无 GPU 分层记录 → 视为全新安装，无需迁移
      return !0;
    }
    console.info("Migrating to new storage...");
    let fallback: any;
    try {
      fallback = await this.getBrowserFsHandle("fallback");
    } catch (e) {
      if (e instanceof NoStorageError) {
        console.info("No existing storage found. Migration skipped.");
        return !1;
      }
      throw e;
    }
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      if (void 0 === est.usage || void 0 === est.quota) return !1;
      // 剩余空间不足 5MB 或已用超过一半则跳过
      if (est.usage > (est.quota - 5242880) / 2) {
        console.info("Migration to native storage skipped because of insufficient space.");
        return !1;
      }
    }
    const names = await FileSystemUtil.listDir(fallback);
    if (names.includes((Engine as any).Engine.rfsSettings.cacheDir)) {
      await fallback.removeEntry((Engine as any).Engine.rfsSettings.cacheDir, { recursive: !0 });
    }
    this.localPrefs.setItem(pendingKey, "1");
    try {
      await this.migrateDir(fallback, target, onProgress);
    } catch (e) {
      // 失败：回滚目标目录
      for await (const key of target.keys()) await target.removeEntry(key, { recursive: !0 });
      throw e;
    } finally {
      this.localPrefs.removeItem(pendingKey);
    }
    try {
      indexedDB.deleteDatabase("fileSystem");
      if ((FilesystemAccess as any).support.adapter.cache) {
        await (globalThis as any).caches?.delete("sandboxed-fs");
      }
    } catch (e) {
      console.warn(e);
    }
    console.info("Migration done.");
    return !0;
  }

  /**
   * 递归拷贝源目录到目标目录（文件流 pipeTo）。
   *
   * @param src 源目录句柄。
   * @param dst 目标目录句柄。
   * @param onProgress 进度回调。
   * @throws StorageQuotaError 配额超限时包装抛出。
   * @throws Error 其它失败包装为 `Failed migrating "${name}"`。
   */
  async migrateDir(src: any, dst: any, onProgress: GameResProgressFn): Promise<void> {
    const entries: any[] = await FileSystemUtil.getDirContents(src);
    for (const entry of entries) {
      try {
        if ("directory" === entry.kind) {
          const child = await dst.getDirectoryHandle(entry.name, { create: !0 });
          await this.migrateDir(entry, child, onProgress);
        } else {
          // U+200F LRM 从文件名剥离（与孪生一致）
          const cleanName = entry.name.replace(/‏/g, "");
          onProgress(this.strings.get("TS:storage_migrating_file", dst.name + "/" + entry.name));
          const outHandle = await dst.getFileHandle(cleanName, { create: !0 });
          const writable = await outHandle.createWritable();
          const file = await entry.getFile();
          await file.stream().pipeTo(writable);
        }
      } catch (e: any) {
        if ("QuotaExceededError" === e.name) throw new StorageQuotaError({ cause: e });
        const wrap = new Error(`Failed migrating "${entry.name}"`);
        (wrap as { cause?: unknown }).cause = e;
        throw wrap;
      }
    }
  }

  /**
   * 按配置加载全部游戏资源并初始化 VFS。
   *
   * @param rfs 已初始化的 RFS（CDN 时可为空，会新建 RealFileSystem）。
   * @param config 资源配置。
   * @param onProgress 进度回调。
   * @returns CDN 时返回 CdnResourceLoader，否则 undefined。
   */
  async loadResources(rfs: any, config: GameResConfig, onProgress: GameResProgressFn): Promise<CdnResourceLoader | undefined> {
    (Engine as any).Engine.initGameResSource(config.source);
    // YR-only：固定加载 YR 归档，不做引擎探测
    let cdnLoader: CdnResourceLoader | undefined;
    if (config.isCdn()) {
      const base = config.getCdnBaseUrl();
      const loader = new ResourceLoaderBase(base);
      const manifest = await loader.loadJson("manifest.json");
      if (2 !== manifest.version) throw new Error("Unknown manifest version " + manifest.version);
      if ("mix" !== manifest.format) throw new Error("Unsupported CDN resource format " + manifest.format);
      rfs = rfs || new RealFileSystem();
      cdnLoader = new CdnResourceLoader(base, manifest, await (Engine as any).Engine.getCacheDir());
    } else {
      if (!rfs) throw new NoStorageError("No available storage adapters");
      console.info("Checking integrity of mix files...");
      await this.checkMixesIntegrity(rfs.getRootDirectory());
      console.info("Mixes are valid.");
    }

    const logger = AppLogger.get("vfs");
    logger.info("Initializing virtual filesystem...");
    const vfs: VfsLike = await (Engine as any).Engine.initVfs(rfs, logger);
    await vfs.loadStandaloneFiles({
      exclude: ["keyboard.ini", "theme.ini"].map((n) => (Engine as any).Engine.getFileNameVariant(n)),
    });
    await vfs.loadExtraMixFiles((Engine as any).Engine.getActiveEngine());
    await this.loadCustomMix(vfs);
    await this.loadMixes(config, cdnLoader, vfs, onProgress);
    await this.loadVpl();
    await (Engine as any).Engine.loadMapList();
    await this.initUiCssVariables(this.rootEl);
    return cdnLoader;
  }

  /**
   * 校验 YR 必需 MIX 的 CRC32（内置期望值表，含 NotReadableError 重试与 OPFS 自愈）。
   *
   * @param root 根目录句柄。
   * @throws ImportFileNotFoundError 文件缺失。
   * @throws IOError 读取 DOMException。
   * @throws ChecksumError CRC 不匹配。
   */
  async checkMixesIntegrity(root: any): Promise<void> {
    // YR-only — always validate both the RA2 base archives and the YR
    // expansion archives (YR depends on RA2's base data).
    const expected = new Map<string, string[]>([
      ["ra2.mix", ["E7BA3BE", "5DC70844"]],
      ["multi.mix", ["984EFDB6", "3CDB648F"]],
      ["ra2md.mix", ["49A9E8EA"]],
      ["multimd.mix", ["743DA541"]],
      ["expandmd01.mix", ["F3D92D6C"]],
    ]);
    for (const [name, goodHexes] of expected.entries()) {
      let file: any;
      let buffer: ArrayBuffer;
      const maxAttempts = 3;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          file = await root.getRawFile(name, !0);
          buffer = await file.arrayBuffer();
          break;
        } catch (e) {
          if (e instanceof FileNotFoundError) throw new ImportFileNotFoundError(name);
          if (e instanceof DOMException && "NotReadableError" === e.name) {
            if (attempt < maxAttempts - 1) {
              console.warn(
                'checkMixesIntegrity: NotReadableError reading "' + name + '", retrying (' + (attempt + 1) + "/" + maxAttempts + ")...",
              );
              await new Promise(function (resolve) {
                return setTimeout(resolve, 500 * (attempt + 1));
              });
              continue;
            }
            // All retries exhausted — delete corrupted file so next page load
            // triggers a clean re-import.
            try {
              await root.removeEntry(name);
              console.warn('checkMixesIntegrity: deleted corrupted file "' + name + '"');
            } catch (delErr) {
              // ignore delete errors
            }
            this.localPrefs.setItem("opfs_unreliable", "1");
            console.warn('checkMixesIntegrity: OPFS marked unreliable — will use IndexedDB on next boot');
          }
          if (e instanceof DOMException) throw new IOError(`Failed to read file (${e.name})`, { cause: e });
          throw e;
        }
      }
      const crc = Crc32.calculateCrc(new Uint8Array(buffer));
      if (!goodHexes.includes(crc.toString(16).toUpperCase())) {
        throw new ChecksumError(
          `Checksum mismatch for "${name}" (size: ${file.size}). ` + `Checksum "${crc}" doesn't match known values`,
          name,
        );
      }
    }
  }

  /**
   * 注入引擎必需 INI 覆盖文件（替代上游 ra2cd.mix 品牌容器）。
   *
   * 从 res/cd-overrides/ 加载 9 个文件（缺文件仅 console.warn），
   * 打成 MemArchive 挂到 VFS 的 "engine-overrides" 前置位。
   *
   * @param vfs 虚拟文件系统。
   */
  async loadCustomMix(vfs: VfsLike): Promise<void> {
    // instead of loading a bundled ra2cd.mix (the upstream product's
    // custom-asset container), load the engine-required INI overrides as standalone
    // files from res/cd-overrides/ and inject them into the VFS as a MemArchive.
    // These are engine data (YR bug-fixes, multiplayer-mode definitions), not branding.
    const loader = new ResourceLoaderBase(this.appResPath);
    const names = [
      "rulescd.ini",
      "artcd.ini",
      "soundcd.ini",
      "mpmodescd.ini",
      "mpteammd.ini",
      "mpfreeforallmd.ini",
      "ui.ini",
      "nodogengikills.ini",
      "ra2md.csf",
    ];
    const archive = new MemArchive();
    for (const n of names) {
      try {
        const bin = await loader.loadBinary("cd-overrides/" + n);
        const stream = new DataStream(new DataView(bin.buffer, bin.byteOffset, bin.byteLength));
        archive.addFile(new VirtualFile(stream, n));
      } catch (e) {
        console.warn("Missing engine override file: cd-overrides/" + n, e);
      }
    }
    vfs.addArchive(archive, "engine-overrides");
  }

  /**
   * 按来源加载 MIX：CDN 下 3 个逻辑资源并清缓存；本地走隐式列表 + 清 CDN 缓存。
   *
   * @param config 资源配置。
   * @param cdnLoader CDN loader（isCdn 时必填）。
   * @param vfs 虚拟文件系统。
   * @param onProgress 进度回调。
   */
  async loadMixes(config: GameResConfig, cdnLoader: CdnResourceLoader | undefined, vfs: VfsLike, onProgress: GameResProgressFn): Promise<void> {
    if (config.isCdn()) {
      const base = config.getCdnBaseUrl();
      onProgress(this.strings.get("TS:Downloading"), base + (Engine as any).Engine.rfsSettings.splashImgFileName);
      const wanted = [
        (resourceConfigs as any).ResourceType.Ini,
        (resourceConfigs as any).ResourceType.Ui,
        (resourceConfigs as any).ResourceType.Strings,
      ];
      // 孪生 loadResources 返回带 pop 的 MapLike；此处兼容 Map / MapLike
      const resourceMap = (await cdnLoader.loadResources(wanted, void 0, (n: number) => {
        onProgress(this.strings.get("TS:DownloadingPg", n));
      })) as any;
      onProgress(this.strings.get("GUI:LoadingEx"));
      for (const key of wanted) {
        const fileName = cdnLoader.getResourceFileName(key);
        const bytes = resourceMap.pop ? resourceMap.pop(key) : resourceMap.get(key);
        const mix = new MixFile(new DataStream(bytes));
        vfs.addArchive(mix, fileName);
      }
    } else {
      await vfs.loadImplicitMixFiles((Engine as any).Engine.getActiveEngine());
      const cacheDir = await (Engine as any).Engine.getCacheDir();
      if (cacheDir) {
        try {
          await CdnResourceLoader.clearCache(cacheDir);
        } catch (e) {
          if (!(e instanceof StorageQuotaError)) throw e;
        }
      }
    }
  }

  /**
   * 懒加载 VPL 光照表（voxels.vpl / units.vpl）并上传为 256×256 Canvas 纹理。
   *
   * 格式（ModEnc）：16 字节头 + 768 字节调色板 + numSections×256 亮度页。
   * 失败仅 console.warn，保持现有实时光照。
   */
  async loadVpl(): Promise<void> {
    const vfs = (Engine as any).Engine.vfs;
    if (!vfs) return;
    let stream: any = null;
    for (const name of ["voxels.vpl", "units.vpl"]) {
      try {
        stream = vfs.openFile(name).stream;
        break;
      } catch (e) {
        if (!(e instanceof FileNotFoundError)) throw e;
      }
    }
    if (!stream) {
      console.warn("VPL 光照表 voxels.vpl/units.vpl 未找到,保持现有实时光照");
      return;
    }
    try {
      const bytes = stream.readUint8Array(stream.byteLength);
      if (bytes.length < 16 + 768 + 256) throw new Error("VPL 文件过小(" + bytes.length + " 字节)");
      let numSections = bytes[8] | (bytes[9] << 8) | (bytes[10] << 16) | (bytes[11] << 24);
      if (numSections < 1) numSections = 1;
      if (numSections > 32) numSections = 32;
      // 页序对齐 vera20k/vpl_file：页=行、色=列，直接 src=min(p,n-1)，不翻转。
      // 用 Canvas 承接 VPL RGBA（DataTexture 上传不可靠；调色板 Canvas 纹理已验证可行）。
      // R 通道=VPL 值，行=l页，列=color。
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(256, 256);
      const data = imageData.data;
      for (let row = 0; row < 256; row++) {
        const srcPage = row < numSections ? row : numSections - 1;
        const page = srcPage;
        for (let color = 0; color < 256; color++) {
          const v = bytes[16 + 768 + page * 256 + color];
          const off = 4 * (row * 256 + color);
          data[off] = v;
          data[off + 1] = 0;
          data[off + 2] = 0;
          data[off + 3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      // 行向：与已脱色的调色板同约定 flipY=false；存储页 l=section l，与 C++ 对齐。
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = !1;
      texture.flipY = !1;
      texture.needsUpdate = !0;
      paletteShaderLib.vplTexture = texture;
      paletteShaderLib.vplEnabled = !0;
    } catch (e) {
      console.warn("VPL 光照表解析失败,保持现有实时光照", e);
    }
  }

  /**
   * 把 SHP/PCX UI 图转成 PNG objectURL 并写到 rootEl 的 CSS 变量。
   *
   * menulogo.png 可选（品牌资产不随包，缺失 debug）；其余缺失 console.warn。
   *
   * @param rootEl 目标元素。
   */
  async initUiCssVariables(rootEl: HTMLElement): Promise<void> {
    let vars: Record<string, string>;
    const images: [string, string?][] = [
      ["pudlgbgn.shp", "dialogn.pal"],
      ["mnbttn.shp", "mainbttn.pal"],
      ["cue_i.pcx"],
      ["cce_i.pcx"],
      ["cce_il.pcx"],
      ["cce_ir.pcx"],
    ];
    const blobs = await this.convertImagesToPng((Engine as any).Engine.vfs, images);
    // menulogo.png 可选：孪生硬 openFile 会 FileNotFoundError 中断 init，此处吞掉。
    try {
      blobs.set("menulogo.png", (Engine as any).Engine.vfs.openFile("menulogo.png").asFile("image/png"));
    } catch (e) {
      if (!(e instanceof FileNotFoundError)) throw e;
      console.debug('Image "menulogo.png" not found in browser FS (branding asset intentionally not shipped).');
    }
    blobs.set("icons24.pcx", await this.generateIconSprite((Engine as any).Engine.vfs));

    const cssVarToFile: Record<string, string> = {
      "--res-menu-logo": "menulogo.png",
      "--res-icons-24": "icons24.pcx",
      "--res-dlg-bgn": "pudlgbgn.shp",
      "--res-mnbttn": "mnbttn.shp",
      "--res-cue-i": "cue_i.pcx",
      "--res-cce-i": "cce_i.pcx",
      "--res-cce-il": "cce_il.pcx",
      "--res-cce-ir": "cce_ir.pcx",
    };
    vars = {};
    for (const key of Object.keys(cssVarToFile)) {
      const blob = blobs.get(cssVarToFile[key]);
      if (blob) {
        const url = URL.createObjectURL(blob);
        vars[key] = `url("${url}")`;
      } else if (cssVarToFile[key] === "menulogo.png") {
        // menulogo.png is the only optional entry here (upstream branding, not shipped)
        console.debug(`Image "${cssVarToFile[key]}" not found in browser FS`);
      } else {
        console.warn(`Image "${cssVarToFile[key]}" not found in browser FS`);
      }
    }
    Object.keys(vars).forEach((k) => {
      rootEl.style.setProperty(k, vars[k]);
    });
  }

  /**
   * 取启动背景：CDN 用 URL；否则从 mod 目录 / 根目录读 splash PNG。
   *
   * @param root 根目录（可空）。
   * @param modDir 模组目录（优先）。
   * @param config 资源配置。
   * @returns URL 字符串、PNG Blob，或 undefined。
   */
  async loadSplashScreenBackground(root: any, modDir: any, config: GameResConfig): Promise<string | Blob | undefined> {
    const splashName = (Engine as any).Engine.rfsSettings.splashImgFileName;
    if (config.isCdn()) return config.getCdnBaseUrl() + splashName;
    {
      let blob: Blob | undefined;
      if (modDir) {
        try {
          blob = await modDir.getRawFile(splashName, !1, "image/png");
        } catch (e) {
          if (!(e instanceof FileNotFoundError)) console.warn("Failed to load splash image", e);
        }
      }
      if (root && !blob) {
        try {
          blob = await root.getRawFile(splashName, !1, "image/png");
        } catch (e) {
          console.warn("Failed to load splash image", e);
        }
      }
      return blob;
    }
  }

  /**
   * 按偏好顺序加载浏览器 FS 适配器（native → indexeddb → cache，或按 mode/fallback）。
   *
   * @param mode "native" | "fallback"（opfs_unreliable=1 时强制跳过 native）。
   * @returns 根目录句柄。
   * @throws NoStorageError 全部适配器失败。
   */
  async getBrowserFsHandle(mode: "native" | "fallback"): Promise<any> {
    const candidates: { name: string; module?: any }[] = [];
    const opfsUnreliable = "1" === this.localPrefs.getItem("opfs_unreliable");
    if ("fallback" !== mode && (FilesystemAccess as any).support.adapter.native && !opfsUnreliable) {
      candidates.push({ name: "native", module: void 0 });
    }
    if ("native" !== mode || opfsUnreliable) {
      candidates.push({ name: "indexeddb", module: (IndexeddbAdapter as any).default });
      if ((FilesystemAccess as any).support.adapter.cache) {
        candidates.push({ name: "cache", module: (CacheAdapter as any).default });
      }
    }
    let cand: { name: string; module?: any } | undefined;
    while ((cand = candidates.shift())) {
      try {
        console.info(`Loading storage adapter "${cand.name}"...`);
        const root = await (FilesystemAccess as any).getOriginPrivateDirectory(cand.module);
        try {
          const check = await root.getFileHandle("browsercheck", { create: !0 });
          if (!("function" == typeof check.createWritable)) throw new Error("createWritable not supported");
          if ((await check.getFile()).name !== check.name) FileSystemUtil.polyfillGetFile();
        } catch (e: any) {
          if ("NotFoundError" === e.name && "indexeddb" === cand.name) {
            // IndexedDB 元数据损坏：删库并 reload 挂起
            await new Promise(() => {
              indexedDB.deleteDatabase("fileSystem");
              this.localPrefs.removeItem(LocalPrefs.StorageKey.GameRes);
              location.reload();
            });
          }
          if ("QuotaExceededError" !== e.name) throw e;
        } finally {
          try {
            await root.removeEntry("browsercheck");
          } catch (cleanup) {
            // 忽略清理失败
          }
        }
        console.info(`Storage adapter "${cand.name}" loaded successfully.`);
        return root;
      } catch (e) {
        console.warn("Couldn't load FS adapter " + cand.name, [e]);
      }
    }
    throw new NoStorageError("No available FS adapters.");
  }

  /**
   * 把 [文件名, 调色板名?] 列表转成 PNG Blob Map（.shp 需调色板，.pcx 直接转）。
   *
   * @param vfs 虚拟文件系统。
   * @param images 图片任务列表。
   * @returns 文件名 → PNG Blob。
   */
  async convertImagesToPng(vfs: any, images: [string, string?][]): Promise<Map<string, Blob>> {
    const out = new Map<string, Blob>();
    for (const [name, palName] of images) {
      let blob: Blob;
      if (name.endsWith(".shp")) {
        const shp = new ShpFile(vfs.openFile(name));
        if (!palName) throw new Error(`No palette specified for image "${name}"`);
        const pal = new Palette(vfs.openFile(palName));
        blob = await ImageUtils.ImageUtils.convertShpToPng(shp, pal);
      } else {
        if (!name.endsWith(".pcx")) {
          console.warn(`Unknown image type "${name}"`);
          continue;
        }
        const pcx = new PcxFile(vfs.openFile(name));
        blob = await pcx.toPngBlob();
      }
      out.set(name, blob);
    }
    return out;
  }

  /**
   * 把 12 个 24×24 PCX 图标拼成一条 sprite 并转 PNG Blob（icons24.pcx）。
   *
   * @param vfs 虚拟文件系统。
   * @returns sprite PNG Blob。
   */
  async generateIconSprite(vfs: any): Promise<Blob> {
    const names = [
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
    const files = names.map((n) => new PcxFile(vfs.openFile(n)));
    const strip = new RgbaBitmap(24 * names.length, 24);
    for (let i = 0; i < files.length; i++) {
      const src = new RgbaBitmap(files[i].width, files[i].height, files[i].data);
      strip.drawRgbaImage(src, 24 * i, 0);
    }
    const canvas = CanvasUtils.CanvasUtils.canvasFromRgbaImageData(strip.data, strip.width, strip.height);
    return await CanvasUtils.CanvasUtils.canvasToBlob(canvas);
  }
}
