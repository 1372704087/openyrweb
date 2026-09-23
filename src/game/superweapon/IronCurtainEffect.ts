/**
 * IronCurtainEffect — 铁幕超武特效。
 *
 * onStart：以激活格为心、半径 1 扫描地面 techno：
 *  - 有机单位（organic）直接摧毁；
 *  - 其余非导弹单位套 invulnerableTrait.setActiveFor(ironCurtainDuration)；
 *  - 载具/飞机若寄生虫在体，一并拆掉寄生。
 * onTick：立即返回 true（无持续阶段）。
 *
 * 由 game/superweapon/IronCurtainEffect.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { SuperWeaponEffect } from "game/superweapon/SuperWeaponEffect"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class IronCurtainEffect extends SuperWeaponEffect {
  onStart(world: any): void {
    const duration = world.rules.combatDamage.ironCurtainDuration;
    const ctx = { player: this.owner };
    const finder = new RadialTileFinder(
      world.map.tiles,
      world.map.mapBounds,
      this.tile,
      { width: 1, height: 1 },
      0,
      1,
      () => true,
    );
    let tile: any;
    while ((tile = finder.getNextTile())) {
      for (const obj of world.map.getGroundObjectsOnTile(tile)) {
        if (!obj.isTechno() || obj.isDestroyed) continue;
        if (obj.isUnit() && obj.tile !== tile) continue;
        if (obj.rules.missileSpawn) continue;
        if (obj.rules.organic) {
          world.destroyObject(obj, ctx);
        } else {
          obj.invulnerableTrait.setActiveFor(duration, world.currentTick);
          if (
            (obj.isVehicle() || obj.isAircraft()) &&
            obj.parasiteableTrait?.isInfested()
          ) {
            obj.parasiteableTrait.destroyParasite(ctx, world);
          }
        }
      }
    }
  }

  onTick(_world: any): boolean {
    return true;
  }
}
