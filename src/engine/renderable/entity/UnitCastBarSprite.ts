/**
 * UnitCastBarSprite — 单位施法进度条（Canvas 纹理 Sprite）。
 *
 * 2px 高 Canvas 条：底半透明黑 + 青色填充；create3DObject 用
 * SpriteUtils 建朝向相机的 Sprite 几何；update 在 isCasting 时按
 * progress 重绘，否则隐藏 mesh。
 *
 * 由 engine/renderable/entity/UnitCastBarSprite.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import { Coords } from "game/Coords"; // 已转换
import { clamp } from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const SpriteUtils: any = (SpriteUtilsModule as any).SpriteUtils;

/**
 * 施法进度条 Sprite。
 * 独立于容器 update；无 setContainer/不注册到特效容器。
 */
export class UnitCastBarSprite {
  /** 施法进度 trait。 */
  castProgressTrait: any;
  /** 相机。 */
  camera: any;
  /** 条总宽（px）。 */
  barWidth: number;
  /** 屏幕偏移 X。 */
  screenOffsetX: number;
  /** 屏幕偏移 Y。 */
  screenOffsetY: number;
  /** 世界偏移 Y。 */
  worldOffsetY: number;

  /** Canvas 2D 上下文。 */
  ctx: any;
  /** Canvas 纹理。 */
  texture: any;
  /** Sprite 网格。 */
  mesh: any;
  /** 上一帧填充宽度（undefined=不显示）。 */
  lastBarWidth: number | undefined;

  /**
   * @param castProgressTrait - 进度 trait
   * @param camera - 相机
   * @param barWidth - 条宽
   * @param screenOffsetX - 屏偏 X
   * @param screenOffsetY - 屏偏 Y
   * @param worldOffsetY - 世界 Y 偏移
   */
  constructor(
    castProgressTrait: any,
    camera: any,
    barWidth: number,
    screenOffsetX: number,
    screenOffsetY: number,
    worldOffsetY: number,
  ) {
    this.castProgressTrait = castProgressTrait;
    this.camera = camera;
    this.barWidth = barWidth;
    this.screenOffsetX = screenOffsetX;
    this.screenOffsetY = screenOffsetY;
    this.worldOffsetY = worldOffsetY;
  }

  /** 当前 mesh。 */
  get3DObject(): any {
    return this.mesh;
  }

  /** 惰性创建 Canvas + Texture + Sprite Mesh。 */
  create3DObject(): void {
    if (!this.mesh) {
      const canvas = document.createElement("canvas");
      canvas.width = this.barWidth + 2;
      canvas.height = 4;
      this.ctx = canvas.getContext("2d", { alpha: true });
      const texture = (this.texture = new THREE.Texture(canvas));
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.flipY = true;

      const geometry = SpriteUtils.createSpriteGeometry({
        texture,
        camera: this.camera,
        align: { x: 0, y: -1 },
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
      mesh.renderOrder = 999998;

      const off = Coords.screenDistanceToWorld(this.screenOffsetX, this.screenOffsetY);
      mesh.position.x = off.x;
      mesh.position.y = this.worldOffsetY;
      mesh.position.z = off.y;
      mesh.updateMatrix();
      mesh.visible = false;
    }
  }

  /**
   * 按施法状态刷新可见性与填充。
   * @param _now - 时间戳（未使用，与孪生一致）
   */
  update(_now: number): void {
    if (this.mesh && this.ctx && this.texture) {
      const trait = this.castProgressTrait;
      const fill = trait.isCasting() ? this.getFillWidth(trait.getProgress()) : void 0;
      if (this.lastBarWidth !== fill) {
        this.lastBarWidth = fill;
        if (fill !== void 0) {
          this.redraw(fill);
          this.texture.needsUpdate = true;
        }
        this.mesh.visible = fill !== void 0;
      }
    }
  }

  /**
   * 重绘进度条。
   * @param fillWidth - 填充像素宽
   */
  redraw(fillWidth: number): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.barWidth + 2, 4);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.barWidth + 2, 4);
    if (fillWidth > 0) {
      this.ctx.fillStyle = "cyan";
      this.ctx.fillRect(1, 1, fillWidth, 2);
    }
  }

  /**
   * 进度 → 填充像素（[1, barWidth]）。
   * @param progress - [0,1]
   */
  getFillWidth(progress: number): number {
    return clamp(Math.ceil(this.barWidth * progress), 1, this.barWidth);
  }

  /** 释放纹理与网格。 */
  dispose(): void {
    this.texture?.dispose();
    this.mesh?.material?.dispose();
    this.mesh?.geometry.dispose();
  }
}
