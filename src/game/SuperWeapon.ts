/**
 * SuperWeapon — 单个超级武器实例（充能计时与状态机）。
 *
 * 状态机：Charging（充能中）→ Ready（可用）↔ Paused（暂停计时）。
 * rechargeTicks 由 rules.rechargeTime（秒）换算为逻辑 tick；oneTimeOnly
 * 构造时直接 Ready 且 chargeTicks=0。update(tick) 每逻辑帧递减剩余
 * tick，归零时置 Ready 并派发 SuperWeaponReadyEvent。
 *
 * 由 game/SuperWeapon.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
import { SuperWeaponReadyEvent } from "game/event/SuperWeaponReadyEvent"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 超级武器充能状态。 */
export enum SuperWeaponStatus {
  /** 充能中（计时递减）。 */
  Charging = 0,
  /** 计时暂停（保留剩余 chargeTicks）。 */
  Paused = 1,
  /** 充能完毕，可释放。 */
  Ready = 2,
}

export class SuperWeapon {
  /** 规则中的超武名（与 SuperWeaponRules 键一致）。 */
  name: any;
  /** 对应 SuperWeaponRules 条目。 */
  rules: any;
  /** 所属玩家。 */
  owner: any;
  /** 是否一次性（构造后直接 Ready）。 */
  oneTimeOnly: any;
  /** 当前充能状态。 */
  status: any;
  /** 是否为触发器/赠予发放（Gift）。 */
  isGift: any;
  /** 满充所需 tick 数。 */
  rechargeTicks: any;
  /** 剩余充能 tick。 */
  chargeTicks: any;

  constructor(name: any, rules: any, owner: any, oneTimeOnly: any = false) {
    this.name = name;
    this.rules = rules;
    this.owner = owner;
    this.oneTimeOnly = oneTimeOnly;
    this.status = SuperWeaponStatus.Charging;
    this.isGift = false;
    // 秒 → tick：rechargeTime 为规则秒数，BASE_TICKS_PER_SECOND=15
    this.rechargeTicks = 60 * rules.rechargeTime * GameSpeed.BASE_TICKS_PER_SECOND;
    this.chargeTicks = this.rechargeTicks;
    if (oneTimeOnly) {
      this.status = SuperWeaponStatus.Ready;
      this.chargeTicks = 0;
    }
  }

  /** 每逻辑帧：未满且未暂停时递减剩余 tick；归零转 Ready 并派发事件。 */
  update(game: any): void {
    if (this.chargeTicks > 0 && this.status !== SuperWeaponStatus.Paused) {
      this.chargeTicks--;
      if (0 === this.chargeTicks) {
        this.status = SuperWeaponStatus.Ready;
        game.events.dispatch(new SuperWeaponReadyEvent(this));
      }
    }
  }

  /** 暂停充能计时（状态转 Paused，剩余 tick 保留）。 */
  pauseTimer(): void {
    this.status = SuperWeaponStatus.Paused;
  }

  /** 恢复计时：按剩余 tick 决定回到 Charging 还是 Ready。 */
  resumeTimer(): void {
    this.status = this.chargeTicks > 0 ? SuperWeaponStatus.Charging : SuperWeaponStatus.Ready;
  }

  /** 重置满充；若当前是 Ready 则回到 Charging（可再次充能）。 */
  resetTimer(): void {
    this.chargeTicks = this.rechargeTicks;
    if (this.status === SuperWeaponStatus.Ready) this.status = SuperWeaponStatus.Charging;
  }

  /** 剩余充能秒数（chargeTicks / 15）。 */
  getTimerSeconds(): number {
    return this.chargeTicks / GameSpeed.BASE_TICKS_PER_SECOND;
  }

  /** 充能进度 [0,1]（0=刚重置，1=已满）。 */
  getChargeProgress(): number {
    return (this.rechargeTicks - this.chargeTicks) / this.rechargeTicks;
  }
}
