/**
 * MapTileLayerDebug — tile 覆盖/坡度调试层与连通性线。
 *
 * createTileOverlay 按高度/斜坡画纹理面；setupLines 画 Foot/Float 可通行图；
 * 占用变化时脏标记重建线。
 *
 * 由 engine/renderable/entity/map/MapTileLayerDebug.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { rampHeights } from "game/theater/rampHeights"; // 已转换
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as BufferGeometryUtilsModule from "engine/gfx/BufferGeometryUtils"; // 孪生
import { IsoCoords } from "engine/IsoCoords"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const SpriteUtils: any = (SpriteUtilsModule as any).SpriteUtils;
const BufferGeometryUtils: any = (BufferGeometryUtilsModule as any).BufferGeometryUtils;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** tile 调试层。 */
export class MapTileLayerDebug {
  /** 覆盖纹理横向 tile 数。 */
  private readonly _textureTilesNo = 20;
  /** 可见性。 */
  visible = true;
  /** 连通线脏标记。 */
  needsLinesUpdate = false;
  /** 资源清理。 */
  disposables: CompositeDisposable;
  /** 地图。 */
  map: any;
  /** 战区。 */
  theater: any;
  /** 相机。 */
  camera: any;
  /** 3D 根。 */
  target?: any;
  /** 覆盖网格。 */
  tileOverlay?: any;
  /** 连通线组。 */
  lines?: any;
  /** 占用变化回调。 */
  private readonly handleTileOccupationChanged = () => {
    this.needsLinesUpdate = true;
  };
  /** 静态 tile 调试纹理缓存。 */
  private static textureCache: any;

  /**
   * @param map - 需 tiles/terrain/tileOccupation
   * @param theater - 战区
   * @param camera - 相机
   */
  constructor(map: any, theater: any, camera: any) {
    this._textureTilesNo = 20;
    this.visible = true;
    this.needsLinesUpdate = false;
    this.disposables = new CompositeDisposable();
    this.map = map;
    this.theater = theater;
    this.camera = camera;
  }

  /** 取 3D 对象。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建根、覆盖面与连通线。 */
  create3DObject(): void {
    let root = this.get3DObject();
    if (!root) {
      root = new (THREE as any).Object3D();
      root.name = "map_tile_layer_debug";
      root.visible = this.visible;
      root.matrixAutoUpdate = false;
      if (this.visible) {
        if (!this.tileOverlay) {
          const overlay = (this.tileOverlay = this.createTileOverlay());
          overlay.matrixAutoUpdate = false;
          overlay.frustumCulled = false;
          root.add(overlay);
        }
        this.setupLines(root);
      }
      this.target = root;
    }
  }

  /** 脏标记时重建连通线。 */
  update(): void {
    if (this.needsLinesUpdate && this.visible) {
      this.needsLinesUpdate = false;
      this.destroyLines();
      this.setupLines(this.target);
    }
  }

  /**
   * 切换可见性。
   * @param visible - 目标可见
   */
  setVisible(visible: boolean): void {
    if (visible === this.visible || !this.target) return;
    this.visible = visible;
    this.target.visible = visible;
    if (this.visible) {
      if (!this.tileOverlay) {
        const overlay = (this.tileOverlay = this.createTileOverlay());
        overlay.matrixAutoUpdate = false;
        this.target.add(overlay);
      }
      this.setupLines(this.target);
    } else {
      this.destroyLines();
    }
  }

  /**
   * 挂 Foot（绿）/ Float（黄）连通线。
   * @param root - 挂载根
   */
  setupLines(root: any): void {
    this.lines = new (THREE as any).Object3D();
    this.lines.matrixAutoUpdate = false;
    this.lines.add(this.createConnectivityLines(SpeedType.Foot, false, 65280));
    const floatLines = this.createConnectivityLines(SpeedType.Float, false, 255);
    floatLines.position.y = 1;
    floatLines.updateMatrix();
    this.lines.add(floatLines);
    root.add(this.lines);
    this.map.tileOccupation.onChange.subscribe(this.handleTileOccupationChanged);
  }

  /** 移除连通线并退订。 */
  destroyLines(): void {
    if (this.lines) {
      this.target!.remove(this.lines);
      this.lines = undefined;
      this.map.tileOccupation.onChange.unsubscribe(this.handleTileOccupationChanged);
    }
  }

