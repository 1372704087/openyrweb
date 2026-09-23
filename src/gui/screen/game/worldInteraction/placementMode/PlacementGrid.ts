/**
 * PlacementGrid — 建筑放置菱形网格与射程圈（自绘/place.shp 三态纹理）。
 *
 * 由 gui/screen/game/worldInteraction/placementMode/PlacementGrid.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { rampHeights } from "game/theater/rampHeights"; // 已转换
import * as OverlayUtilsModule from "engine/gfx/OverlayUtils"; // 孪生
import { pointEquals } from "util/geometry"; // 已转换
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import * as IsoCoordsModule from "engine/IsoCoords"; // 孪生
import * as ExtensionHostModule from "extensions/ExtensionHost"; // 孪生
import * as ShpFileModule from "data/ShpFile"; // 孪生
import * as EngineModule from "engine/Engine"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const OverlayUtils: any = OverlayUtilsModule as any;
const SpriteUtils: any = SpriteUtilsModule as any;
const IsoCoords: any = IsoCoordsModule as any;
const ExtensionHost: any = ExtensionHostModule as any;
const ShpFile: any = ShpFileModule as any;
const Engine: any = EngineModule as any;

/** 2 的幂取整（与孪生 THREE.Math.ceilPowerOfTwo 一致）。 */
const ceilPowerOfTwo: (n: number) => number = (THREE as any).Math?.ceilPowerOfTwo ?? ((n: number) => Math.pow(2, Math.ceil(Math.log2(n))));

/** 放置网格。 */
export class PlacementGrid {
  /** 视图模型。 */
  viewModel: any;
  /** 相机。 */
  camera: any;
  /** 地图 tile 表。 */
  mapTiles: any;
  /** 坡度 → 网格 mesh。 */
  tileOverlays = new Map<number, any>();
  /** 根 Object3D。 */
  target: any;
  /** 当前 tile 组。 */
  tilesObject: any;
  /** 射程圈。 */
  rangeObject: any;
  /** 上次射程圈参数。 */
  lastRangeCircle: any;
  /** 纹理缓存。 */
  textureCache: any;

  /**
   * @param viewModel 视图模型
   * @param camera 相机
   * @param mapTiles tile 表
   */
  constructor(viewModel: any, camera: any, mapTiles: any) {
    this.viewModel = viewModel;
    this.camera = camera;
    this.mapTiles = mapTiles;
    this.tileOverlays = new Map();
  }

  /** 根对象。 */
  get3DObject(): any {
    return this.target;
  }

  /** 创建根与坡度模板。 */
  create3DObject(): void {
    const root = new THREE.Object3D();
    root.name = "placement_grid";
    this.target = root;
    this.createTileOverlays();
  }

  /** 按 model.tiles 重建格子组；更新射程圈。 */
  update(): void {
    this.refreshRangeCircle();
    if (this.viewModel.visible || !this.tilesObject) {
      const group = new THREE.Object3D();
      group.visible = true;
      for (const cell of this.viewModel.tiles) {
        const tile = this.mapTiles.getByMapCoords(cell.rx, cell.ry);
        if (!tile) throw new Error(`Map tile not found for coords (${cell.rx}, ${cell.ry})`);
        const template = this.tileOverlays.get(tile.rampType);
        if (!template) throw new Error("Missing overlay mesh for rampType " + tile.rampType);
        const mesh = template.clone();
        mesh.material = mesh.material.clone();
        // 状态 → 预烘焙纹理(绿=可放/黄=占用可放/红=不可放),
        // 半透明填充与亮边已烘进纹理,材质保持白色不调色。
        const colorKey = cell.buildable
          ? this.viewModel.showBusy
            ? "yellow"
            : "green"
          : "red";
        mesh.material.map = this.getTileOverlayTextures()[colorKey];
        mesh.material.needsUpdate = true;
        const pos = this.getTilePosition(tile);
        mesh.position.copy(pos);
        group.add(mesh);
      }
      const root = this.get3DObject();
      root.remove(this.tilesObject);
      this.tilesObject = group;
      root.add(group);
    } else {
      this.tilesObject.visible = false;
    }
  }

