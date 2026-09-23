/**
 * AnimProps — 动画属性（从对象艺术 INI 段解析帧区间、速率与循环）。
 *
 * 由 engine/AnimProps.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { getRandomInt } from "util/math"; // 已转换

/** 动画艺术段读取器：提供 bool / number / number[] 读取。 */
export interface AnimArtReader {
  getBool(key: string): boolean;
  getNumber(key: string, defaultValue?: number): number;
  getNumberArray(key: string): number[];
  /** 艺术段中的帧数元数据（shadow 时可能按一半计算）。 */
  numImages?: number;
}

/** init(e) 的第二参数：帧数或带 numImages 的元数据对象。 */
export type AnimFrameCountInput =
  | number
  | {
      numImages: number;
    }
  | undefined;

/**
 * 动画属性集合。
 * 从 art 段解析 Shadow / Reverse / End / Rate / Start / Loop* / LoopCount /
 * RandomLoopDelay 等字段。
 */
export class AnimProps {
  /** 默认播放速率（帧/秒），取 GameSpeed.BASE_TICKS_PER_SECOND */
  static readonly defaultRate: number = GameSpeed.BASE_TICKS_PER_SECOND;

  /** 当前艺术段读取器 */
  art: AnimArtReader;
  /** 是否有镜像阴影帧（frameCount 取 numImages/2） */
  shadow!: boolean;
  /** 是否反向播放 */
  reverse!: boolean;
  /** 总帧数（不含 shadow 半帧计算时的双倍） */
  frameCount!: number;
  /** 结束帧（含） */
  end!: number;
  /** 播放速率（帧/秒，RandomRate 随机或 Rate 默认） */
  rate!: number;
  /** 起始帧 */
  start!: number;
  /** 循环起始帧 */
  loopStart!: number;
  /** 循环结束帧（含，至少不小于 loopStart） */
  loopEnd!: number;
  /** 循环次数（-1 表示无限） */
  loopCount!: number;
  /** 循环间随机延迟帧数 [min, max]；无效时为 undefined */
  randomLoopDelay?: [number, number];

  /**
   * @param art - 艺术段读取器
   * @param e - 帧数，或含 numImages 的元数据对象（shadow 时取一半）
   */
  constructor(art: AnimArtReader, e: AnimFrameCountInput) {
    this.art = art;
    this.init(e);
  }

  /** 从 art 段重新解析全部属性字段。 */
  init(e: AnimFrameCountInput): void {
    this.shadow = this.art.getBool("Shadow");
    this.reverse = this.art.getBool("Reverse");
    // 孪生: "number" == typeof e ? e : this.shadow ? e.numImages / 2 : e.numImages
    this.frameCount =
      typeof e === "number" ? e : this.shadow ? (e as { numImages: number }).numImages / 2 : (e as { numImages: number }).numImages;
    this.end = this.art.getNumber("End", this.frameCount - 1);

    let t = this.art.getNumberArray("RandomRate").sort();
    if (t.length === 2) {
      this.rate = getRandomInt(t[0], t[1]) / 60;
    } else {
      this.rate = this.art.getNumber("Rate", 60 * AnimProps.defaultRate) / 60;
    }
    this.start = this.art.getNumber("Start", 0);
    this.loopStart = this.art.getNumber("LoopStart", 0);
    this.loopEnd = Math.max(this.loopStart, this.art.getNumber("LoopEnd", this.end + 1) - 1);
    this.loopCount = this.art.getNumber("LoopCount", 1);

    t = this.art.getNumberArray("RandomLoopDelay").sort();
    this.randomLoopDelay = t.length === 2 ? [t[0], t[1]] : undefined;
  }

  /** 取当前艺术段读取器。 */
  getArt(): AnimArtReader {
    return this.art;
  }

  /** 替换艺术段并按既有 frameCount 重新 init。 */
  setArt(art: AnimArtReader): void {
    this.art = art;
    this.init(this.frameCount);
  }
}
