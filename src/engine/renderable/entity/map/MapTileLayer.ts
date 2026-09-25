/**
 * MapTileLayer — 地图 tile 层（TMP 图集 + 顶点光色 + tile 动画 Anim）。
 *
 * 构造缓存 allTiles；create3DObject 合并 sprite 几何并写 vertexColorMult；
 * update 驱动 Anim，updateLighting 局部/全量刷新光色缓冲。
 *
 * 由 engine/renderable/entity/map/MapTileLayer.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import * as TextureUtilsModule from "engine/gfx/TextureUtils"; // 孪生
import * as TmpDrawableModule from "engine/gfx/drawable/TmpDrawable"; // 孪生
import * as TextureAtlasModule from "engine/gfx/TextureAtlas"; // 孪生
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import * as AnimModule from "engine/renderable/entity/Anim"; // 孪生
import { LightingType } from "engine/type/LightingType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as BufferGeometryUtilsModule from "engine/gfx/BufferGeometryUtils"; // 孪生
import * as PaletteBasicMaterialModule from "engine/gfx/material/PaletteBasicMaterial"; // 孪生
import { getRandomInt } from "util/math"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const TextureUtils: any = (TextureUtilsModule as any).TextureUtils;
const TmpDrawable: any = (TmpDrawableModule as any).TmpDrawable;
const TextureAtlas: any = (TextureAtlasModule as any).TextureAtlas;
const SpriteUtils: any = (SpriteUtilsModule as any).SpriteUtils;
const Anim: any = (AnimModule as any).Anim;
const BufferGeometryUtils: any = (BufferGeometryUtilsModule as any).BufferGeometryUtils;
const PaletteBasicMaterial: any = (PaletteBasicMaterialModule as any).PaletteBasicMaterial;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 地图 tile 渲染层。 */
export class MapTileLayer {
  /** 战区。 */
  theater: any;
  /** art 索引。 */
  art: any;
  /** 图像查找。 */
  imageFinder: any;
  /** 相机。 */
  camera: any;
  /** 调试帧 Ref。 */
  debugFrame: any;
  /** 游戏速度 Ref。 */
  gameSpeed: any;
  /** 世界音效。 */
  worldSound: any;
  /** 光照。 */
  lighting: any;
  /** 是否精灵批处理。 */
  useSpriteBatching: any;
  /** tile → 图集顶点下标。 */
  tileIndexes: Map<any, number> = new Map();
  /** tile 动画光色缓存。 */
  tileAnimLightMultsByTile: Map<any, any> = new Map();
  /** 资源清理。 */
  disposables: CompositeDisposable;
  /** 全部 tile。 */
  allTiles: any[];
  /** 合并网格。 */
  target?: any;
  /** vertexColorMult 属性。 */
  colorMultAttribute?: any;
  /** tile 上的 Anim 列表。 */
  anims: any[] = [];

  /**
   * @param map - 需 tiles.getAll()
   * @param theater - 战区
   * @param art - art
   * @param imageFinder - ImageFinder
   * @param camera - 相机
   * @param debugFrame - 调试帧 Ref
   * @param gameSpeed - 速度 Ref
   * @param worldSound - 世界音效
   * @param lighting - Lighting
   * @param useSpriteBatching - 批处理 Ref/开关
   */
  constructor(
    map: any,
    theater: any,
    art: any,
    imageFinder: any,
    camera: any,
    debugFrame: any,
    gameSpeed: any,
    worldSound: any,
    lighting: any,
    useSpriteBatching: any,
  ) {
    this.theater = theater;
    this.art = art;
    this.imageFinder = imageFinder;
    this.camera = camera;
    this.debugFrame = debugFrame;
    this.gameSpeed = gameSpeed;
    this.worldSound = worldSound;
    this.lighting = lighting;
    this.useSpriteBatching = useSpriteBatching;
    this.tileIndexes = new Map();
    this.tileAnimLightMultsByTile = new Map();
    this.disposables = new CompositeDisposable();
    this.theater = theater;
    this.camera = camera;
    this.allTiles = map.tiles.getAll();
  }

