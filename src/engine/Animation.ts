/**
 * Animation — 帧动画状态机（基于 AnimProps 的 start/pause/update 推进）。
 *
 * 由 engine/Animation.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { getRandomInt } from "util/math"; // 已转换
import type { AnimProps } from "engine/AnimProps"; // 已转换

/** 动画播放状态。 */
export enum AnimationState {
  /** 尚未 start */
  NOT_STARTED = 0,
  /** 播放中 */
  RUNNING = 1,
  /** 已停止（播放结束或显式 stop） */
  STOPPED = 2,
  /** 等待延迟帧 */
  DELAYED = 3,
  /** 已暂停 */
  PAUSED = 4,
}

/** 速度倍率源（仅读取 value 字段，与孪生 speed.value 一致）。 */
export interface AnimSpeedLike {
  value: number;
}

/**
 * 单条动画实例。
 * 持有帧号 / 循环号 / 延迟帧，并按 update(deltaMs) 推进。
 */
export class Animation {
  /** 动画属性（帧区间、速率、循环） */
  props: AnimProps;
  /** 当前状态 */
  state: AnimationState;
  /** endLoop() 是否被调用（本圈结束后提前收尾） */
  endLoopFlag: boolean;
  /** endLoopAndPlayToEnd() 是否被调用（收尾后播到 end） */
  playToEndFlag: boolean;
  /** 速度倍率 */
  speed: AnimSpeedLike;
  /** start 时记录的基准时间戳（ms） */
  time!: number;
  /** 当前帧号 */
  frameNo!: number;
  /** 已完成循环次数 */
  loopNo!: number;
  /** 剩余延迟帧 */
  delayFrames!: number;

  /**
   * @param props - 动画属性
   * @param speed - 速度倍率对象（含 value）
   */
  constructor(props: AnimProps, speed: AnimSpeedLike) {
    this.props = props;
    this.state = AnimationState.NOT_STARTED;
    this.endLoopFlag = false;
    this.playToEndFlag = false;
    this.speed = speed;
  }

  /** 当前状态。 */
  getState(): AnimationState {
    return this.state;
  }

  /**
   * 启动（或重启）动画。
   * @param e - 当前时间戳（ms）
   * @param t - 启动前延迟帧数（0 则直接 RUNNING，否则 DELAYED）
   */
  start(e: number, t: number = 0): void {
    this.time = e;
    this.frameNo = this.props.reverse ? this.props.end : this.props.start;
    this.loopNo = 0;
    this.delayFrames = t;
    this.state = t ? AnimationState.DELAYED : AnimationState.RUNNING;
  }

  /** 仅在 RUNNING 时切换为 PAUSED。 */
  pause(): void {
    if (this.state === AnimationState.RUNNING) {
      this.state = AnimationState.PAUSED;
    }
  }

  /** 仅在 PAUSED 时恢复 RUNNING。 */
  unpause(): void {
    if (this.state === AnimationState.PAUSED) {
      this.state = AnimationState.RUNNING;
    }
  }

  /** 状态重置为 NOT_STARTED（不重置帧号）。 */
  reset(): void {
    this.state = AnimationState.NOT_STARTED;
  }

  /** 显式停止。 */
  stop(): void {
    this.state = AnimationState.STOPPED;
  }

  /**
   * 按时间差推进动画。
   * @param e - 当前时间戳（ms）
   */
  update(e: number): void {
    const t = (e - this.time) / 1000;
    let i = this.props.rate * this.speed.value;
    i = Math.floor(t * i);
    // 步长 < 1 或 PAUSED 时不推进（但步长 >=1 时先刷新 time）
    if (!(i < 1)) {
      this.time = e;
      if (this.state !== AnimationState.PAUSED) {
        if (this.delayFrames > 0) {
          this.delayFrames = Math.max(0, this.delayFrames - i);
          if (this.delayFrames > 0) {
            this.state = AnimationState.DELAYED;
            return;
          }
          this.state = AnimationState.RUNNING;
        }
        if (this.computeNextFrame(i)) {
          this.state = AnimationState.STOPPED;
        }
      }
    }
  }

  /** 请求在当前圈结束后结束循环（与 playToEnd 联动可播到 end）。 */
  endLoop(): void {
    this.endLoopFlag = true;
  }

  /** 请求结束循环并继续播到 end 帧。 */
  endLoopAndPlayToEnd(): void {
    this.endLoopFlag = true;
    this.playToEndFlag = true;
  }

  /** 把帧号拨回当前圈起点（reverse 时拨到圈尾）。 */
  rewind(): void {
    if (this.props.reverse) {
      this.frameNo = this.loopNo ? this.props.loopEnd : this.props.end;
    } else {
      this.frameNo = this.loopNo ? this.props.loopStart : this.props.start;
    }
  }

  /** 当前帧号。 */
  getCurrentFrame(): number {
    return this.frameNo;
  }

  /**
   * 按步长 e 推进帧号，处理循环 / 结束 / 随机循环延迟。
   * @param e - 待推进帧步长（>=1 的整数）
   * @returns 是否已到动画终点（应置为 STOPPED）
   */
  computeNextFrame(e: number): boolean {
    let t = this.frameNo;
    while (e > 0) {
      // 目标边界：endLoop 且 playToEnd 时用 start/end，否则用 loopStart/loopEnd
      const i =
        this.endLoopFlag && this.playToEndFlag
          ? this.props.reverse
            ? this.props.start
            : this.props.end
          : this.props.reverse
            ? this.props.loopStart
            : this.props.loopEnd;

      if ((!this.props.reverse && t + e <= i) || (this.props.reverse && t - e >= i)) {
        t += this.props.reverse ? -e : e;
        break;
      }

      // 已完成指定循环次数 → 停在边界
      if (this.props.loopCount !== -1 && this.loopNo >= this.props.loopCount - 1) {
        this.frameNo = i;
        return true;
      }

      // endLoop 标志只消耗一次；孪生 `return !(flag = false)` → 返回 true（update 置 STOPPED）
      if (this.endLoopFlag) {
        this.endLoopFlag = false;
        return true;
      }

      // 扣除到边界 + 1 帧的步长，跳到圈起点，圈号 +1
      e -= 1 + (this.props.reverse ? t - i : i - t);
      t = this.props.reverse ? this.props.loopEnd : this.props.loopStart;
      this.loopNo++;
      if (this.props.randomLoopDelay) {
        this.state = AnimationState.DELAYED;
        this.delayFrames = getRandomInt(
          this.props.randomLoopDelay[0],
          this.props.randomLoopDelay[1],
        );
      }
    }
    this.frameNo = t;
    return false;
  }
}
