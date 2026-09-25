/**
 * MapShroudLayer — 战争迷雾 UV 帧层（边缘/角组合 47 帧表驱动）。
 *
 * 全量/增量把 shroud 状态写入合并 mesh 的 uvAttribute；模块级 CORNER_MAP/
 * EDGE_MAP/NIBBLE_MASK 查表算 frameNo。
 *
 * 由 engine/renderable/entity/map/MapShroudLayer.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import * as TextureUtilsModule from "engine/gfx/TextureUtils"; // 孪生
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as ShpTextureAtlasModule from "engine/renderable/builder/ShpTextureAtlas"; // 孪生
import { Palette } from "data/Palette"; // 已转换
import { Color } from "util/Color"; // 已转换
import { ShroudType } from "game/map/MapShroud"; // 已转换
import * as BufferGeometryUtilsModule from "engine/gfx/BufferGeometryUtils"; // 孪生
import * as PaletteBasicMaterialModule from "engine/gfx/material/PaletteBasicMaterial"; // 孪生
import { Engine } from "engine/Engine"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const TextureUtils: any = (TextureUtilsModule as any).TextureUtils;
const SpriteUtils: any = (SpriteUtilsModule as any).SpriteUtils;
const ShpTextureAtlas: any = (ShpTextureAtlasModule as any).ShpTextureAtlas;
const BufferGeometryUtils: any = (BufferGeometryUtilsModule as any).BufferGeometryUtils;
const PaletteBasicMaterial: any = (PaletteBasicMaterialModule as any).PaletteBasicMaterial;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 纯角组合（无边）→ 帧号。 */
const CORNER_MAP: number[] = (
  [
    [1, 32],
    [4, 33],
    [8, 34],
    [2, 35],
    [5, 36],
    [12, 37],
    [10, 38],
    [3, 39],
    [13, 40],
    [14, 41],
    [11, 42],
    [7, 43],
    [9, 44],
    [6, 45],
    [15, 46],
  ] as [number, number][]
).reduce((acc, pair) => ((acc[pair[0]] = pair[1]), acc), new Array(16).fill(void 0));

/** 边+角组合 → 帧号（高 8 位角掩码 | 低 4 位边掩码索引）。 */
const EDGE_MAP: number[] = (
  [
    [24, 16],
    [34, 17],
    [50, 18],
    [65, 19],
    [97, 20],
    [132, 21],
    [152, 22],
    [196, 23],
    [18, 24],
    [33, 25],
    [68, 26],
    [136, 27],
    [26, 28],
    [35, 29],
    [69, 30],
    [140, 31],
  ] as [number, number][]
).reduce((acc, pair) => ((acc[pair[0]] = pair[1]), acc), new Array(256).fill(void 0));

/** 各边掩码下可保留的角位。 */
const NIBBLE_MASK = [0, 5, 12, 13, 10, 15, 14, 15, 3, 7, 15, 15, 11, 15, 15, 15];

/** 迷雾层。 */
export class MapShroudLayer {
  /** 迷雾模型。 */
  shroud: any;
  /** 图像查找。 */
  imageFinder: any;
  /** 相机。 */
  camera: any;
  /** 资源清理。 */
  disposables: CompositeDisposable;
  /** 增量待更坐标。 */
  needsIncrementalUpdate: any[] = [];
  /** 全量模式：false | "full" | "cover" | "clear"。 */
  needsFullUpdate: boolean | "full" | "cover" | "clear" = false;
  /** shroud 变更回调。 */
  private readonly onShroudChange = (evt: any) => {
    if ("incremental" === evt.type) this.needsIncrementalUpdate.push(...evt.coords);
    else this.needsFullUpdate = evt.type as any;
  };
  /** 3D 根。 */
  target?: any;
  /** 合并 mesh 的 uv 属性。 */
  uvAttribute?: any;
  /** 每 piece 的 uv 元素数。 */
  uvElemsPerPiece = 0;
  /** 47 帧 uv 查找表。 */
  uvLookup?: Float32Array;

