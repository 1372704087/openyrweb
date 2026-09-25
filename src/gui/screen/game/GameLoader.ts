/**
 * GameLoader — 对局资源装载（剧场/音效/纹理/VXL/bot 库/进度回调）。
 *
 * 由 gui/screen/game/GameLoader.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { DataStream } from "data/DataStream"; // 已转换
import * as cancellationModule from "@puzzl/core/lib/async/cancellation"; // 孪生
import * as ResourceLoaderModule from "engine/ResourceLoader"; // 孪生
import * as resourceConfigsModule from "engine/resourceConfigs"; // 孪生
import * as EngineModule from "engine/Engine"; // 孪生
import * as EngineTypeModule from "engine/EngineType"; // 孪生
import * as TheaterTypeModule from "engine/TheaterType"; // 孪生
import { sleep } from "util/time"; // 已转换
import { SideType } from "game/SideType"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import * as IsoCoordsModule from "engine/IsoCoords"; // 孪生
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { ImageFinder } from "engine/ImageFinder"; // 已转换
import { ShpBuilder } from "engine/renderable/builder/ShpBuilder"; // 孪生
import * as PipOverlayModule from "engine/renderable/entity/PipOverlay"; // 孪生
import * as CanvasSpriteBuilderModule from "engine/renderable/builder/CanvasSpriteBuilder"; // 孪生
import { TileSets } from "game/theater/TileSets"; // 孪生
import * as GameFactoryModule from "game/GameFactory"; // 孪生
import * as TrailerSmokeFxModule from "engine/renderable/fx/TrailerSmokeFx"; // 孪生
import { ShpAggregator } from "engine/renderable/builder/ShpAggregator"; // 孪生
import { BuildingShpHelper } from "engine/renderable/entity/building/BuildingShpHelper"; // 孪生
import { BuildingAnimArtProps } from "engine/renderable/entity/building/BuildingAnimArtProps"; // 孪生
import * as mathModule from "util/math"; // 孪生
import { MixFile } from "data/MixFile"; // 已转换
import { isIpad } from "util/userAgent"; // 已转换
import * as GameOptRandomGenModule from "game/gameopts/GameOptRandomGen"; // 孪生
import * as DebugRenderableModule from "engine/renderable/DebugRenderable"; // 孪生
import { MixinRules } from "game/ini/MixinRules"; // 孪生
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const OperationCanceledError: any = (cancellationModule as any).OperationCanceledError;
const DownloadError: any = (ResourceLoaderModule as any).DownloadError ?? (resourceConfigsModule as any).DownloadError;
const ResourceType: any = (resourceConfigsModule as any).ResourceType;
const theaterSpecificResources: any = (resourceConfigsModule as any).theaterSpecificResources;
const Engine: any = (EngineModule as any).Engine;
const EngineTypeNs: any = (EngineTypeModule as any).EngineType;
const TheaterType: any = (TheaterTypeModule as any).TheaterType;
const IsoCoords: any = (IsoCoordsModule as any).IsoCoords;
const PipOverlay: any = (PipOverlayModule as any).PipOverlay ?? PipOverlayModule;
const CanvasSpriteBuilder: any = (CanvasSpriteBuilderModule as any).CanvasSpriteBuilder ?? CanvasSpriteBuilderModule;
const GameFactory: any = (GameFactoryModule as any).GameFactory;
const TrailerSmokeFx: any = (TrailerSmokeFxModule as any).TrailerSmokeFx;
const ShpAggregatorCtor: any = (ShpAggregator as any) ?? ShpAggregator;
const BuildingShpHelperCtor: any = (BuildingShpHelper as any) ?? BuildingShpHelper;
const BuildingAnimArtPropsCtor: any = (BuildingAnimArtProps as any) ?? BuildingAnimArtProps;
const ShpBuilderCtor: any = (ShpBuilder as any) ?? ShpBuilder;
const GameOptRandomGen: any = (GameOptRandomGenModule as any).GameOptRandomGen;
const DebugRenderable: any = (DebugRenderableModule as any).DebugRenderable;
const MixinRulesCtor: any = (MixinRules as any) ?? MixinRules;
const ImageFinderNs: any = ImageFinder;
const isBetween: any = (mathModule as any).isBetween ?? ((n: number, a: number, b: number) => n >= a && n <= b);
const TileSetsCtor: any = (TileSets as any) ?? TileSets;

/** 对局加载器?*/
export class GameLoader {
  /** 版本?*/
  appVersion: any;
  /** Worker 宿主?*/
  workerHostApi: any;
  /** CDN 资源加载?*/
  cdnResourceLoader: any;
  /** 本地资源加载?*/
  appResourceLoader: any;
  /** 规则?*/
  rules: any;
  /** 游戏模式?*/
  gameModes: any;
  /** 音效?*/
  sound: any;
  /** INI 日志?*/
  iniLogger: any;
  /** action 日志?*/
  actionLogger: any;
  /** 速度作弊?*/
  speedCheat: any;
  /** 资源配置?*/
  gameResConfig: any;
  /** VXL 几何池?*/
  vxlGeometryPool: any;
  /** 建筑图缓存?*/
  buildingImageDataCache: any;
  /** 调试 bot 索引?*/
  debugBotIndex: any;
  /** 开发者模式?*/
  devMode: any;