  /** 刷新/隐藏/移除射程圈。 */
  refreshRangeCircle(): void {
    if (this.viewModel.visible || !this.rangeObject) {
      if (this.rangeObject) this.rangeObject.visible = true;
      const root = this.get3DObject();
      const indicator = this.viewModel.rangeIndicator;
      if (indicator) {
        if (
          !this.lastRangeCircle ||
          indicator.radius !== this.lastRangeCircle.radius
        ) {
          const circle = OverlayUtils.createGroundCircle(
            indicator.radius * Coords.getWorldTileSize(),
            this.viewModel.rangeIndicatorColor,
          );
          if (this.rangeObject) root.remove(this.rangeObject);
          root.add(circle);
          this.rangeObject = circle;
        }
        if (!this.lastRangeCircle || !pointEquals(indicator.center, this.lastRangeCircle.center)) {
          const rx = Math.floor(indicator.center.x);
          const ry = Math.floor(indicator.center.y);
          const tile = this.mapTiles.getByMapCoords(rx, ry);
          if (!tile) {
            console.warn(`Map tile not found for coords (${rx}, ${ry})`);
            return;
          }
          const pos = this.getTilePosition(tile);
          pos.x += (indicator.center.x % 1) * Coords.getWorldTileSize();
          pos.z += (indicator.center.y % 1) * Coords.getWorldTileSize();
          this.rangeObject.position.copy(pos);
        }
        this.lastRangeCircle = indicator;
      } else if (this.rangeObject) {
        root.remove(this.rangeObject);
        this.rangeObject = void 0;
        this.lastRangeCircle = void 0;
      }
    } else {
      this.rangeObject.visible = false;
    }
  }

  /** 为每种坡度创建模板 mesh。 */
  createTileOverlays(): void {
    for (let i = 0; i < rampHeights.length; ++i) {
      this.tileOverlays.set(i, this.createTileOverlay(i));
    }
  }

