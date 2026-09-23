/**
 * AudioSequence — 一次性顺序播放的音频序列。
 *
 * 按 buffers 顺序在时间线上依次入队（首段可带固定 delay 偏移），
 * 全部 item 完成后自动把 playing 置回 false。与 AudioLoop 的区别是
 * 不循环、不随机取样。
 *
 * 由 engine/sound/AudioSequence.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 一条已入队的音频 item。 */
export interface AudioSequenceItem {
  /** 计划开始时间（audioContext 时间轴）。 */
  startTime: number;
  /** 时长（秒，已按 rate 折算）。 */
  duration: number;
  /** 播放控制句柄。 */
  handle: any;
}

/** playBuffer 回调：按给定参数启动一个缓冲并返回句柄与源节点。 */
export type AudioSequencePlayBuffer = (
  buffer: any,
  when: number,
  volume: number,
  pan: number,
  rate: number,
) => { handle: any; source: any };

export class AudioSequence {
  /** 音频上下文。 */
  audioContext: any;
  /** 音量（0..1）。 */
  volume: number;
  /** 声像（-1..1）。 */
  pan: number;
  /** 播放速率。 */
  rate: number;
  /** 首段固定延迟（毫秒）。 */
  delayMs?: number;
  /** 实际播放回调。 */
  playBuffer: AudioSequencePlayBuffer;
  /** 恒为 false：标识这不是循环类。 */
  readonly isLoop = false;
  /** 在途播放项。 */
  items: AudioSequenceItem[] = [];
  /** 是否处于播放态。 */
  playing = false;
  /** 当前可用缓冲列表（setBuffers 写入）。 */
  buffers?: any[];
  /** 时间线游标。 */
  timePointer?: number;

  /** 单个源 ended 回调：清理完成后若无剩余 item 则结束播放态。 */
  handleSoundEnded = (): void => {
    if (this.playing) {
      this.removeCompleted();
      if (!this.items.length) this.playing = false;
    }
  };

  constructor(
    audioContext: any,
    volume: number,
    pan: number,
    rate: number,
    delayMs?: number,
    playBuffer: AudioSequencePlayBuffer = (() => ({ handle: undefined, source: undefined })) as any,
  ) {
    this.audioContext = audioContext;
    this.volume = volume;
    this.pan = pan;
    this.rate = rate;
    this.delayMs = delayMs;
    this.playBuffer = playBuffer;
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

  /** 停止：停掉全部在途 item 并清空。 */
  stop(): void {
    if (this.playing) {
      this.playing = false;
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
  add(item: AudioSequenceItem): void {
    this.items.push(item);
  }

  /** 过滤掉 startTime+duration 已小于当前时间的完成项。 */
  removeCompleted(): void {
    this.items = this.items.filter((it) => it.startTime + it.duration >= this.audioContext.currentTime);
  }

  /**
   * 按 buffers 顺序依次入队。
   * 首段偏移 = delayMs/1e3，后续段偏移归零并接在上一段之后。
   */
  fill(buffers: any[]): void {
    let offset = this.delayMs ? this.delayMs / 1e3 : 0;
    for (const buf of buffers) {
      const dur = this.queueBuffer(buf, this.timePointer!, offset);
      this.timePointer! += dur;
      offset = 0;
    }
  }

  /**
   * 入队一个缓冲：调用 playBuffer 并登记 item。
   * @param extraDelay 额外固定延迟（秒）。
   * @returns 该 item 占用的总时长（时长 + 延迟），秒。
   */
  queueBuffer(buffer: any, baseTime: number, extraDelay: number): number {
    const when = baseTime + extraDelay;
    const duration = buffer.duration / this.rate;
    const { handle, source } = this.playBuffer(buffer, when, this.volume, this.pan, this.rate);
    source.addEventListener("ended", this.handleSoundEnded);
    this.add({ startTime: when, duration, handle });
    return duration + extraDelay;
  }
}