  /**
   * @param appVersion 版本
   * @param workerHostApi Worker
   * @param cdnResourceLoader CDN
   * @param appResourceLoader 本地资源
   * @param rules 规则
   * @param gameModes 模式
   * @param sound 音效
   * @param iniLogger INI 日志
   * @param actionLogger action 日志
   * @param speedCheat 速度
   * @param gameResConfig 资源配置
   * @param vxlGeometryPool VXL ?   * @param buildingImageDataCache 建筑图缓?   * @param debugBotIndex bot 索引
   * @param devMode dev
   */
  constructor(
    appVersion: any,
    workerHostApi: any,
    cdnResourceLoader: any,
    appResourceLoader: any,
    rules: any,
    gameModes: any,
    sound: any,
    iniLogger: any,
    actionLogger: any,
    speedCheat: any,
    gameResConfig: any,
    vxlGeometryPool: any,
    buildingImageDataCache: any,
    debugBotIndex: any,
    devMode: any,
  ) {
    this.appVersion = appVersion;
    this.workerHostApi = workerHostApi;
    this.cdnResourceLoader = cdnResourceLoader;
    this.appResourceLoader = appResourceLoader;
    this.rules = rules;
    this.gameModes = gameModes;
    this.sound = sound;
    this.iniLogger = iniLogger;
    this.actionLogger = actionLogger;
    this.speedCheat = speedCheat;
    this.gameResConfig = gameResConfig;
    this.vxlGeometryPool = vxlGeometryPool;
    this.buildingImageDataCache = buildingImageDataCache;
    this.debugBotIndex = debugBotIndex;
    this.devMode = devMode;
  }

  /**
   * 入口：预?worker ?doLoad，finally dispose?   * @param gameId 游戏 id
   * @param timestamp 时间?   * @param gameOpts 选项
   * @param mapFile 地图
   * @param playerName 玩家?   * @param isSinglePlayer 单机
   * @param loadingScreen 加载?   * @param token 取消令牌
   */
  async load(
    gameId: any,
    timestamp: any,
    gameOpts: any,
    mapFile: any,
    playerName: any,
    isSinglePlayer: any,
    loadingScreen: any,
    token: any,
  ): Promise<any> {
    const infos = this.resolveLoadingPlayerInfos(gameId, timestamp, gameOpts);
    loadingScreen.start(infos, gameOpts.mapTitle, playerName);
    try {
      this.workerHostApi.warmUpPool();
      return await this.doLoad(
        gameId,
        timestamp,
        gameOpts,
        mapFile,
        playerName,
        isSinglePlayer,
        loadingScreen,
        token,
      );
    } finally {
      this.workerHostApi.dispose();
    }
  }

