/**
 * Sound — 音效播放门面（UI 点击自动音 + 按 SoundKey 播放样本）。
 *
 * initialize 后监听 document click：按钮/列表项/复选框/下拉等选择器
 * 自动播对应 GUI 音。play(key, channel) 经 SoundSpecs 解析定义后，
 * 按 Loop/Attack/Decay/Random 控制位选择 playWavFile / playWavSequence /
 * playWavLoop 路径，并维护按名并发限制（Interrupt 可打断最旧句柄）。
 *
 * 由 engine/sound/Sound.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { SoundSpecs, SoundControl } from "engine/sound/SoundSpecs"; // 已转换
import { SoundSpec } from "engine/sound/SoundSpec"; // 已转换
import { getRandomInt } from "util/math"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Sound {
  /** 音频系统门面。 */
  audioSystem: any;
  /** 音频文件提供者（get 返回文件对象）。 */
  audioFiles: any;
  /** sound.ini 解析结果。 */
  soundSpecs: SoundSpecs;
  /** 音画规则 INI（audioVisualRules，含 SoundKey → 文件名映射）。 */
  audioVisualRules: any;
  /** 用于 click 监听的 document。 */
  document: any;
  /** 按声音名分组的在途播放句柄。 */
  playbackHandles = new Map<string, any[]>();

  /** document click 处理器：按目标元素选择器播对应 GUI 音。 */
  handleClick = (event: any): void => {
    let el: any = event.target;
    if (el.matches("button, .menu-button:not(.disabled)")) {
      this.play(SoundKey.GUIMainButtonSound, ChannelType.Ui);
    } else if (el.matches(".list-item")) {
      this.play(SoundKey.GenericClick, ChannelType.Ui);
    } else if (
      el instanceof HTMLInputElement &&
      ["checkbox", "radio", "range"].includes(el.type) &&
      !el.disabled
    ) {
      this.play(SoundKey.GUICheckboxSound, ChannelType.Ui);
    } else if (
      (el instanceof HTMLSelectElement && !el.disabled) ||
      el.matches(".select:not(.disabled) *")
    ) {
      this.play(SoundKey.GUIComboOpenSound, ChannelType.Ui);
    }
  };

  constructor(
    audioSystem: any,
    audioFiles: any,
    soundSpecs: SoundSpecs,
    audioVisualRules: any,
    document: any,
  ) {
    this.audioSystem = audioSystem;
    this.audioFiles = audioFiles;
    this.soundSpecs = soundSpecs;
    this.audioVisualRules = audioVisualRules;
    this.document = document;
    this.playbackHandles = new Map();
  }

  /** 初始化音频系统并挂 click 监听。 */
  initialize(): void {
    this.audioSystem.initialize();
    this.document.addEventListener("click", this.handleClick);
  }

  /** 释放音频系统并摘 click 监听。 */
  dispose(): void {
    this.audioSystem.dispose();
    this.document.removeEventListener("click", this.handleClick);
  }

  /**
   * 把 SoundKey 枚举解析为实际资源名：
   * - 枚举名在 reverse map 中是 string → 查 audioVisualRules；
   * - 否则（直接传入字符串名）原样返回。
   */
  getSoundKey(key: SoundKey | string): string | undefined {
    let resolved: string;
    if (typeof (SoundKey as any)[key] === "string") {
      resolved = this.audioVisualRules.ini.getString((SoundKey as any)[key]);
      if (!resolved) return;
    } else {
      resolved = key as string;
    }
    return resolved;
  }

  /** 解析 SoundKey → SoundSpec；缺定义时 console.warn。 */
  getSoundSpec(key: SoundKey | string): SoundSpec | undefined {
    const soundKey = this.getSoundKey(key);
    if (soundKey) {
      const spec = this.soundSpecs.getSpec(soundKey);
      if (spec) return spec;
      console.warn(`Sound "${soundKey}" is not defined`);
    } else {
      console.warn(`No sound is defined for key "${(SoundKey as any)[key]}"`);
    }
  }

  /**
   * 按定义播放：
   * - 有 Loop 控制位：循环次数 = spec.loop || Infinity；
   * - 否则循环次数 0（单次）。
   * 音量 = volume/100，延迟 0，limit 取 spec.limit。
   */
  play(key: SoundKey | string, channel: ChannelType): any {
    const spec = this.getSoundSpec(key);
    if (spec) {
      const loops = spec.control.has(SoundControl.Loop)
        ? spec.loop || Number.POSITIVE_INFINITY
        : 0;
      return this.playWithOptions(spec, channel, spec.volume / 100, 0, spec.limit, loops);
    }
  }

  /**
   * 实际选择播放路径并登记句柄：
   * - 需要 loop（次数非 0 且多样本/无限/有 delay）→ playWavLoop；
   * - 有 attack/decay → playWavSequence（随机或全序列）；
   * - 否则随机或取首个样本 → playWavFile。
   * 达到 limit 时：无 Interrupt 直接丢弃，有则 shift 最旧并 stop。
   */
  playWithOptions(
    spec: SoundSpec,
    channel: ChannelType,
    volume: number,
    pan: number,
    limit: number,
    loops: number,
  ): any {
    if (!spec.sounds.length) return;
    this.cleanOldHandles();
    let handles = this.playbackHandles.get(spec.name);
    if (!handles) {
      handles = [];
      this.playbackHandles.set(spec.name, handles);
    }
    if (limit && handles.length >= limit) {
      if (!spec.control.has(SoundControl.Interrupt)) return;
      handles.shift()!.stop();
    }
    const rate = 1 + (spec.fShift ? getRandomInt(spec.fShift.min, spec.fShift.max) / 100 : 0);
    let handle: any;
    const hasAttack = spec.control.has(SoundControl.Attack);
    const hasDecay = spec.control.has(SoundControl.Decay);
    if (loops && (spec.sounds.length > 1 || loops !== Number.POSITIVE_INFINITY || spec.delay)) {
      const sequence = this.buildAttackDecaySequence(spec, hasAttack, hasDecay, true);
      const files = sequence.map((name) => this.getWavFile(name)).filter(isNotNullOrUndefined);
      handle = this.audioSystem.playWavLoop(files, channel, volume, pan, spec.delay, rate, hasAttack, hasDecay, loops);
    } else {
      let delay = 0;
      if (spec.delay) delay = getRandomInt(spec.delay.min, spec.delay.max);
      if (hasAttack || hasDecay) {
        const sequence = this.buildAttackDecaySequence(spec, hasAttack, hasDecay, false);
        const files = sequence.map((name) => this.getWavFile(name)).filter(isNotNullOrUndefined);
        handle = this.audioSystem.playWavSequence(files, channel, volume, pan, delay, rate);
      } else {
        let sample: string;
        sample = spec.control.has(SoundControl.Random)
          ? spec.sounds[getRandomInt(0, spec.sounds.length - 1)]
          : spec.sounds[0];
        const file = this.getWavFile(sample);
        if (!file) return;
        handle = this.audioSystem.playWavFile(file, channel, volume, pan, delay, rate, loops !== 0);
      }
    }
    if (handle) handles.push(handle);
    return handle;
  }

  /**
   * 构造 attack/middle/decay 样本序列：
   * - attackCount/decayCount 由控制位决定（缺省 1）；
   * - middle = sounds.slice(ac, len-dc)；
   * - full=true 时 middle 全量入列，否则从 middle 随机取 1 个。
   */
  buildAttackDecaySequence(
    spec: SoundSpec,
    useAttack: boolean,
    useDecay: boolean,
    full: boolean,
  ): string[] {
    let attackCount = useAttack ? spec.attack || 1 : 0;
    let decayCount = useDecay ? spec.decay || 1 : 0;
    const middle = spec.sounds.slice(attackCount, spec.sounds.length - decayCount);
    const out: string[] = [];
    if (attackCount > 0) {
      const name = spec.sounds[getRandomInt(0, attackCount - 1)];
      out.push(name);
    }
    if (full) out.push(...middle);
    else out.push(middle[getRandomInt(0, middle.length - 1)]);
    if (decayCount > 0) {
      const name = spec.sounds[getRandomInt(spec.sounds.length - decayCount, spec.sounds.length - 1)];
      out.push(name);
    }
    return out;
  }

  /** 取 .wav 文件；缺失时 console.error。 */
  getWavFile(name: string): any {
    const key = name + ".wav";
    const file = this.audioFiles.get(key);
    if (file) return file;
    console.error(`Audio file "${key}" not found.`);
  }

  /** 清掉已结束的播放句柄。 */
  cleanOldHandles(): void {
    for (const [name, handles] of this.playbackHandles) {
      const alive = handles.filter((h) => h.isPlaying());
      this.playbackHandles.set(name, alive);
    }
  }
}
