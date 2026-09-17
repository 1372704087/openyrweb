/**
 * RallyTrait — 集结点管理（设置/校验/为出厂单位找落点）。
 *
 * 工厂类建筑的集结点 trait，负责：
 *  - changeRallyPoint 校验玩家设定的集结格（水上/被占不可用）；
 *  - findRallyNodeForUnit / findRallyPointforUnit 为出厂单位在集结点
 *    附近找可用落位（RadialTileFinder 半径 5，检查通行性/建筑遮挡/
 *    高度差/桥面），找不到回落到集结点本身。
 *
 * 由 game/gameobject/trait/RallyTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as TerrainTypeModule from "engine/type/TerrainType"; // 未转换（any-shim）
import * as RadialTileFinderModule from "game/map/tileFinder/RadialTileFinder"; // 未转换（any-shim）
import * as FactoryTypeModule from "game/rules/TechnoRules"; // 已转换
import * as MovementZoneModule from "game/type/MovementZone"; // 已转换
import * as SpeedTypeModule from "game/type/SpeedType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RallyTrait {
  rallyPoint: any;

  getRallyPoint(): any {
    return this.rallyPoint;
  }

  /** 设置集结点（会校验合法性，非法点忽略）。实参顺序 (point, object, world)。 */
  changeRallyPoint(point: any, object: any, world: any): void {
    const valid = this.findValidRallyPoint(object, point, world.map);
    if (valid) this.rallyPoint = valid;
  }

  /** 从指定点向外搜 20 格找可用集结格（非水域 / 未被占）。 */
  findValidRallyPoint(object: any, point: any, map: any): any {
    const finder = new RadialTileFinderModule.RadialTileFinder(
      map.tiles,
      map.mapBounds,
      point,
      { width: 1, height: 1 },
      0,
      20,
      (tile: any) =>
        (object.rules.naval || tile.terrainType !== TerrainTypeModule.TerrainType.Water) &&
        !map.tileOccupation.isTileOccupiedBy(tile, object),
    );
    let found = finder.getNextTile();
    if (!found && object.factoryTrait?.type === FactoryTypeModule.FactoryType.NavalUnitType) {
      // 海军工厂：在自身占位内找可通行水域格。与基线一致——只 break 内层，
      // 外层继续扫，最终保留最后一列的首个可通行格。
      const foundation = object.getFoundation();
      for (let dx = 0; dx < foundation.width; dx++) {
        for (let dy = 0; dy < foundation.height; dy++) {
          const tile = map.tiles.getByMapCoords(object.tile.rx + dx, object.tile.ry + dy);
          if (!tile) break;
          if (map.terrain.getPassableSpeed(tile, SpeedTypeModule.SpeedType.Float, false, false) > 0) {
            found = tile;
            break;
          }
        }
      }
    }
    return found;
  }

  /** 为出厂单位找集结落位（含桥面判定）；无集结点返回 undefined。 */
  findRallyNodeForUnit(unit: any, world: any): { tile: any; onBridge: any } | undefined {
    if (this.rallyPoint) {
      const tile = this.findRallyPointforUnit(unit, this.rallyPoint, world, true);
      return {
        tile,
        onBridge: unit.rules.naval ? undefined : world.tileOccupation.getBridgeOnTile(tile),
      };
    }
    return undefined;
  }

  /**
   * 在集结点附近为出厂单位找可用落位（RadialTileFinder 半径 5）：
   * 检查障碍物/桥面/高度差/建筑遮挡/通行速度，找不到回落到集结点本身。
   */
  findRallyPointforUnit(unit: any, rallyPoint: any, world: any, ignoreBuildings: boolean, elevation?: number): any {
    const bridge = unit.rules.naval ? undefined : world.tileOccupation.getBridgeOnTile(rallyPoint);
    const isFlyer = unit.rules.movementZone === MovementZoneModule.MovementZone.Fly;
    const finder = new RadialTileFinderModule.RadialTileFinder(world.tiles, world.mapBounds, rallyPoint, { width: 1, height: 1 }, 0, 5, (tile: any) => {
      const onBridge = !bridge || bridge.isHighBridge() ? world.tileOccupation.getBridgeOnTile(tile) : undefined;
      return (
        (isFlyer ? [] : world.terrain.findObstacles({ tile, onBridge }, unit)).length === 0 &&
        (elevation === undefined || Math.abs(elevation - (tile.z + (onBridge?.tileElevation ?? 0))) < 4) &&
        (!ignoreBuildings || !world.getObjectsOnTile(tile).find((obj: any) => obj.isBuilding() && !obj.isDestroyed)) &&
        (isFlyer || world.terrain.getPassableSpeed(tile, unit.rules.speedType, unit.isInfantry(), !!onBridge) > 0)
      );
    });
    return finder.getNextTile() ?? rallyPoint;
  }
}
