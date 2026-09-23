/**
 * HelipadTrait — 停机坪变化时清除飞行器的首选机场引用。
 *
 * 换主或离场时，通知该玩家名下由 padAircraft 列表指定的飞行器清除
 * preferredAirport 引用，让它们重新搜索可停靠的机场。
 *
 * 由 game/gameobject/trait/HelipadTrait.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange";
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class HelipadTrait {
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](object: any, oldOwner: any, world: any): void {
    this.checkAircraftsForPlayer(oldOwner, world);
  }

  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any, world: any): void {
    this.checkAircraftsForPlayer(object.owner, world);
  }

  checkAircraftsForPlayer(player: any, world: any): void {
    const padAircraft = world.rules.general.padAircraft;
    for (const aircraft of player
      .getOwnedObjectsByType(ObjectType.Aircraft)
      .filter((a: any) => padAircraft.includes(a.name))) {
      if (aircraft.airportBoundTrait) aircraft.airportBoundTrait.preferredAirport = undefined;
    }
  }
}
