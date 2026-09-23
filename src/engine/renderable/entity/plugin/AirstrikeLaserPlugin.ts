/**
 * AirstrikeLaserPlugin — Boris 空袭指示激光（持续红光束）。
 *
 * 读取 airstrikeTrait 目标状态，创建/更新 DesignatorLaserFx 端点；
 * 模式镜像 MindControlLinkPlugin/MagnetronBeamPlugin。
 *
 * 由 engine/renderable/entity/plugin/AirstrikeLaserPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as DesignatorLaserFxModule from "engine/renderable/fx/DesignatorLaserFx"; // 孪生

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const DesignatorLaserFx: any = (DesignatorLaserFxModule as any).DesignatorLaserFx;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 空袭指示激光插件。
 *
 * 由 engine/renderable/entity/plugin/AirstrikeLaserPlugin.ts.js 重写为 TS。
 */
export class AirstrikeLaserPlugin {
  /** 源单位（Boris）。 */
  source: any;
  /** 指示激光 FX。 */
  laser?: any;
  /** 渲染管理器。 */
  renderableManager?: any;

  /** @param source - 发起空袭的单位 */
  constructor(source: any) {
    this.source = source;
    this.laser = void 0;
    this.renderableManager = void 0;
  }

  /** 注入渲染管理器。 */
  onCreate(rm: any): void {
    this.renderableManager = rm;
  }

  /** 每帧：同步激光存在与端点。 */
  update(): void {
    const src = this.source;
    if (!src || src.isDestroyed || src.isCrashing || src.isDisposed) {
      this.disposeLaser();
      return;
    }
    const at = src.airstrikeTrait;
    // Keep laser as long as a target exists, even if active=false (post-strike cooldown).
    // The target is cleared only when the building is destroyed or Boris cancels/moves.
    if (!at || (!at.targetObject && !at.targetTile)) {
      this.disposeLaser();
      return;
    }
    // Compute source position: the unit's configured firing position.
    // The airstrike is called with the secondary weapon (Flare), so use
    // SecondaryFireFLH first; if it is not defined, fall back to the
    // primary weapon's PrimaryFireFLH. The FLH is rotated by the unit's
    // facing, exactly like the muzzle position the weapon uses when
    // firing. Mirrors MagnetronBeamPlugin's FLH computation.
    const a = src.position.worldPosition.clone();
    try {
      let flh = src.art && src.art.secondaryFireFlh;
      if (!flh || !(flh.forward || flh.lateral || flh.vertical)) {
        flh = src.art && src.art.primaryFireFlh;
      }
      if (flh && (flh.forward || flh.lateral || flh.vertical)) {
        const muzzleFacing = src.turretTrait ? src.turretTrait.facing : src.direction;
        const rad = (muzzleFacing * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const lx = flh.lateral;
        const fy = flh.forward;
        // FLH offset: leptons → world (X/Z 1:1, Y is world units).
        a.x += lx * cos - fy * sin;
        a.z += -(lx * sin + fy * cos);
        a.y += flh.vertical;
      } else {
        // No FLH configured — fall back to a chest-height offset.
        a.y += 50;
      }
    } catch (_err) {
      a.y += 50;
    }

    // Compute target position: the targeted building's world position.
    const targetObj = at.targetObject;
    let b: any;
    if (targetObj && !targetObj.isDestroyed) {
      b = targetObj.position.worldPosition.clone();
      // Add a slight vertical offset to hit the building center rather than ground.
      b.y += 50;
    } else if (at.targetTile && at.targetTile.rx !== void 0) {
      b = new (THREE as any).Vector3((at.targetTile.rx + 0.5) * 24, 0, (at.targetTile.ry + 0.5) * 24);
    } else {
      this.disposeLaser();
      return;
    }

    if (!this.laser) {
      const cam = this.renderableManager && this.renderableManager.camera;
      if (!cam) return;
      // Red color for the Soviet airstrike designator.
      const color = new (THREE as any).Color(1, 0, 0);
      this.laser = new DesignatorLaserFx(cam, a, b, color);
      this.renderableManager && this.renderableManager.addEffect(this.laser);
    } else {
      // Update endpoints — the DesignatorLaserFx reads from these Vector3s each frame.
      this.laser.sourcePos.copy(a);
      this.laser.targetPos.copy(b);
    }
  }

  /** 移除时清理。 */
  onRemove(): void {
    this.renderableManager = void 0;
    this.disposeLaser();
  }

  /** dispose 激光。 */
  dispose(): void {
    this.disposeLaser();
  }

  /** 移除并 dispose 激光。 */
  disposeLaser(): void {
    if (this.laser) {
      this.laser.remove();
      this.laser.dispose();
      this.laser = void 0;
    }
  }
}
