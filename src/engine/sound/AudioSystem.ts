/**
 * AudioSystem — WebAudio 核心：通道图、缓冲解码缓存、单曲/序列/循环播放、
 * 背景音乐（HTMLAudioElement + MediaElementSource）管理。
 *
 * initialize() 创建 AudioContext 与各 ChannelType 的 GainNode 支路
 * （Master 直连 destination，Effect 经压缩器，其余入 Master）。
 * playWavFile / playWavSequence / playWavLoop 分别对接
 * InternalPlaybackHandle + AudioSequence/AudioLoop。
 * 音乐路径用 <audio> 元素 + object URL，支持 loop 与 onEnd 回调。
 *
 * 由 engine/sound/AudioSystem.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { InternalPlaybackHandle } from "engine/sound/InternalPlaybackHandle"; // 已转换
import { AudioLoop } from "engine/sound/AudioLoop"; // 已转换
import { AudioSequence } from "engine/sound/AudioSequence"; // 已转换
import { Mixer } from "engine/sound/Mixer"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 内嵌的静音 data-URI（mp3），供 <audio> 初始 src 使用，与孪生字面量一致。
 * （保留嵌入笔误/截断，勿「修好」。）
 */
const SILENT_AUDIO_DATA_URI =
  "data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

/** 音乐播放状态（MediaElementSource + 是否在播 + 可选 ended 监听）。 */
interface MusicState {
  source: any;
  playing: boolean;
  onEnd?: () => void;
}

export class AudioSystem {
  /** 混音台（音量/静音源）。 */
  mixer: Mixer;
  /** 通道 → GainNode。 */
  channels = new Map<number, any>();
  /** wav/解码缓存（LRU：满 100 删最旧）。 */
  audioBufferCache = new Map<any, any>();
  /** 订阅清理容器。 */
  disposables = new CompositeDisposable();
  /** 在途 AudioBufferSourceNode 集合（suspend 时批量 stop）。 */
  soundsPlaying = new Set<any>();
  /** AudioContext；未 initialize 时为 undefined。 */
  audioContext?: any;
  /** 音乐节点状态；未 initMusicNode 时为 undefined。 */
  musicState?: MusicState;

  /** mixer 音量变化 → 写回对应通道 gain（静音时为 0）。 */
  handleVolumeChange = (channel: number, mixer: Mixer): void => {
    this.getChannel(channel).gain.value = mixer.isMuted(channel) ? 0 : mixer.getVolume(channel);
  };

  constructor(mixer: Mixer) {
    this.mixer = mixer;
    this.channels = new Map();
    this.audioBufferCache = new Map();
    this.disposables = new CompositeDisposable();
    this.soundsPlaying = new Set();
  }

  /** 是否已创建 AudioContext。 */
  isInitialized(): boolean {
    return !!this.audioContext;
  }

  /** context 是否非 running（未创建时也视为 suspended）。 */
  isSuspended(): boolean {
    return this.audioContext?.state !== "running";
  }

  /** 创建 AudioContext、挂音量订阅、建通道图（幂等）。 */
  initialize(): void {
    if (this.isInitialized()) return;
    this.audioContext = new AudioContext();
    this.mixer.onVolumeChange.subscribe(this.handleVolumeChange);
    this.disposables.add(() => this.mixer.onVolumeChange.unsubscribe(this.handleVolumeChange));
    this.createChannels(this.audioContext, this.mixer);
  }

  /** 释放订阅并关闭 context，清空在途集合。 */
  dispose(): void {
    this.disposables.dispose();
    if (this.audioContext) {
      this.audioContext.close();
      this.soundsPlaying.clear();
    }
  }

  /**
   * 按 ChannelType 数值成员建 GainNode 并接线：
   * Master → destination；Effect → DynamicsCompressor → Master；其余 → Master。
   */
  createChannels(context: any, mixer: Mixer): void {
    const types = Object.keys(ChannelType)
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    types.forEach((type) => {
      const gain = context.createGain();
      gain.gain.value = mixer.getVolume(type);
      this.channels.set(type, gain);
    });
    const master = this.getChannel(ChannelType.Master);
    types.forEach((type) => {
      const gainNode = this.getChannel(type);
      if (type === ChannelType.Master) {
        gainNode.connect(context.destination);
      } else if (type === ChannelType.Effect) {
        const compressor = context.createDynamicsCompressor();
        gainNode.connect(compressor).connect(master);
      } else {
        gainNode.connect(master);
      }
    });
  }

  /** 取通道 GainNode；不存在时抛错。 */
  getChannel(channel: number): any {
    if (!this.channels.has(channel)) throw new Error(`Sound channel "${channel}" doesn't exist`);
    return this.channels.get(channel);
  }

  /** 静音/取消静音 Master 通道（经 Mixer）。 */
  setMuted(muted: boolean): void {
    this.mixer.setMuted(ChannelType.Master, muted);
  }

