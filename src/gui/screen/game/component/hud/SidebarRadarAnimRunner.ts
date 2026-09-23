/**
 * SidebarRadarAnimRunner — 雷达罩开合动画驱动。
 *
 * 由 gui/screen/game/component/hud/SidebarRadarAnimRunner.ts.js
 * 重写为 TS（行为完全一致）。
 */
import { IniSection } from "data/IniSection"; // 已转换
import { Animation, AnimationState } from "engine/Animation"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { Engine } from "engine/Engine"; // 已转换
import { BoxedVar } from "util/BoxedVar"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 雷达动画类型。 */
export enum AnimationType {
  /** 无动画 */
  None = 0,
  /** 关罩 */
  RadarOff = 1,
  /** 开罩 */
  RadarOn = 2,
}

/** 雷达罩动画运行器。 */
export class SidebarRadarAnimationRunner {
  /** 罩 SHP 文件。 */
  shpFile: any;
  /** 是否处于关闭态。 */
  closed = true;
  /** 当前动画类型。 */
  currentAnimationType = AnimationType.None;
  /** 进行中的动画。 */
  animation: Animation | undefined;

  /**
   * @param shpFile 罩资源
   */
  constructor(shpFile: any) {
    this.shpFile = shpFile;
    this.closed = true;
    this.currentAnimationType = AnimationType.None;
  }

  /**
   * 关罩动画。
   * @param instant 是否跳过
   */
  radarOff(instant = false): void {
    this.currentAnimationType = AnimationType.RadarOff;
    if (!instant) this.initAnimation();
  }

  /**
   * 开罩动画。
   * @param instant 是否跳过
   */
  radarOn(instant = false): void {
    this.currentAnimationType = AnimationType.RadarOn;
    if (!instant) this.initAnimation();
  }

  /** 用 shp + 引擎速度新建 Animation。 */
  initAnimation(): void {
    const section = new IniSection("");
    const props = new AnimProps(section, this.shpFile);
    this.animation = new Animation(props, new BoxedVar(Engine.UI_ANIM_SPEED));
  }

  /**
   * 推进动画；STOPPED 时收尾。
   * @param now 帧时间
   */
  tick(now: number): void {
    const anim = this.animation;
    const type = this.currentAnimationType;
    if (anim && type !== AnimationType.None) {
      switch (anim.getState()) {
        case AnimationState.STOPPED:
          break;
        case AnimationState.NOT_STARTED:
          anim.start(now);
        // falls through
        case AnimationState.RUNNING:
        default:
          anim.update(now);
      }
      if (anim.getState() === AnimationState.STOPPED) {
        this.closed = type === AnimationType.RadarOff;
        this.currentAnimationType = AnimationType.None;
      }
    }
  }

  /** 恒需更新（接口要求）。 */
  shouldUpdate(): boolean {
    return true;
  }

  /** 是否无进行中动画。 */
  isStopped(): boolean {
    return this.currentAnimationType === AnimationType.None;
  }

  /** 当前显示帧号。 */
  getCurrentFrame(): number {
    if (!this.animation) {
      return this.currentAnimationType === AnimationType.RadarOn
        ? this.shpFile.numImages - 1
        : 0;
    }
    let dir = this.currentAnimationType === AnimationType.RadarOff ? -1 : 1;
    if (this.currentAnimationType === AnimationType.None && this.closed) dir *= -1;
    let base = 0;
    if (dir === -1) base = this.animation.props.end;
    return base + dir * this.animation.getCurrentFrame();
  }
}