  /**
   * @param shroud - MapShroud
   * @param imageFinder - ImageFinder
   * @param camera - 相机
   */
  constructor(shroud: any, imageFinder: any, camera: any) {
    this.shroud = shroud;
    this.imageFinder = imageFinder;
    this.camera = camera;
    this.disposables = new CompositeDisposable();
    this.needsIncrementalUpdate = [];
    this.needsFullUpdate = false;
    this.camera = camera;
  }

  /** 取 3D 对象。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建 tile 对象并订阅 shroud。 */
  create3DObject(): void {
    let root = this.get3DObject();
    if (root) return;
    root = new (THREE as any).Object3D();
    root.name = "map_shroud_layer";
    root.matrixAutoUpdate = false;
    this.target = root;
    this.createTileObjects(root);
    this.shroud.onChange.subscribe(this.onShroudChange);
    this.disposables.add(() => this.shroud.onChange.unsubscribe(this.onShroudChange));
  }

  /**
   * 更换 shroud 源并强制全量刷新。
   * @param shroud - 新 MapShroud
   */
  setShroud(shroud: any): void {
    this.shroud.onChange.unsubscribe(this.onShroudChange);
    this.shroud = shroud;
    this.shroud.onChange.subscribe(this.onShroudChange);
    this.needsFullUpdate = "full";
  }

  /**
   * 构建全图迷雾 mesh 与 47 帧 uv 查找表。
   * @param parent - 挂载根
   */
  createTileObjects(parent: any): void {
    const shpFile = this.imageFinder.find(Engine.shroudFileName.split(".")[0], false);
    const atlas = new ShpTextureAtlas().fromShpFile(shpFile);
    this.disposables.add(atlas);
    const palette = new Palette();
    const colors = [new Color(0, 0, 0), new Color(0, 0, 0)];
    for (let g = 0; g < 254; g++) {
      const v = Math.min(255, Math.floor((g / 125) * 255));
      colors.push(new Color(v, v, v));
    }
    palette.setColors(colors);
    const paletteTex = TextureUtils.textureFromPalette(palette);
    const geos: any[] = [];
    let count = 0;
    const size = this.shroud.getSize();
    for (let y = 0; y < size.height; y++) {
      for (let x = 0; x < size.width; x++) {
        const coords = { sx: x, sy: y };
        const frameNo = this.getFrameNo(coords);
        const geo = this.createTileGeometry(coords, atlas, frameNo);
        geos.push(geo);
        count++;
      }
    }
    // 0×0 迷雾（占位 shroud 未初始化）：跳过合并与 mesh，避免 geometries[0] 空指针
    // 【运行时验证】loadUi 阶段 shroud 为占位空壳，无守卫时用户对局必炸（reading 'index'）
    if (count === 0 || geos.length === 0) return;

    const material = new PaletteBasicMaterial({
      map: atlas.getTexture(),
      palette: paletteTex,
      alphaTest: 0.01,
      flatShading: true,
      transparent: true,
      depthTest: false,
      blending: (THREE as any).MultiplyBlending,
    });
    const merged = BufferGeometryUtils.mergeBufferGeometries(geos);
    if (merged.getAttribute("position").count !== SpriteUtils.VERTICES_PER_SPRITE * count) {
      throw new Error("Vertex count mismatch");
    }
    this.uvAttribute = merged.getAttribute("uv");
    this.uvElemsPerPiece = (this.uvAttribute.count * this.uvAttribute.itemSize) / count;
    this.uvLookup = new Float32Array(47 * this.uvElemsPerPiece);
    for (let m = 0; m < 47; m++) {
      const sample = SpriteUtils.createSpriteGeometry(this.getTileGeometryOptions(atlas, m));
      this.uvLookup.set(sample.getAttribute("uv").array, m * this.uvElemsPerPiece);
    }
    geos.forEach((g) => g.dispose());
    const mesh = new (THREE as any).Mesh(merged, material);
    mesh.renderOrder = 999999;
    mesh.matrixAutoUpdate = false;
    mesh.frustumCulled = false;
    parent.add(mesh);
    this.disposables.add(merged, material);
  }