  /** 取 3D 对象。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建根并建 tile 对象。 */
  create3DObject(): void {
    let root = this.get3DObject();
    if (!root) {
      root = new (THREE as any).Object3D();
      root.name = "map_tile_layer";
      root.matrixAutoUpdate = false;
      this.target = root;
      this.createTileObjects(root);
    }
  }

  /**
   * 打包 TMP 图集、合并 sprite、建光色缓冲与 tile Anim。
   * @param parent - 挂载根
   */
  createTileObjects(parent: any): void {
    const drawableByImage = new Map();
    const imageByTile = new Map();
    const isoPalette = this.theater.isoPalette;
    const paletteTex = TextureUtils.textureFromPalette(isoPalette);
    const tileSets = this.theater.tileSets;
    for (const tile of this.allTiles) {
      const tileNum = tile.tileNum;
      const tmpSet = tileSets.getTile(tileNum);
      if (!tmpSet) return;
      const tmpFile = tmpSet.getTmpFile(tile.subTile, getRandomInt);
      if (!tmpFile || tile.subTile >= tmpFile.images.length) return;
      const image = tmpFile.images[tile.subTile];
      imageByTile.set(tile, image);
      let drawable = drawableByImage.get(image);
      if (!drawable) {
        drawable = new TmpDrawable().draw(image, tmpFile.blockWidth, tmpFile.blockHeight);
        drawableByImage.set(image, drawable);
      }
    }
    const atlas = new TextureAtlas();
    const drawables: any[] = [];
    drawableByImage.forEach((d) => {
      drawables.push(d);
    });
    atlas.pack(drawables);
    this.disposables.add(atlas);
    const geos: any[] = [];
    const lightTriples: number[] = [];
    for (let x = 0, n = this.allTiles.length; x < n; x++) {
      const tile = this.allTiles[x];
      const image = imageByTile.get(tile);
      if (!image) throw new Error(`Missing tmp image for tile rx,ry=${tile.rx},` + tile.ry);
      let ox = 0;
      let oy = 0;
      if (image.hasExtraData) {
        ox += Math.max(0, image.x - image.extraX);
        oy += Math.max(0, image.y - image.extraY);
      }
      const world = Coords.tile3dToWorld(tile.rx, tile.ry, tile.z);
      const drawable = drawableByImage.get(image);
      const geo = SpriteUtils.createSpriteGeometry({
        texture: atlas.getTexture(),
        textureArea: atlas.getImageRect(drawable),
        align: { x: 0, y: -1 },
        offset: { x: -ox, y: -oy },
        camera: this.camera,
        scale: Coords.ISO_WORLD_SCALE,
      });
      geo.applyMatrix(new (THREE as any).Matrix4().makeTranslation(world.x, world.y, world.z));
      geos.push(geo);
      const light = this.lighting.compute(LightingType.Full, tile);
      lightTriples.push(light.x, light.y, light.z);
      this.tileIndexes.set(tile, x);
    }
    // 空图/无 tile：跳过合并，避免 geometries[0] 空指针（运行时必要加固）
    if (geos.length === 0) return;

    const material = new PaletteBasicMaterial({
      map: atlas.getTexture(),
      palette: paletteTex,
      alphaTest: 0.5,
      flatShading: true,
      useVertexColorMult: true,
    });
    const merged = BufferGeometryUtils.mergeBufferGeometries(geos);
    const vertCount = merged.getAttribute("position").count;
    if (vertCount !== (SpriteUtils.VERTICES_PER_SPRITE * lightTriples.length) / 3) {
      throw new Error("Vertex count mismatch");
    }
    const buffer = new Float32Array(4 * vertCount);
    this.updateColorMultBuffer(lightTriples, buffer);
    const attr = new (THREE as any).BufferAttribute(buffer, 4);
    // 孪生用 addAttribute（旧 API）
    merged.addAttribute("vertexColorMult", attr);
    this.colorMultAttribute = attr;
    geos.forEach((g) => g.dispose());
    const mesh = new (THREE as any).Mesh(merged, material);
    mesh.matrixAutoUpdate = false;
    mesh.frustumCulled = false;
    parent.add(mesh);
    this.disposables.add(merged, material);
    const anims: any[] = [];
    for (const tile of this.allTiles) {
      const tileNum = tile.tileNum;
      const tmpSet = tileSets.getTile(tileNum);
      if (!tmpSet) return;
      const animDef = tmpSet.getAnimation();
      if (animDef && tile.subTile === animDef.subTile) {
        const animLight = this.lighting.compute(LightingType.Full, tile).addScalar(-1);
        this.tileAnimLightMultsByTile.set(tile, animLight);
        const anim = new Anim(
          animDef.name,
          this.art.getAnimation(animDef.name),
          { x: animDef.offsetX, y: animDef.offsetY + (Coords.ISO_TILE_SIZE + 1) / 2 },
          this.imageFinder,
          this.theater,
          this.camera,
          this.debugFrame,
          this.gameSpeed,
          this.useSpriteBatching,
          animLight,
          this.worldSound,
          isoPalette,
        );
        const pos = Coords.tile3dToWorld(tile.rx, tile.ry, tile.z);
        anim.setPosition(pos);
        anim.create3DObject();
        anims.push(anim);
        parent.add(anim.get3DObject());
        this.disposables.add(anim);
      }
    }
    this.anims = anims;
  }