  /**
   * 随机?国（加载屏用，PRNG 顺序?GameFactory 一致）?   * @param gameId id
   * @param timestamp ts
   * @param gameOpts 选项
   */
  resolveLoadingPlayerInfos(gameId: any, timestamp: any, gameOpts: any): any[] {
    const rng = GameOptRandomGen.factory(gameId, timestamp);
    const colors = rng.generateColors(gameOpts);
    const countries = rng.generateCountries(gameOpts, this.rules);
    return gameOpts.humanPlayers.map((p: any) => ({
      ...p,
      colorId: colors.get(p) ?? p.colorId,
      countryId: countries.get(p) ?? p.countryId,
    }));
  }

  /**
   * 主装载流水线?   * @param gameId id
   * @param timestamp ts
   * @param gameOpts 选项
   * @param mapFile 地图
   * @param playerName 玩家
   * @param isSinglePlayer 单机
   * @param loadingScreen 加载?   * @param token 取消
   */
  async doLoad(
    gameId: any,
    timestamp: any,
    gameOpts: any,
    mapFile: any,
    playerName: any,
    isSinglePlayer: any,
    loadingScreen: any,
    token: any,
  ): Promise<any> {
    if (!Engine.vfs) throw new Error("Virtual File System not initialized");
    this.clearStaticCaches();
    this.buildingImageDataCache.clear();
    try {
      if (!Engine.getActiveMod()) await this.loadFestiveAssets(token);
    } catch (e) {
      if (e instanceof OperationCanceledError) throw e;
      console.error("Couldn't load festive assets", e);
    }
    await this.loadTheater(mapFile.theaterType, token, (p) =>
      loadingScreen.onLoadProgress((p / 100) * 30),
    );
    await sleep(1);
    let botsLib: any = await this.loadBotsLib();
    if (!this.devMode && botsLib.version !== this.appVersion) {
      throw new DownloadError(
        "Bot library version mismatch. " +
          `Expected ${this.appVersion}, but got ` +
          botsLib.version,
      );
    }
    const { game, theater } = await this.createGame(
      gameId,
      timestamp,
      gameOpts,
      mapFile,
      isSinglePlayer,
      botsLib,
    );
    let hudSide = SideType.GDI;
    let localPlayer: any;
    if (playerName) {
      localPlayer = game.getPlayerByName(playerName);
      if (!localPlayer.isObserver) hudSide = localPlayer.country.side;
    }
    let cdnBlobs: any = void 0;
    if (this.gameResConfig.isCdn()) {
      cdnBlobs = await this.cdnResourceLoader.loadResources(
        [
          ResourceType.Sounds,
          ...(hudSide === SideType.GDI
            ? [ResourceType.EvaAlly, ResourceType.UiAlly]
            : [ResourceType.EvaSov, ResourceType.UiSov]),
          ResourceType.Cameo,
        ],
        token,
        (p) => loadingScreen.onLoadProgress(30 + (p / 100) * 15),
      );
    }
    if (cdnBlobs) {
      Engine.vfs.addArchive(
        new MixFile(new DataStream(cdnBlobs.pop(ResourceType.Cameo))),
        this.cdnResourceLoader.getResourceFileName(ResourceType.Cameo),
      );
      // cameocd.mix is the upstream product's custom unit-cameo override
      // pack (a CD-specific asset, like ra2cd.mix). We do NOT ship it (AGENTS.md §4.2).
      // The base cameo.mix (from game data / CDN) is already loaded above, so this
      // override is optional. Make its absence non-fatal instead of throwing
      // FileNotFoundError and aborting game load.
      try {
        await Engine.vfs.addMixFile("cameocd.mix");
      } catch {
        console.debug(
          'Optional asset "cameocd.mix" not found ?skipping (upstream custom cameo override intentionally not shipped).',
        );
      }
    }
    const cameoFilenames = this.collectCameoFileNames(game);
    await this.loadHudSideImages(cdnBlobs, hudSide);
    loadingScreen.onLoadProgress(40);
    await sleep(1);
    if (cdnBlobs) {
      for (const type of [
        ResourceType.Sounds,
        hudSide === SideType.GDI ? ResourceType.EvaAlly : ResourceType.EvaSov,
      ]) {
        Engine.vfs.addArchive(
          new MixFile(new DataStream(cdnBlobs.pop(type))),
          this.cdnResourceLoader.getResourceFileName(type),
        );
      }
      await Engine.vfs.addBagFile("audio.bag");
    }
    loadingScreen.onLoadProgress(45);
    await sleep(1);
    const skipHeavy =
      /iPhone|Android|CrOS|Windows Phone|webOS/i.test(navigator.userAgent) ||
      isIpad();
    if (!skipHeavy) {
      console.time("Load sounds");
      await this.prepareSounds(token, (p) => loadingScreen.onLoadProgress(45 + (p / 100) * 15));
      console.timeEnd("Load sounds");
    }
    loadingScreen.onLoadProgress(60);
    await sleep(1);
    if (!skipHeavy) {
      const images = Engine.getImages();
      const finder = new ImageFinderNs(images, theater);
      console.time("Load textures");
      await this.prepareTextures(
        game.rules,
        game.art,
        mapFile,
        finder,
        token,
        (p) => loadingScreen.onLoadProgress(60 + (p / 100) * 10),
      );
      console.timeEnd("Load textures");
    }
    loadingScreen.onLoadProgress(70);
    await sleep(1);
    console.time("Load voxels");
    await this.prepareVxlGeometries(
      game.rules,
      game.art,
      game.map,
      Engine.getVoxels(),
      token,
      (p) => loadingScreen.onLoadProgress(70 + (p / 100) * 20),
    );
    console.timeEnd("Load voxels");
    await sleep(1);
    token?.throwIfCancelled();
    IsoCoords.init({
      x: 0,
      y: (game.map.mapBounds.getFullSize().width * Coords.getWorldTileSize()) / 2,
    });
    game.init(localPlayer);
    token?.throwIfCancelled();
    loadingScreen.onLoadProgress(95);
    await sleep(1);
    return { game, theater, hudSide, cameoFilenames };
  }