  /**
   * 单 tile 几何（平移到世界坐标）。
   * @param coords - sx/sy
   * @param atlas - SHP 图集
   * @param frameNo - 帧号
   */
  createTileGeometry(coords: any, atlas: any, frameNo: number): any {
    const { rx, ry } = this.shroud.shroudCoordsToWorld(coords);
    const world = Coords.tile3dToWorld(rx, ry, 0);
    const geo = SpriteUtils.createSpriteGeometry(this.getTileGeometryOptions(atlas, frameNo));
    geo.applyMatrix(new (THREE as any).Matrix4().makeTranslation(world.x, world.y, world.z));
    return geo;
  }

  /**
   * sprite 几何选项。
   * @param atlas - 图集
   * @param frameNo - 帧
   */
  getTileGeometryOptions(atlas: any, frameNo: number): any {
    return {
      texture: atlas.getTexture(),
      textureArea: atlas.getTextureArea(frameNo),
      flat: true,
      align: { x: 0, y: -1 },
      camera: this.camera,
      scale: Coords.ISO_WORLD_SCALE,
    };
  }

  /** 每帧应用 full/cover/clear/incremental 更新。 */
  update(_tick?: number): void {
    // 把当前状态暴露给控制台探针（window.__shroudLayerState / __shroudLayer）
    (globalThis as any).__shroudLayer = this;
    (globalThis as any).__shroudLayerState = {
      built: !!this.uvAttribute,
      size: this.shroud.getSize ? this.shroud.getSize() : null,
      needsFullUpdate: this.needsFullUpdate,
      pendingIncremental: this.needsIncrementalUpdate.length,
    };
    // 占位 shroud（0×0，loadUi 时真 shroud 尚未由 setShroud 注入）阶段：
    // createTileObjects 会早退、无 mesh。等真 shroud（size>0）到位后首次 update 补建，
    // 否则占位阶段每帧读 uvAttribute.subarray 会炸。
    if (!this.uvAttribute) {
      // !(width > 0) 同时拦截 NaN/undefined/≤0（宽为 NaN 时旧 `width <= 0` 判不住）
      const size = this.shroud.getSize();
      if (!this.target || !(size && size.width > 0)) return;
      this.createTileObjects(this.target);
      // createTileObjects 可能因 count===0（height 为 0/NaN）早退：
      // 未产出 uv 状态时不得落进 needsFullUpdate 分支，否则 uvLookup.subarray 必炸
      if (!this.uvAttribute || !this.uvLookup) return;
    }
    if (this.needsFullUpdate) {
      if ("cover" === this.needsFullUpdate || "clear" === this.needsFullUpdate) {
        this.toggleAllTiles("cover" === this.needsFullUpdate ? ShroudType.Unexplored : ShroudType.Explored);
      } else {
        this.updateAllTiles();
        this.needsIncrementalUpdate = [];
      }
      this.uvAttribute!.needsUpdate = true;
      this.needsFullUpdate = false;
    }
    if (this.needsIncrementalUpdate.length) {
      const tiles = this.extendToAdjacentTiles(this.needsIncrementalUpdate);
      this.updateTiles(tiles);
      this.uvAttribute!.needsUpdate = true;
      this.needsIncrementalUpdate.length = 0;
    }
  }

