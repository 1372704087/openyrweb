/**
 * ShpBuilder — SHP 精灵构建器（图集几何缓存 + 引用计数材质 + 可选批量）。
 *
 * 由 engine/renderable/builder/ShpBuilder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as TextureUtilsModule from "engine/gfx/TextureUtils"; // 孪生
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import * as ShpTextureAtlasModule from "engine/renderable/builder/ShpTextureAtlas"; // 孪生
import * as PaletteBasicMaterialModule from "engine/gfx/material/PaletteBasicMaterial"; // 孪生
import * as BatchedMeshModule from "engine/gfx/batch/BatchedMesh"; // 孪生

const TextureUtils = (TextureUtilsModule as any).TextureUtils as any;
const SpriteUtils = (SpriteUtilsModule as any).SpriteUtils as any;
const ShpTextureAtlas = (ShpTextureAtlasModule as any).ShpTextureAtlas as any;
const PaletteBasicMaterial = (PaletteBasicMaterialModule as any)
  .PaletteBasicMaterial as any;
const BatchedMesh = (BatchedMeshModule as any).BatchedMesh as any;
const BatchMode = (BatchedMeshModule as any).BatchMode as any;

declare const THREE: any;

/** SHP 文件最小形状。 */
export interface ShpFileLike {
  width: number;
  height: number;
  numImages: number;
  getImage(index: number): {
    x: number;
    y: number;
  };
}

/** 显示尺寸。 */
export interface Size {
  width: number;
  height: number;
}

/** 绘制偏移。 */
export interface Offset {
  x: number;
  y: number;
}

/**
 * SHP 精灵构建器。
 * 静态三级缓存：textureCache / geometryCache（按 shp+键）/ materialCache。
 * 支持 offset、depth、flat、批量多调色板与 extraLight。
 */
export class ShpBuilder {
  private static textureCache = new Map<ShpFileLike, any>();
  private static geometryCache = new Map<ShpFileLike, Map<string, any>>();
  private static materialCache = new Map<
    string,
    { material: any; usages: number }
  >();

  scale: number;
  depth: boolean;
  depthOffset: number;
  batchPalettes: any[] = [];
  useMeshBatching = false;
  opacity = 1;
  forceTransparent = false;
  offset: Offset = { x: 0, y: 0 };
  frameOffset = 0;
  flat = false;
  extraLight?: any;
  private shpSize: Size;
  private frameNo = 0;
  private atlas?: any;
  private mesh?: any;
  private materialCacheKey?: string;

  /**
   * 预热纹理缓存（未命中则构建 ShpTextureAtlas）。
   * @param e - SHP 文件
   */
  static prepareTexture(e: ShpFileLike): void {
    if (!ShpBuilder.textureCache.has(e)) {
      const t = new ShpTextureAtlas().fromShpFile(e);
      ShpBuilder.textureCache.set(e, t);
    }
  }

  /** 清空纹理/几何缓存并 dispose。 */
  static clearCaches(): void {
    ShpBuilder.textureCache.forEach((e) => e.dispose());
    ShpBuilder.textureCache.clear();
    ShpBuilder.geometryCache.forEach((e) => e.forEach((g) => g.dispose()));
    ShpBuilder.geometryCache.clear();
  }

  /**
   * @param shpFile - SHP 源
   * @param palette - 调色板
   * @param camera - 相机
   * @param scale - 世界缩放（默认 1）
   * @param depth - 是否深度绘制（默认 false）
   * @param depthOffset - 深度偏移（默认 0）
   */
  constructor(
    private shpFile: ShpFileLike,
    private palette: any,
    private camera: any,
    scale: number = 1,
    depth: boolean = false,
    depthOffset: number = 0,
  ) {
    (this.scale = scale),
      (this.depth = depth),
      (this.depthOffset = depthOffset),
      (this.batchPalettes = []),
      (this.useMeshBatching = false),
      (this.opacity = 1),
      (this.forceTransparent = false),
      (this.offset = { x: 0, y: 0 }),
      (this.frameOffset = 0),
      (this.flat = false),
      (this.shpFile = shpFile),
      (this.palette = palette),
      (this.camera = camera),
      (this.shpSize = { width: shpFile.width, height: shpFile.height }),
      this.setFrame(0);
  }

