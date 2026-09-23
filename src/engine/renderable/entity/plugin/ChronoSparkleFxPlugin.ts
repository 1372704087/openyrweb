/**
 * ChronoSparkleFxPlugin — 超时空传送闪烁动画（transient Anim 循环/单次）。
 *
 * 跟踪 lastTeleportTick 与 warpedOut 状态变化：进入传送创建循环 sparkle，
 * 退出或普通瞬移播一次后结束。
 *
 * 由 engine/renderable/entity/plugin/ChronoSparkleFxPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 超时空闪烁插件。 */
export class ChronoSparkleFxPlugin {
  /** 所属单位。 */
  gameObject: any;
  /** 闪烁动画名。 */
  sparkleAnimName: string;
  /** 单位移动 trait（非单位为 undefined）。 */
  objMoveTrait?: any;
  /** 渲染管理器。 */
  renderableManager?: any;
  /** 当前闪烁 Anim。 */
  chronoSparkleAnim?: any;
  /** 上帧瞬移 tick。 */
  lastTeleport?: number;
  /** 上帧 warpedOut。 */
  lastWarpedOut?: boolean;

  /**
   * @param gameObject - 单位
   * @param sparkleAnimName - 动画名
   */
  constructor(gameObject: any, sparkleAnimName: string) {
    this.gameObject = gameObject;
    this.sparkleAnimName = sparkleAnimName;
    this.objMoveTrait = gameObject.isUnit() ? gameObject.moveTrait : void 0;
  }

  /** 注入渲染管理器。 */
  onCreate(renderableManager: any): void {
    this.renderableManager = renderableManager;
  }

  /** 每帧：按传送状态开关闪烁动画。 */
  update(): void {
    if (this.gameObject.isDestroyed || this.gameObject.isCrashing || !this.renderableManager) return;
    const teleport = this.objMoveTrait?.lastTeleportTick;
    const teleChanged = teleport !== this.lastTeleport;
    const warped = this.gameObject.warpedOutTrait.isActive();
    if (warped === this.lastWarpedOut && !teleChanged) return;
    this.lastTeleport = teleport;
    this.lastWarpedOut = warped;
    // 孪生：(lastWarpedOut=warped) || i ? 重建 : warped || endAnimationLoop
    // else 分支进入条件 warped===false && i===false → 等价 endAnimationLoop
    if (warped || teleChanged) {
      this.chronoSparkleAnim?.endAnimationLoop();
      this.chronoSparkleAnim = this.renderableManager.createTransientAnim(this.sparkleAnimName, (anim: any) => {
        anim.extraOffset = { x: 0, y: Coords.ISO_TILE_SIZE / 2 };
        anim.setPosition(this.gameObject.position.worldPosition.clone());
        anim.create3DObject();
        anim.getAnimProps().loopCount = warped ? -1 : 1;
      });
    } else {
      this.chronoSparkleAnim?.endAnimationLoop();
    }
  }

  /** 移除时结束动画。 */
  onRemove(): void {
    this.renderableManager = void 0;
    this.chronoSparkleAnim?.endAnimationLoop();
  }

  /** 无额外资源。 */
  dispose(): void {}
}
