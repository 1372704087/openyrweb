/**
 * PowerTrait — 建筑电力登记 trait（挂在玩家身上）。
 *
 * 负责把带 rules.power 的 Techno 出生/离场/血量变化/换主/warp 变化
 * 同步到 owner.powerTrait（add/remove/update）：
 *  - BioReactorPowerTrait（ExtraPower+InfantryAbsorb，如尤里生物反应炉）
 *    拥有完整电力输出（基础+驻军加成），本 trait 必须跳过该对象，
 *    否则血量 update 会用 rules.power 重算抹掉驻军加成，导致疏散后
 *    无限电力 bug；
 *  - 中立且 needsEngineer 的可占领电力（isCapturablePower）不计入
 *    玩家电力（占领前中立建筑不供电）；
 *  - 每 tick 对全部战斗方 updateBlackout（断电状态刷新）。
 *
 * 由 game/trait/PowerTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifySpawnModule from "game/trait/interface/NotifySpawn"; // 孪生
import * as NotifyHealthChangeModule from "game/trait/interface/NotifyHealthChange"; // 孪生
import * as NotifyUnspawnModule from "game/trait/interface/NotifyUnspawn"; // 孪生
import * as NotifyOwnerChangeModule from "game/trait/interface/NotifyOwnerChange"; // 本组新写
import * as NotifyWarpChangeModule from "game/trait/interface/NotifyWarpChange"; // 孪生
import * as NotifyTickModule from "game/trait/interface/NotifyTick"; // 本组新写

export class PowerTrait {
  /**
   * 是否由 BioReactorPowerTrait 独占该建筑的电力簿记。
   * 生物反应炉拥有完整输出（基础 Power 按血量缩放 + 每驻军 ExtraPower），
   * 基础游戏逻辑不得再 add/update/remove 基础切片，否则双方不同步。
   */
  _ownedByBioReactor(object: any): boolean {
    return !!object.bioReactorPowerTrait;
  }

  /** 建筑出生：非生物反应炉、非可占领中立电力时向 owner 登记电力。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any): void {
    if (
      object.isTechno() &&
      object.rules.power &&
      !this._ownedByBioReactor(object) &&
      !this.isCapturablePower(object, object.owner)
    ) {
      object.owner.powerTrait?.updateFrom(object, "add", world);
    }
  }

  /** 建筑离场：非 warp、非生物反应炉、非可占领电力时从 owner 移除。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any, world: any): void {
    if (
      object.isTechno() &&
      object.rules.power &&
      !object.warpedOutTrait.isActive() &&
      !this._ownedByBioReactor(object) &&
      !this.isCapturablePower(object, object.owner)
    ) {
      object.owner.powerTrait?.updateFrom(object, "remove", world);
    }
  }

  /** 血量变化：重算该建筑电力贡献（生物反应炉/warp/可占领跳过）。 */
  [NotifyHealthChangeModule.NotifyHealthChange.onChange](object: any, world: any): void {
    if (
      object?.isTechno() &&
      object.rules.power &&
      !object.warpedOutTrait.isActive() &&
      !this._ownedByBioReactor(object) &&
      !this.isCapturablePower(object, object.owner)
    ) {
      object.owner.powerTrait?.updateFrom(object, "update", world);
    }
  }

  /**
   * 换主：旧主 remove、新主 add。生物反应炉交由自身 trait 在 tick
   * 时重新对账，此处直接 return。
   */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](
    object: any,
    oldOwner: any,
    world: any,
  ): void {
    if (this._ownedByBioReactor(object)) {
      // 生物反应炉归属转移：交给 trait 自身（下 tick 重新对账）。
      return;
    }
    if (object.rules.power && !object.warpedOutTrait.isActive()) {
      if (!this.isCapturablePower(object, oldOwner)) {
        oldOwner.powerTrait?.updateFrom(object, "remove", world);
      }
      if (!this.isCapturablePower(object, object.owner)) {
        object.owner.powerTrait?.updateFrom(object, "add", world);
      }
    }
  }

  /** warp 生效/失效：inactive→remove，active→add（生物反应炉跳过）。 */
  [NotifyWarpChangeModule.NotifyWarpChange.onChange](
    object: any,
    world: any,
    inactive?: boolean,
  ): void {
    if (this._ownedByBioReactor(object)) return;
    if (object.rules.power && !this.isCapturablePower(object, object.owner)) {
      object.owner.powerTrait?.updateFrom(object, inactive ? "remove" : "add", world);
    }
  }

  /** 每 tick：对全部战斗方刷新断电状态。 */
  [NotifyTickModule.NotifyTick.onTick](world: any): void {
    for (const player of world.getCombatants()) {
      player.powerTrait.updateBlackout(world);
    }
  }

  /** 可占领电力：有电力、当前归属中立、且 needsEngineer（工程师占领建筑）。 */
  isCapturablePower(object: any, owner: any): boolean {
    return 0 < object.rules.power && owner.isNeutral && object.rules.needsEngineer;
  }
}