  /**
   * 引用计数取/建材质（要求 map 为 AlphaFormat）。
   * @param e - 纹理（AlphaFormat）
   * @param t - 调色板
   * @param i - transparent
   */
  useMaterial(e: any, t: any, i: boolean): any {
    if (e.format !== THREE.AlphaFormat)
      throw new Error("Texture must have format THREE.AlphaFormat");
    this.materialCacheKey = e.uuid + "_" + t.uuid + "_" + Number(i);
    const cached = ShpBuilder.materialCache.get(this.materialCacheKey);
    let mat;
    if (cached) {
      (mat = cached.material), cached.usages++;
    } else {
      mat = new PaletteBasicMaterial({
        map: e,
        palette: t,
        alphaTest: 0.05,
        paletteCount: this.batchPalettes.length,
        flatShading: true,
        transparent: i,
      });
      ShpBuilder.materialCache.set(this.materialCacheKey, {
        material: mat,
        usages: 1,
      });
    }
    return mat;
  }

  /** 引用计数释放当前材质。 */
  freeMaterial(): void {
    if (!this.materialCacheKey)
      throw new Error("Material cache key not set");
    const e = ShpBuilder.materialCache.get(this.materialCacheKey);
    if (e) {
      if (e.usages === 1) {
        (ShpBuilder.materialCache.delete(this.materialCacheKey),
          e.material.dispose());
      } else {
        e.usages--;
      }
    }
  }

  /**
   * 开关批量（须在 build 前）。
   * @param e - 是否批量
   */
  setBatched(e: boolean): void {
    if (this.mesh)
      throw new Error("Batching can only be set before calling build()");
    this.useMeshBatching = e;
  }

  /**
   * 设置绘制偏移（须在 build 前）。
   * @param e - 偏移
   */
  setOffset(e: Offset): void {
    if (this.mesh)
      throw new Error("Offset can only be set before calling build()");
    this.offset = e;
  }

  /**
   * 设置帧偏移；mesh 已建时通过重置 frameNo 触发几何重建。
   * @param e - 帧偏移
   */
  setFrameOffset(e: number): void {
    this.frameOffset = e;
    if (this.mesh) {
      const t = this.frameNo;
      this.frameNo = -1;
      this.setFrame(t);
    }
  }

  /** 确保纹理缓存命中并取得 atlas。 */
  private initTexture(): void {
    ShpBuilder.prepareTexture(this.shpFile);
    this.atlas = ShpBuilder.textureCache.get(this.shpFile);
  }

  /**
   * 由帧号生成 SpriteUtils 几何选项。
   * @param frame - 逻辑帧号（未含 frameOffset）
   */
  private getSpriteGeometryOptions(frame: number): any {
    frame += this.frameOffset;
    const img = this.shpFile.getImage(frame);
    const off = {
      x:
        img.x -
        Math.floor(this.shpSize.width / 2) +
        Math.floor(this.offset.x),
      y:
        img.y -
        Math.floor(this.shpSize.height / 2) +
        Math.floor(this.offset.y),
    };
    return {
      texture: this.atlas.getTexture(),
      textureArea: this.atlas.getTextureArea(frame),
      flat: this.flat,
      align: { x: 1, y: -1 },
      offset: off,
      camera: this.camera,
      depth: this.depth,
      depthOffset: this.depthOffset,
      scale: this.scale,
    };
  }

  /**
   * 几何缓存键（含帧、尺寸、偏移、flat/depth/depthOffset）。
   * @param frame - 逻辑帧号
   */
  private getGeometryCacheKey(frame: number): string {
    return (
      frame +
      this.frameOffset +
      "_" +
      this.shpSize.width +
      "_" +
      this.shpSize.height +
      "_" +
      this.offset.x +
      "_" +
      this.offset.y +
      "_" +
      this.flat +
      "_" +
      this.depth +
      "_" +
      this.depthOffset
    );
  }

  /**
   * 切换显示帧（变化时重建 mesh.geometry）。
   * @param i - 逻辑帧号
   */
  setFrame(i: number): void {
    if (this.frameNo !== i) {
      this.frameNo = i;
      if (this.mesh) {
        const cache = this.getGeometryCache();
        const key = this.getGeometryCacheKey(i);
        let geom = cache.get(key);
        if (!geom) {
          geom = SpriteUtils.createSpriteGeometry(
            this.getSpriteGeometryOptions(i),
          );
          cache.set(key, geom);
        }
        this.mesh.geometry = geom;
      }
    }
  }

  /** 取当前 shpFile 对应几何子缓存（惰性创建）。 */
  private getGeometryCache(): Map<string, any> {
    let e = ShpBuilder.geometryCache.get(this.shpFile);
    if (!e) {
      e = new Map();
      ShpBuilder.geometryCache.set(this.shpFile, e);
    }
    return e;
  }

  /** 当前帧号。 */
  getFrame(): number {
    return this.frameNo;
  }

  /**
   * 设置显示尺寸。
   * @param e - 尺寸
   */
  setSize(e: Size): void {
    this.shpSize = { width: e.width, height: e.height };
  }

  /** 当前显示尺寸。 */
  getSize(): Size {
    return this.shpSize;
  }

