/**
 * OverpoweredTrait — 超载充电体（多个攻击单位「充电」时切换副武器/维持供电）。
 *
 * chargers 集合记录正在为本建筑充电的单位；isOverpowered 用充电体数量与
 * 阈值（自带通电 1，否则 +2）比较；hasChargersToPowerOn 供 PoweredTrait
 * 判断是否至少 2 个充电体。tick 清理已毁/坠毁/换主/目标不再是本对象的
 * 充电体；swapAttackTaskWeapon 在超载时切 secondaryWeapon 否则
 * primaryWeapon，无武器则取消当前 AttackTask。
 *
 * 由 game/gameobject/trait/OverpoweredTrait.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as AttackTaskModule from "game/gameobject/task/AttackTask"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class OverpoweredTrait {
  /** 所属建筑。 */
  obj: any;
  /** 正在充电的攻击单位集合。 */
  chargers: Set<any>;

  constructor(obj: any) {
    this.obj = obj;
    this.chargers = new Set();
  }

  /** 是否达到超载阈值（充电体数量 ≥ threshold）。 */
  isOverpowered() {
    let threshold = 1;
    // 已自带通电（forceOn）阈值 1，否则需 3 个充电体（+2）。
    if (this.obj?.poweredTrait?.isPoweredOn(true)) {
      // threshold stays 1
    } else {
      threshold += 2;
    }
    return this.chargers.size >= threshold;
  }

  /** 是否至少 2 个充电体可维持通电（PoweredTrait.isCharged 用）。 */
  hasChargersToPowerOn() {
    return this.chargers.size >= 2;
  }

  /** 登记一个充电体并刷新攻击武器。 */
  chargeFrom(unit: any) {
    this.chargers.add(unit);
    this.swapAttackTaskWeapon();
  }

  /** 每 tick：清理失效充电体，有移除则刷新武器。 */
  [NotifyTickModule.NotifyTick.onTick](obj: any) {
    if (this.chargers.size > 0) {
      let changed = false;
      this.chargers.forEach((unit) => {
        if (
          unit.isDestroyed ||
          unit.isCrashing ||
          unit.owner !== obj.owner ||
          unit.attackTrait?.currentTarget?.obj !== obj
        ) {
          this.chargers.delete(unit);
          changed = true;
        }
      });
      if (changed) this.swapAttackTaskWeapon();
    }
  }

  /** 当前 AttackTask 切换到 getWeapon()；无武器则 cancel。 */
  swapAttackTaskWeapon() {
    const task = this.obj?.unitOrderTrait.getCurrentTask();
    if (task instanceof AttackTaskModule.AttackTask) {
      const weapon = this.getWeapon();
      if (weapon) task.setWeapon(weapon);
      else task.cancel();
    }
  }

  /** 超载用副武器，否则主武器。 */
  getWeapon() {
    return this.isOverpowered() ? this.obj?.secondaryWeapon : this.obj?.primaryWeapon;
  }

  /** 释放引用并清空充电体。 */
  dispose() {
    this.obj = undefined;
    this.chargers.clear();
  }
}
