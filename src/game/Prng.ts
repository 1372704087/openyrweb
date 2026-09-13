/**
 * Prng — 模拟用伪随机数生成器（Mersenne Twister 封装）。
 *
 * 锁步联机的确定性随机源：各客户端以相同种子构造，序列逐位一致。
 * 由 game/Prng.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import MersenneTwister from "mersenne-twister";
import { Crc32 } from "data/Crc32";
import { binaryStringToUint8Array } from "util/string";

export class Prng {
  private readonly prng: MersenneTwister;
  lastRandom: number;

  /**
   * 种子既可以是数字（可带后缀混合），也可以是字符串（CRC32 后作种子）。
   * 数字 + 后缀的混合方式是十进制字符串拼接：factory(42, 7) → 种子 427。
   */
  static factory(seed: number | string, suffix: number): Prng {
    const numericSeed = Number.isNaN(Number(seed))
      ? Crc32.calculateCrc(binaryStringToUint8Array(seed as string))
      : Number(`${seed}${suffix}`);
    return new Prng(numericSeed);
  }

  constructor(seed: number) {
    this.prng = new MersenneTwister(seed);
  }

  /** 返回 [min, max] 闭区间内的随机整数。 */
  generateRandomInt(min: number, max: number): number {
    const random = this.prng.random();
    this.lastRandom = random;
    return Math.floor(random * (max - min + 1)) + min;
  }

  /** 返回 [0, 1) 随机浮点。 */
  generateRandom(): number {
    const random = this.prng.random();
    this.lastRandom = random;
    return random;
  }

  /** 最近一次 generateRandom*() 产生的原始浮点值。 */
  getLastRandom(): number {
    return this.lastRandom;
  }
}
