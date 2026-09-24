/**
 * WorldView — 构建世界场景、光照、渲染件与 FX 处理器。
 *
 * 由 gui/screen/game/WorldView.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as WorldSceneModule from "engine/renderable/WorldScene"; // 孪生
import { WorldViewportHelper } from "engine/util/WorldViewportHelper"; // 已转换
import { MapTileIntersectHelper } from "engine/util/MapTileIntersectHelper"; // 已转换
import { WorldSound } from "engine/sound/WorldSound"; // 孪生
import * as EngineModule from "engine/Engine"; // 孪生
import { MapPanningHelper } from "engine/util/MapPanningHelper"; // 已转换
import * as IsoCoordsModule from "engine/IsoCoords"; // 孪生
import { ImageFinder } from "engine/ImageFinder"; // 已转换
import { MapRenderable } from "engine/renderable/entity/map/MapRenderable"; // 孪生
import { RenderableFactory } from "engine/renderable/entity/RenderableFactory"; // 孪生
import { RenderableManager } from "engine/RenderableManager"; // 孪生
import { ChronoFxHandler } from "engine/renderable/fx/handler/ChronoFxHandler"; // 孪生
import { Lighting } from "engine/Lighting"; // 孪生
import { LightingDirector } from "engine/gfx/lighting/LightingDirector"; // 孪生
import { WarheadDetonateFxHandler } from "engine/renderable/fx/handler/WarheadDetonateFxHandler"; // 孪生
import { SuperWeaponFxHandler } from "engine/renderable/fx/handler/SuperWeaponFxHandler"; // 孪生
import { CrateFxHandler } from "engine/renderable/fx/handler/CrateFxHandler"; // 孪生
import { BeaconFxHandler } from "engine/renderable/fx/handler/BeaconFxHandler"; // 孪生
import { VxlBuilderFactory } from "engine/renderable/builder/VxlBuilderFactory"; // 孪生
import { TriggerActionFxHandler } from "engine/renderable/fx/handler/TriggerActionFxHandler"; // 孪生
import { BoxedVar } from "util/BoxedVar"; // 已转换
import { ParasiteSparkFxHandler } from "engine/renderable/fx/handler/ParasiteSparkFxHandler"; // 孪生
import * as VirusCloudFxHandlerModule from "engine/renderable/fx/handler/VirusCloudFxHandler"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未完全转换的命名空间取成员
const WorldScene: any = (WorldSceneModule as any).WorldScene ?? WorldSceneModule;
const Engine: any = (EngineModule as any).Engine;
const IsoCoords: any = (IsoCoordsModule as any).IsoCoords;
const VirusCloudFxHandler: any = (VirusCloudFxHandlerModule as any).VirusCloudFxHandler;
const WorldSoundCtor: any = (WorldSound as any) ?? WorldSound;
const MapRenderableCtor: any = (MapRenderable as any) ?? MapRenderable;

/** 世界视图。 */
export class WorldView {
  /** HUD 边距。 */
  hudGutterSize: any;
  /** 游戏。 */
  game: any;
  /** 音效系统。 */
  sound: any;
  /** 渲染器。 */
  renderer: any;
  /** 运行时开关。 */
  runtimeVars: any;
  /** 小地图。 */
  minimap: any;
  /** 字符串。 */
  strings: any;
  /** 通用选项。 */
  generalOptions: any;
  /** VXL 几何池。 */
  vxlGeometryPool: any;
  /** 建筑图缓存。 */
  buildingImageDataCache: any;
  /** 愚人节开关。 */
  aprilFools: boolean;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 本地玩家。 */
  localPlayer = new BoxedVar<any>(void 0);
  /** 世界场景。 */
  worldScene: any;
  /** 世界音效。 */
  worldSound: any;
  /** 地图渲染件。 */
  mapRenderable: any;

  /**
   * @param hudGutterSize HUD 边距
   * @param game 游戏
   * @param sound 音效
   * @param renderer 渲染器
   * @param runtimeVars 运行时
   * @param minimap 小地图
   * @param strings 字符串
   * @param generalOptions 选项
   * @param vxlGeometryPool VXL 池
   * @param buildingImageDataCache 建筑图缓存
   * @param aprilFools 愚人节
   */
  constructor(
    hudGutterSize: any,
    game: any,
    sound: any,
    renderer: any,
    runtimeVars: any,
    minimap: any,
    strings: any,
    generalOptions: any,
    vxlGeometryPool: any,
    buildingImageDataCache: any,
    aprilFools = false,
  ) {
    this.hudGutterSize = hudGutterSize;
    this.game = game;
    this.sound = sound;
    this.renderer = renderer;
    this.runtimeVars = runtimeVars;
    this.minimap = minimap;
    this.strings = strings;
    this.generalOptions = generalOptions;
    this.vxlGeometryPool = vxlGeometryPool;
    this.buildingImageDataCache = buildingImageDataCache;
    this.aprilFools = aprilFools;
    this.disposables = new CompositeDisposable();
    this.localPlayer = new BoxedVar(void 0);
  }