  /**
   * 单坡度模板。
   * @param rampIndex 坡度索引
   */
  createTileOverlay(rampIndex: number): any {
    const tileSize = IsoCoords.getScreenTileSize();
    const geometry = SpriteUtils.createSpriteGeometry({
      texture: this.getTileOverlayTextures().green,
      textureArea: {
        x: 0,
        y: 2 * rampIndex * tileSize.height,
        width: tileSize.width,
        height: 2 * tileSize.height,
      },
      align: { x: 0, y: -1 },
      camera: this.camera,
      scale: Coords.ISO_WORLD_SCALE,
    });
    geometry.applyMatrix(
      new THREE.Matrix4().makeTranslation(0, Coords.tileHeightToWorld(1), 0),
    );
    const material = new THREE.MeshBasicMaterial({
      map: this.getTileOverlayTextures().green,
      alphaTest: 0.05,
      transparent: true,
      opacity: 1,
      flatShading: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1e6;
    mesh.frustumCulled = false;
    return mesh;
  }

  /**
   * tile → 世界坐标。
   * @param tile tile
   */
  getTilePosition(tile: any): any {
    return Coords.tile3dToWorld(tile.rx, tile.ry, tile.z);
  }

  // 状态→纹理(绿/红/黄各一张同布局高图)。自绘模式采用半透明填充 +
  // 同色系亮边(对齐 gamemd-master C++ 版 BuildingPlacement::Draw:
  // fill 60,220,60 / 230,60,60 @α0.43;edge 140,255,140 / 255,120,120
  // @α0.82;线宽 1.5)。placeex「使用 place.shp」开启时改用游戏资源
  // place.shp 原版菱形(纯色不透明、无描边)。纹理生成后缓存,开关对
  // 新一局生效。
  /** 取三态纹理缓存。 */
  getTileOverlayTextures(): any {
    if (!this.textureCache) {
      const tileSize = IsoCoords.getScreenTileSize();
      const states: any[] = [
        // 红色填充浓度单独调高(0.55):低透明度的红叠在地形上偏淡
        ["green", [60, 220, 60], [140, 255, 140], 0.43],
        ["red", [230, 60, 60], [255, 120, 120], 0.55],
        ["yellow", [220, 220, 60], [255, 255, 140], 0.43],
      ];
      // placeex「使用 place.shp」:开启时用游戏资源 place.shp 的原版
      // 菱形色块(纯色、无描边);place.shp 缺失或解码失败时回退到
      // 自绘菱形。解码一次,三态各自着色。
      let shpImage: any = null;
      if (
        Engine.vfs &&
        Engine.vfs.fileExists("place.shp") &&
        ExtensionHost.isFeatureEnabled("placeex", "usePlaceShp")
      ) {
        try {
          shpImage = new ShpFile(Engine.vfs.openFile("place.shp")).getImage(0);
          if (shpImage && (shpImage.width <= 0 || shpImage.height <= 0)) {
            shpImage = null;
          }
        } catch (e) {
          console.warn("[PlacementGrid] place.shp unavailable, using procedural grid", e);
          shpImage = null;
        }
      }
      this.textureCache = {} as Record<string, any>;
      for (const [key, fill, edge, fillAlpha] of states) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Couldn't acquire canvas 2d context");
        canvas.width = ceilPowerOfTwo(tileSize.width);
        canvas.height = ceilPowerOfTwo(2 * tileSize.height * rampHeights.length);
        const origin = IsoCoords.tileToScreen(0, 0);
        origin.x += -tileSize.width / 2;
        const halfH = Coords.ISO_TILE_SIZE / 2;
        // shp 形状画布:按本状态着色,纯色不透明、无描边
        let tinted: HTMLCanvasElement | null = null;
        if (shpImage) {
          tinted = document.createElement("canvas");
          tinted.width = shpImage.width;
          tinted.height = shpImage.height;
          const tctx = tinted.getContext("2d");
          if (tctx) {
            const imgData = tctx.createImageData(shpImage.width, shpImage.height);
            for (let i = 0; i < shpImage.imageData.length; ++i) {
              if (shpImage.imageData[i]) {
                imgData.data[4 * i] = fill[0];
                imgData.data[4 * i + 1] = fill[1];
                imgData.data[4 * i + 2] = fill[2];
                imgData.data[4 * i + 3] = 255;
              }
            }
            tctx.putImageData(imgData, 0, 0);
          } else {
            tinted = null;
          }
        }
        for (let ramp = 0; ramp < rampHeights.length; ++ramp) {
          if (tinted) {
            // shp 帧在 2×格高的槽位带内垂直居中(各坡度复用同一
            // 原版形状,与 VERA20K 的简化一致)
            ctx.drawImage(
              tinted,
              Math.round((tileSize.width - tinted.width) / 2),
              Math.round((2 * tileSize.height - tinted.height) / 2) +
                2 * ramp * tileSize.height,
            );
            continue;
          }
          const heights = rampHeights[ramp];
          const corners = [
            [0, 1],
            [0, 0],
            [1, 0],
            [1, 1],
          ];
          ctx.beginPath();
          const p0 = IsoCoords.tileToScreen(corners[0][0], corners[0][1]);
          ctx.moveTo(
            -origin.x + p0.x,
            -origin.y + p0.y + (1 - heights[0]) * halfH + 2 * ramp * tileSize.height,
          );
          for (let i = 1; i < corners.length; ++i) {
            const p = IsoCoords.tileToScreen(corners[i][0], corners[i][1]);
            ctx.lineTo(
              -origin.x + p.x,
              -origin.y + p.y + (1 - heights[i]) * halfH + 2 * ramp * tileSize.height,
            );
          }
          // 半透明填充 + 同色系亮边 1.5px
          ctx.closePath();
          ctx.lineWidth = 1.5;
          ctx.fillStyle = `rgba(${fill[0]},${fill[1]},${fill[2]},${fillAlpha})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${edge[0]},${edge[1]},${edge[2]},0.82)`;
          ctx.stroke();
        }
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        this.textureCache[key] = texture;
      }
    }
    return this.textureCache;
  }

  /** 释放模板资源。 */
  dispose(): void {
    this.tileOverlays.forEach((mesh) => {
      mesh.material.dispose();
      mesh.geometry.dispose();
    });
  }
}
