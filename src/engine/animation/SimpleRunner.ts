/**
 * SimpleRunner — 基于 Animation 的简易动画驱动器。
 *
 * 由 engine/animation/SimpleRunner.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Animation, AnimationState } from "engine/Animation"; // 已转换

/**
 * 简易动画驱动器。
 * tick 时按状态推进 Animation；STOPPED 后 shouldUpdate 返回 false。
 */
export class SimpleRunner {
  /** 被驱动的动画（可为 undefined，tick/getCurrentFrame 直接访问） */
  animation!: Animation;

  /**
   * 推进一帧。
   * @param e - 当前时间戳（ms）
   */
  tick(e: number): void {
    const t = this.animation;
    if (t) {
      switch (t.getState()) {
        case AnimationState.STOPPED:
          return;
        case AnimationState.NOT_STARTED:
          t.start(e);
        // 孪生: fallthrough — start 后立即 update
        case AnimationState.RUNNING:
        default:
          t.update(e);
      }
    }
  }

  /** 当前帧号（转发到 Animation）。 */
  getCurrentFrame(): number {
    return this.animation.getCurrentFrame();
  }

  /** 动画未 STOPPED 时仍需更新。 */
  shouldUpdate(): boolean {
    return this.animation.getState() !== AnimationState.STOPPED;
  }
}
