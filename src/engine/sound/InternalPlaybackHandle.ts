/**
 * InternalPlaybackHandle — 单次播放的内部控制句柄。
 *
 * AudioSystem 在真正 start AudioBufferSourceNode 之前先创建本句柄，
 * 使调用方能在解码/接线完成前就拿到可 stop / setVolume / setPan 的对象：
 * 节点未就绪时请求被暂存，setNodes 接线后立即回放。
 *
 * 由 engine/sound/InternalPlaybackHandle.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class InternalPlaybackHandle {
  /** 当前是否仍在播放（start 后为 true，stop/ended 后为 false）。 */
  playing = true;
  /** 是否为循环播放句柄（AudioLoop 路径为 true，单次播放为 false）。 */
  isLoop = false;
  /** 接线前调用过 stop() 时置位；setNodes 后会补执行一次 stop。 */
  stopRequested = false;
  /** 音频缓冲源节点（setNodes 时写入）。 */
  sourceNode?: any;
  /** 增益节点（setNodes 时写入）。 */
  gainNode?: any;
  /** 声像节点（setNodes 时写入）。 */
  panNode?: any;
  /** 接线前暂存的音量请求（setNodes 后回放到 gainNode）。 */
  volumeRequested?: number;
  /** 接线前暂存的声像请求（setNodes 后回放到 panNode）。 */
  panRequested?: number;

  /**
   * 将 WebAudio 节点挂到本句柄：
   * - 若此前已 stop()，立即补停；
   * - 否则回放暂存的 volume/pan 请求。
   */
  setNodes(sourceNode: any, gainNode: any, panNode: any): void {
    this.sourceNode = sourceNode;
    this.gainNode = gainNode;
    this.panNode = panNode;
    if (this.stopRequested) {
      this.stop();
    } else {
      if (this.volumeRequested) gainNode.gain.value = this.volumeRequested;
      if (this.panRequested) panNode.pan.value = this.panRequested;
    }
  }

  /** 是否仍在播放。 */
  isPlaying(): boolean {
    return this.playing;
  }

  /** 停止播放：有源节点则 stop()，否则标记 stopRequested；异常仅 console.error。 */
  stop(): void {
    try {
      if (this.sourceNode) this.sourceNode.stop();
      else this.stopRequested = true;
      this.playing = false;
    } catch (e) {
      console.error(e);
    }
  }

  /** 设置音量；节点未就绪时暂存到 volumeRequested。 */
  setVolume(value: number): void {
    if (this.gainNode) this.gainNode.gain.value = value;
    else this.volumeRequested = value;
  }

  /** 设置声像；节点未就绪时暂存到 panRequested。 */
  setPan(value: number): void {
    if (this.panNode) this.panNode.pan.value = value;
    else this.panRequested = value;
  }
}
