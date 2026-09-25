/**
 * MapSpriteBatchLayer — 地形/覆盖/污渍等静态精灵批处理层。
 *
 * 构造时聚合成 agg_*.shp；addObject 找满批 builder 或新建，主+可选 shadow
 * spec 入批；updateLighting 刷新 lightMult。
 *
 * 由 engine/renderable/entity/map/MapSpriteBatchLayer.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { ImageFinder } from "engine/ImageFinder"; // 已转换
import * as BatchShpBuilderModule from "engine/renderable/builder/BatchShpBuilder"; // 孪生
import * as ShpAggregatorModule from "engine/renderable/builder/ShpAggregator"; // 孪生
import * as MapSpriteTranslationModule from "engine/renderable/MapSpriteTranslation"; // 孪生
import * as ShadowRenderableModule from "engine/renderable/ShadowRenderable"; // 孪生
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const BatchShpBuilder: any = (BatchShpBuilderModule as any).BatchShpBuilder;
const ShpAggregator: any = (ShpAggregatorModule as any).ShpAggregator;
const MapSpriteTranslation: any = (MapSpriteTranslationModule as any).MapSpriteTranslation;
const ShadowRenderable: any = (ShadowRenderableModule as any).ShadowRenderable;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 精灵批处理层。 */
export class MapSpriteBatchLayer {
  /** 层标签/根名。 */
  label: string;
  /** 深度计算回调。 */
  spriteUseDepth: (obj: any) => any;
  /** 战区。 */
  theater: any;
  /** art。 */
  art: any;
  /** 图像查找。 */
  imageFinder: any;
  /** 相机。 */
  camera: any;
  /** 光照。 */
  lighting: any;
  /** SHP 聚合器。 */
  shpAggregator: any;
  /** 纹理缓存。 */
  textureCache: Map<any, any> = new Map();
  /** 对象 → {main, shadow} spec。 */
  batchShpSpecsByObject: Map<any, any> = new Map();
  /** batchKey → builder 列表。 */
  batchShpBuilders: Map<string, any[]> = new Map();
  /** 阴影 builder 列表。 */
  shadowBatchShpBuilders: any[] = [];
  /** 可批 rules 集合。 */
  batchedObjectRules: Set<any>;
  /** 聚合结果。 */
  aggregatedImageData: any;
  /** 3D 根。 */
  target?: any;

  /**
   * @param label - 层名
   * @param objectRules - 可批 rules 集合
   * @param spriteUseDepth - depth 回调
   * @param theater - 战区
   * @param art - art
   * @param imageFinder - ImageFinder
   * @param camera - 相机
   * @param lighting - Lighting
   * @param shpAggregator - ShpAggregator
   */
  constructor(
    label: string,
    objectRules: Iterable<any>,
    spriteUseDepth: (obj: any) => any,
    theater: any,
    art: any,
    imageFinder: any,
    camera: any,
    lighting: any,
    shpAggregator: any,
  ) {
    this.label = label;
    this.spriteUseDepth = spriteUseDepth;
    this.theater = theater;
    this.art = art;
    this.imageFinder = imageFinder;
    this.camera = camera;
    this.lighting = lighting;
    this.shpAggregator = shpAggregator;
    this.textureCache = new Map();
    this.batchShpSpecsByObject = new Map();
    this.batchShpBuilders = new Map();
    this.shadowBatchShpBuilders = [];
    this.batchedObjectRules = new Set(objectRules);
    this.aggregatedImageData = this.createAggregatedShpFile(`agg_${label}.shp`);
  }

  /** 取 3D 对象。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建根。 */
  create3DObject(): void {
    let root = this.get3DObject();
    if (!root) {
      root = new (THREE as any).Object3D();
      root.name = this.label;
      root.matrixAutoUpdate = false;
      this.target = root;
    }
  }

