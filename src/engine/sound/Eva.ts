/**
 * Eva — EVA 播报调度器。
 *
 * 订阅渲染帧：当前无播报在播时，从等待列表按优先级降序取出一条，
 * 过滤 5 秒冷却（lastEvaEventBySpec），经 Sound 取 wav 后在 Voice
 * 通道播放。play(name, queue) 可强制 queue 标志。
 *
 * 由 engine/sound/Eva.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { EvaSpecs, EvaSpec } from "engine/sound/EvaSpecs"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 同一 EVA 事件的最小间隔（毫秒），与孪生字面量 5e3 一致。 */
const EVA_COOLDOWN_MS = 5e3;

export class Eva {
  /** EVA 定义表（已 readIni）。 */
  evaSpecs: EvaSpecs;
  /** 音效门面（getWavFile + audioSystem）。 */
  sound: any;
  /** 渲染器（onFrame 事件源）。 */
  renderer: any;
  /** 待播等待列表。 */
  evaWaitingList: EvaSpec[] = [];
  /** 每条 spec 上次播出时间戳（帧时间）。 */
  lastEvaEventBySpec = new Map<EvaSpec, number>();
  /** 当前正在播的句柄。 */
  currentEvaPlaying?: any;

  /** 帧回调：处理在播/空闲两种状态下的队列推进。 */
  handleFrame = (frameTime: number): void => {
    if (this.currentEvaPlaying?.isPlaying()) {
      // 在播：丢掉未标 queue 的等待项（非 queue 的直接被顶掉）
      this.evaWaitingList = this.evaWaitingList.filter((spec) => spec.queue);
    } else {
      this.currentEvaPlaying = undefined;
      // 空闲：按优先级降序，过滤冷却中的项
      this.evaWaitingList.sort((a, b) => b.priority - a.priority);
      this.evaWaitingList = this.evaWaitingList.filter(
        (spec) => frameTime - (this.lastEvaEventBySpec.get(spec) || 0) >= EVA_COOLDOWN_MS,
      );
      if (this.evaWaitingList.length) {
        const next = this.evaWaitingList.shift()!;
        const wav = this.sound.getWavFile(next.sound);
        if (wav) {
          this.currentEvaPlaying = this.sound.audioSystem.playWavFile(wav, ChannelType.Voice);
          this.lastEvaEventBySpec.set(next, frameTime);
          // 孪生：splice(1) 只删除从下标 1 起的项（shift 已拿走首项）
          this.evaWaitingList.splice(1);
        }
      }
    }
  };

  constructor(evaSpecs: EvaSpecs, sound: any, renderer: any) {
    this.evaSpecs = evaSpecs;
    this.sound = sound;
    this.renderer = renderer;
    this.evaWaitingList = [];
    this.lastEvaEventBySpec = new Map();
  }

  /** 开始订阅帧事件。 */
  init(): void {
    this.renderer.onFrame.subscribe(this.handleFrame);
  }

  /** 退订并停止当前播报。 */
  dispose(): void {
    this.renderer.onFrame.unsubscribe(this.handleFrame);
    this.currentEvaPlaying?.stop();
  }

  /**
   * 请求播放一条 EVA；queue=true 时强制写 queue 标志（浅拷贝后入队）。
   * 找不到定义时 console.warn 并跳过。
   */
  play(name: string, queue = false): void {
    let spec = this.evaSpecs.getSpec(name);
    if (spec) {
      if (queue) spec = { ...spec, queue: true };
      this.evaWaitingList.push(spec);
    } else {
      console.warn(`No EVA with name ${name} was found. Skipping.`);
    }
  }
}