  /**
   * 驱动 tile Anim。
   * @param tick - 游戏 tick
   */
  update(tick: number): void {
    for (const anim of this.anims) anim.update(tick);
  }

  /**
   * 刷新光色：tiles 列表局部更新，否则全量。
   * @param tiles - 可选 tile 列表
   */
  updateLighting(tiles?: Iterable<any>): void {
    if (tiles) {
      for (const tile of tiles) {
        const idx = this.tileIndexes.get(tile);
        if (void 0 !== idx) {
          const { x, y, z } = this.lighting.compute(LightingType.Full, tile);
          this.updateColorMultBufferAtIndex(idx, x, y, z, this.colorMultAttribute.array);
        }
        this.tileAnimLightMultsByTile.get(tile)?.copy(this.lighting.compute(LightingType.Full, tile));
      }
      this.colorMultAttribute.needsUpdate = true;
    } else {
      const triples: number[] = [];
      for (const tile of this.allTiles) {
        const { x, y, z } = this.lighting.compute(LightingType.Full, tile);
        triples.push(x, y, z);
      }
      this.updateColorMultBuffer(triples, this.colorMultAttribute.array);
      this.colorMultAttribute.needsUpdate = true;
      this.tileAnimLightMultsByTile.forEach((mult, tile) => {
        mult.copy(this.lighting.compute(LightingType.Full, tile));
      });
    }
  }

  /**
   * 把每 tile 的 rgb 三元组展开为每顶点 rgba。
   * @param triples - 长度 3*N 的光色数组
   * @param out - 目标 Float32Array
   */
  updateColorMultBuffer(triples: number[], out: Float32Array): void {
    const verts = SpriteUtils.VERTICES_PER_SPRITE;
    const count = triples.length / 3;
    let s = 0;
    for (let l = 0; l < count; l++) {
      const r = triples[3 * l];
      const g = triples[3 * l + 1];
      const b = triples[3 * l + 2];
      for (let v = 0; v < verts; v++) {
        out[s++] = r;
        out[s++] = g;
        out[s++] = b;
        out[s++] = 1;
      }
    }
  }

  /**
   * 写单 tile 顶点光色。
   * @param index - tile 下标
   * @param r - 红
   * @param g - 绿
   * @param b - 蓝
   * @param out - 目标数组
   */
  updateColorMultBufferAtIndex(index: number, r: number, g: number, b: number, out: Float32Array): void {
    const verts = SpriteUtils.VERTICES_PER_SPRITE;
    let n = index * verts * 4;
    for (let o = 0; o < verts; o++) {
      out[n++] = r;
      out[n++] = g;
      out[n++] = b;
      out[n++] = 1;
    }
  }

  /** 释放资源。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