  /**
   * 收集 cameo 文件名（?SW 侧栏图）?   * @param game 游戏
   */
  collectCameoFileNames(game: any): string[] {
    let list: string[] = [];
    const rulesList = [
      ...game.rules.buildingRules.values(),
      ...game.rules.infantryRules.values(),
      ...game.rules.vehicleRules.values(),
      ...game.rules.aircraftRules.values(),
    ];
    for (const rules of rulesList.values()) {
      if (!game.art.hasObject(rules.name, rules.type)) continue;
      const art = game.art.getObject(rules.name, rules.type);
      list.push(art.cameo + ".shp");
      list.push(art.altCameo + ".shp");
    }
    for (const sw of game.rules.superWeaponRules.values()) {
      if (sw.sidebarImage.length) list.push(sw.sidebarImage + ".shp");
    }
    list = list.filter((name) => Engine.getImages().has(name));
    return [...new Set(list)];
  }

  /**
   * worker 解码 Raw IMA-ADPCM WAV?   * @param token 取消
   * @param progress 进度
   */
  async prepareSounds(token: any, progress: (p: number) => void): Promise<void> {
    const set = new Set<any>();
    for (const spec of this.sound.soundSpecs.getAll()) {
      for (const name of spec.sounds) {
        const wav = this.sound.getWavFile(name);
        if (wav && wav.isRawImaAdpcm()) set.add(wav);
      }
    }
    let done = 0;
    const total = set.size;
    if (!total) return;
    const queue = [...set].sort(
      (a, b) => a.getRawData().length - b.getRawData().length,
    );
    const concurrency = this.workerHostApi.concurrency;
    try {
      for (let i = 0; i < concurrency; i++) {
        this.workerHostApi.queueTask(async (worker: any) => {
          while (queue.length && !token?.isCancelled()) {
            const wav = queue.pop();
            const raw = wav.getRawData();
            const decoded = await worker.decodeWav(raw);
            wav.setData(decoded);
            done++;
            const pct = (done / total) * 100;
            if (Math.floor(pct) % 10 === 0) progress((done / total) * 100);
          }
        });
        await Promise.resolve();
      }
      await this.workerHostApi.waitForTasks();
      token?.throwIfCancelled();
    } catch (e) {
      if (e instanceof OperationCanceledError) throw e;
      // the worker intentionally rejects these jobs (WORKER_UNAVAILABLE),
      // routing to the main-thread WAV decoder (WavFile.decodeData via wavefile).
      // That fallback is fully functional, so demote the expected reject to debug
      // and only surface genuinely unexpected errors at error level.
      if (String((e as any)?.message || e).includes("WORKER_UNAVAILABLE")) {
        console.debug("Sounds will decode on demand (worker unavailable).");
      } else {
        console.error(e);
      }
    }
  }