  /**
   * 聚合可批 rules 的 SHP 帧。
   * @param name - 聚合文件名
   */
  createAggregatedShpFile(name: string): any {
    const frames = [...this.batchedObjectRules.values()]
      .map((rules) => {
        const objectArt = this.art.getObject(rules.name, rules.type);
        let shp: any;
        try {
          shp = this.imageFinder.findByObjectArt(objectArt);
        } catch (err) {
          if (err instanceof ImageFinder.MissingImageError) return;
          throw err;
        }
        return ShpAggregator.getShpFrameInfo(shp, objectArt.hasShadow);
      })
      .filter(isNotNullOrUndefined);
    return this.shpAggregator.aggregate(frames, name);
  }

  /** 无逐帧逻辑。 */
  update(_tick?: number): void {}

  /** 刷新全部 spec 的 lightMult 并转发 builder。 */
  updateLighting(): void {
    this.batchShpSpecsByObject.forEach((specs, obj) => {
      specs.main.lightMult?.copy(this.lighting.compute(obj.art.lightingType, obj.tile));
    });
    [...this.batchShpBuilders.values()].flat().forEach((b) => b.updateLighting());
  }

  /**
   * 对象 rules 是否可批。
   * @param obj - 游戏对象
   */
  shouldBeBatched(obj: any): boolean {
    return this.batchedObjectRules.has(obj.rules);
  }

  /**
   * 批键 = paletteType_customPaletteName。
   * @param obj - 游戏对象
   */
  getBatchKey(obj: any): string {
    return obj.art.paletteType + "_" + obj.art.customPaletteName;
  }

  /**
   * 把对象加入批（必要时新建 builder）。
   * @param obj - 游戏对象
   */
  addObject(obj: any): void {
    const key = this.getBatchKey(obj);
    let builders = this.batchShpBuilders.get(key);
    if (!builders) {
      builders = [];
      this.batchShpBuilders.set(key, builders);
    }
    let builder = builders.find((b) => !b.isFull());
    if (!builder) {
      if (!this.get3DObject()) throw new Error("Not implemented");
      const palette = this.theater.getPalette(obj.art.paletteType, obj.art.customPaletteName);
      builder = new BatchShpBuilder(
        this.aggregatedImageData.file,
        palette,
        this.camera,
        this.textureCache,
        void 0,
        void 0,
        void 0,
        Coords.ISO_WORLD_SCALE,
      );
      builders.push(builder);
      this.get3DObject().add(builder.build());
    }
    const main = this.buildBatchShpSpec(obj, this.aggregatedImageData);
    builder.add(main);
    let shadow: any;
    if (obj.art.hasShadow) {
      let shadowBuilder = this.shadowBatchShpBuilders.find((b) => !b.isFull());
      if (!shadowBuilder) {
        if (!this.get3DObject()) throw new Error("Not implemented");
        shadowBuilder = new BatchShpBuilder(
          this.aggregatedImageData.file,
          ShadowRenderable.getOrCreateShadowPalette(),
          this.camera,
          this.textureCache,
          0.5,
          true,
          void 0,
          Coords.ISO_WORLD_SCALE,
        );
        this.shadowBatchShpBuilders.push(shadowBuilder);
        this.get3DObject().add(shadowBuilder.build());
      }
      shadow = this.buildShadowBatchShpSpec(main, this.aggregatedImageData);
      shadowBuilder.add(shadow);
    }
    this.batchShpSpecsByObject.set(obj, { main, shadow });
  }

  /**
   * 构建主批 spec。
   * @param obj - 对象
   * @param agg - 聚合数据
   */
  buildBatchShpSpec(obj: any, agg: any): any {
    const foundation = obj.getFoundation();
    const translation = new MapSpriteTranslation(foundation.width, foundation.height);
    const position = obj.position.worldPosition.clone();
    const { spriteOffset, anchorPointWorld } = translation.compute();
    position.x += anchorPointWorld.x;
    position.z += anchorPointWorld.y;
    const shpFile = this.imageFinder.findByObjectArt(obj.art);
    const frameNo = agg.imageIndexes.get(shpFile);
    if (void 0 === frameNo) throw new Error("SHP file not found in aggregated image data");
    return {
      shpFile,
      frameNo,
      depth: this.spriteUseDepth(obj),
      flat: obj.art.flat,
      position,
      offset: spriteOffset.clone().add(obj.art.getDrawOffset()),
      lightMult: this.lighting.compute(obj.art.lightingType, obj.tile),
    };
  }

