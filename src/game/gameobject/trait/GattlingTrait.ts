/**
 * GattlingTrait — 加特林武器阶段升级 trait（IsGattling=yes）。
 *
 * 武器成对排列 (Stage*2) 地面 / (Stage*2+1) 对空。攻击中 timer 每 tick
 * +RateUp，空闲 -RateDown；timer 落在 StageX 阈值区间即激活该阶段
 * （精英用 EliteStage）。阶段切换时 ArmedTrait.selectGattlingStage
 * 换武器，并为运行中的 AttackTask 重选武器避免旧音效/伤害残留。
 * 攻击/销毁时停掉全部叠放的开火音效。
 *
 * 由 game/gameobject/trait/GattlingTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyAttackModule from "game/gameobject/trait/interface/NotifyAttack"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import { AttackTrait } from "game/gameobject/trait/AttackTrait"; // 未转换（any-shim）
import { AttackTask } from "game/gameobject/task/AttackTask"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GattlingTrait {
  /** 宿主对象。 */
  gameObject: any;
  /** 当前加特林阶段（0 起）。 */
  stage: number;
  /** 升阶计时器。 */
  timer: number;
  /** 每 tick 升速（INI RateUp，默认 1）。 */
  rateUp: number;
  /** 每 tick 降速（INI RateDown，默认 1）。 */
  rateDown: number;
  /** 普通阶段阈值表。 */
  stageThresholds: number[];
  /** 精英阶段阈值表。 */
  eliteStageThresholds: number[];
  /** 本 tick 是否开过火（攻击推进 timer 用）。 */
  firedThisTick: boolean | undefined;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.stage = 0;
    this.timer = 0;
    this.rateUp = gameObject.rules.rateUp || 1;
    this.rateDown = gameObject.rules.rateDown || 1;
    this.stageThresholds = gameObject.rules.stageThresholds || [];
    this.eliteStageThresholds = gameObject.rules.eliteStageThresholds || [];
  }

  /** 是否精英（决定阈值表与武器阶段）。 */
  private _isElite(): boolean {
    return this.gameObject.veteranLevel === VeteranLevel.Elite;
  }

  /** 当前生效阈值表。 */
  private _getThresholds(): number[] {
    return this._isElite() ? this.eliteStageThresholds : this.stageThresholds;
  }

  /** 阈值表最大值（timer 上限）。 */
  private _maxTimer(): number {
    const thresholds = this._getThresholds();
    return 0 < thresholds.length ? thresholds[thresholds.length - 1] : 0;
  }

  /** 由 timer 推算当前阶段索引。 */
  private _computeStage(): number {
    const thresholds = this._getThresholds();
    let stage = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (this.timer < thresholds[i]) break;
      stage = i;
    }
    return Math.min(stage, Math.max(0, thresholds.length - 1));
  }

  /** 阶段切换：换 ArmedTrait 武器对并为运行中 AttackTask 重选武器。 */
  private _updateWeapon(_obj: any, world: any): void {
    const obj = this.gameObject;
    obj.armedTrait?.selectGattlingStage(this.stage, this._isElite());
    // AttackTask captures its weapon at creation time. When the Gattling
    // stage advances we swap the ArmedTrait primary/secondary pair, but the running
    // AttackTask keeps firing the old Weapon instance, so stage 1/2 still play the
    // stage 0 sound and damage. Re-select the weapon for any active AttackTask so
    // the next shot uses the correct stage weapon.
    const current = obj.unitOrderTrait?.getCurrentTask?.();
    let selected;
    if (current instanceof AttackTask) {
      selected = obj.attackTrait?.selectWeaponVersus(
        obj,
        current.target,
        world,
        !!current.options.force,
        !!current.options.passive,
      );
      if (selected) current.setWeapon(selected);
    }
    const opp = obj.attackTrait?.opportunityFireTask;
    if (opp instanceof AttackTask && opp !== current) {
      selected = obj.attackTrait?.selectWeaponVersus(
        obj,
        opp.target,
        world,
        !!opp.options.force,
        !!opp.options.passive,
      );
      if (selected) opp.setWeapon(selected);
    }
  }

  /** 停掉对象上全部叠放的武器开火音效（Report 实例数组与单句柄）。 */
  private _stopAllWeaponFireSounds(obj: any): void {
    const sounds = obj.__weaponFireSounds;
    if (sounds && sounds.length) {
      for (let i = 0; i < sounds.length; i++) {
        try {
          if (sounds[i].isPlaying()) sounds[i].stop();
        } catch {
          /* ignore */
        }
      }
      sounds.length = 0;
    }
    if (obj.__weaponFireSound && obj.__weaponFireSound.isPlaying()) {
      obj.__weaponFireSound.stop();
      obj.__weaponFireSound = void 0;
    }
  }

  /** 开火广播：仅当攻击方是本体时标记本 tick 开火。 */
  [NotifyAttackModule.NotifyAttack.onAttack](_a: any, _b: any, attacker: any): void {
    // Warhead.inflictDamage notifies both the victim's and the attacker's
    // NotifyAttack traits. The third argument is the attacker, so only
    // advance the gattling timer when this unit is the one that fired.
    if (attacker === this.gameObject) this.firedThisTick = !0;
  }

  /** 每 tick：推进 timer、重算阶段并在切换时换武器+停音效。 */
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any): void {
    const thresholds = this._getThresholds();
    if (!(0 < thresholds.length)) return;
    const attacking = obj.attackTrait && !obj.attackTrait.isIdle();
    if (attacking || this.firedThisTick) {
      this.timer = Math.min(this._maxTimer(), this.timer + this.rateUp);
      this.firedThisTick = !1;
    } else {
      this.timer = Math.max(0, this.timer - this.rateDown);
    }
    const nextStage = this._computeStage();
    if (nextStage !== this.stage) {
      this.stage = nextStage;
      // Stop every active Report instance from the previous stage. Gattling weapons
      // can accumulate multiple overlapping handles during a fast burst; only stopping
      // __weaponFireSound leaves the older loops running, so stage 1/2/3 sounds overlap.
      this._stopAllWeaponFireSounds(obj);
      this._updateWeapon(obj, world);
    }
    // Ensure the per-tick firing flag is always cleared, even if this tick did not
    // enter the timer-increase branch (e.g. unit went idle or the trait stops ticking).
    this.firedThisTick = !1;
  }

  /** 销毁：立即停掉全部跟踪的武器音效。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](obj: any): void {
    // If the unit is destroyed while firing, AttackTask.onEnd may not run in time.
    // Stop every tracked weapon sound immediately so the gattling loop doesn't
    // keep playing after the tank is gone.
    this._stopAllWeaponFireSounds(obj);
  }
}

// 保留 AttackTrait 导入（孪生 deps 列出，运行时经模块注册）。
void AttackTrait;
