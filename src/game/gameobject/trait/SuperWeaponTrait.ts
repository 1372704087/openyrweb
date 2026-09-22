/**
 * SuperWeaponTrait — 建筑持有超级武器（spawn/unspawn/换主时向玩家注册/移除）。
 *
 * name 为超武规则名：onSpawn 时若玩家 superWeaponsTrait 尚无该名则
 * createSuperWeapon 并 add；低电且 isPowered 则 pauseTimer。onUnspawn /
 * 换主时先从旧主移除（仅当玩家其它建筑不再持有同名且非 gift）再注册新主。
 *
 * 由 game/gameobject/trait/SuperWeaponTrait.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SuperWeaponTrait {
  /** 超武规则名。 */
  name: any;

  constructor(name: any) {
    this.name = name;
  }

  /** 从所属玩家的 SuperWeaponsTrait 取出本名超武实例。 */
  getSuperWeapon(building: any) {
    return building.owner.superWeaponsTrait?.get(this.name);
  }

  /** 出生：按需向玩家注册超武。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any) {
    this.addSuperWeaponToPlayerIfNeeded(object.owner, world);
  }

  /** 离场：按需从玩家移除超武。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any) {
    this.removeSuperWeaponFromPlayerIfNeeded(object.owner);
  }

  /** 换主：旧主移除、新主注册。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](object: any, oldOwner: any, world: any) {
    this.removeSuperWeaponFromPlayerIfNeeded(oldOwner);
    this.addSuperWeaponToPlayerIfNeeded(object.owner, world);
  }

  /** 玩家尚无该名超武时创建并加入；低电且需电则 pauseTimer。 */
  addSuperWeaponToPlayerIfNeeded(player: any, world: any) {
    if (player.superWeaponsTrait && !player.superWeaponsTrait.has(this.name)) {
      const sw = world.createSuperWeapon(this.name, player);
      player.superWeaponsTrait.add(sw);
      if (sw.rules.isPowered && player.powerTrait?.isLowPower()) sw.pauseTimer();
    }
  }

  /** 玩家无其它建筑仍持有同名且非 gift 时移除。 */
  removeSuperWeaponFromPlayerIfNeeded(player: any) {
    const collection = player.superWeaponsTrait;
    if (collection) {
      const stillOwned = player
        .getOwnedObjectsByType(ObjectTypeModule.ObjectType.Building)
        .some((b: any) => b.superWeaponTrait?.name === this.name);
      if (!stillOwned) {
        const sw = collection.get(this.name);
        if (sw && !sw.isGift) collection.remove(this.name);
      }
    }
  }
}