  /**
   * 构建阴影批 spec（后半帧 + 微抬 y）。
   * @param main - 主 spec
   * @param agg - 聚合数据
   */
  buildShadowBatchShpSpec(main: any, agg: any): any {
    const frameNo = agg.imageIndexes.get(main.shpFile);
    if (void 0 === frameNo) throw new Error("SHP file not found in aggregated image data");
    return {
      ...main,
      position: main.position.clone().add(new (THREE as any).Vector3(0, 0.1, 0)),
      flat: true,
      frameNo: frameNo + agg.file.numImages / 2,
      lightMult: void 0,
    };
  }

  /**
   * 移除对象并回收空批。
   * @param obj - 对象
   */
  removeObject(obj: any): void {
    const specs = this.batchShpSpecsByObject.get(obj);
    if (!specs) return;
    const key = this.getBatchKey(obj);
    const builders = this.batchShpBuilders.get(key);
    const builder = builders?.find((b) => b.has(specs.main));
    if (!builder) return;
    builder.remove(specs.main);
    if (builder.isEmpty() && 1 < builders!.length) {
      this.get3DObject()?.remove(builder.build());
      builder.dispose();
      builders!.splice(builders!.indexOf(builder), 1);
    }
    if (specs.shadow) {
      const shadowBuilder = this.shadowBatchShpBuilders.find((b) => b.has(specs.shadow));
      shadowBuilder?.remove(specs.shadow);
      if (shadowBuilder?.isEmpty() && 1 < this.shadowBatchShpBuilders.length) {
        this.get3DObject()?.remove(shadowBuilder.build());
        shadowBuilder.dispose();
        this.shadowBatchShpBuilders.splice(this.shadowBatchShpBuilders.indexOf(shadowBuilder), 1);
      }
    }
    this.batchShpSpecsByObject.delete(obj);
  }

  /**
   * 是否已有该对象。
   * @param obj - 对象
   */
  hasObject(obj: any): boolean {
    return this.batchShpSpecsByObject.has(obj);
  }

  /**
   * 对象帧数（有 shadow 时减半）。
   * @param obj - 对象
   */
  getObjectFrameCount(obj: any): number {
    const specs = this.batchShpSpecsByObject.get(obj);
    if (!specs) throw new Error(`Batch SHP spec for object "${obj.name}" not found`);
    return specs.main.shpFile.numImages * (specs.shadow ? 0.5 : 1);
  }

  /**
   * 设置对象当前帧。
   * @param obj - 对象
   * @param frame - 相对帧号
   */
  setObjectFrame(obj: any, frame: number): void {
    const specs = this.batchShpSpecsByObject.get(obj);
    if (!specs) throw new Error(`Batch SHP spec for object "${obj.name}" not found`);
    if (frame >= specs.main.shpFile.numImages * (specs.shadow ? 0.5 : 1)) return;
    const base = this.aggregatedImageData.imageIndexes.get(specs.main.shpFile);
    specs.main.frameNo = base + frame;
    if (specs.shadow) {
      specs.shadow.frameNo = specs.main.frameNo + this.aggregatedImageData.file.numImages / 2;
    }
    const key = this.getBatchKey(obj);
    const builder = this.batchShpBuilders.get(key)?.find((b) => b.has(specs.main));
    builder?.update(specs.main);
    if (specs.shadow) {
      const shadowBuilder = this.shadowBatchShpBuilders.find((b) => b.has(specs.shadow));
      shadowBuilder?.update(specs.shadow);
    }
  }

  /** 释放 builder 与纹理。 */
  dispose(): void {
    [...this.batchShpBuilders.values(), ...this.shadowBatchShpBuilders]
      .flat()
      .forEach((b) => b.dispose());
    [...this.textureCache.values()].forEach((t) => t.dispose());
    this.textureCache.clear();
  }
}
