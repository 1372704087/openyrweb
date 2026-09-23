/**
 * HighlightAnimRunner — 高亮脉冲动画驱动器（SimpleRunner 子类）。
 *
 * 构造时用 dummy IniSection/ShpFile 搭 AnimProps（默认 rate=0.5、loopEnd=2、
 * loopCount=2），start 后立即 stop。animate(n) 改 loopCount 并 reset；
 * getValue = (1-当前帧)*maxAmount，用于高亮强度。
 *
 * 由 engine/renderable/entity/HighlightAnimRunner.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { SimpleRunner } from "engine/animation/SimpleRunner"; // 已转换
import { Animation } from "engine/Animation"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { IniSection } from "data/IniSection"; // 已转换
import { ShpFile } from "data/ShpFile"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 高亮脉冲驱动器。
 * 与 InvulnerableAnimRunner 同构，但 getValue 为线性衰减而非 sin。
 */
export class HighlightAnimRunner extends SimpleRunner {
  /** 高亮最大强度。 */
  maxAmount: number;

  /**
   * @param gameSpeed - 游戏速度（Animation 第二参）
   * @param maxAmount - 最大强度（默认 0.5）
   * @param frames - 高亮帧数 → loopEnd=frames-1（默认 2）
   * @param rate - 动画速率（默认 5）
   */
  constructor(gameSpeed: any, maxAmount: number = 0.5, frames: number = 2, rate: number = 5) {
    super();
    this.maxAmount = maxAmount;
    const props = new AnimProps(new IniSection("dummy"), new ShpFile());
    props.rate = rate;
    props.loopEnd = frames - 1;
    props.loopCount = 2;
    this.animation = new Animation(props, gameSpeed);
    this.animation.stop();
  }

  /**
   * 重置并设定循环次数。
   * @param loops - 循环次数
   */
  animate(loops: number): void {
    this.animation.props.loopCount = loops;
    this.animation.reset();
  }

  /** 当前高亮值 = (1-frame)*maxAmount。 */
  getValue(): number {
    return (1 - this.getCurrentFrame()) * this.maxAmount;
  }
}