  /**
   * CDN 剧场资源?   * @param theaterType 剧场
   * @param token 取消
   * @param progress 进度
   */
  async loadTheater(
    theaterType: any,
    token: any,
    progress: (p: number) => void,
  ): Promise<void> {
    if (!this.gameResConfig.isCdn()) {
      progress(100);
      return;
    }
    const extra = theaterSpecificResources.get(theaterType);
    if (!extra) throw new Error("Unhandled theater type " + TheaterType[theaterType]);
    const types = [
      ResourceType.BuildGen,
      ResourceType.Anims,
      ResourceType.Vxl,
      ...extra,
    ];
    const blobs = await this.cdnResourceLoader.loadResources(types, token, (p) =>
      progress((p / 100) * 60),
    );
    for (const type of types) {
      Engine.vfs.addArchive(
        new MixFile(new DataStream(blobs.pop(type))),
        this.cdnResourceLoader.getResourceFileName(type),
      );
    }
  }

  /**
   * 构建 Game?   * @param gameId id
   * @param timestamp ts
   * @param gameOpts 选项
   * @param mapFile 地图
   * @param isSinglePlayer 单机
   * @param botsLib bot ?   */
  async createGame(
    gameId: any,
    timestamp: any,
    gameOpts: any,
    mapFile: any,
    isSinglePlayer: any,
    botsLib: any,
  ): Promise<any> {
    const override = Engine.getIni(this.gameModes.getById(gameOpts.gameMode).rulesOverride);
    const mixinInis = MixinRulesCtor.getTypes(gameOpts)
      .map((t: any) => Engine.mixinRulesFileNames.get(t))
      .filter(isNotNullOrUndefined)
      .map((name: any) => Engine.getIni(name));
    const theater = await Engine.loadTheater(mapFile.theaterType);
    const engineType = Engine.getActiveEngine();
    const settings = Engine.getTheaterSettings(engineType, mapFile.theaterType);
    const theaterIni = Engine.getTheaterIni(engineType, mapFile.theaterType);
    const tileSets = new TileSetsCtor(theaterIni);
    tileSets.loadTileData(Engine.getTileData(), settings.extension);
    return {
      game: GameFactory.create(
        mapFile,
        tileSets,
        Engine.getRules(),
        Engine.getArt(),
        Engine.getAi(),
        override,
        mixinInis,
        gameId,
        timestamp,
        gameOpts,
        this.gameModes,
        isSinglePlayer,
        botsLib,
        this.iniLogger,
        this.speedCheat,
        this.debugBotIndex,
        this.actionLogger,
      ),
      theater,
    };
  }

