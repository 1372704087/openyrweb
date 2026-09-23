/**
 * BatchShpBuilder — 多规格 SHP 精灵批（单 Mesh 空闲链表槽位 + vertexColorMult）。
 *
 * 由 engine/renderable/builder/BatchShpBuilder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as ShpTextureAtlasModule from "engine/renderable/builder/ShpTextureAtlas"; // 孪生
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import * as TextureUtilsModule from "engine/gfx/TextureUtils"; // 孪生
import * as PaletteBasicMaterialModule from "engine/gfx/material/PaletteBasicMaterial"; // 孪生

const ShpTextureAtlas = (ShpTextureAtlasModule as any).ShpTextureAtlas as any;
const SpriteUtils = (SpriteUtilsModule as any).SpriteUtils as any;
const TextureUtils = (TextureUtilsModule as any).TextureUtils as any;
const PaletteBasicMaterial = (PaletteBasicMaterialModule as any)
  .PaletteBasicMaterial as any;

declare const THREE: any;

/** 批内精灵规格。 */
export interface BatchSpriteSpec {
  frameNo: number;
  shpFile: any;
  offset: { x: number; y: number };
  flat?: boolean;
  depth?: boolean;
  position: { x: number; y: number; z: number };
  lightMult?: any;
}

/** SHP 源。 */
export interface ShpFileLike {
  width: number;
  height: number;
  getImage(index: number): { x: number; y: number };
}

/**
 * SHP 精灵批构建器。
 * 空闲槽位用 position[0] 链表串接；remove 仅写 visibility=0 并回收槽位。
 */
export class BatchShpBuilder {
  private atlas?: any;
  private mesh?: any;
  private positionAttribute?: any;
  private colorMultAttribute?: any;
  private firstFreeSpriteIdx = -1;
  private specIndexes = new Map<BatchSpriteSpec, number | undefined>();

  /** 每精灵顶点数。 */
  get verticesPerSprite(): number {
    return SpriteUtils.VERTICES_PER_SPRITE;
  }

  /** 每精灵三角形数。 */
  get trianglesPerSprite(): number {
    return SpriteUtils.TRIANGLES_PER_SPRITE;
  }

  /**
   * @param shpFile - SHP 源
   * @param palette - 调色板
   * @param camera - 相机
   * @param textureCache - 外部纹理缓存（ShpFile → atlas）
   * @param opacity - 不透明度（默认 1）
   * @param transparent - 是否透明（默认 false）
   * @param batchSize - 最大精灵数（默认 10000）
   * @param scale - 缩放（默认 1）
   */
  constructor(
    private shpFile: ShpFileLike,
    private palette: any,
    private camera: any,
    private textureCache: Map<any, any>,
    private opacity: number = 1,
    private transparent: boolean = false,
    private batchSize: number = 10000,
    private scale: number = 1,
  ) {
    (this.shpFile = shpFile),
      (this.palette = palette),
      (this.camera = camera),
      (this.textureCache = textureCache),
      (this.opacity = opacity),
      (this.transparent = transparent),
      (this.batchSize = batchSize),
      (this.scale = scale),
      (this.specIndexes = new Map());
  }

  /** 从共享缓存取/建图集。 */
  initTexture(): void {
    if (this.textureCache.has(this.shpFile)) {
      this.atlas = this.textureCache.get(this.shpFile);
    } else {
      const e = new ShpTextureAtlas().fromShpFile(this.shpFile);
      this.textureCache.set(this.shpFile, e);
      this.atlas = e;
    }
  }

  /**
   * 精灵几何选项（帧锚点居中 + offset）。
   * @param e - 精灵规格
   */
  private getSpriteGeometryOptions(e: BatchSpriteSpec): any {
    const img = this.shpFile.getImage(e.frameNo);
    const off = {
      x: img.x - e.shpFile.width / 2 + e.offset.x,
      y: img.y - e.shpFile.height / 2 + e.offset.y,
    };
    return {
      texture: this.atlas.getTexture(),
      textureArea: this.atlas.getTextureArea(e.frameNo),
      flat: e.flat,
      depth: e.depth,
      align: { x: 1, y: -1 },
      offset: off,
      camera: this.camera,
      scale: this.scale,
    };
  }

