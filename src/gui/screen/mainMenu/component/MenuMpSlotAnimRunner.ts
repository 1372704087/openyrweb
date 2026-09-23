/**
 * MenuMpSlotAnimRunner — 多人槽位滑入滑出帧计算（覆盖基类）。
 *
 * 无动画/DELAYED 时折叠=6、展开=0；否则 base=1（滑入 +5）。
 *
 * 由 gui/screen/mainMenu/component/MenuMpSlotAnimRunner.ts.js
 * 重写为 TS（行为完全一致）。
 */
import {
  AnimationType,
  MenuSlotAnimationRunner,
} from "gui/screen/mainMenu/component/MenuSlotAnimationRunner"; // 孪生（本组内一并转换）
import { AnimationState } from "engine/Animation"; // 已转换

export class MenuMpSlotAnimRunner extends MenuSlotAnimationRunner {
  /** 多人槽位帧：折叠 6 / 展开 0，动画中 base=1。 */
  getCurrentFrame(): number {
    if (
      this.currentAnimationType === AnimationType.None ||
      this.animation!.getState() === AnimationState.DELAYED
    )
      return this.collapsed ? 6 : 0;
    {
      var dir = this.currentAnimationType === AnimationType.SlideIn ? -1 : 1;
      let base = 1;
      if (-1 == dir) base += 5;
      return base + dir * this.animation!.getCurrentFrame();
    }
  }
}
