/**
 * SecureProgressSprite — 建筑占领进度条（Canvas 纹理）。
 *
 * 90×26 Canvas：悬停时画玩家名，否则画边框槽；按 secureProgressTrait
 * 进度填充。renderOrder 在共享情报时 999999，否则 999998。computeKey
 * 用于脏检测避免无谓重绘。
 *
 * 由 engine/renderable/entity/SecureProgressSprite.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as CanvasUtilsModule from "engine/gfx/CanvasUtils"; // 孪生
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import { Coords } from "game/Coords"; // 已转换
import { clamp } from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const CanvasUtils: any = (CanvasUtilsModule as any).CanvasUtils;
const SpriteUtils: any = (SpriteUtilsModule as any).SpriteUtils;

/** Canvas 宽高（与孪生字面量一致）。 */
const CANVAS_W = 90;
const CANVAS_H = 26;
/** 填充槽内宽。 */
const FILL_MAX = 76;

/**
 * 占领进度条 Sprite。
 */
export class SecureProgressSprite {
  /** 宿主建筑。 */
  building: any;
  /** 相机。 */
  camera: any;
  /** 本地观察者 Ref。 */
  viewer: any;
  /** 联盟关系。 */
  alliances: any;
  /** 选择模型（悬停检测）。 */
  selectionModel: any;

  /** Canvas 上下文。 */
  ctx: any;
  /** 纹理。 */
  texture: any;
  /** 网格。 */
  mesh: any;
  /** 上次重绘 key。 */
  lastKey: string | undefined;

  /**
   * @param building - 建筑
   * @param camera - 相机
   * @param viewer - 观察者 Ref
   * @param alliances - 联盟
   * @param selectionModel - 选择模型
   */
  constructor(building: any, camera: any, viewer: any, alliances: any, selectionModel: any) {
    this.building = building;
    this.camera = camera;
    this.viewer = viewer;
    this.alliances = alliances;
    this.selectionModel = selectionModel;
  }

  /** 当前 mesh。 */
  get3DObject(): any {
    return this.mesh;
  }

  /** 惰性创建 Canvas + Sprite。 */
  create3DObject(): void {
    if (!this.mesh) {
      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      this.ctx = canvas.getContext("2d", { alpha: true });
      const texture = (this.texture = new THREE.Texture(canvas));
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.flipY = true;

      const geometry = SpriteUtils.createSpriteGeometry({
        texture,
        camera: this.camera,
        align: { x: 1, y: -1 },
        offset: { x: -Math.floor(45), y: -Math.floor(13) },
        scale: Coords.ISO_WORLD_SCALE,
      });
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        depthTest: false,
        flatShading: true,
      });
      const mesh = (this.mesh = new THREE.Mesh(geometry, material));
      mesh.matrixAutoUpdate = false;
      mesh.visible = false;
      // 摆到建筑地基中心上方
      mesh.position.x = (Coords.getWorldTileSize() * this.building.art.foundation.width) / 2;
      mesh.position.y = Coords.tileHeightToWorld((this.building.art.height + 1) / 2);
      mesh.position.z = (Coords.getWorldTileSize() * this.building.art.foundation.height) / 2;
      mesh.updateMatrix();
    }
  }

  /**
   * 脏检测重绘 + renderOrder。
   * @param _now - 时间戳（未用）
   */
  update(_now: number): void {
    if (this.mesh && this.ctx && this.texture) {
      const key = this.computeKey();
      if (!key) {
        this.lastKey = void 0;
        this.mesh.visible = false;
        return;
      }
      if (this.lastKey !== key) {
        this.lastKey = key;
        this.redraw();
        this.texture.needsUpdate = true;
      }
      const local = this.viewer.value;
      const securing = this.building.secureProgressTrait?.getSecuringPlayer();
      this.mesh.renderOrder =
        local && securing && this.alliances.haveSharedIntel(local, securing) ? 999999 : 999998;
      this.mesh.visible = true;
    }
  }

  /** 脏检测 key；非活跃返回 undefined。 */
  computeKey(): string | undefined {
    const trait = this.building.secureProgressTrait;
    const player = trait?.getSecuringPlayer();
    if (trait?.isActive() && player) {
      const hovered = this.selectionModel.isHovered();
      return [
        player.name,
        player.color.asHex(),
        this.getFillWidth(trait.getProgress()),
        hovered ? 1 : 0,
      ].join("_");
    }
  }

  /** 重绘进度条。 */
  redraw(): void {
    const ctx = this.ctx;
    const trait = this.building.secureProgressTrait;
    const player = trait?.getSecuringPlayer();
    if (ctx && trait?.isActive() && player) {
      const colorHex = player.color.asHexString();
      const fill = this.getFillWidth(trait.getProgress());
      const hovered = this.selectionModel.isHovered();
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      if (hovered) {
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        CanvasUtils.drawText(ctx, player.name, 0, 0, {
          color: colorHex,
          fontFamily: "'Fira Sans Condensed', 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', 'Source Han Sans SC', 'WenQuanYi Micro Hei', Arial, sans-serif",
          fontSize: 10,
          fontWeight: "500",
          textAlign: "center",
          width: CANVAS_W,
          paddingTop: 4,
        });
      } else {
        ctx.fillRect(4, 15, 82, 9);
      }
      // 槽底
      ctx.fillStyle = "rgba(15, 15, 15, 0.95)";
      ctx.fillRect(6, 17, 78, 5);
      // 边框
      ctx.fillStyle = colorHex;
      ctx.fillRect(5, 16, 80, 1);
      ctx.fillRect(5, 22, 80, 1);
      ctx.fillRect(5, 17, 1, 5);
      ctx.fillRect(84, 17, 1, 5);
      if (fill > 0) {
        ctx.fillRect(7, 18, fill, 3);
      }
    }
  }

  /**
   * 进度 → 填充宽（[1,76]）。
   * @param progress - [0,1]
   */
  getFillWidth(progress: number): number {
    return clamp(Math.ceil(FILL_MAX * progress), 1, FILL_MAX);
  }

  /** 释放资源。 */
  dispose(): void {
    this.texture?.dispose();
    this.mesh?.material?.dispose();
    this.mesh?.geometry.dispose();
  }
}
