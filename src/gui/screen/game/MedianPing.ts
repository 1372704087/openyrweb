/**
 * MedianPing — 蓄水池采样的中位数延迟估计。
 *
 * 由 gui/screen/game/MedianPing.ts.js 重写为 TS（行为完全一致）。
 */

/** 中位数 ping 计算器。 */
export class MedianPing {
  /** 蓄水池容量。 */
  reservoirSize: number;
  /** 样本蓄水池。 */
  reservoir: number[] = [];
  /** 累计样本数。 */
  totalSamples = 0;

  /**
   * @param reservoirSize 容量，默认 100
   */
  constructor(reservoirSize = 100) {
    this.reservoirSize = reservoirSize;
    this.reservoir = [];
    this.totalSamples = 0;
  }

  /**
   * 蓄水池采样推入一个延迟样本。
   * @param sample 毫秒
   */
  pushSample(sample: number): void {
    this.totalSamples++;
    if (this.reservoir.length < this.reservoirSize) {
      this.reservoir.push(sample);
    } else {
      const idx = Math.floor(Math.random() * this.totalSamples);
      if (idx < this.reservoirSize) {
        this.reservoir[idx] = sample;
      }
    }
  }

  /** 计算中位数；空池返回 undefined。 */
  calculate(): number | undefined {
    if (this.reservoir.length !== 0) {
      const sorted = [...this.reservoir].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return void 0;
  }
}
