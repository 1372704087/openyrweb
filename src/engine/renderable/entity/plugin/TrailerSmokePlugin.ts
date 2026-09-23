/**
 * TrailerSmokePlugin — 拖尾烟雾（飞机坠毁/导弹尾迹/抛体 trailerAnim）。
 *
 * 首次离开初始位置后按对象类型选动画创建 TrailerSmokeFx（只创建一次）。
 *
 * 由 engine/renderable/entity/plugin/TrailerSmokePlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as TrailerSmokeFxModule from "engine/renderable/fx/TrailerSmokeFx"; // 孪生

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const TrailerSmokeFx: any = (TrailerSmokeFxModule as any).TrailerSmokeFx;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 拖尾烟雾插件。 */
export class TrailerSmokePlugin {
  /** 所属对象。 */
  gameObject: any;
  /** art。 */
  art: any;
  /** 战区。 */
  theater: any;
  /** 图像查找。 */
  imageFinder: any;
  /** 速度 Ref。 */
  gameSpeed: any;
  /** 渲染管理器。 */
  renderableManager?: any;
  /** 初始位置（onCreate 快照）。 */
  initialPosition?: any;
  /** 拖尾 FX。 */
  trailerFx?: any;

  /**
   * @param gameObject - 对象
   * @param art - art
   * @param theater - 战区
   * @param imageFinder - ImageFinder
   * @param gameSpeed - 速度 Ref
   */
  constructor(gameObject: any, art: any, theater: any, imageFinder: any, gameSpeed: any) {
    this.gameObject = gameObject;
    this.art = art;
    this.theater = theater;
    this.imageFinder = imageFinder;
    this.gameSpeed = gameSpeed;
  }

  /** 快照初始位置并注入渲染管理器。 */
  onCreate(renderableManager: any): void {
    this.initialPosition = this.gameObject.position.worldPosition.clone();
    this.renderableManager = renderableManager;
  }

  /** 每帧：离开初始点后创建一次性拖尾。 */
  update(_tick?: number): void {
    if (
      !this.renderableManager ||
      this.trailerFx ||
      this.gameObject.position.worldPosition.equals(this.initialPosition)
    ) {
      return;
    }
    if (this.gameObject.isAircraft()) {
      let animName: any;
      if (this.gameObject.rules.missileSpawn) {
        animName = this.art.getAnimation(this.gameObject.art.trailer || "V3TRAIL");
      } else if (this.gameObject.isCrashing) {
        animName = this.art.getAnimation("SGRYSMK1");
      }
      if (animName) {
        const shp = this.imageFinder.findByObjectArt(animName);
        const palette = this.theater.getPalette(animName.paletteType);
        const delay = this.gameObject.art.spawnDelay;
        this.trailerFx = new TrailerSmokeFx(
          this.gameObject.position.worldPosition,
          delay,
          animName,
          shp,
          palette,
          this.gameSpeed,
        );
        this.renderableManager.addEffect(this.trailerFx);
      }
    }
    let trailerName: string | undefined;
    if (this.gameObject.isProjectile() || this.gameObject.isDebris()) {
      trailerName = this.gameObject.isProjectile()
        ? this.gameObject.art.trailer
        : this.gameObject.rules.trailerAnim;
    }
    if (trailerName) {
      const anim = this.art.getAnimation(trailerName);
      const shp = this.imageFinder.findByObjectArt(anim);
      const palette = this.theater.getPalette(anim.paletteType);
      const delay = this.gameObject.isProjectile()
        ? this.gameObject.art.spawnDelay
        : this.gameObject.rules.trailerSeparation;
      this.trailerFx = new TrailerSmokeFx(
        this.gameObject.position.worldPosition,
        delay,
        anim,
        shp,
        palette,
        this.gameSpeed,
      );
      this.renderableManager.addEffect(this.trailerFx);
    }
  }

  /** 移除时结束拖尾。 */
  onRemove(_renderableManager?: any): void {
    this.renderableManager = void 0;
    this.trailerFx?.finishAndRemove();
  }

  /** dispose 拖尾。 */
  dispose(): void {
    this.trailerFx?.finishAndRemove();
  }
}