  /** 总帧数。 */
  get frameCount(): number {
    return this.shpFile.numImages;
  }

  /**
   * 在 batchPalettes 中按 hash 找索引。
   * @param t - 目标调色板
   */
  getBatchPaletteIndex(t: any): number {
    const e = this.batchPalettes.findIndex((e) => e.hash === t.hash);
    if (e === -1)
      throw new Error(
        "Provided palette not found in the list of batch palettes. Call setBatchPalettes first.",
      );
    return e;
  }

  /**
   * 热更新调色板。
   * @param t - 新调色板
   */
  setPalette(t: any): void {
    this.palette = t;
    if (this.mesh) {
      if (this.useMeshBatching) {
        const i = this.getBatchPaletteIndex(t);
        this.mesh.setPaletteIndex(i);
      } else {
        const i = TextureUtils.textureFromPalette(t);
        this.mesh.material.palette = i;
      }
    }
  }

  /**
   * 设置批量调色板列表（须 build 前）。
   * @param e - 数组
   */
  setBatchPalettes(e: any[]): void {
    if (!this.useMeshBatching)
      throw new Error("Can't use multiple palettes when not batching");
    if (this.mesh)
      throw new Error("Palettes must be set before creating 3DObject");
    this.batchPalettes = e;
  }

  /**
   * 设置额外光照。
   * @param t - 强度
   */
  setExtraLight(t: any): void {
    this.extraLight = t;
    if (this.mesh) {
      if (this.useMeshBatching) this.mesh.setExtraLight(t);
      else this.mesh.material.extraLight = t;
    }
  }

  /**
   * 设置不透明度；整数部分变化且未 forceTransparent 时重算 transparent。
   * @param e - 0..1
   */
  setOpacity(e: number): void {
    const t = this.opacity;
    if (t !== e) {
      (this.opacity = e, this.updateOpacity());
    }
    if (
      Math.floor(t) !== Math.floor(e) &&
      !this.forceTransparent
    )
      this.updateTransparency();
  }

  /**
   * 强制透明开关。
   * @param e - 是否强制
   */
  setForceTransparent(e: boolean): void {
    if (e !== this.forceTransparent) {
      (this.forceTransparent = e, this.updateTransparency());
    }
  }

  /** 把 opacity 写入 mesh。 */
  updateOpacity(): void {
    if (this.mesh) {
      if (this.useMeshBatching) this.mesh.setOpacity(this.opacity);
      else this.mesh.material.opacity = this.opacity;
    }
  }

  /** 重算 transparent（批量路径重建材质引用计数）。 */
  updateTransparency(): void {
    if (this.mesh) {
      const e = this.forceTransparent || this.opacity < 1;
      if (this.useMeshBatching) {
        const t = this.mesh.material.map;
        const i = this.mesh.material.palette;
        this.freeMaterial();
        this.mesh.material = this.useMaterial(t, i, e);
      } else {
        this.mesh.material.transparent = e;
      }
    }
  }

  /**
   * 创建 mesh（幂等）。
   * 批量：BatchedMesh + 多调色板纹理；否则：单 Mesh + PaletteBasicMaterial。
   */
  build(): any {
    if (this.mesh) return this.mesh;
    this.initTexture();
    const t = this.atlas.getTexture();
    const key = this.getGeometryCacheKey(this.frameNo);
    const cache = this.getGeometryCache();
    let geom = cache.get(key);
    if (!geom) {
      geom = SpriteUtils.createSpriteGeometry(
        this.getSpriteGeometryOptions(this.frameNo),
      );
      cache.set(key, geom);
    }
    let mesh: any;
    let needTransparent = this.opacity < 1 || this.forceTransparent;
    if (this.useMeshBatching) {
      let n = TextureUtils.textureFromPalettes(this.batchPalettes);
      n = this.useMaterial(t, n, needTransparent);
      mesh = new BatchedMesh(geom, n, BatchMode.Merging);
      mesh.castShadow = false;
    } else {
      const n = TextureUtils.textureFromPalette(this.palette);
      const mat = new PaletteBasicMaterial({
        map: t,
        palette: n,
        alphaTest: 0.5,
        flatShading: true,
        transparent: needTransparent,
      });
      mesh = new THREE.Mesh(geom, mat);
    }
    mesh.matrixAutoUpdate = false;
    this.mesh = mesh;
    this.setPalette(this.palette);
    this.updateOpacity();
    if (this.extraLight) this.setExtraLight(this.extraLight);
    return mesh;
  }

  /** 释放 mesh（批量走 freeMaterial，否则 dispose 材质）。 */
  dispose(): void {
    if (this.mesh) {
      if (this.useMeshBatching) this.freeMaterial();
      else this.mesh.material.dispose();
      this.mesh = void 0;
    }
  }
}