  /**
   * 热更新调色板纹理。
   * @param t - 新调色板
   */
  setPalette(t: any): void {
    this.palette = t;
    if (this.mesh) {
      this.mesh.material.palette = TextureUtils.textureFromPalette(t);
    }
  }

  /**
   * 创建批 mesh（幂等）：预分配 batchSize 槽位 + 空闲链表。
   */
  build(): any {
    if (this.mesh) return this.mesh;
    this.initTexture();
    const palTex = TextureUtils.textureFromPalette(this.palette);
    const geom = new THREE.BufferGeometry();
    const vertexCount = this.batchSize * this.verticesPerSprite;
    const posAttr = new THREE.BufferAttribute(
      new Float32Array(3 * vertexCount),
      3,
    );
    (geom.addAttribute("position", posAttr), (this.positionAttribute = posAttr));
    geom.addAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(2 * vertexCount), 2),
    );
    if (SpriteUtils.USE_INDEXED_GEOMETRY) {
      const idxCount = this.batchSize * this.trianglesPerSprite * 3;
      geom.setIndex(
        new THREE.BufferAttribute(new Uint32Array(3 * idxCount), 1),
      );
    }
    const colorAttr = new THREE.BufferAttribute(
      new Float32Array(4 * vertexCount),
      4,
    );
    (geom.addAttribute("vertexColorMult", colorAttr),
      (this.colorMultAttribute = colorAttr));
    let n = 0;
    for (const spec of this.specIndexes.keys()) {
      (this.specIndexes.set(spec, n), this.setSpecGeometry(spec, geom, n), n++);
    }
    this.firstFreeSpriteIdx = n < this.batchSize ? n : -1;
    if (n < this.batchSize) {
      const arr = posAttr.array;
      for (let t = n; t < this.batchSize - 1; t++)
        arr[t * this.verticesPerSprite * 3] = t + 1;
      arr[(this.batchSize - 1) * this.verticesPerSprite * 3] = -1;
    }
    const material = new PaletteBasicMaterial({
      map: this.atlas.getTexture(),
      palette: palTex,
      alphaTest: this.transparent ? 0.05 : 0.5,
      flatShading: true,
      transparent: this.transparent,
      opacity: this.opacity,
      useVertexColorMult: true,
    });
    const o = new THREE.Mesh(geom, material);
    (o.matrixAutoUpdate = false), (o.frustumCulled = false);
    this.mesh = o;
    return o;
  }

  /**
   * 加入精灵（已存在则 no-op；满批抛错）。
   * 未 build 时只登记 spec，build 时再写入几何。
   * @param e - 精灵规格
   */
  add(e: BatchSpriteSpec): void {
    if (this.specIndexes.has(e)) return;
    if (this.isFull()) throw new Error("Batch is full");
    const geom = this.mesh?.geometry;
    if (geom) {
      const i = this.firstFreeSpriteIdx;
      if (i === -1) throw new Error("No free sprite index found");
      this.specIndexes.set(e, i);
      const next = this.positionAttribute?.array[i * this.verticesPerSprite * 3];
      this.setSpecGeometry(e, geom, i);
      this.firstFreeSpriteIdx = next;
    } else {
      this.specIndexes.set(e, void 0);
    }
  }

  /**
   * 把精灵几何合并进批缓冲（并写 lighting/visibility）。
   * @param e - 规格
   * @param t - 批 geometry
   * @param i - 槽位索引
   */
  private setSpecGeometry(e: BatchSpriteSpec, t: any, i: number): void {
    const opts = this.getSpriteGeometryOptions(e);
    let sg = SpriteUtils.createSpriteGeometry(opts);
    const r = e.position;
    sg.applyMatrix(new THREE.Matrix4().makeTranslation(r.x, r.y, r.z));
    const a = sg;
    if (a.getAttribute("position").count !== this.verticesPerSprite)
      throw new Error("Vertex count mismatch");
    t.merge(a, i * this.verticesPerSprite);
    if (a.index) {
      t.index.array.set(
        Uint32Array.from(
          a.index.array,
          (v: number) => v + i * this.verticesPerSprite,
        ),
        i * a.index.array.length,
      );
      t.index.needsUpdate = true;
    }
    const light = e.lightMult ?? new THREE.Vector3(1, 1, 1);
    this.setLightingAt(i, light, this.colorMultAttribute.array);
    this.setVisibilityAt(i, true, this.colorMultAttribute.array);
    for (const attr of Object.values(t.attributes) as any[])
      attr.needsUpdate = true;
  }

  /**
   * 是否已登记该精灵。
   * @param e - 规格
   */
  has(e: BatchSpriteSpec): boolean {
    return this.specIndexes.has(e);
  }

  /**
   * 移除精灵：可见性置 0 并回收到空闲链表头。
   * @param t - 规格
   */
  remove(t: BatchSpriteSpec): void {
    if (!this.specIndexes.has(t)) return;
    if (this.mesh) {
      const i = this.specIndexes.get(t)!;
      this.setVisibilityAt(i, false, this.colorMultAttribute.array);
      this.colorMultAttribute.needsUpdate = true;
      const arr = this.positionAttribute.array;
      arr[i * this.verticesPerSprite * 3] = this.firstFreeSpriteIdx;
      this.firstFreeSpriteIdx = i;
    }
    this.specIndexes.delete(t);
  }

  /**
   * 更新单精灵几何/光照（须已登记且已 build）。
   * @param e - 规格
   */
  update(e: BatchSpriteSpec): void {
    if (!this.specIndexes.has(e)) return;
    const geom = this.mesh?.geometry;
    if (geom) this.setSpecGeometry(e, geom, this.specIndexes.get(e)!);
  }

  /** 槽位是否占满。 */
  isFull(): boolean {
    return this.specIndexes.size === this.batchSize;
  }

  /** 是否为空。 */
  isEmpty(): boolean {
    return this.specIndexes.size === 0;
  }

  /**
   * 写某精灵全部顶点的 lighting RGB。
   * @param e - 槽位
   * @param t - 向量 {x,y,z}
   * @param i - colorMult 数组
   */
  private setLightingAt(e: number, t: any, i: Float32Array): void {
    for (let r = 0; r < this.verticesPerSprite; r++) {
      const base = e * this.verticesPerSprite * 4 + 4 * r;
      (i[base] = t.x), (i[base + 1] = t.y), (i[base + 2] = t.z);
    }
  }

  /**
   * 写某精灵全部顶点的 visibility 分量。
   * @param e - 槽位
   * @param t - 是否可见
   * @param i - colorMult 数组
   */
  private setVisibilityAt(e: number, t: boolean, i: Float32Array): void {
    for (let r = 0; r < this.verticesPerSprite; r++)
      i[e * this.verticesPerSprite * 4 + 4 * r + 3] = t ? 1 : 0;
  }

  /** 按各精灵 lightMult 重写全部 lighting。 */
  updateLighting(): void {
    if (!this.mesh) return;
    const arr = this.colorMultAttribute.array;
    this.specIndexes.forEach((idx, spec) => {
      const light = spec.lightMult ?? new THREE.Vector3(1, 1, 1);
      this.setLightingAt(idx!, light, arr);
    });
    this.colorMultAttribute.needsUpdate = true;
  }

  /** 释放 geometry + material。 */
  dispose(): void {
    if (this.mesh) {
      (this.mesh.geometry.dispose(), this.mesh.material.dispose());
    }
  }
}