  /**
   * 初始化场景/音效/渲染件。
   * @param player 本地玩家
   * @param viewport UI 视口
   * @param theater theater
   */
  init(player: any, viewport: any, theater: any): any {
    this.localPlayer.value = player;
    this.disposables.add(() => (this.localPlayer.value = void 0));
    const game = this.game;
    const map = game.map;
    const mapBounds = this.computeMapScreenBounds(map.mapBounds.getLocalSize());
    const worldViewport = this.computeWorldViewport(viewport, mapBounds);
    const scene = this.initWorldView(player, worldViewport, game, map);
    this.worldScene = scene;
    this.disposables.add(() => (this.worldScene = void 0));
    const viewportHelper = new WorldViewportHelper(scene);
    const tileIntersect = new MapTileIntersectHelper(map, scene);
    const world = game.getWorld();
    const shroud = player ? this.game.mapShroudTrait.getPlayerShroud(player) : void 0;
    const worldSound = new WorldSoundCtor(
      this.sound,
      player,
      shroud,
      viewportHelper,
      tileIntersect,
      world,
      scene,
      this.renderer,
    );
    worldSound.init();
    this.worldSound = worldSound;
    this.disposables.add(worldSound, () => (this.worldSound = void 0));
    const lighting = new Lighting(game.mapLightingTrait);
    this.disposables.add(lighting);
    scene.applyLighting(lighting);
    const director = new LightingDirector(lighting, this.renderer, game.speed);
    director.init();
    this.disposables.add(director);
    const selection = game.getUnitSelection();
    const {
      renderableManager,
      mapRenderable,
      superWeaponFxHandler,
      beaconFxHandler,
    } = this.initRenderables(
      game,
      this.localPlayer,
      scene,
      theater,
      selection,
      worldSound,
      lighting,
      director,
    );
    this.mapRenderable = mapRenderable;
    this.disposables.add(() => (this.mapRenderable = void 0));
    const onLighting = (level: any) => {
      scene.applyLighting(lighting);
      renderableManager.updateLighting();
      mapRenderable.updateLighting(level);
    };
    lighting.onChange.subscribe(onLighting);
    this.disposables.add(() => lighting.onChange.unsubscribe(onLighting));
    this.minimap.initWorld(scene);
    const onResize = () => {
      this.handleMapBoundsOrViewportChange(viewport);
      this.minimap.forceRerender();
    };
    map.mapBounds.onLocalResize.subscribe(onResize);
    this.disposables.add(() => map.mapBounds.onLocalResize.unsubscribe(onResize));
    return {
      worldScene: scene,
      worldSound,
      renderableManager,
      superWeaponFxHandler,
      beaconFxHandler,
    };
  }

  /**
   * 切换本地玩家（迷雾）。
   * @param player 玩家
   */
  changeLocalPlayer(player: any): void {
    this.localPlayer.value = player;
    const shroud = player ? this.game.mapShroudTrait.getPlayerShroud(player) : void 0;
    this.worldSound?.changeLocalPlayer(player, shroud);
    this.mapRenderable?.setShroud(shroud);
  }

  /**
   * 视口变化。
   * @param viewport 新视口
   */
  handleViewportChange(viewport: any): void {
    this.handleMapBoundsOrViewportChange(viewport);
  }

  /**
   * 地图 bounds 或视口变化时更新场景与 pan 限制。
   * @param viewport UI 视口
   */
  handleMapBoundsOrViewportChange(viewport: any): void {
    if (!this.worldScene) return;
    const bounds = this.computeMapScreenBounds(this.game.map.mapBounds.getLocalSize());
    const worldViewport = this.computeWorldViewport(viewport, bounds);
    this.worldScene.updateViewport(worldViewport);
    this.updatePanLimits(this.game.map, this.worldScene.cameraPan, worldViewport);
  }

  /**
   * 创建 WorldScene 并对准起始位置。
   * @param player 本地玩家
   * @param viewport 世界视口
   * @param game 游戏
   * @param map 地图
   */
  initWorldView(player: any, viewport: any, game: any, map: any): any {
    const scene = WorldScene.factory(
      viewport,
      this.runtimeVars.freeCamera,
      this.generalOptions.graphics.shadows,
    );
    this.disposables.add(scene);
    this.updatePanLimits(map, scene.cameraPan, viewport);
    const combatant =
      !player || player.isObserver ? game.getCombatants()[0] : player;
    const loc = map.startingLocations[combatant.startLocation];
    const panning = new MapPanningHelper(map);
    scene.cameraPan.setPan(panning.computeCameraPanFromTile(loc.x, loc.y));
    const full = map.mapBounds.getFullSize();
    const focus = IsoCoords.screenTileToWorld(full.width / 2, full.height / 2);
    scene.setLightFocusPoint(focus.x, focus.y);
    return scene;
  }