  /** 动态加?bot 库（?bundle 内）?*/
  async loadBotsLib(): Promise<any> {
    // AI ships in the main bundle now (game/bot/BotsLib exports
    // IraqBot). No external sp-bots bundle dependency.
    let mod: any;
    try {
      mod = await (globalThis as any).SystemJS.import("game/bot/BotsLib");
    } catch (e) {
      throw new DownloadError("Failed to load bot lib", { cause: e });
    }
    return mod;
  }

  /**
   * 装载侧栏 UI mix?   * @param cdnBlobs CDN 数据
   * @param side 阵营
   */
  async loadHudSideImages(cdnBlobs: any, side: any): Promise<void> {
    if (!Engine.vfs) throw new Error("VFS is not initialized");
    Engine.vfs.removeArchive("sidec01.mix");
    Engine.vfs.removeArchive("sidec02.mix");
    Engine.vfs.removeArchive("sidec02md.mix");
    Engine.vfs.removeArchive("sidec01cd.mix");
    Engine.vfs.removeArchive("sidec02cd.mix");
    Engine.unloadSideMixData();
    if (cdnBlobs) {
      const type = side === SideType.GDI ? ResourceType.UiAlly : ResourceType.UiSov;
      const name = this.cdnResourceLoader.getResourceFileName(type);
      if (!["sidec01.mix", "sidec02.mix"].includes(name)) {
        throw new Error(`Side mix file name "${name}" mismatch`);
      }
      Engine.vfs.addArchive(new MixFile(new DataStream(cdnBlobs.pop(type))), name);
    } else {
      await Engine.vfs.addMixFile(side === SideType.GDI ? "sidec01.mix" : "sidec02.mix");
      if (Engine.getActiveEngine() === EngineTypeNs.YurisRevenge && side === SideType.ThirdSide) {
        await Engine.vfs.addMixFile("sidec02md.mix");
      }
    }
    // sidec01cd.mix / sidec02cd.mix are the upstream product's custom
    // side-UI override packs (CD-specific, like cameocd.mix). Not shipped (AGENTS.md
    // §4.2); the base sidec0X.mix above already provides the UI. Optional load.
    try {
      await Engine.vfs.addMixFile(side === SideType.GDI ? "sidec01cd.mix" : "sidec02cd.mix");
    } catch {
      console.debug(
        "Optional side-cd mix not found ?skipping (upstream custom side-UI override intentionally not shipped).",
      );
    }
  }

  /**
   * 节日资源（万?圣诞）?   * @param token 取消
   */
  async loadFestiveAssets(token: any): Promise<void> {
    const now = new Date();
    let month = now.getMonth() + 1;
    const day = now.getDate();
    let type: any;
    if ((month === 10 && isBetween(day, 24, 31)) || (month === 11 && isBetween(day, 1, 6))) {
      type = ResourceType.HalloweenMix;
    } else if (month === 12 && isBetween(day, 16, 31)) {
      type = ResourceType.XmasMix;
    }
    if (type === void 0) return;
    month = this.appResourceLoader.getResourceFileName(type);
    if (Engine.vfs.hasArchive(month as any)) return;
    const blobs = await this.appResourceLoader.loadResources([type], token);
    const buf = blobs.pop(type);
    Engine.vfs.addArchive(new MixFile(new DataStream(buf)), month as any);
  }

