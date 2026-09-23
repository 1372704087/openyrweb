/**
 * StalemateDetectTrait — 僵局检测（graceMinutes 倒计时 + 经济/建造活动重置）。
 *
 * 每 tick 倒数归零仅派发一次 StalemateDetectEvent；战斗方 credits 上升且
 * 有工厂、生产/放置非墙建筑、敌对摧毁非墙非 insignificant 建筑、非同盟换主
 * 都 clearStale。graceMinutes=10。
 *
 * 由 game/gameobject/trait/StalemateDetectTrait.ts.js →
 * game/trait/StalemateDetectTrait.ts.js 重写为 TS（行为完全一致）。两个文
 * 件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模
 * 块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as StalemateDetectEventModule from "game/event/StalemateDetectEvent"; // 未转换（any-shim）
import * as GameSpeedModule from "game/GameSpeed"; // 已转换
import * as NotifyDestroyModule from "game/trait/interface/NotifyDestroy"; // 已转换
import * as NotifyOwnerChangeModule from "game/trait/interface/NotifyOwnerChange"; // 已转换
import * as NotifyPlaceBuildingModule from "game/trait/interface/NotifyPlaceBuilding"; // 已转换
import * as NotifyProduceUnitModule from "game/trait/interface/NotifyProduceUnit"; // 已转换
import * as NotifyTickModule from "game/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class StalemateDetectTrait {
  /** 是否已触发过僵局事件（直到 clearStale）。 */
  stale: boolean;
  /** 各战斗方上次已知 credits。 */
  allPlayersCredits: Map<any, any>;
  /** 距僵局事件的剩余 tick。 */
  countdownTicks: number;
  /** 宽限分钟数（静态，见类尾赋值）。 */
  static graceMinutes: number;

  constructor() {
    this.stale = false;
    this.allPlayersCredits = new Map();
    this.resetCountdown();
  }

  /** 是否处于僵局态。 */
  isStale() {
    return this.stale;
  }

  /** 剩余宽限 tick。 */
  getCountdownTicks() {
    return this.countdownTicks;
  }

  /** 按 graceMinutes 重置倒计时。 */
  resetCountdown() {
    this.countdownTicks = Math.floor(60 * StalemateDetectTrait.graceMinutes * GameSpeedModule.GameSpeed.BASE_TICKS_PER_SECOND);
  }

  /** 清僵局并重置倒计时。 */
  clearStale() {
    this.stale = false;
    this.resetCountdown();
  }

  /** 每 tick：倒数或派发事件；监听 credits 上升（有工厂则 clear）。 */
  [NotifyTickModule.NotifyTick.onTick](world: any) {
    if (this.countdownTicks > 0) {
      this.countdownTicks--;
    } else if (!this.stale) {
      this.stale = true;
      this.resetCountdown();
      world.events.dispatch(new StalemateDetectEventModule.StalemateDetectEvent());
    }
    for (const player of world.getCombatants()) {
      const prev = this.allPlayersCredits.get(player);
      if (prev !== player.credits) {
        this.allPlayersCredits.set(player, player.credits);
        if (player.credits > (prev ?? 0) && player.production.hasAnyFactory()) this.clearStale();
      }
    }
  }

  /** 生产单位：清僵局。 */
  [NotifyProduceUnitModule.NotifyProduceUnit.onProduce]() {
    this.clearStale();
  }

  /** 放置建筑：非墙则清僵局。 */
  [NotifyPlaceBuildingModule.NotifyPlaceBuilding.onPlace](object: any) {
    if (!object.wallTrait) this.clearStale();
  }

  /** 摧毁：非中立/墙/insignificant 的敌对建筑被毁则清僵局。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, world: any, attackerInfo: any) {
    if (!object.isBuilding()) return;
    if (object.owner.isNeutral) return;
    if (object.wallTrait) return;
    if (object.rules.insignificant) return;
    if (object.owner.defeated && this.stale) return;
    if (attackerInfo?.obj && world.areFriendly(object, attackerInfo.obj)) return;
    this.clearStale();
  }

  /** 换主：非同盟且旧主非中立则清僵局。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](object: any, oldOwner: any, world: any) {
    if (object.isBuilding() && !oldOwner.isNeutral) {
      if (!world.alliances.areAllied(object.owner, oldOwner)) this.clearStale();
    }
  }
}

StalemateDetectTrait.graceMinutes = 10;
