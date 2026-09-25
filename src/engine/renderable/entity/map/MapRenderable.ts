/**
 * MapRenderable — 地图渲染总装（tile/debug/surface/bounds/shroud/三精灵层）。
 *
 * init 组装子层；setShroud 热切换迷雾层；update 同步 debug 开关与辐射 tile 光。
 *
 * 由 engine/renderable/entity/map/MapRenderable.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { MapTileLayer } from "engine/renderable/entity/map/MapTileLayer"; // 已转换
import { MapTileLayerDebug } from "engine/renderable/entity/map/MapTileLayerDebug"; // 已转换
import { MapSurface } from "engine/renderable/entity/map/MapSurface"; // 已转换
import { MapBounds } from "engine/renderable/entity/map/MapBounds"; // 已转换
import { MapShroudLayer } from "engine/renderable/entity/map/MapShroudLayer"; // 已转换
import * as ShpAggregatorModule from "engine/renderable/builder/ShpAggregator"; // 孪生
import { MapSpriteBatchLayer } from "engine/renderable/entity/map/MapSpriteBatchLayer"; // 已转换
import { BridgeOverlayTypes } from "game/map/BridgeOverlayTypes"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ShpAggregator: any = (ShpAggregatorModule as any).ShpAggregator;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 地图渲染总装。 */
export class MapRenderable {
  /** 地图游戏对象。 */
  gameObj: any;
  /** 迷雾（可热切换）。 */
  mapShroud: any;
  /** 辐射。 */
  mapRadiation: any;
  /** 光照。 */
  lighting: any;
  /** 战区。 */
  theater: any;
  /** rules。 */
  rules: any;
  /** art。 */
  art: any;
  /** 图像查找。 */
  imageFinder: any;
  /** 相机。 */
  camera: any;
  /** 调试线框 Ref。 */
  debugWireframe: any;
  /** 速度 Ref。 */
  gameSpeed: any;
  /** 世界音效。 */
  worldSound: any;
  /** 精灵批处理开关。 */
  useSpriteBatching: any;
  /** 上一帧 debug 值。 */
  lastDebugValue = false;
  /** 待刷新辐射 tile。 */
  invalidatedRadTiles: Set<any> = new Set();
  /** tile → 辐射点光。 */
  radTileLights: Map<any, any> = new Map();
  /** 辐射变更回调。 */
  private readonly handleRadChange = (tiles: Iterable<any>) => {
    for (const t of tiles) this.invalidatedRadTiles.add(t);
  };
  /** 子层列表。 */
  private _objects: any[] = [];
  /** tile 层。 */
  tileLayer!: MapTileLayer;
  /** 调试层。 */
  debugLayer!: MapTileLayerDebug;
  /** 阴影接收面。 */
  mapSurface!: MapSurface;
  /** 边界线。 */
  mapBounds!: MapBounds;
  /** 迷雾层（可选）。 */
  shroudLayer?: MapShroudLayer;
  /** 地形精灵层。 */
  terrainLayer!: MapSpriteBatchLayer;
  /** 覆盖精灵层。 */
  overlayLayer!: MapSpriteBatchLayer;
  /** 污渍精灵层。 */
  smudgeLayer!: MapSpriteBatchLayer;
  /** 3D 根。 */
  target?: any;

  /**
   * @param gameObj - 地图对象
   * @param mapShroud - 迷雾（可空）
   * @param mapRadiation - 辐射
   * @param lighting - Lighting
   * @param theater - 战区
   * @param rules - rules
   * @param art - art
   * @param imageFinder - ImageFinder
   * @param camera - 相机
   * @param debugWireframe - debug Ref
   * @param gameSpeed - 速度 Ref
   * @param worldSound - 世界音效
   * @param useSpriteBatching - 批处理开关
   */
  constructor(
    gameObj: any,
    mapShroud: any,
    mapRadiation: any,
    lighting: any,
    theater: any,
    rules: any,
    art: any,
    imageFinder: any,
    camera: any,
    debugWireframe: any,
    gameSpeed: any,
    worldSound: any,
    useSpriteBatching: any,
  ) {
    this.gameObj = gameObj;
    this.mapShroud = mapShroud;
    this.mapRadiation = mapRadiation;
    this.lighting = lighting;
    this.theater = theater;
    this.rules = rules;
    this.art = art;
    this.imageFinder = imageFinder;
    this.camera = camera;
    this.debugWireframe = debugWireframe;
    this.gameSpeed = gameSpeed;
    this.worldSound = worldSound;
    this.useSpriteBatching = useSpriteBatching;
    this.lastDebugValue = false;
    this.invalidatedRadTiles = new Set();
    this.radTileLights = new Map();
    this.init();
  }

  /** 取 3D 对象。 */
  get3DObject(): any {
    return this.target;
  }

  /** 取地图对象。 */
  getGameObject(): any {
    return this.gameObj;
  }

