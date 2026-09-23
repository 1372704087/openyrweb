/**
 * NukeEffect — 战术核弹超武特效。
 *
 * onStart：取武器规则，若拥有者有核弹发射井（nukeSilo 建筑）则从井口
 * 正常开火；否则 fireLooseNuke 在目标格生成松散弹体（并抬到 detonationAltitude）。
 * onTick：立即完成。
 *
 * 由 game/superweapon/NukeEffect.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Weapon } from "game/Weapon"; // 已转换
import { WeaponType } from "game/WeaponType"; // 已转换
import { SuperWeaponEffect } from "game/superweapon/SuperWeaponEffect"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class NukeEffect extends SuperWeaponEffect {
  /** 武器 INI 名。 */
  weaponType: string;

  constructor(type: any, owner: any, tile: any, weaponType: string) {
    super(type, owner, tile);
    this.weaponType = weaponType;
  }

  onStart(world: any): void {
    const weapon = world.rules.getWeapon(this.weaponType);
    const target = world.createTarget(undefined, this.tile);
    const silo = this.owner
      .getOwnedObjectsByType(ObjectType.Building)
      .find((b: any) => b.rules.nukeSilo);
    if (silo) {
      const w = Weapon.factory(weapon.name, WeaponType.Primary, silo, world.rules);
      w.fire(target, world);
    } else {
      this.fireLooseNuke(weapon, target, world);
    }
  }

  /** 无发射井时在目标 lepton 位置生成松散核弹弹体。 */
  fireLooseNuke(weapon: any, target: any, world: any): void {
    const pos = new Vector2(this.tile.rx + 0.5, this.tile.ry + 0.5).multiplyScalar(
      Coords.LEPTONS_PER_TILE,
    );
    if (world.map.isWithinHardBounds(pos)) {
      const projectile = world.createLooseProjectile(weapon.name, this.owner, target);
      projectile.position.moveToLeptons(pos);
      projectile.position.tileElevation = Coords.worldToTileHeight(
        projectile.rules.detonationAltitude,
      );
      world.spawnObject(projectile, projectile.position.tile);
    }
  }

  onTick(_world: any): boolean {
    return true;
  }
}
