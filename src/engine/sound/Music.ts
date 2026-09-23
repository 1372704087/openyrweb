/**
 * Music — 背景音乐播放列表与选项（shuffle/repeat）管理。
 *
 * MusicType 混合数值枚举（Normal/NormalShuffle）与字符串别名
 * （INTRO/SCORE/…），后者对应 MusicSpecs 中的主题键。play() 按类型
 * 构建播放列表或直取单曲，经 AudioSystem.playMusicFile 播出。
 *
 * 由 engine/sound/Music.ts.js 重写为 TS（行为完全一致，枚举值与
 * 孪生逐值对齐）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { getRandomInt } from "util/math"; // 已转换
import { MusicSpecs, MusicSpec } from "engine/sound/MusicSpecs"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 音乐播放类型（数值成员 + 字符串主题键）。 */
export enum MusicType {
  Normal = 0,
  NormalShuffle = 1,
  Intro = "INTRO",
  Score = "SCORE",
  Loading = "LOADING",
  Credits = "CREDITS",
  Options = "RA2Options",
}

export class Music {
  /** 音频系统门面（playMusicFile/stopMusic）。 */
  audioSystem: any;
  /** 音频文件提供者（get 返回 Promise 文件）。 */
  audioFiles: any;
  /** 主题定义表。 */
  musicSpecs: MusicSpecs;
  /** 当前播放列表（仅 Normal* 路径填充）。 */
  playlist: MusicSpec[] = [];
  /** 播放列表游标；-1 表示未选中。 */
  currentPlaylistIdx = -1;
  /** 是否随机播放顺序。 */
  shuffle = false;
  /** 是否单曲循环（advancePlaylist 不前进）。 */
  repeat = false;
  /** unserializeOptions 记录的初始 repeat 曲名（首次 play 时定位）。 */
  initialRepeatName?: string;
  /** 当前已播的 MusicType（避免重复 play 同类型）。 */
  currentMusicType?: MusicType;

  constructor(audioSystem: any, audioFiles: any, musicSpecs: MusicSpecs) {
    this.audioSystem = audioSystem;
    this.audioFiles = audioFiles;
    this.musicSpecs = musicSpecs;
    this.playlist = [];
    this.currentPlaylistIdx = -1;
    this.shuffle = false;
    this.repeat = false;
  }

  /** 从 "shuffle,repeat,repeatName" 解析选项。 */
  unserializeOptions(str: string): void {
    const [shuffleFlag, repeatFlag, repeatName] = str.split(",");
    this.shuffle = Boolean(Number(shuffleFlag));
    this.repeat = Boolean(Number(repeatFlag));
    this.initialRepeatName = repeatName;
  }

  /** 序列化为 "shuffle,repeat,repeatName"；无 repeat 曲名时末段为 undefined 字面量。 */
  serializeOptions(): string {
    return [
      Number(this.shuffle),
      Number(this.repeat),
      this.repeat && this.currentPlaylistIdx !== -1 ? this.playlist[this.currentPlaylistIdx].name : undefined,
    ].join(",");
  }

  /** 当前是否 shuffle。 */
  getShuffleMode(): boolean {
    return this.shuffle;
  }

  /** 当前是否 repeat。 */
  getRepeatMode(): boolean {
    return this.repeat;
  }

  /** 构建（不 shuffle 的）Normal 播放列表。 */
  getPlaylist(): MusicSpec[] {
    return this.buildPlaylist(false);
  }

  /** 当前播放列表项；未选中时返回 undefined。 */
  getCurrentPlaylistItem(): MusicSpec | undefined {
    if (this.currentPlaylistIdx !== -1) return this.playlist[this.currentPlaylistIdx];
  }

  /** 停止播放。 */
  dispose(): void {
    this.stopPlaying();
  }

  /** 按主题键取 spec；缺失时 console.warn。 */
  getMusicSpec(key: string): MusicSpec | undefined {
    const spec = this.musicSpecs.getSpec(key);
    if (spec) return spec;
    console.warn(`Music "${key}" is not defined`);
  }