  /**
   * 建筑/动画纹理聚合?   * @param rules 规则
   * @param art art
   * @param mapFile 地图
   * @param images 图片查找
   * @param token 取消
   * @param progress 进度
   */
  async prepareTextures(
    rules: any,
    art: any,
    mapFile: any,
    images: any,
    token: any,
    progress: (p: number) => void,
  ): Promise<void> {
    const helper = new BuildingShpHelperCtor(images);
    const aggregator = new ShpAggregatorCtor();
    const animNames = new Set<string>();
    let lastReport = performance.now();
    const structures = new Set<string>();
    for (const s of mapFile.structures) structures.add(s.name);
    const buildingNames: string[] = [];
    for (const [name, r] of rules.buildingRules) {
      if (structures.has(name) || r.techLevel !== -1) buildingNames.push(name);
    }
    let processed = 0;
    const total = buildingNames.length + rules.animationNames.size;
    for (const name of buildingNames) {
      token?.throwIfCancelled();
      const now = performance.now();
      if (now - lastReport > 1e3) {
        lastReport = now;
        progress((processed / total) * 100);
        await sleep(0);
      }
      processed++;
      if (this.buildingImageDataCache.has(name)) continue;
      if (!art.hasObject(name, ObjectType.Building)) continue;
      const objectArt = art.getObject(name, ObjectType.Building);
      if (objectArt.demandLoad) continue;
      const animProps = new BuildingAnimArtPropsCtor();
      animProps.read(objectArt.art, art);
      for (const list of animProps.getAll().values()) {
        for (const a of list) animNames.add(a.name);
      }
      try {
        const shp = images.findByObjectArt(objectArt);
        const bib = objectArt.bibShape
          ? images.find(objectArt.bibShape, objectArt.useTheaterExtension)
          : void 0;
        const animShps = helper.collectAnimShpFiles(animProps, objectArt);
        const frameInfos = helper.getShpFrameInfos(objectArt, shp, bib, animShps, animProps);
        const agg = aggregator.aggregate(frameInfos.values(), `agg_${name}.shp`);
        this.buildingImageDataCache.set(name, agg);
        ShpBuilderCtor.prepareTexture(agg.file);
      } catch (e) {
        if (e instanceof ImageFinderNs.MissingImageError) continue;
        throw e;
      }
    }
    for (const name of rules.animationNames) {
      token?.throwIfCancelled();
      const now = performance.now();
      if (now - lastReport > 1e3) {
        lastReport = now;
        progress((processed / total) * 100);
        await sleep(0);
      }
      processed++;
      if (animNames.has(name)) continue;
      if (!art.hasObject(name, ObjectType.Animation)) continue;
      const anim = art.getAnimation(name);
      try {
        const shp = images.findByObjectArt(anim);
        ShpBuilderCtor.prepareTexture(shp);
      } catch (e) {
        if (e instanceof ImageFinderNs.MissingImageError) continue;
        throw e;
      }
    }
  }