  /**
   * 把坐标扩到 3×3 邻域（去重）。
   * @param coords - 变更坐标列表
   */
  extendToAdjacentTiles(coords: any[]): any[] {
    const map = new Map<string, any>();
    const size = this.shroud.getSize();
    for (const c of coords) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const sx = c.sx + dx;
          const sy = c.sy + dy;
          if (0 <= sx && 0 <= sy && sx < size.width && sy < size.height) {
            map.set(sx + "_" + sy, { sx, sy });
          }
        }
      }
    }
    return [...map.values()];
  }

  /**
   * 更新给定 tile 的 uv piece。
   * @param tiles - tile 坐标
   */
  updateTiles(tiles: any[]): void {
    const size = this.shroud.getSize();
    for (const t of tiles) {
      const index = t.sx + t.sy * size.width;
      this.updateTilePiece(index, this.getFrameNo(t));
    }
  }

  /** 全图刷新 frame。 */
  updateAllTiles(): void {
    const size = this.shroud.getSize();
    for (let y = 0; y < size.height; y++) {
      for (let x = 0; x < size.width; x++) {
        const coords = { sx: x, sy: y };
        const index = coords.sx + coords.sy * size.width;
        this.updateTilePiece(index, this.getFrameNo(coords));
      }
    }
  }

  /**
   * 整图切到未探索/已探索帧。
   * @param type - ShroudType
   */
  toggleAllTiles(type: number): void {
    // 兜底：uv 状态未建（占位/异常尺寸路径）时跳过，避免 uvLookup.subarray 炸帧循环
    if (!this.uvLookup || !this.uvAttribute) return;
    const frame = type === ShroudType.Unexplored ? 15 : 0;
    const piece = this.uvLookup.subarray(frame * this.uvElemsPerPiece, (1 + frame) * this.uvElemsPerPiece);
    const arr = this.uvAttribute!.array;
    const size = this.shroud.getSize();
    for (let i = 0, n = size.width * size.height; i < n; i++) arr.set(piece, i * this.uvElemsPerPiece);
  }

  /**
   * 写单 piece uv。
   * @param index - piece 下标
   * @param frameNo - 帧号
   */
  updateTilePiece(index: number, frameNo: number): void {
    if (!this.uvLookup || !this.uvAttribute) return;
    this.uvAttribute.array.set(
      this.uvLookup.subarray(frameNo * this.uvElemsPerPiece, (frameNo + 1) * this.uvElemsPerPiece),
      index * this.uvElemsPerPiece,
    );
  }

  /**
   * 由邻域遮蔽状态算 0..15 边帧或 16..46 角组合帧。
   * @param coords - sx/sy
   */
  getFrameNo(coords: { sx: number; sy: number }): number {
    if (this.shroud.getShroudTypeByShroudCoords(coords) === ShroudType.Unexplored) return 15;
    let edge = 0;
    if (this.hasShroudedNeighbour(coords, 0, -1)) edge += 1;
    if (this.hasShroudedNeighbour(coords, 1, 0)) edge += 2;
    if (this.hasShroudedNeighbour(coords, 0, 1)) edge += 4;
    if (this.hasShroudedNeighbour(coords, -1, 0)) edge += 8;
    let corner = 0;
    for (const dx of [-1, 1]) {
      for (const dy of [-1, 1]) {
        if (this.hasShroudedNeighbour(coords, dx, dy)) {
          const bit = dx + 1 + ((dy + 1) >> 1);
          corner += 1 << bit;
        }
      }
    }
    if (corner > 0) {
      if (edge === 0) {
        edge = CORNER_MAP[corner];
      } else {
        const residual = corner & ~NIBBLE_MASK[edge];
        if (residual > 0) {
          const mapped = EDGE_MAP[residual + (edge << 4)];
          if (void 0 === mapped) {
            throw new Error(
              `Missing mapped corner frame number for cornerValue "${corner}",` + "edgeFrameNo=" + edge,
            );
          }
          edge = mapped;
        }
      }
    }
    return edge;
  }

  /**
   * 邻格是否未探索。
   * @param coords - 中心
   * @param dx - x 偏移
   * @param dy - y 偏移
   */
  hasShroudedNeighbour({ sx, sy }: { sx: number; sy: number }, dx: number, dy: number): boolean {
    return this.shroud.getShroudTypeByShroudCoords({ sx: sx + dx, sy: sy + dy }) === ShroudType.Unexplored;
  }

  /** 释放资源。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
