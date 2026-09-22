/**
 * BerserkTrait — 狂暴（Berserk）持续帧 trait。
 *
 * setBerserk(frames, source) 在已有剩余帧更大时只保留较大值（原版 YR）。
 * 首次进入狂暴时取消当前全部任务，单位立刻停止原攻击并重扫友军。
 * 每 tick 递减；换主清零帧数；离场清零帧数与来源；dispose 清 gameObject。
 *
 * 由 game/gameobject/trait/BerserkTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class BerserkTrait {
  /** 宿主对象。 */
  gameObject: any;
  /** 狂暴剩余帧数，>0 表示处于狂暴。 */
  berserkFrames: number;
  /** 触发来源（技能/武器等，可空）。 */
  berserkSource: any;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.berserkFrames = 0;
    this.berserkSource = void 0;
  }

  /** 是否处于狂暴态。 */
  isBerserk(): boolean {
    return 0 < this.berserkFrames;
  }

  /** 当前剩余狂暴帧。 */
  getBerserkFrames(): number {
    return this.berserkFrames;
  }

  /**
   * 应用给定帧数的狂暴。若已在狂暴，取当前与新持续时间的较大者
   * （原版 YR 行为）。首次进入狂暴时取消全部当前任务，使单位立刻
   * 停止攻击并重新扫描附近目标。
   */
  setBerserk(frames: number, source?: any): void {
    if (frames > this.berserkFrames) {
      const wasBerserk = 0 < this.berserkFrames;
      this.berserkFrames = frames;
      this.berserkSource = source;
      if (!wasBerserk) this.gameObject.unitOrderTrait?.cancelAllTasks();
    }
  }

  /** 立即清除狂暴状态。 */
  clearBerserk(): void {
    this.berserkFrames = 0;
    this.berserkSource = void 0;
  }

  /** 每 tick 递减剩余帧。 */
  [NotifyTickModule.NotifyTick.onTick](): void {
    if (0 < this.berserkFrames) this.berserkFrames--;
  }

  /** 换主：重置狂暴帧。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](): void {
    this.berserkFrames = 0;
  }

  /** 离场：清零帧数与来源。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](): void {
    this.berserkFrames = 0;
    this.berserkSource = void 0;
  }

  /** 释放宿主引用。 */
  dispose(): void {
    this.gameObject = void 0;
  }
}