  /**
   * 预生?VXL 几何?   * @param rules 规则
   * @param art art
   * @param map 地图
   * @param voxels VXL ?   * @param token 取消
   * @param progress 进度
   */
  async prepareVxlGeometries(
    rules: any,
    art: any,
    map: any,
    voxels: any,
    token: any,
    progress: (p: number) => void,
  ): Promise<void> {
    const set = new Set(
      [...rules.vehicleRules.values(), ...rules.aircraftRules.values(), ...rules.buildingRules.values()].filter(
        (r: any) =>
          (r.techLevel !== -1 || r.spawned) && art.hasObject(r.name, r.type),
      ),
    );
    for (const b of rules.buildingRules.values()) {
      // 与孪生一致：freeUnit/undeploysInto/初始单位从 **rules** 取规则对象入 set；
      // 若误用 art.getObject，塞进的是无 .name 的 ObjectArt，二次 art.getObject(name)
      // 会抛 "Must specify an art name for type Vehicle"。
      if (b.freeUnit) {
        let free: any;
        if (rules.hasObject(b.freeUnit, ObjectType.Vehicle)) {
          free = rules.getObject(b.freeUnit, ObjectType.Vehicle);
        }
        if (free) set.add(free);
      }
      if (
        b.undeploysInto &&
        rules.hasObject(b.undeploysInto, ObjectType.Vehicle)
      ) {
        set.add(rules.getObject(b.undeploysInto, ObjectType.Vehicle));
      }
    }
    for (const obj of map.getInitialMapObjects().technos) {
      if (!obj.isVehicle() && !obj.isAircraft()) continue;
      if (!rules.hasObject(obj.name, obj.type)) continue;
      set.add(rules.getObject(obj.name, obj.type));
    }
    const files = new Map<string, any>();
    for (const objRules of set) {
      const objectArt = art.getObject(objRules.name, objRules.type);
      const isVoxel =
        objectArt.isVoxel ||
        (objRules.type === ObjectType.Building && objRules.turretAnimIsVoxel);
      if (!isVoxel) continue;
      const base = objectArt.imageName.toLowerCase();
      const names: string[] = [];
      if (objRules.type !== ObjectType.Building) {
        names.push(base + ".vxl");
        if (objRules.spawns && objRules.noSpawnAlt) names.push(base + "wo.vxl");
        if (
          objRules.harvester &&
          objRules.unloadingClass &&
          // rules = 外层参数（Rules 实例）：unloadingClass 的查询走 rules.hasObject，
          // 不能用循环变量（规则对象没有 hasObject，遮蔽会抛 TypeError）
          rules.hasObject(objRules.unloadingClass, ObjectType.Vehicle)
        ) {
          names.push(
            rules.getObject(objRules.unloadingClass, ObjectType.Vehicle).imageName.toLowerCase() +
              ".vxl",
          );
        }
        if (objRules.turret) {
          for (let i = 0; i < objRules.turretCount; ++i) {
            names.push(base + `tur${i || ""}.vxl`);
          }
          const barl = base + "barl.vxl";
          if (voxels.has(barl)) names.push(barl);
        }
      } else if (objRules.turretAnimIsVoxel) {
        const tur = objRules.turretAnim.toLowerCase() + ".vxl";
        names.push(tur);
        const barl = tur.replace("tur", "barl");
        if (voxels.has(barl)) names.push(barl);
      }
      for (const n of names) {
        const entry = voxels.get(n);
        if (entry) files.set(n, entry);
      }
    }
    let loaded = 0;
    const pending: any[] = [];
    for (const [name, entry] of files) {
      token?.throwIfCancelled();
      if (await this.vxlGeometryPool.loadFromStorage(entry, name)) {
        loaded++;
        progress((loaded / files.size) * 100);
      } else {
        pending.push([name, entry]);
      }
    }
    if (!pending.length) return;
    pending.sort((a, b) => b[1].voxelCount - a[1].voxelCount);
    const concurrency = this.workerHostApi.concurrency;
    const quality = this.vxlGeometryPool.getModelQuality();
    const persist: any[] = [() => this.vxlGeometryPool.clearOtherModStorage()];
    try {
      for (let i = 0; i < concurrency; i++) {
        this.workerHostApi.queueTask(async (worker: any) => {
          while (pending.length && !token?.isCancelled()) {
            const [name, entry] = pending.pop();
            const geo = await worker.generateVxlGeometry(entry, quality);
            persist.push(() => this.vxlGeometryPool.persistToStorage(entry, name, geo));
            loaded++;
            progress((loaded / files.size) * 100);
          }
        });
      }
      await this.workerHostApi.waitForTasks();
      token?.throwIfCancelled();
    } catch (e) {
      if (e instanceof OperationCanceledError) throw e;
      // see prepareSounds ?the worker rejects on purpose
      // (WORKER_UNAVAILABLE); VXL geometries are built on the main thread on
      // demand via VxlGeometryPool.get() -> VxlGeometryMonotoneBuilder, so models
      // still render. Only the pre-load cache is skipped.
      if (String((e as any)?.message || e).includes("WORKER_UNAVAILABLE")) {
        console.debug("VXL geometries will build on demand (worker unavailable).");
      } else {
        console.error(e);
        console.warn("Failed to pre-load VXL geometries. Skipping.");
      }
    }
    await Promise.all(persist.map((f) => f())).catch((e) =>
      console.warn("Failed to persist VXL geometry cache", [e]),
    );
  }

  /** 清静态缓存?*/
  clearStaticCaches(): void {
    PipOverlay.clearCaches();
    ShpBuilderCtor.clearCaches();
    DebugRenderable.clearCaches();
    CanvasSpriteBuilder.clearCaches();
    TrailerSmokeFx.clearTextureCache();
  }
}