  /**
   * 播放单个 wav 文件。
   * @param delayMs 相对当前时间的延迟毫秒。
   * @returns 可控制的播放句柄。
   */
  playWavFile(
    file: any,
    channel: number,
    volume = 1,
    pan = 0,
    delayMs = 0,
    rate = 1,
    loop = false,
  ): InternalPlaybackHandle {
    if (!this.isInitialized())
      throw new Error("Can't play audio file because audio system is not initialized");
    const when = this.audioContext.currentTime + delayMs / 1e3;
    this.removeSuspendedSounds();
    return this.playWavFileAtTime(file, channel, when, volume, pan, rate, loop);
  }

  /** context 非 running 时，停掉全部在途 source（异常仅 console.error）。 */
  removeSuspendedSounds(): void {
    if (this.isSuspended()) {
      this.soundsPlaying.forEach((source) => {
        try {
          source.stop();
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  /**
   * 创建 AudioLoop 并异步解码 files 后 setBuffers；立即 start(currentTime)。
   * @param attackMs attack 延迟区间；@param decayMs decay 标志（布尔，与孪生一致）。
   */
  playWavLoop(
    files: any[],
    channel: number,
    volume = 1,
    pan = 0,
    delayMs?: { min: number; max: number },
    rate = 1,
    attack?: boolean,
    decay?: boolean,
    loops: number = Number.POSITIVE_INFINITY,
  ): AudioLoop {
    if (!this.isInitialized())
      throw new Error("Can't play audio sequence because audio system is not initialized");
    const context = this.audioContext;
    this.removeSuspendedSounds();
    const loop = new AudioLoop(
      context,
      volume,
      pan,
      rate,
      delayMs,
      attack,
      decay,
      loops,
      (buffer, when, vol, p, r) => {
        const handle = new InternalPlaybackHandle();
        // playBuffer(buffer, when, volume, pan, rate) → 但孪生参数顺序是 (e,t,i,r,s)=(buffer, when?, ...)
        // 孪生: (e, t, i, r, s) => playAudioBuffer(a, e, n, i, r, t, s, !1)
        //   e=buffer, t=when, i=volume, r=pan, s=rate → playAudioBuffer(handle, buffer, channel, volume, pan, when, rate, false)
        return {
          handle,
          source: this.playAudioBuffer(handle, buffer, channel, vol, p, when, r, false),
        };
      },
    );
    Promise.all(files.map((f) => this.decodeFile(f, context)))
      .then((decoded) => {
        loop.setBuffers(decoded);
      })
      .catch((e) => console.error(e));
    loop.start(context.currentTime);
    return loop;
  }

  /** 创建 AudioSequence 并异步解码 files 后 setBuffers；立即 start(currentTime)。 */
  playWavSequence(
    files: any[],
    channel: number,
    volume = 1,
    pan = 0,
    delayMs = 0,
    rate = 1,
  ): AudioSequence {
    if (!this.isInitialized())
      throw new Error("Can't play audio sequence because audio system is not initialized");
    const context = this.audioContext;
    this.removeSuspendedSounds();
    const seq = new AudioSequence(context, volume, pan, rate, delayMs, (buffer, when, vol, p, r) => {
      const handle = new InternalPlaybackHandle();
      return {
        handle,
        source: this.playAudioBuffer(handle, buffer, channel, vol, p, when, r, false),
      };
    });
    Promise.all(files.map((f) => this.decodeFile(f, context)))
      .then((decoded) => {
        seq.setBuffers(decoded);
      })
      .catch((e) => console.error(e));
    seq.start(context.currentTime);
    return seq;
  }

  /** 解码（带 LRU 缓存，上限 100）。 */
  async decodeFile(file: any, context: any): Promise<any> {
    let decoded = this.audioBufferCache.get(file);
    if (!decoded) {
      const raw = new Uint8Array(file.getData()).buffer;
      decoded = await context.decodeAudioData(raw);
      if (this.audioBufferCache.size >= 100) {
        this.audioBufferCache.delete(this.audioBufferCache.keys().next().value);
      }
      this.audioBufferCache.set(file, decoded);
    }
    return decoded;
  }

  /**
   * 在指定绝对时刻播单曲：缓存命中立即播，否则异步解码后播
   * （若期间已 stopRequested 则跳过）。解码前取 bytes 失败则 warn 并返回空句柄。
   */
  playWavFileAtTime(
    file: any,
    channel: number,
    when: number,
    volume = 1,
    pan = 0,
    rate = 1,
    loop = false,
  ): InternalPlaybackHandle {
    if (!this.isInitialized())
      throw new Error("Can't play audio file because audio system is not initialized");
    const context = this.audioContext;
    const handle = new InternalPlaybackHandle();
    const cached = this.audioBufferCache.get(file);
    if (cached) {
      this.playAudioBuffer(handle, cached, channel, volume, pan, when, rate, loop);
    } else {
      let raw: ArrayBuffer;
      try {
        const bytes = file.getData();
        raw = new Uint8Array(bytes).buffer;
      } catch (e) {
        console.error("Failed to decode wav file", e);
        return handle;
      }
      (async () => {
        const decoded = await context.decodeAudioData(raw);
        if (this.audioBufferCache.size >= 100) {
          this.audioBufferCache.delete(this.audioBufferCache.keys().next().value);
        }
        this.audioBufferCache.set(file, decoded);
        if (!handle.stopRequested) {
          this.playAudioBuffer(handle, decoded, channel, volume, pan, when, rate, loop);
        }
      })().catch((e) => console.error(e));
    }
    return handle;
  }

  /**
   * 接线并 start 一个 AudioBufferSource：
   * source → panner → gain → channel GainNode；登记 soundsPlaying。
   * @param when 绝对开始时刻；@param loop 是否循环。
   */
  playAudioBuffer(
    handle: InternalPlaybackHandle,
    buffer: any,
    channel: number,
    volume: number,
    pan: number,
    when: number,
    rate: number,
    loop: boolean,
  ): any {
    const context = this.audioContext;
    const gain = context.createGain();
    gain.gain.value = volume;
    const panner = context.createStereoPanner();
    panner.pan.value = pan;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    source.loop = loop;
    source.connect(panner).connect(gain).connect(this.getChannel(channel));
    handle.setNodes(source, gain, panner);
    source.addEventListener("ended", () => {
      this.soundsPlaying.delete(source);
      handle.playing = false;
    });
    this.soundsPlaying.add(source);
    source.start(when);
    return source;
  }

  /** 确保音乐节点已创建（未初始化时抛错）。 */
  async initMusicLoop(): Promise<void> {
    if (!this.isInitialized())
      throw new Error("Can't initialize music loop because audio system is not initialized");
    if (!this.musicState) this.initMusicNode();
  }

  /**
   * 播放音乐文件（object URL 到 <audio>）：
   * - 先 stopMusic，再设 loop/src/onended/onpause 回收 URL；
   * - 可选 onEnd（ended 一次性）；最后 playOrResumeMusic。
   */
  async playMusicFile(file: any, loop: boolean, onEnd?: () => void): Promise<void> {
    if (!this.isInitialized())
      throw new Error("Can't play audio file because audio system is not initialized");
    this.removeSuspendedSounds();
    this.stopMusic();
    const state = this.musicState ?? this.initMusicNode();
    // 孪生为 let：回调里要置 undefined（TS 版若写 const，(el as any)=undefined 运行时抛 Assignment to constant）
    let el = state.source.mediaElement;
    el.loop = loop;
    const objectUrl = (el.src = URL.createObjectURL(file.asFile()));
    el.onended = el.onpause = () => {
      URL.revokeObjectURL(objectUrl);
      // 孪生：局部 el 置 undefined（不影响 state.source.mediaElement 引用）
      el = undefined as any;
    };
    if (onEnd) {
      state.onEnd = onEnd;
      el.addEventListener("ended", state.onEnd, { once: true });
    }
    await this.playOrResumeMusic();
  }

  /** 创建 gain/panner/<audio>/MediaElementSource 并接到 Music 通道。 */
  initMusicNode(): MusicState {
    const context = this.audioContext;
    const gain = context.createGain();
    gain.gain.value = 1;
    const panner = context.createStereoPanner();
    panner.pan.value = 0;
    const el = document.createElement("audio");
    el.src = SILENT_AUDIO_DATA_URI;
    el.loop = true;
    const source = context.createMediaElementSource(el);
    this.musicState = { source, playing: false };
    source.addEventListener("ended", () => {
      this.musicState!.playing = false;
    });
    source.connect(panner).connect(gain).connect(this.getChannel(ChannelType.Music));
    return this.musicState;
  }

  /** 未在播时调用 mediaElement.play()（失败 console.error 并复位 playing）。 */
  async playOrResumeMusic(): Promise<void> {
    if (this.musicState && !this.musicState.playing) {
      this.musicState.playing = true;
      try {
        await this.musicState.source.mediaElement.play()?.catch((e: any) => console.error(e));
      } catch (e) {
        console.error(e);
        this.musicState.playing = false;
      }
    }
  }

  /** 停止音乐：摘 onEnd、pause、src 复位为静音 URI、playing=false。 */
  stopMusic(): void {
    if (this.musicState?.playing) {
      try {
        if (this.musicState.onEnd) {
          this.musicState.source.mediaElement.removeEventListener("ended", this.musicState.onEnd);
        }
        this.musicState.source.mediaElement.pause();
        this.musicState.source.mediaElement.src = SILENT_AUDIO_DATA_URI;
        this.musicState.playing = false;
        this.musicState.onEnd = undefined;
      } catch (e) {
        console.error(e);
      }
    }
  }
}
