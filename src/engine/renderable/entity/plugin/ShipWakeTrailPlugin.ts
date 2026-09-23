/**
 * ShipWakeTrailPlugin — 船尾航迹（水面移动时 TrailerSmokeFx 尾迹）。
 *
 * 跟踪 moving/submerged/inWater 状态：三者满足时启用尾迹，否则 disable；
 * Hover 悬浮按 hover.height 偏移尾迹原点。
 *
 * 由 engine/renderable/entity/plugin/ShipWakeTrailPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import * as TrailerSmokeFxModule from "engine/renderable/fx/TrailerSmokeFx"; // 孪生
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { LandType } from "game/type/LandType"; // 已转换
import { LocomotorType } from "game/type/LocomotorType"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const TrailerSmokeFx: any = (TrailerSmokeFxModule as any).TrailerSmokeFx;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 船尾航迹插件。 */
export class ShipWakeTrailPlugin {
  /** 所属舰船。 */
  gameObject: any;
  /** rules。 */
  rules: any;
  /** art。 */
  art: any;
  /** 战区。 */
  theater: any;
  /** 图像查找。 */
  imageFinder: any;
  /** 速度 Ref。 */
  gameSpeed: any;
  /** 尾迹锚点。 */
  trailPos: any;
  /** 渲染管理器。 */
  renderableManager?: any;
  /** 尾迹 FX。 */
  trailerFx?: any;
  /** 上帧移动。 */
  lastMoving?: boolean;
  /** 上帧下潜。 */
  lastSubmerged?: boolean;
  /** 上帧在水中。 */
  lastInWater?: boolean;

  /**
   * @param gameObject - 舰船
   * @param rules - rules
   * @param art - art
   * @param theater - 战区
   * @param imageFinder - ImageFinder
   * @param gameSpeed - 速度 Ref
   */
  constructor(gameObject: any, rules: any, art: any, theater: any, imageFinder: any, gameSpeed: any) {
    this.gameObject = gameObject;
    this.rules = rules;
    this.art = art;
    this.theater = theater;
    this.imageFinder = imageFinder;
    this.gameSpeed = gameSpeed;
    this.trailPos = new (THREE as any).Vector3();
  }

  /** 注入渲染管理器。 */
  onCreate(renderableManager: any): void {
    this.renderableManager = renderableManager;
  }

  /** 每帧：状态机开关尾迹。 */
  update(_tick?: number): void {
    if (!this.renderableManager) return;
    this.trailPos.copy(this.gameObject.position.worldPosition);
    this.trailPos.y = Coords.tileHeightToWorld(this.gameObject.tile.z);
    if (this.gameObject.rules.locomotor === LocomotorType.Hover) {
      const h = this.rules.general.hover.height;
      this.trailPos.x -= h;
      this.trailPos.z -= h;
    }
    const moving = this.gameObject.moveTrait.isMoving();
    const submerged = this.gameObject.submergibleTrait?.isSubmerged();
    const inWater = this.gameObject.zone === ZoneType.Water && this.gameObject.tile.landType === LandType.Water;
    const changed =
      moving !== this.lastMoving || submerged !== this.lastSubmerged || inWater !== this.lastInWater;
    if (changed) {
      this.lastMoving = moving;
      this.lastSubmerged = submerged;
      this.lastInWater = inWater;
      if (moving && !submerged && inWater) {
        if (this.trailerFx) {
          this.trailerFx.enable();
        } else {
          const anim = this.art.getAnimation(this.rules.audioVisual.wake);
          if (anim) {
            const shp = this.imageFinder.findByObjectArt(anim);
            const palette = this.theater.getPalette(anim.paletteType);
            const delay = this.gameObject.art.spawnDelay;
            this.trailerFx = new TrailerSmokeFx(this.trailPos, delay, anim, shp, palette, this.gameSpeed);
            this.renderableManager.addEffect(this.trailerFx);
          }
        }
      } else {
        this.trailerFx?.disable();
      }
    }
  }

  /** 移除时结束尾迹。 */
  onRemove(_renderableManager?: any): void {
    this.renderableManager = void 0;
    this.trailerFx?.finishAndRemove();
  }

  /** dispose 尾迹。 */
  dispose(): void {
    this.trailerFx?.finishAndRemove();
  }
}
