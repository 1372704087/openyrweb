/**
 * BioReactorPowerTrait — 生物反应堆电力（血量基础 Power + 驻军 ExtraPower）。
 *
 * 本 trait 独占该建筑在玩家 PowerTrait 中的整条电力登记（基础按血量缩放
 * + 驻军×ExtraPower）；PowerTrait._ownedByBioReactor 跳过携带本 trait 的
 * techno，避免双计。每 tick/受伤后 _reconcile 推 delta，并经 NotifyPower
 * + PowerChangeEvent 刷新 HUD。Invariant：
 *   power 包含 ceil(Power×health%) + occupants×ExtraPower。
 *
 * 由 game/gameobject/trait/BioReactorPowerTrait.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 已转换
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换
import * as PowerChangeEventModule from "game/event/PowerChangeEvent"; // 未转换（any-shim）
import * as NotifyPowerModule from "game/trait/interface/NotifyPower"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class BioReactorPowerTrait {
  /** 当前已登记在玩家电力池中的总电力。 */
  registered: number;
  /** 是否已登记（首次 onSpawn 后 true）。 */
  added: boolean;

  constructor() {
    this.registered = 0;
    this.added = false;
  }

  /** 真实输出：ceil(Power×health%) + round(驻军×ExtraPower)。 */
  _currentTotal(building: any) {
    const base = Math.ceil(((building.rules.power || 0) * (building.healthTrait ? building.healthTrait.health : 100)) / 100);
    const occupants = building.garrisonTrait ? building.garrisonTrait.units.length : 0;
    return base + Math.round(occupants * (building.rules.extraPower || 0));
  }

  /** 把 (newTotal − registered) 推入玩家电力池并广播刷新。 */
  _reconcile(building: any, world: any) {
    const total = this._currentTotal(building);
    if (total === this.registered && this.added) return;
    const powerTrait = building.owner.powerTrait;
    if (!powerTrait) return;
    if (!this.added) {
      powerTrait.powerByObject.set(building, total);
      powerTrait.power += total;
      this.added = true;
    } else {
      // 孪生对 get 结果做 set（有值/无值同路径），等价于直接 set。
      const prev = powerTrait.powerByObject.get(building);
      if (prev !== undefined) powerTrait.powerByObject.set(building, total);
      else powerTrait.powerByObject.set(building, total);
      powerTrait.power += total - this.registered;
    }
    this.registered = total;
    powerTrait.updateLevel(world);
    world.traits.filter(NotifyPowerModule.NotifyPower).forEach((trait: any) => {
      trait[NotifyPowerModule.NotifyPower.onPowerChange](powerTrait.player, world);
    });
    world.events.dispatch(new PowerChangeEventModule.PowerChangeEvent(powerTrait.player, powerTrait.power, powerTrait.drain));
  }

  /** 从玩家池移除本建筑整条登记并广播。 */
  _remove(building: any, world: any) {
    if (!this.added) return;
    const powerTrait = building.owner.powerTrait;
    if (powerTrait) {
      powerTrait.power -= this.registered;
      powerTrait.powerByObject.delete(building);
      this.registered = 0;
      this.added = false;
      powerTrait.updateLevel(world);
      world.traits.filter(NotifyPowerModule.NotifyPower).forEach((trait: any) => {
        trait[NotifyPowerModule.NotifyPower.onPowerChange](powerTrait.player, world);
      });
      world.events.dispatch(
        new PowerChangeEventModule.PowerChangeEvent(powerTrait.player, powerTrait.power, powerTrait.drain),
      );
    }
  }

  /** 出生：复位登记状态，afterTick 再 reconcile。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](building: any, world: any) {
    this.registered = 0;
    this.added = false;
    world.afterTick(() => this._reconcile(building, world));
  }

  /** 每 tick reconcile（驻军/血量变化同步）。 */
  [NotifyTickModule.NotifyTick.onTick](building: any, world: any) {
    this._reconcile(building, world);
  }

  /** 受伤：血量变，afterTick 重算基础 Power。 */
  [NotifyDamageModule.NotifyDamage.onDamage](building: any, world: any) {
    world.afterTick(() => this._reconcile(building, world));
  }

  /** 离场：移除整条登记。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](building: any, world: any) {
    this._remove(building, world);
  }

  /**
   * 换主：从旧主移除并复位，下一 tick _reconcile 在新主下重登记。
   * @param building 建筑
   * @param oldOwner 旧主
   * @param world 游戏世界
   */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](building: any, oldOwner: any, world: any) {
    if (!this.added) return;
    const powerTrait = oldOwner.powerTrait;
    if (powerTrait) {
      powerTrait.power -= this.registered;
      powerTrait.powerByObject.delete(building);
      powerTrait.updateLevel(world);
      world.traits.filter(NotifyPowerModule.NotifyPower).forEach((trait: any) => {
        trait[NotifyPowerModule.NotifyPower.onPowerChange](powerTrait.player, world);
      });
      world.events.dispatch(
        new PowerChangeEventModule.PowerChangeEvent(powerTrait.player, powerTrait.power, powerTrait.drain),
      );
    }
    this.registered = 0;
    this.added = false;
  }
}
