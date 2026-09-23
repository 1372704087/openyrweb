/**
 * MoveSoundFxPlugin — 移动/旋转循环音效（悬浮攻击/旋翼/移动状态驱动）。
 *
 * 移动条件翻转时 playEffect 循环音；停止时 stop 并清句柄。
 *
 * 由 engine/renderable/entity/plugin/MoveSoundFxPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 移动音效插件。 */
export class MoveSoundFxPlugin {
  /** 所属对象。 */
  gameObject: any;
  /** 移动音效 key。 */
  moveSound: any;
  /** 世界音效。 */
  worldSound: any;
  /** 上帧是否移动/旋转。 */
  lastMovingOrRotating = false;
  /** 当前循环句柄。 */
  soundHandle?: any;

  /**
   * @param gameObject - 对象
   * @param moveSound - 音效 key
   * @param worldSound - WorldSound
   */
  constructor(gameObject: any, moveSound: any, worldSound: any) {
    this.gameObject = gameObject;
    this.moveSound = moveSound;
    this.worldSound = worldSound;
    this.lastMovingOrRotating = false;
  }

  /** 无初始化。 */
  onCreate(): void {}

  /** 每帧：按移动状态开关循环音。 */
  update(): void {
    if (this.gameObject.isDestroyed || this.gameObject.isCrashing) return;
    const moving =
      !this.gameObject.warpedOutTrait.isActive() &&
      !!(
        (!this.gameObject.rules.balloonHover &&
          this.gameObject.rules.hoverAttack &&
          this.gameObject.zone === ZoneType.Air) ||
        this.gameObject.spinVelocity ||
        (!this.gameObject.moveTrait.isIdle() && !this.gameObject.moveTrait.isWaiting())
      );
    if (moving === this.lastMovingOrRotating) return;
    this.lastMovingOrRotating = moving;
    if (moving) {
      if (this.soundHandle && this.soundHandle.isPlaying()) return;
      this.soundHandle = this.worldSound.playEffect(
        this.moveSound,
        this.gameObject,
        this.gameObject.owner,
        0.35,
      );
    } else if (this.soundHandle?.isLoop) {
      this.soundHandle.stop();
      this.soundHandle = void 0;
    }
  }

  /** 移除时停音。 */
  onRemove(): void {
    this.soundHandle?.stop();
  }

  /** dispose 停音。 */
  dispose(): void {
    this.soundHandle?.stop();
  }
}