  /** 组装全部子层。 */
  init(): void {
    const map = this.getGameObject();
    this.tileLayer = new MapTileLayer(
      map,
      this.theater,
      this.art,
      this.imageFinder,
      this.camera,
      this.debugWireframe,
      this.gameSpeed,
      this.worldSound,
      this.lighting,
      this.useSpriteBatching,
    );
    this.addObject(this.tileLayer);
    this.debugLayer = new MapTileLayerDebug(map, this.theater, this.camera);
    this.debugLayer.setVisible(false);
    this.addObject(this.debugLayer);
    this.mapSurface = new MapSurface(map, this.theater);
    this.addObject(this.mapSurface);
    this.mapBounds = new MapBounds(map);
    this.mapBounds.setVisible(false);
    if (this.mapShroud) {
      this.shroudLayer = new MapShroudLayer(this.mapShroud, this.imageFinder, this.camera);
      this.addObject(this.shroudLayer);
    }
    this.addObject(this.mapBounds);
    const aggregator = new ShpAggregator();
    this.terrainLayer = new MapSpriteBatchLayer(
      "map_terrain_layer",
      [...this.rules.terrainRules.values()].filter(
        (r: any) => !r.isAnimated && this.art.hasObject(r.name, r.type),
      ),
      () => false,
      this.theater,
      this.art,
      this.imageFinder,
      this.camera,
      this.lighting,
      aggregator,
    );
    this.addObject(this.terrainLayer);
    this.overlayLayer = new MapSpriteBatchLayer(
      "map_overlay_layer",
      [...this.rules.overlayRules.values()].filter(
        (r: any) =>
          this.art.hasObject(r.name, r.type) &&
          !BridgeOverlayTypes.isBridge(this.rules.getOverlayId(r.name)),
      ),
      (obj: any) => obj.rules.wall,
      this.theater,
      this.art,
      this.imageFinder,
      this.camera,
      this.lighting,
      aggregator,
    );
    this.addObject(this.overlayLayer);
    this.smudgeLayer = new MapSpriteBatchLayer(
      "map_smudge_layer",
      [...this.rules.smudgeRules.values()].filter((r: any) => this.art.hasObject(r.name, r.type)),
      () => false,
      this.theater,
      this.art,
      this.imageFinder,
      this.camera,
      this.lighting,
      aggregator,
    );
    this.addObject(this.smudgeLayer);
    this.mapRadiation.onChange.subscribe(this.handleRadChange);
  }

  /**
   * 热切换迷雾层。
   * @param shroud - 新迷雾或空
   */
  setShroud(shroud: any): void {
    if (shroud === this.mapShroud) return;
    if (!shroud && this.shroudLayer) {
      this.removeObject(this.shroudLayer);
      this.shroudLayer.dispose();
      this.shroudLayer = void 0;
    }
    this.mapShroud = shroud;
    if (this.mapShroud) {
      if (this.shroudLayer) this.shroudLayer.setShroud(this.mapShroud);
      else {
        this.shroudLayer = new MapShroudLayer(this.mapShroud, this.imageFinder, this.camera);
        this.addObject(this.shroudLayer);
      }
    }
  }

  /**
   * 注册子层。
   * @param obj - 子层
   */
  addObject(obj: any): void {
    this._objects.push(obj);
    if (this.target) {
      obj.create3DObject();
      this.target.add(obj.get3DObject());
    }
  }

  /**
   * 注销子层。
   * @param obj - 子层
   */
  removeObject(obj: any): void {
    const idx = this._objects.indexOf(obj);
    if (-1 === idx) return;
    this._objects.splice(idx, 1);
    if (this.target && obj.get3DObject()) this.target.remove(obj.get3DObject());
  }

  /** 惰性创建根并挂全部子层。 */
  create3DObject(): void {
    let root = this.get3DObject();
    if (root) return;
    root = new (THREE as any).Object3D();
    root.name = "map";
    root.matrixAutoUpdate = false;
    this.target = root;
    for (let i = 0, n = this._objects.length; i < n; ++i) {
      this._objects[i].create3DObject();
      root.add(this._objects[i].get3DObject());
    }
  }

  /**
   * 每帧：debug 开关、子层 update、辐射点光刷新。
   * @param tick - tick
   * @param frame - frame
   */
  update(tick: number, frame: number): void {
    this.create3DObject();
    if (this.debugWireframe.value !== this.lastDebugValue) {
      this.lastDebugValue = this.debugWireframe.value;
      this.debugLayer.setVisible(this.debugWireframe.value);
      this.mapBounds.setVisible(this.debugWireframe.value);
    }
    this._objects.forEach((o) => o.update(tick, frame));
    if (this.invalidatedRadTiles.size) {
      for (const tile of this.invalidatedRadTiles) {
        let level = this.mapRadiation.getRadLevel(tile);
        if (level) {
          const t = Math.min(1, level / this.rules.radiation.radLevelMax);
          if (this.radTileLights.has(tile)) {
            this.lighting.removeTileLight(tile, this.radTileLights.get(tile));
          }
          const rgb = this.rules.radiation.radColor;
          const light = {
            intensity: this.rules.radiation.radLightFactor * t,
            red: (rgb[0] / 255) * t,
            green: (rgb[1] / 255) * t,
            blue: (rgb[2] / 255) * t,
          };
          this.lighting.addTileLight(tile, light);
          this.radTileLights.set(tile, light);
        } else {
          this.lighting.removeTileLight(tile, this.radTileLights.get(tile));
          this.radTileLights.delete(tile);
        }
      }
      this.lighting.forceUpdate([...this.invalidatedRadTiles]);
      this.invalidatedRadTiles.clear();
    }
  }

  /**
   * 转发光照刷新到各层。
   * @param tiles - 可选 tile 列表
   */
  updateLighting(tiles?: any): void {
    this.tileLayer.updateLighting(tiles);
    this.terrainLayer.updateLighting();
    this.overlayLayer.updateLighting();
    this.smudgeLayer.updateLighting();
  }

  /** 释放全部子层与辐射订阅。 */
  dispose(): void {
    this.mapRadiation.onChange.unsubscribe(this.handleRadChange);
    this.tileLayer.dispose();
    this.debugLayer.dispose();
    this.terrainLayer.dispose();
    this.overlayLayer.dispose();
    this.smudgeLayer.dispose();
    this.shroudLayer?.dispose();
    this.mapBounds.dispose();
    this.mapSurface.dispose();
  }
}