  /** 按 tile z/ramp 画半透明覆盖四边形。 */
  createTileOverlay(): any {
    const geos: any[] = [];
    this.map.tiles.forEach((tile: any) => {
      const pos = Coords.tile3dToWorld(tile.rx, tile.ry, tile.z + 1);
      const screenSize = IsoCoords.getScreenTileSize();
      const geo = SpriteUtils.createSpriteGeometry({
        texture: this.getTileTexture(),
        textureArea: {
          x: tile.z * screenSize.width,
          y: 2 * tile.rampType * screenSize.height,
          width: screenSize.width,
          height: 2 * screenSize.height,
        },
        align: { x: 0, y: -1 },
        camera: this.camera,
        scale: Coords.ISO_WORLD_SCALE,
      });
      geo.applyMatrix(new (THREE as any).Matrix4().makeTranslation(pos.x, pos.y, pos.z));
      geos.push(geo);
    });
    const merged = BufferGeometryUtils.mergeBufferGeometries(geos);
    const material = new (THREE as any).MeshBasicMaterial({
      map: this.getTileTexture(),
      alphaTest: 0.5,
      transparent: true,
      opacity: 0.7,
      flatShading: true,
    });
    this.disposables.add(merged, material);
    return new (THREE as any).Mesh(merged, material);
  }

  /** 惰性生成高度/斜坡调试纹理。 */
  getTileTexture(): any {
    let texture = MapTileLayerDebug.textureCache;
    if (!texture) {
      const screenSize = IsoCoords.getScreenTileSize();
      const cols = this._textureTilesNo;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not acquire canvas 2d context");
      canvas.width = screenSize.width * cols;
      canvas.height = 2 * screenSize.height * rampHeights.length;
      const origin = IsoCoords.tileToScreen(0, 0);
      origin.x += -screenSize.width / 2;
      const halfTile = Coords.ISO_TILE_SIZE / 2;
      const corners = [
        [0, 1],
        [0, 0],
        [1, 0],
        [1, 1],
      ];
      for (let a = 0; a < cols; ++a) {
        for (let i = 0; i < rampHeights.length; ++i) {
          const heights = rampHeights[i];
          const color = 16711680 - (a << 11) - (a << 7);
          ctx.beginPath();
          const p0 = IsoCoords.tileToScreen.apply(this, corners[0] as [number, number]);
          ctx.moveTo(-origin.x + p0.x + a * screenSize.width, -origin.y + p0.y + (1 - heights[0]) * halfTile + 2 * i * screenSize.height);
          for (let c = 1; c < corners.length; ++c) {
            const p = IsoCoords.tileToScreen.apply(this, corners[c] as [number, number]);
            ctx.lineTo(-origin.x + p.x + a * screenSize.width, -origin.y + p.y + (1 - heights[c]) * halfTile + 2 * i * screenSize.height);
          }
          ctx.closePath();
          ctx.lineWidth = 1;
          ctx.fillStyle = "#" + color.toString(16);
          ctx.fill();
          ctx.strokeStyle = "#" + (16777215 - color).toString(16);
          ctx.stroke();
        }
      }
      texture = new (THREE as any).Texture(canvas);
      texture.minFilter = (THREE as any).NearestFilter;
      texture.magFilter = (THREE as any).NearestFilter;
      texture.needsUpdate = true;
      MapTileLayerDebug.textureCache = texture;
    }
    return texture;
  }

  /**
   * 画 passability 图的边线段。
   * @param speedType - 通行类型
   * @param onBridge - 是否桥上
   * @param color - 线色
   */
  createConnectivityLines(speedType: number, onBridge: boolean, color: number): any {
    const graph = this.map.terrain.computePassabilityGraph(speedType, onBridge);
    const geometry = new (THREE as any).Geometry();
    const seen = new Set<string>();
    graph.forEachNode((node: any) => {
      const from = node;
      from.neighbors.forEach((to: any) => {
        const key = from.id + "->" + to.id;
        if (seen.has(key)) return;
        seen.add(key);
        geometry.vertices.push(
          Coords.tile3dToWorld(
            from.data.tile.rx + 0.5,
            from.data.tile.ry + 0.5,
            from.data.tile.z + (from.data.onBridge?.tileElevation ?? 0),
          ),
          Coords.tile3dToWorld(
            to.data.tile.rx + 0.5,
            to.data.tile.ry + 0.5,
            to.data.tile.z + (to.data.onBridge?.tileElevation ?? 0),
          ),
        );
      });
    });
    const material = new (THREE as any).LineBasicMaterial({
      color,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const lines = new (THREE as any).LineSegments(geometry, material);
    lines.matrixAutoUpdate = false;
    this.disposables.add(geometry, material);
    return lines;
  }

  /** 移除时拆线。 */
  onRemove(): void {
    if (this.lines) this.destroyLines();
  }

  /** 释放资源。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
