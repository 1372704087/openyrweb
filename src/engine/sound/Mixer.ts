/**
 * Mixer — 通道音量/静音混音台。
 *
 * 持有 ChannelType → 音量 的 Map 与静音 Map，音量或静音变化时经
 * onVolumeChange 事件广播；AudioSystem 订阅后把结果写回各 GainNode。
 * serialize/unserialize 用于选项存档（"ch,vol;ch,vol;..." 格式）。
 *
 * 由 engine/sound/Mixer.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventDispatcher } from "util/event"; // 已转换

export class Mixer {
  /** 通道 → 音量（0..1；未设置时 getVolume 返回 1）。 */
  volumes = new Map<number, number>();
  /** 通道 → 是否静音。 */
  mutes = new Map<number, boolean>();
  /** 内部音量变化分发器（经 onVolumeChange 只读暴露）。 */
  _onVolumeChange = new EventDispatcher();

  /** 音量/静音变化事件：回调收到 (mixer, channelType)。 */
  get onVolumeChange() {
    return this._onVolumeChange.asEvent();
  }

  /** 设置通道音量；与当前值相同则不触发事件。 */
  setVolume(channel: number, volume: number): void {
    if (this.getVolume(channel) !== volume) {
      this.volumes.set(channel, volume);
      this._onVolumeChange.dispatch(this, channel);
    }
  }

  /** 读取通道音量；未设置时默认为 1。 */
  getVolume(channel: number): number {
    return this.volumes.get(channel) ?? 1;
  }

  /** 设置通道静音（无条件 dispatch，与孪生一致）。 */
  setMuted(channel: number, muted: boolean): void {
    this.mutes.set(channel, muted);
    this._onVolumeChange.dispatch(this, channel);
  }

  /** 通道是否静音。 */
  isMuted(channel: number): boolean {
    return !!this.mutes.get(channel);
  }

  /** 序列化为 "ch,vol;ch,vol;..." 字符串。 */
  serialize(): string {
    return [...this.volumes.entries()].map(([ch, vol]) => ch + "," + vol).join(";");
  }

  /** 从 "ch,vol;..." 字符串还原 volumes（mutes 不参与序列化）。 */
  unserialize(str: string): this {
    this.volumes = new Map(str.split(";").map((pair) => pair.split(",").map(Number) as [number, number]));
    return this;
  }
}
