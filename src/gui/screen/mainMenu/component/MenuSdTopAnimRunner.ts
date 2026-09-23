/**
 * MenuSdTopAnimRunner — 侧栏顶图滑入滑出帧计算（覆盖基类）。
 *
 * 无动画/DELAYED 时折叠=5、展开=0；否则 base=0（滑入 +5）。
 *
 * 由 gui/screen/mainMenu/component/MenuSdTopAnimRunner.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import {
  AnimationType,
  MenuSlotAnimationRunner,
} from "gui/screen/mainMenu/component/MenuSlotAnimationRunner"; // 孪生（本组内一并转换）
import { AnimationState } from "engine/Animation"; // 已转换

export class MenuSdTopAnimRunner extends MenuSlotAnimationRunner {
  /** 顶图帧：折叠 5 / 展开 0，动画中 base=0。 */
  getCurrentFrame(): number {
    if (
      this.currentAnimationType === AnimationType.None ||
      this.animation!.getState() === AnimationState.DELAYED
    )
      return this.collapsed ? 5 : 0;
    {
      var dir = this.currentAnimationType === AnimationType.SlideIn ? -1 : 1;
      let base = 0;
      if (-1 == dir) base += 5;
      return base + dir * this.animation!.getCurrentFrame();
    }
  }
}
