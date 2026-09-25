/**
 * AudioLoop — 循环随机片段音频填充器。
 *
 * 维护一条时间线 timePointer，反复从 buffers 中随机取样入队播放，
 * 保持至少 ~0.1s 缩略与 3 个在途 item；support attack（首段固定）与
 * decay（尾段固定）的随机序列；remainingLoops 限制总循环次数。
 * stop() 时若有 decay，则只停掉非末段 item 并把最后一段重排到衰减点。
 *
 * 由 engine/sound/AudioLoop.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { getRandomInt } from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 一条已入队的音频 item。 */
export interface AudioLoopItem {
  /** 计划开始时间（audioContext 时间轴）。 */
  startTime: number;
  /** 时长（秒，已按 rate 折算）。 */
  duration: number;
  /** 播放控制句柄。 */
  handle: any;
}

/** playBuffer 回调：按给定参数启动一个缓冲并返回句柄与源节点。 */
export type AudioLoopPlayBuffer = (
  buffer: any,
  when: number,
  volume: number,
  pan: number,
  rate: number,
) => { handle: any; source: any };

export class AudioLoop {
  /** 音频上下文。 */
  audioContext: any;
  /** 音量（0..1）。 */
  volume: number;
  /** 声像（-1..1）。 */
  pan: number;
  /** 播放速率。 */
  rate: number;
  /** 随机延迟区间（毫秒）；undefined 表示无延迟。 */
  delayMs?: { min: number; max: number };
  /** attack 段长度（首段从头取，后续从 1..len-1-decay 随机）；孪生亦可传入布尔。 */
  attack?: number | boolean;
  /** decay 段长度（尾段固定为最后一个缓冲）；孪生亦可传入布尔。 */
  decay?: number | boolean;
  /** 实际播放回调。 */
  playBuffer: AudioLoopPlayBuffer;
  /** 恒为 true：标识这是循环类。 */
  readonly isLoop = true;
  /** 在途播放项。 */
  items: AudioLoopItem[] = [];
  /** 是否处于播放态。 */
  playing = false;
  /** 剩余可入队循环次数（Infinity 表示不限）。 */
  remainingLoops: number;
  /** 当前可用的缓冲列表（setBuffers 写入）。 */
  buffers?: any[];
  /** 时间线游标。 */
  timePointer?: number;
  /** 当前选中的缓冲下标。 */
  bufferPointer?: number;

  /** 单个源 ended 回调：清理已完成项并按需补填/停止。 */
  handleSoundEnded = (): void => {
    if (this.playing) {
      this.removeCompleted();
      this.fill(this.buffers!);
      if (!this.remainingLoops && !this.items.length) this.stop();
    }
  };

  constructor(
    audioContext: any,
    volume: number,
    pan: number,
    rate: number,
    delayMs: { min: number; max: number } | undefined,
    attack: number | boolean | undefined,
    decay: number | boolean | undefined,
    remainingLoops: number,
    playBuffer: AudioLoopPlayBuffer,
  ) {
    this.audioContext = audioContext;
    this.volume = volume;
    this.pan = pan;
    this.rate = rate;
    this.delayMs = delayMs;
    this.attack = attack;
    this.decay = decay;
    this.playBuffer = playBuffer;
    this.remainingLoops = remainingLoops;
  }

  /** 替换缓冲列表；若正在播放则推进时间线并补填。 */
  setBuffers(buffers: any[]): void {
    this.buffers = buffers;
    if (this.playing) {
      this.timePointer = Math.max(this.timePointer!, this.audioContext.currentTime);
      this.fill(this.buffers);
    }
  }

  /** 启动播放（已在播放时抛错）；有缓冲则立即 fill。 */
  start(startTime: number): void {
    if (this.playing) throw new Error("Already playing");
    this.timePointer = startTime;
    this.playing = true;
    if (this.buffers) this.fill(this.buffers);
  }

  /** 是否正在播放。 */
  isPlaying(): boolean {
    return this.playing;
  }

  /**
   * 停止：
   * - 有 decay 且有 buffers：停掉 items[1..]，把最后一个缓冲重排到
   *   首个 item 结束时刻（淡出尾段）；
   * - 否则停掉全部并清空。
   */
  stop(): void {
    if (!this.playing) return;
    this.playing = false;
    if (this.decay && this.buffers) {
      this.removeCompleted();
      if (this.items.length) {
        const end = this.items[0].startTime + this.items[0].duration;
        this.items.splice(1).forEach((it) => it.handle.stop());
        this.queueBuffer(this.buffers[this.buffers.length - 1], end);
      }
    } else {
      this.items.forEach((it) => it.handle.stop());
      this.items.length = 0;
    }
  }

  /** 更新音量并广播到在途 item。 */
  setVolume(volume: number): void {
    this.volume = volume;
    this.items.forEach((it) => it.handle.setVolume(volume));
  }

  /** 更新声像并广播到在途 item。 */
  setPan(pan: number): void {
    this.pan = pan;
    this.items.forEach((it) => it.handle.setPan(pan));
  }

  /** 追加一条在途 item。 */
  add(item: AudioLoopItem): void {
    this.items.push(item);
  }

  /** 过滤掉 startTime+duration 已小于当前时间的完成项。 */
  removeCompleted(): void {
    this.items = this.items.filter((it) => it.startTime + it.duration >= this.audioContext.currentTime);
  }

  /**
   * 按时间线补填缓冲，直到缩略 ≥0.1s 且在途 ≥3，或 remainingLoops 耗尽。
   * attack 首次固定取下标 0，之后从 [1, len-1-decay) 随机；无 attack 则全程随机。
   */
  fill(buffers: any[]): void {
    let slack = this.items.length ? this.timePointer! - this.items[0].startTime : 0;
    while (slack < 0.1 || this.items.length < 3) {
      if (!this.attack || this.bufferPointer !== undefined) {
        if (this.remainingLoops <= 0) break;
        this.remainingLoops--;
      }
      if (this.attack) {
        this.bufferPointer =
          this.bufferPointer === undefined ? 0 : getRandomInt(1, buffers.length - 1 - (this.decay ? 1 : 0));
      } else {
        this.bufferPointer = getRandomInt(0, buffers.length - 1);
      }
      const buf = buffers[this.bufferPointer];
      const dur = this.queueBuffer(buf, this.timePointer!);
      this.timePointer! += dur;
      slack += dur;
    }
  }

  /**
   * 入队一个缓冲：随机 delayMs 毫秒偏移后调用 playBuffer，登记 item。
   * @returns 该 item 占用的总时长（时长 + 延迟），秒。
   */
  queueBuffer(buffer: any, baseTime: number): number {
    const delay = this.delayMs ? getRandomInt(this.delayMs.min, this.delayMs.max) / 1e3 : 0;
    const when = baseTime + delay;
    const duration = buffer.duration / this.rate;
    const { handle, source } = this.playBuffer(buffer, when, this.volume, this.pan, this.rate);
    source.addEventListener("ended", this.handleSoundEnded);
    this.add({ startTime: when, duration, handle });
    return duration + delay;
  }
}
