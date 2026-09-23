/**
 * MenuSlotAnimationRunner — 主菜单侧栏按钮滑入/滑出动画驱动。
 *
 * AnimationType：None/SlideIn/SlideOut；MenuButtonState：Hidden…Flashing。
 * tick 按 delayFrames 启动 Animation；getCurrentFrame 按折叠态与按钮态
 * 映射 SHP 帧号（含 flashingFrame 500ms 闪烁）。
 *
 * 由 gui/screen/mainMenu/component/MenuSlotAnimationRunner.ts.js
 * 重写为 TS（行为完全一致，含 switch fall-through）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { IniSection } from "data/IniSection"; // 已转换
import { ShpFile } from "data/ShpFile"; // 已转换
import { Animation, AnimationState } from "engine/Animation"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { Engine } from "engine/Engine"; // 已转换
import { BoxedVar } from "util/BoxedVar"; // 已转换

/** 滑入滑出动画阶段。 */
export enum AnimationType {
  /** 无。 */
  None = 0,
  /** 滑入。 */
  SlideIn = 1,
  /** 滑出。 */
  SlideOut = 2,
}

/** 按钮视觉状态。 */
export enum MenuButtonState {
  /** 隐藏。 */
  Hidden = 0,
  /** 未点亮。 */
  Unlit = 1,
  /** 常态。 */
  Normal = 2,
  /** 激活。 */
  Active = 3,
  /** 闪烁。 */
  Flashing = 4,
}

export class MenuSlotAnimationRunner {
  /** 动画起始延迟帧。 */
  delayFrames: number;
  /** 当前按钮状态。 */
  buttonState = MenuButtonState.Hidden;
  /** 侧栏是否折叠（默认 true）。 */
  collapsed = true;
  /** 当前滑入滑出阶段。 */
  currentAnimationType = AnimationType.None;
  /** 闪烁帧（2 或 4）。 */
  flashingFrame = 2;
  /** 运行中的 Animation。 */
  animation?: Animation;

  constructor(delayFrames: any = 0) {
    this.delayFrames = delayFrames;
  }

  /** 切到滑入。 */
  slideIn(): void {
    this.currentAnimationType = AnimationType.SlideIn;
    this.initAnimation();
  }

  /** 切到滑出。 */
  slideOut(): void {
    this.currentAnimationType = AnimationType.SlideOut;
    this.initAnimation();
  }

  /** 空 Ini + 空 Shp，loopEnd=5 的 Animation。 */
  initAnimation(): void {
    var section = new IniSection("");
    let props = new AnimProps(section, new ShpFile());
    props.loopEnd = 5;
    section = section as any;
    this.animation = new Animation(
      props,
      new BoxedVar(Engine.UI_ANIM_SPEED),
    );
  }

  /** 推进动画/闪烁；NOT_STARTED fall-through 到 update。 */
  tick(now: number): void {
    let anim = this.animation;
    var type = this.currentAnimationType;
    if (this.buttonState === MenuButtonState.Flashing)
      this.flashingFrame = Math.floor(now / 500) % 2 == 0 ? 2 : 4;
    if (anim && type !== AnimationType.None) {
      switch (anim.getState()) {
        case AnimationState.STOPPED:
          break;
        case AnimationState.NOT_STARTED:
          anim.start(now, this.delayFrames);
        // fall through（孪生无 break）
        case AnimationState.RUNNING:
        default:
          anim.update(now);
      }
      if (anim.getState() === AnimationState.STOPPED) {
        this.collapsed = type === AnimationType.SlideOut;
        this.currentAnimationType = AnimationType.None;
      }
    }
  }

  /** 恒 true（孪生）。 */
  shouldUpdate(): boolean {
    return true;
  }

  /** 动画阶段已结束。 */
  isStopped(): boolean {
    return this.currentAnimationType === AnimationType.None;
  }

  /** 当前应显示的 SHP 帧号。 */
  getCurrentFrame(): number {
    if (
      this.currentAnimationType !== AnimationType.None &&
      this.animation!.getState() !== AnimationState.DELAYED
    ) {
      var dir = this.currentAnimationType === AnimationType.SlideIn ? -1 : 1;
      let base = this.buttonState !== MenuButtonState.Hidden ? 5 : 11;
      if (-1 == dir) base += 5;
      return base + dir * this.animation!.getCurrentFrame();
    }
    let frame;
    if (this.collapsed) frame = this.buttonState === MenuButtonState.Hidden ? 16 : 10;
    else if (this.buttonState === MenuButtonState.Hidden) frame = 0;
    else if (this.buttonState === MenuButtonState.Unlit) frame = 1;
    else if (this.buttonState === MenuButtonState.Normal) frame = 2;
    else if (this.buttonState === MenuButtonState.Active) frame = 4;
    else {
      if (this.buttonState !== MenuButtonState.Flashing)
        throw new Error(`Unknown buttonState "${this.buttonState}"`);
      frame = this.flashingFrame;
    }
    return frame;
  }
}