  /**
   * 按 MusicType 播放：
   * - Normal / NormalShuffle：构建列表并从头（或 initialRepeatName）播；
   * - 其余字符串类型：直取 MusicSpec 后播；
   * - 与 currentMusicType 相同则直接跳过。
   */
  async play(type: MusicType): Promise<void> {
    if (this.currentMusicType === type) return;
    if (type === MusicType.Normal || type === MusicType.NormalShuffle) {
      const useShuffle = this.shuffle || type === MusicType.NormalShuffle;
      this.playlist = this.buildPlaylist(useShuffle);
      this.currentPlaylistIdx = 0;
      if (this.initialRepeatName) {
        const idx = this.playlist.findIndex((item) => item.name === this.initialRepeatName);
        if (idx !== -1) this.currentPlaylistIdx = idx;
      }
      const ok = await this.playSpec(this.playlist[this.currentPlaylistIdx], () => this.advancePlaylist());
      if (ok) this.currentMusicType = type;
    } else {
      const spec = this.getMusicSpec(type);
      if (spec) {
        const ok = await this.playSpec(spec);
        if (ok) this.currentMusicType = type;
      } else {
        console.warn(`No music spec found for type "${type}"`);
      }
    }
  }

  /** 停止当前音乐并清空 currentMusicType。 */
  stopPlaying(): void {
    this.audioSystem.stopMusic();
    this.currentMusicType = undefined;
  }

  /** 切换 shuffle：重建列表并尽量保持当前曲目游标。 */
  setShuffleMode(shuffle: boolean): void {
    if (shuffle !== this.shuffle) {
      this.shuffle = shuffle;
      const current = this.currentPlaylistIdx !== -1 ? this.playlist[this.currentPlaylistIdx] : undefined;
      this.playlist = this.buildPlaylist(this.shuffle);
      this.currentPlaylistIdx = current ? this.playlist.findIndex((item) => item === current) : -1;
    }
  }

  /** 切换 repeat。 */
  setRepeatMode(repeat: boolean): void {
    this.repeat = repeat;
  }

  /** 取 mp3 后交给 audioSystem 播；失败返回 false。 */
  async playSpec(spec: MusicSpec, onEnd?: () => void): Promise<boolean> {
    const file = await this.getMp3File(spec.sound);
    if (!file) return false;
    await this.audioSystem.playMusicFile(file, spec.repeat, onEnd);
    return true;
  }

  /** 按小写名+".mp3" 取文件；失败 console.error 并返回 undefined。 */
  async getMp3File(sound: string): Promise<any> {
    const key = sound.toLowerCase() + ".mp3";
    let file;
    try {
      file = await this.audioFiles.get(key);
    } catch (e) {
      console.error("Failed to fetch audio file", e);
      return;
    }
    if (file) return file;
    console.warn(`Audio file "${key}" not found.`);
  }

  /** 取全部 normal=true 的主题；needShuffle 时 Fisher–Yates 式洗牌。 */
  buildPlaylist(needShuffle: boolean): MusicSpec[] {
    let list = this.musicSpecs.getAll().filter((spec) => spec.normal);
    if (needShuffle) list = this.shufflePlaylist(list);
    return list;
  }

  /** 洗牌：反复从拷贝中随机 splice 出一个推入结果。 */
  shufflePlaylist(list: MusicSpec[]): MusicSpec[] {
    const out: MusicSpec[] = [];
    const pool = [...list];
    while (pool.length) {
      out.push(...pool.splice(getRandomInt(0, pool.length - 1), 1));
    }
    return out;
  }

  /** 曲终推进：repeat 则停在原地，否则模长 +1；再播下一首。 */
  async advancePlaylist(): Promise<void> {
    this.currentPlaylistIdx = this.repeat
      ? this.currentPlaylistIdx
      : (this.currentPlaylistIdx + 1) % this.playlist.length;
    await this.playSpec(this.playlist[this.currentPlaylistIdx], () => this.advancePlaylist());
  }

  /** 手动选中播放列表中的某一项并从头播。 */
  async selectPlaylistItem(item: MusicSpec): Promise<void> {
    const idx = this.playlist?.findIndex((entry) => entry === item);
    if (idx !== -1) {
      this.currentPlaylistIdx = idx;
      this.stopPlaying();
      await this.playSpec(this.playlist[this.currentPlaylistIdx], () => this.advancePlaylist());
    }
  }
}