  /**
   * 创建地图/对象渲染件与 FX 处理器。
   * @param game 游戏
   * @param player 本地玩家包装
   * @param scene 场景
   * @param theater theater
   * @param selection 选择
   * @param worldSound 世界音效
   * @param lighting 光照
   * @param director 光照导演
   */
  initRenderables(
    game: any,
    player: any,
    scene: any,
    theater: any,
    selection: any,
    worldSound: any,
    lighting: any,
    director: any,
  ): any {
    const images = Engine.getImages();
    const voxels = Engine.getVoxels();
    const voxelAnims = Engine.getVoxelAnims();
    const imageFinder = new ImageFinder(images, theater);
    const palettes = Engine.getPalettes();
    const shroud = player.value ? game.mapShroudTrait.getPlayerShroud(player.value) : void 0;
    const mapRenderable = new MapRenderableCtor(
      game.map,
      shroud,
      game.mapRadiationTrait,
      lighting,
      theater,
      game.rules,
      game.art,
      imageFinder,
      scene.camera,
      this.runtimeVars.debugWireframes,
      game.speed,
      worldSound,
      true,
    );
    scene.add(mapRenderable);
    this.disposables.add(mapRenderable);
    const supportsInstancing = this.renderer.supportsInstancing();
    const factory = new RenderableFactory(
      player,
      selection,
      game.alliances,
      game.rules,
      game.art,
      mapRenderable,
      imageFinder,
      palettes,
      voxels,
      voxelAnims,
      theater,
      scene.camera,
      lighting,
      director,
      this.runtimeVars.debugWireframes,
      this.runtimeVars.debugText,
      game.speed,
      worldSound,
      this.strings,
      this.generalOptions.flyerHelper,
      this.generalOptions.hiddenObjects,
      new VxlBuilderFactory(this.vxlGeometryPool, supportsInstancing, scene.camera),
      this.buildingImageDataCache,
      true,
      supportsInstancing,
      this.aprilFools,
    );
    const manager = new RenderableManager(game.getWorld(), scene, scene.camera, factory);
    manager.init();
    this.disposables.add(manager);
    const chrono = new ChronoFxHandler(game, manager);
    chrono.init();
    this.disposables.add(chrono);
    const warhead = new WarheadDetonateFxHandler(game, manager);
    warhead.init();
    this.disposables.add(warhead);
    const swFx = new SuperWeaponFxHandler(game, manager, director);
    swFx.init();
    this.disposables.add(swFx);
    const crate = new CrateFxHandler(game, manager);
    crate.init();
    this.disposables.add(crate);
    const beacon = new BeaconFxHandler(game, player, manager, this.renderer, worldSound);
    beacon.init();
    this.disposables.add(beacon);
    const parasite = new ParasiteSparkFxHandler(game, manager);
    parasite.init();
    this.disposables.add(parasite);
    const virus = new VirusCloudFxHandler(game, manager);
    virus.init();
    this.disposables.add(virus);
    const trigger = new TriggerActionFxHandler(game, manager);
    trigger.init();
    this.disposables.add(trigger);
    return {
      renderableManager: manager,
      mapRenderable,
      superWeaponFxHandler: swFx,
      beaconFxHandler: beacon,
    };
  }

  /**
   * 计算世界视口（扣除 HUD gutter）。
   * @param viewport UI 视口
   * @param bounds 地图屏幕 bounds
   */
  computeWorldViewport(viewport: any, bounds: any): any {
    return {
      x: viewport.x,
      y: viewport.y,
      width: Math.min(bounds.width, viewport.width - this.hudGutterSize.width),
      height: Math.min(bounds.height, viewport.height - this.hudGutterSize.height),
    };
  }

  /**
   * 更新 pan 限制。
   * @param map 地图
   * @param cameraPan 镜头
   * @param viewport 世界视口
   */
  updatePanLimits(map: any, cameraPan: any, viewport: any): void {
    const panning = new MapPanningHelper(map);
    const bounds = this.computeMapScreenBounds(map.mapBounds.getLocalSize());
    cameraPan.setPanLimits(panning.computeCameraPanLimits(viewport, bounds));
  }

  /**
   * 地图本地尺寸 → 屏幕 bounds。
   * @param size 本地尺寸
   */
  computeMapScreenBounds(size: any): any {
    const a = IsoCoords.screenTileToScreen(size.x, size.y);
    const b = IsoCoords.screenTileToScreen(size.x + size.width, size.y + size.height - 1);
    return { x: a.x, y: a.y, width: b.x - a.x, height: b.y - a.y };
  }

  /** 从渲染器移除场景并释放。 */
  dispose(): void {
    if (this.worldScene) this.renderer.removeScene(this.worldScene);
    this.disposables.dispose();
  }
}
