/**
 * DamageSmokePlugin — 受损冒烟（health<50 创建 DamageSmokeFx，恢复/超时清理）。
 *
 * 状态翻转时创建/销毁 SGRYSMK1 烟雾；持续 80000/gameSpeed 后自动结束。
 *
 * 由 engine/renderable/entity/plugin/DamageSmokePlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as DamageSmokeFxModule from "engine/renderable/fx/DamageSmokeFx"; // 孪生

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const DamageSmokeFx: any = (DamageSmokeFxModule as any).DamageSmokeFx;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 受损冒烟插件。 */
export class DamageSmokePlugin {
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
  /** 上帧是否受损。 */
  lastDamaged?: boolean;
  /** 烟雾 FX。 */
  smokeFx?: any;
  /** 烟雾起始 tick。 */
  smokeStartTime?: number;

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

  /** 注入渲染管理器。 */
  onCreate(renderableManager: any): void {
    this.renderableManager = renderableManager;
  }

  /**
   * 每帧：受损状态翻转与超时清理。
   * @param tick - 当前 tick
   */
  update(tick: number): void {
    if (!this.renderableManager) return;
    const damaged = this.gameObject.healthTrait.health < 50;
    // 孪生：(damaged === lastDamaged || isDestroyed) 短路跳过状态机
    if (damaged !== this.lastDamaged && !this.gameObject.isDestroyed) {
      this.lastDamaged = damaged;
      if (damaged) {
        if (!this.smokeFx) {
          this.smokeStartTime = tick;
          const anim = this.art.getAnimation("SGRYSMK1");
          if (anim) {
            const shp = this.imageFinder.findByObjectArt(anim);
            const palette = this.theater.getPalette(anim.paletteType);
            this.smokeFx = new DamageSmokeFx(this.gameObject, anim, shp, palette, this.gameSpeed);
            this.renderableManager.addEffect(this.smokeFx);
          }
        }
      } else {
        this.disposeSmokeFx();
      }
    }
    if (
      this.smokeFx &&
      this.smokeStartTime &&
      tick - this.smokeStartTime >= 8e4 / this.gameSpeed.value
    ) {
      this.disposeSmokeFx();
    }
  }

  /** 结束并清理烟雾。 */
  disposeSmokeFx(): void {
    if (this.smokeFx) {
      this.smokeFx.finishAndRemove();
      this.smokeFx = void 0;
    }
  }

  /** 移除时清理。 */
  onRemove(_renderableManager?: any): void {
    this.renderableManager = void 0;
    this.disposeSmokeFx();
  }

  /** dispose 烟雾。 */
  dispose(): void {
    this.disposeSmokeFx();
  }
}
