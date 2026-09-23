/**
 * MapSurface — 地图投影接收面（逐 tile 斜坡四边形合并 + ShadowMaterial）。
 *
 * MAGIC_OFFSET 为贴地微抬；createObject 合并全部 tile 几何，只接收阴影。
 *
 * 由 engine/renderable/entity/map/MapSurface.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { rampHeights } from "game/theater/rampHeights"; // 已转换
import * as BufferGeometryUtilsModule from "engine/gfx/BufferGeometryUtils"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const BufferGeometryUtils: any = (BufferGeometryUtilsModule as any).BufferGeometryUtils;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 贴地微抬偏移（与孪生 MAGIC_OFFSET 一致）。 */
export const MAGIC_OFFSET = 0.05;

/** 地图阴影接收面。 */
export class MapSurface {
  /** 可见性。 */
  visible = true;
  /** 资源清理器。 */
  disposables: CompositeDisposable;
  /** 地图对象。 */
  map: any;
  /** 战区。 */
  theater: any;
  /** 3D 根。 */
  target?: any;

  /**
   * @param map - 需 tiles
   * @param theater - 战区
   */
  constructor(map: any, theater: any) {
    this.visible = true;
    this.disposables = new CompositeDisposable();
    this.map = map;
    this.theater = theater;
  }

  /** 取 3D 对象。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建接收面网格。 */
  create3DObject(): void {
    let root = this.get3DObject();
    if (!root) {
      root = this.createObject();
      root.name = "map_surface_shadow";
      root.matrixAutoUpdate = false;
      root.visible = this.visible;
      this.target = root;
    }
  }

  /** 无逐帧逻辑。 */
  update(): void {}

  /**
   * 设置可见性。
   * @param visible - 目标可见
   */
  setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.target) this.target.visible = visible;
  }

  /** 合并全图 tile 四边形为单一接收阴影 Mesh。 */
  createObject(): any {
    const geos: any[] = [];
    this.map.tiles.forEach((tile: any) => {
      const pos = Coords.tile3dToWorld(tile.rx, tile.ry, tile.z);
      const geo = this.createRectGeometry(tile.rampType);
      geo.applyMatrix(new (THREE as any).Matrix4().makeTranslation(pos.x, pos.y + 0.05, pos.z));
      geos.push(geo);
    });
    const merged = BufferGeometryUtils.mergeBufferGeometries(geos);
    const mat = new (THREE as any).ShadowMaterial();
    mat.transparent = true;
    mat.opacity = 0.5;
    const mesh = new (THREE as any).Mesh(merged, mat);
    mesh.receiveShadow = true;
    mesh.renderOrder = 5;
    mesh.frustumCulled = false;
    this.disposables.add(merged, mat);
    return mesh;
  }

  /**
   * 按 rampType 创建单 tile 四边形几何。
   * @param rampType - 斜坡索引
   */
  createRectGeometry(rampType: number): any {
    const size = Coords.getWorldTileSize();
    const heights = rampHeights[rampType];
    const geometry = new (THREE as any).BufferGeometry();
    const position = new Float32Array([
      0,
      Coords.tileHeightToWorld(heights[0]),
      size,
      size,
      Coords.tileHeightToWorld(heights[3]),
      size,
      0,
      Coords.tileHeightToWorld(heights[1]),
      0,
      size,
      Coords.tileHeightToWorld(heights[2]),
      0,
    ]);
    const index = new Uint16Array([0, 1, 2, 3, 2, 1]);
    geometry.addAttribute("position", new (THREE as any).BufferAttribute(position, 3));
    geometry.setIndex(new (THREE as any).BufferAttribute(index, 1));
    return geometry;
  }

  /** 释放几何/材质。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
