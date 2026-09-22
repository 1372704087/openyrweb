/**
 * FreeUnitTrait — 建筑完工赠送单位（FreeUnit=，径向寻路找落点）。
 *
 * 建造状态变为 BuildUp 且建筑 buildStatus 仍为 Ready、且主非中立时：
 * 按 FreeUnit 查车辆规则，否则步兵规则；用 RadialBackFirstTileFinder 从
 * 地基向外找可走落点（通过性、高差 <2、无障碍、无 overlay）。找不到落点
 * 则回收单位并返还 soylent/purchaseValue。
 *
 * 由 game/gameobject/trait/FreeUnitTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import * as NotifyBuildStatusModule from "game/gameobject/trait/interface/NotifyBuildStatus"; // 已转换
import * as BuildingModule from "game/gameobject/Building"; // 未转换（any-shim）
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换
import * as RadialBackFirstTileFinderModule from "game/map/tileFinder/RadialBackFirstTileFinder"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class FreeUnitTrait {
  /**
   * 建造状态变化：从 Ready→BuildUp 时生成 FreeUnit 并放到附近可走格。
   * @param status 新状态
   * @param building 建筑对象
   * @param world 游戏世界
   */
  [NotifyBuildStatusModule.NotifyBuildStatus.onStatusChange](status: any, building: any, world: any) {
    if (
      building.buildStatus === BuildingModule.BuildStatus.Ready &&
      status === BuildingModule.BuildStatus.BuildUp &&
      !building.owner.isNeutral
    ) {
      let rules: any;
      if (world.rules.hasObject(building.rules.freeUnit, ObjectTypeModule.ObjectType.Vehicle)) {
        rules = world.rules.getObject(building.rules.freeUnit, ObjectTypeModule.ObjectType.Vehicle);
      } else {
        if (!world.rules.hasObject(building.rules.freeUnit, ObjectTypeModule.ObjectType.Infantry)) {
          console.warn(`Free unit "${building.rules.freeUnit}" is not a vehicle or infantry type.`);
          return;
        }
        rules = world.rules.getObject(building.rules.freeUnit, ObjectTypeModule.ObjectType.Infantry);
      }
      const unit = world.createUnitForPlayer(rules, building.owner);
      let fallback: any;
      const chosen =
        new RadialBackFirstTileFinderModule.RadialBackFirstTileFinder(
          world.map.tiles,
          world.map.mapBounds,
          building.tile,
          building.getFoundation(),
          1,
          1,
          (tile: any) => {
            const passable =
              world.map.terrain.getPassableSpeed(tile, unit.rules.speedType, unit.isInfantry(), false) > 0 &&
              Math.abs(tile.z - building.tile.z) < 2 &&
              !world.map.terrain.findObstacles({ tile, onBridge: undefined }, unit).length;
            if (!fallback && passable) fallback = tile;
            return passable && !world.map.getObjectsOnTile(tile).find((o: any) => o.isOverlay());
          },
        ).getNextTile() ??
        fallback;
      if (!chosen) {
        building.owner.removeOwnedObject(unit);
        unit.dispose();
        building.owner.credits += unit.rules.soylent || unit.purchaseValue;
        return;
      }
      world.spawnObject(unit, chosen);
    }
  }
}
