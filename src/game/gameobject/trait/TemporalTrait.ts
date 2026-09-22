/**
 * TemporalTrait — 超时空/湮灭武器 trait（超时空军团兵等）。
 *
 * 攻击方 updateTarget 登记目标，目标进入 warpedOut 并设定 eraseTicks=
 * 10×maxHitPoints；每 tick 按攻击方武器 damage 扣减，归零摧毁。
 * 释放后若无其他攻击者则 expire warpedOut。目标/自身销毁时释放。
 *
 * 由 game/gameobject/trait/TemporalTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { DeathType } from "game/gameobject/common/DeathType"; // 未转换（any-shim）
import { AttackTask } from "game/gameobject/task/AttackTask"; // 未转换（any-shim）
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TemporalTrait {
  /** 宿主对象（攻击方或被攻击方均可挂载）。 */
  gameObject: any;
  /** 被攻击时是否仍计入 warpedOut 帧（默认 true）。 */
  ticksWhenWarpedOut: boolean;
  /** 以本对象为当前目标的攻击方集合。 */
  attackers: Set<any>;
  /** 作为攻击方时当前锁定的目标。 */
  currentTarget: any;
  /** 作为攻击方时当前使用的武器。 */
  currentWeapon: any;
  /** 被攻击方剩余湮灭伤害点（由 maxHitPoints 初始化）。 */
  eraseTicks: number | undefined;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.ticksWhenWarpedOut = !0;
    this.attackers = new Set();
  }

  /** 每 tick：保持/释放锁定目标；按攻击方伤害推进 eraseTicks。 */
  [NotifyTickModule.NotifyTick.onTick](self: any, world: any): void {
    if (
      self.attackTrait &&
      ((self.attackTrait.currentTarget && !self.warpedOutTrait.isActive()) || this.releaseCurrentTarget(world)),
      void 0 !== this.eraseTicks
    ) {
      for (const attacker of this.attackers) {
        const weapon = attacker.temporalTrait.currentWeapon;
        if (!weapon) throw new Error(`Attacker "${attacker.name}" is no longer targeting "${self.name}"`);
        const damage = weapon.rules.damage;
        this.eraseTicks -= damage;
        if (this.eraseTicks <= 0) {
          self.deathType = DeathType.Temporal;
          world.destroyObject(self, { player: attacker.owner, obj: attacker, weapon }, !0);
          this.eraseTicks = void 0;
          break;
        }
      }
    }
  }

  /** 作为攻击方：当前目标。 */
  getTarget(): any {
    return this.currentTarget;
  }

  /** 作为攻击方：更新锁定目标；首个攻击者触发 warpedOut 并初始化 eraseTicks。 */
  updateTarget(target: any, weapon: any, world: any): void {
    if (this.currentTarget !== target) {
      this.releaseCurrentTarget(world);
      this.currentTarget = target;
      this.currentWeapon = weapon;
      const wasEmpty = target.temporalTrait.attackers.size;
      target.temporalTrait.attackers.add(this.gameObject);
      if (!wasEmpty) return;
      target.warpedOutTrait.setActive(!0, !0, world);
      const task = target.unitOrderTrait.getCurrentTask();
      if ((task && task instanceof AttackTask) || task instanceof MoveTask) task.cancel();
      target.temporalTrait.eraseTicks = 10 * target.healthTrait.maxHitPoints;
    }
  }

  /** 释放当前目标；目标侧无攻击者则 expire warpedOut 并清 eraseTicks。 */
  releaseCurrentTarget(world: any): void {
    if (this.currentTarget) {
      if (!this.currentTarget.isDisposed) {
        const set = this.currentTarget.temporalTrait.attackers;
        set.delete(this.gameObject);
        if (!set.size) {
          this.currentTarget.warpedOutTrait.expire(world);
          this.currentTarget.temporalTrait.eraseTicks = void 0;
        }
      }
      this.currentTarget = void 0;
      this.currentWeapon = void 0;
    }
  }

  /** 自身销毁：释放目标。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](_obj: any, world: any): void {
    this.releaseCurrentTarget(world);
  }

  /** 清理引用。 */
  dispose(): void {
    this.gameObject = void 0;
    this.attackers.clear();
  }
}
