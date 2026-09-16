/**
 * CrewedTrait — 载具/建筑被毁时逃出乘员的 trait。
 *
 * 根据所属阵营（SideType）从 CrewRules 取乘员单位名和幸存者除数，
 * 按卖断价值计算幸存人数（载具最多 1 人、建筑最多 5 人），在建筑占位
 * 内随机格生成步兵（基地车被毁最后一名替换为工程师），散开逃离。
 * 死亡方式为自杀/自爆或移动中坠落的不逃出。
 *
 * 由 game/gameobject/trait/CrewedTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifySellModule from "game/gameobject/trait/interface/NotifySell"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import { SideType } from "game/SideType"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import * as ScatterTaskModule from "game/gameobject/task/ScatterTask"; // 未转换（any-shim）
import * as InfantryModule from "game/gameobject/Infantry"; // 已转换
import * as VeteranLevelModule from "game/gameobject/unit/VeteranLevel"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CrewedTrait {
  [NotifySellModule.NotifySell.onSell](object: any, world: any): void {
    this.spawnSurvivors(object, world);
  }

  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, attacker: any, game: any, isPrimary: any): void {
    // 自杀武器自毁 / 移动中 / 有坠毁 trait 的不逃出乘员。
    if (
      isPrimary ||
      (attacker?.obj === object && attacker.weapon?.rules.suicide) ||
      (object.isVehicle() && object.moveTrait.isMoving()) ||
      object.crashableTrait
    ) {
      return;
    }
    this.spawnSurvivors(object, game);
  }

  /** 生成幸存乘员：按阵营取乘员名，按卖断价值计算人数，在占位内随机格散开。 */
  spawnSurvivors(object: any, world: any): void {
    const crew = world.rules.general.crew;
    const side = object.owner.country.side;
    let divisor: number;
    let crewName: string;
    if (side === SideType.GDI) {
      divisor = crew.alliedSurvivorDivisor;
      crewName = crew.alliedCrew;
    } else if (side === SideType.Nod) {
      divisor = crew.sovietSurvivorDivisor;
      crewName = crew.sovietCrew;
    } else {
      if (side !== SideType.ThirdSide) return;
      divisor = crew.thirdSurvivorDivisor;
      crewName = crew.thirdCrew;
    }
    let count = world.sellTrait.computeRefundValue(object) / divisor;
    count = count > 0 && count < 1 ? 1 : Math.floor(count);
    count = object.isVehicle() ? Math.min(1, count) : Math.min(5, count);
    const survivors: string[] = [];
    for (let i = 0; i < count; i++) survivors.push(crewName);
    if (survivors.length > 0) {
      // 基地车被毁时最后一名替换为工程师。
      if (object.rules.constructionYard) survivors[survivors.length - 1] = world.rules.general.engineer;
      const candidateTiles = world.map.tiles
        .getInRectangle(object.tile, object.getFoundation())
        .filter((tile: any) => world.map.isWithinBounds(tile));
      let available = [...candidateTiles];
      for (const crewType of survivors) {
        const crewRules = world.rules.getObject(crewType, ObjectType.Infantry);
        if (
          world.map.terrain.getPassableSpeed(
            object.tile,
            crewRules.speedType,
            true,
            !object.isBuilding() && object.onBridge,
            undefined,
            true,
          )
        ) {
          const unit = world.createUnitForPlayer(crewRules, object.owner);
          const tile = available.length
            ? available.splice(world.generateRandomInt(0, available.length - 1), 1)[0]
            : candidateTiles[world.generateRandomInt(0, candidateTiles.length - 1)];
          if (unit.isInfantry()) unit.position.subCell = InfantryModule.Infantry.SUB_CELLS[0];
          if (unit.veteranTrait && object.owner.canProduceVeteran(unit.rules))
            unit.veteranTrait.setVeteranLevel(VeteranLevelModule.VeteranLevel.Veteran);
          world.spawnObject(unit, tile);
          if (object.isBuilding()) {
            unit.unitOrderTrait.addTask(
              new ScatterTaskModule.ScatterTask(world, undefined, { ignoredBlockers: object.isDestroyed ? undefined : [object] }),
            );
          }
        }
      }
    }
  }
}
