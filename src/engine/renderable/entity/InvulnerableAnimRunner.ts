/**
 * InvulnerableAnimRunner — 无敌脉冲动画驱动器（SimpleRunner 子类）。
 *
 * dummy AnimProps：loopEnd=steps、loopCount=-1 无限循环、默认 rate=10。
 * getValue 用 sin 在 minAmount~maxAmount 间振荡（步进 steps 控制周期）。
 *
 * 由 engine/renderable/entity/InvulnerableAnimRunner.ts.js 重写为 TS（行为完全一致）。
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
 * 无敌脉冲驱动器。
 * 无限循环正弦波，animate() 仅 reset。
 */
export class InvulnerableAnimRunner extends SimpleRunner {
  /** 振荡下界。 */
  minAmount: number;
  /** 振荡上界。 */
  maxAmount: number;
  /** 一个周期的步数。 */
  steps: number;

  /**
   * @param gameSpeed - 游戏速度
   * @param minAmount - 下界（默认 -0.75）
   * @param maxAmount - 上界（默认 -0.5）
   * @param steps - 步数（默认 10，同时作 loopEnd）
   * @param rate - 动画速率（默认 10）
   */
  constructor(
    gameSpeed: any,
    minAmount: number = -0.75,
    maxAmount: number = -0.5,
    steps: number = 10,
    rate: number = 10,
  ) {
    super();
    this.minAmount = minAmount;
    this.maxAmount = maxAmount;
    this.steps = steps;
    const props = new AnimProps(new IniSection("dummy"), new ShpFile());
    props.rate = rate;
    props.loopEnd = steps;
    props.loopCount = -1;
    this.animation = new Animation(props, gameSpeed);
    this.animation.stop();
  }

  /** 重置到起点。 */
  animate(): void {
    this.animation.reset();
  }

  /** sin 插值当前值。 */
  getValue(): number {
    return (
      this.minAmount +
      ((1 + Math.sin((2 * Math.PI * this.getCurrentFrame()) / this.steps)) / 2) *
        (this.maxAmount - this.minAmount)
    );
  }
}
