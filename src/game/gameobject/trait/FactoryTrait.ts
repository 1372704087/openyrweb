/**
 * FactoryTrait — 工厂生产 trait（建筑上的生产线驱动器）。
 *
 * 每个 factory= 建筑挂载一个，负责：
 *  - 状态机：Idle → 生产 → Delivering（新单位出厂走位）→ Idle；
 *  - 主工厂判定：只有 primaryFactory 能发起生产（UnitType 例外：若
 *    主工厂正在 Delivering 也可继续生产，因为多工厂可并行出货）；
 *  - 步兵/载具出厂：computeExitCoords 计算出口格 → spawn → 挂
 *    ExitFactoryTask（带 deployTime 的先等打包完成）；
 *  - 飞行器出厂：produceAircraftAt → 找 DockTrait 有空泊位的本体或
 *    停机坪 → 放置 + dock + 标记 isProducedAircraft；
 *  - 克隆罐（cloning）：步兵工厂 Idle 时复制一次产出；
 *  - 集结点：resetRallyPoint 按工厂类型计算缺省集结格；
 *  - 抗卡死：Delivering 状态下新单位 150 tick 未能离开工厂出口则
 *    释放工厂槽位继续生产（单位保留 ExitFactoryTask 仍可后续移动）。
 *
 * 由 game/gameobject/trait/FactoryTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import { QueueStatus, QueueType } from "game/player/production/ProductionQueue"; // 已转换
import { FactoryType } from "game/rules/TechnoRules"; // 已转换
import * as ExitFactoryTaskModule from "game/gameobject/task/move/ExitFactoryTask"; // 未转换（any-shim）
import * as TerrainTypeModule from "engine/type/TerrainType"; // 未转换（any-shim）
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as MoveTraitModule from "game/gameobject/trait/MoveTrait"; // 未转换（any-shim）
import * as CardinalTileFinderModule from "game/map/tileFinder/CardinalTileFinder"; // 已转换
import * as DockTraitModule from "game/gameobject/trait/DockTrait"; // 本批转换
import * as FactoryProduceUnitEventModule from "game/event/FactoryProduceUnitEvent"; // 已转换
import * as InfantryModule from "game/gameobject/Infantry"; // 已转换
import * as TileOccupationModule from "game/map/TileOccupation"; // 未转换（any-shim）
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import * as RadialTileFinderModule from "game/map/tileFinder/RadialTileFinder"; // 已转换
import * as NotifyWarpChangeModule from "game/gameobject/trait/interface/NotifyWarpChange"; // 已转换
import * as VeteranLevelModule from "game/gameobject/unit/VeteranLevel"; // 已转换
import * as NotifyProduceUnitModule from "game/trait/interface/NotifyProduceUnit"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as ZoneTypeModule from "game/gameobject/unit/ZoneType"; // 已转换
import * as WaitMinutesTaskModule from "game/gameobject/task/system/WaitMinutesTask"; // 已转换
import * as CallbackTaskModule from "game/gameobject/task/system/CallbackTask"; // 已转换
import * as TaskGroupModule from "game/gameobject/task/system/TaskGroup"; // 已转换
import * as DeathTypeModule from "game/gameobject/common/DeathType"; // 已转换

/** 工厂状态。 */
export enum FactoryStatus {
  Idle = 0,
  Delivering = 1,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class FactoryTrait {
  type: FactoryType;
  isCloningVats: boolean;
  status: FactoryStatus = FactoryStatus.Idle;
  deliveringUnit: any;
  buildingProductionTicks: number;
  deliverStallTicks: number;
  building: any;

  constructor(type: FactoryType, isCloningVats = false) {
    this.type = type;
    this.isCloningVats = isCloningVats;
    this.status = FactoryStatus.Idle;
  }

  /** 出生：按工厂类型设定缺省集结点。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any): void {
    this.resetRallyPoint(object, world);
  }

  resetRallyPoint(object: any, world: any): void {
    if (![FactoryType.BuildingType, FactoryType.AircraftType].includes(this.type)) {
      const rallyTile = this.computeDefaultRallyPoint(object, this.type, world.map);
      object.rallyTrait?.changeRallyPoint(rallyTile, object, world);
    }
  }

  /** 超时空传送进出：刷新关联队列让 sidebar 感知。 */
  [NotifyWarpChangeModule.NotifyWarpChange.onChange](object: any, _warpSource: any, _world: any): void {
    if (object.owner.production) {
      const queues =
        this.type === FactoryType.BuildingType
          ? [QueueType.Structures, QueueType.Armory]
          : [object.owner.production.getQueueTypeForFactory(this.type)];
      for (const queueType of queues) object.owner.production.getQueue(queueType).notifyUpdated();
    }
  }

  /** 换主时：正在交付的单位若仍在工厂内则转交新主人。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](object: any, oldOwner: any, world: any): void {
    if (
      this.status === FactoryStatus.Delivering &&
      object.rules.deployTime &&
      this.deliveringUnit &&
      !this.deliveringUnit.isDestroyed &&
      this.unitIsInsideFactory(this.deliveringUnit, object, world)
    ) {
      world.changeObjectOwner(this.deliveringUnit, object.owner);
    }
  }

  /** 工厂被毁：交付中的单位若仍在工厂内则一并摧毁（时间抹除除外）。实参顺序 (object, game, attacker, temporal)。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, game: any, attacker: any, temporal: any): void {
    if (
      this.status === FactoryStatus.Delivering &&
      object.rules.deployTime &&
      this.deliveringUnit &&
      !this.deliveringUnit.isDestroyed &&
      object.deathType !== DeathTypeModule.DeathType.Temporal &&
      this.unitIsInsideFactory(this.deliveringUnit, object, game)
    ) {
      game.destroyObject(this.deliveringUnit, attacker, temporal);
    }
  }

  /** 主生产 tick：Delivering 状态机 + 主工厂生产分发。 */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    if (this.status === FactoryStatus.Delivering) {
      if (!this.deliveringUnit || this.deliveringUnit.isDestroyed) {
        // 无交付单位（如已销毁）：等一个 buildingProductionTicks 间隔。
        this.buildingProductionTicks = this.buildingProductionTicks ?? 1;
        if (this.buildingProductionTicks-- > 0) return;
        this.buildingProductionTicks = undefined;
      } else if (!this.unitHasClearedFactory(this.deliveringUnit, object, world)) {
        // 抗卡死：新单位长时间无法离开工厂出口（地形/单位堵路），约 10 秒
        // （150 tick）后释放工厂继续生产；卡住单位保留 ExitFactoryTask
        // 仍可后续移动，此处仅解锁工厂槽位。
        this.deliverStallTicks = (this.deliverStallTicks ?? 0) + 1;
        if (this.deliverStallTicks < 150) return;
        this.deliverStallTicks = undefined;
      }
      this.status = FactoryStatus.Idle;
      this.deliverStallTicks = undefined;
      this.deliveringUnit = undefined;
      return;
    }
    // Idle：主工厂发起生产（超时空传送中的主工厂跳过；UnitType 例外：
    // 主工厂正在 Delivering 也可继续，因为多工厂可并行出货）。
    if (object.owner.production && !object.warpedOutTrait.isActive()) {
      const primary = object.owner.production.getPrimaryFactory(this.type);
      const queue =
        this.type === FactoryType.BuildingType
          ? undefined
          : object.owner.production.getQueueForFactory(this.type);
      const first =
        queue && queue.status === QueueStatus.Ready ? queue.getFirst() : undefined;
      // AI 并行生产开关——三个扩展同功能键的统一归一，仅约束 AI 玩家
      // （人类保持原版多厂并行风格）：
      //  - NP2.0  [General] DisableParallelAIQueues（缺省 no）
      //  - NPatch [General] DisableAIParallelProduction（缺省 no，同义键）
      //  - Ares   [GlobalControls] AllowParallelAIQueues（缺省 yes，反极性）
      //  - NP2.0  单位键 DisableAIParallelProduction（仅全局放行时有效）
      // 任一"禁止"即关闭；只封锁"主厂 Delivering 时其余同类厂并行出货"
      // 的克隆分支，主厂自身生产与主厂超时空失效时的替位生产不受限。
      const aiParallelAllowed =
        !object.owner.isAi ||
        (!world.rules.general.disableParallelAIQueues &&
          !world.rules.general.disableAIParallelProduction &&
          world.rules.general.allowParallelAIQueues &&
          !(first && first.rules.disableAIParallelProduction));
      if (
        (primary?.warpedOutTrait.isActive() ||
          primary === object ||
          (aiParallelAllowed &&
            primary?.factoryTrait?.deliveringUnit &&
            primary.factoryTrait.type === FactoryType.UnitType)) &&
        this.type !== FactoryType.BuildingType &&
        first
      ) {
        if (this.type === FactoryType.AircraftType) {
          // 飞行器：在本体或任一有空的停机坪上生产。
          let produced = this.produceAircraftAt(object, first, world);
          if (!produced) {
            for (const building of [...object.owner.buildings].filter(
              (b: any) => b.factoryTrait?.type === FactoryType.AircraftType && b.helipadTrait,
            )) {
              if (produced) break;
              produced = this.produceAircraftAt(building, first, world);
            }
          }
          if (!produced) return;
        } else {
          this.produceGroundUnitAt(object, first, world);
          // 克隆罐：步兵工厂 Idle 时复制一次产出。
          if (!this.isCloningVats && this.type === FactoryType.InfantryType) {
            for (const cloneVat of [...object.owner.buildings].filter(
              (b: any) => b.factoryTrait && b.rules.cloning,
            )) {
              if (cloneVat.factoryTrait.status === FactoryStatus.Idle)
                cloneVat.factoryTrait.produceGroundUnitAt(cloneVat, first, world);
            }
          }
        }
        object.owner.addUnitsBuilt(first.rules, 1);
        first.creditsSpent = 0;
        first.progress = 0;
        queue.shift(first.rules, 1);
        if (queue.currentSize) queue.status = QueueStatus.Active;
      }
    }
  }

  /** 单位是否仍在工厂内（占位重合且非空中）。 */
  unitIsInsideFactory(unit: any, building: any, world: any): boolean {
    return world.map.tileOccupation.isTileOccupiedBy(unit.tile, building) && unit.zone !== ZoneTypeModule.ZoneType.Air;
  }

  /** 单位是否已离开工厂（占位脱离 或 飞行高度超过建筑高度）。 */
  unitHasClearedFactory(unit: any, building: any, world: any): boolean {
    return (
      !world.map.tileOccupation.isTileOccupiedBy(unit.tile, building) ||
      (unit.rules.consideredAircraft && unit.position.tileElevation >= building.art.height)
    );
  }

  /** 在工厂本体生产地面单位（含步兵九宫格分配/集结点/ veterans）。第二参为生产队列项（含 .rules）。 */
  produceGroundUnitAt(building: any, queueItem: any, world: any): void {
    const rules = queueItem.rules;
    const unit = world.createUnitForPlayer(rules, building.owner);
    if (rules.trainable && building.owner.canProduceVeteran(unit.rules))
      unit.veteranTrait?.setVeteranLevel(VeteranLevelModule.VeteranLevel.Veteran);
    if (unit.isInfantry()) unit.position.subCell = InfantryModule.Infantry.SUB_CELLS[0];
    let rallyTile = this.computeInternalRallyPoint(building, this.type, building.rallyTrait.getRallyPoint(), world.map);
    if (this.type !== FactoryType.UnitType)
      rallyTile = building.rallyTrait.findRallyPointforUnit(unit, rallyTile, world.map, false, building.tile.z);
    let spawnTile;
    if (this.type === FactoryType.NavalUnitType) {
      spawnTile = rallyTile;
    } else {
      const exitCoords = this.computeExitCoords(building, this.type);
      spawnTile = world.map.tiles.getByMapCoords(Math.floor(exitCoords.rx), Math.floor(exitCoords.ry));
    }
    if (unit.rules.consideredAircraft) rallyTile = spawnTile;
    let rallyNode;
    if (building.rallyTrait.getRallyPoint() !== rallyTile)
      rallyNode = building.rallyTrait.findRallyNodeForUnit(unit, world.map);
    // 步兵：分配九宫格子格（排除已被占用的子格）。
    if (unit.isInfantry()) {
      const occupiedSubCells = world.map.tileOccupation
        .getObjectsOnTileByLayer(
          rallyNode?.tile ?? rallyTile,
          unit.rules.consideredAircraft ? TileOccupationModule.LayerType.Air : TileOccupationModule.LayerType.Ground,
        )
        .filter((obj: any) => obj.isInfantry() && obj.moveTrait.moveState !== MoveTraitModule.MoveState.Moving)
        .map((obj: any) => obj.position.subCell);
      unit.position.subCell =
        InfantryModule.Infantry.SUB_CELLS.find((subCell: number) => !occupiedSubCells.includes(subCell)) ??
        InfantryModule.Infantry.SUB_CELLS[0];
    }
    const moveToRally = () => {
      if (unit.rules.consideredAircraft) {
        const target = rallyNode ?? { tile: rallyTile, onBridge: undefined };
        unit.unitOrderTrait.addTaskNext(
          new MoveTaskModule.MoveTask(world, target.tile, !!target.onBridge, {
            closeEnoughTiles: world.rules.general.closeEnough,
          }),
        );
      } else {
        unit.unitOrderTrait.addTaskNext(new ExitFactoryTaskModule.ExitFactoryTask(world, building, rallyTile, rallyNode));
      }
    };
    unit.direction = 270;
    world.spawnObject(unit, spawnTile);
    world.traits.filter(NotifyProduceUnitModule.NotifyProduceUnit).forEach((trait: any) => {
      trait[NotifyProduceUnitModule.NotifyProduceUnit.onProduce](unit, world);
    });
    world.events.dispatch(new FactoryProduceUnitEventModule.FactoryProduceUnitEvent(unit));
    // 有 deployTime 的先等打包完成再走出厂（deployTime 读建筑 rules，与原版一致）。
    if (building.rules.deployTime) {
      unit.unitOrderTrait.addTask(
        new TaskGroupModule.TaskGroup(
          new WaitMinutesTaskModule.WaitMinutesTask(building.rules.deployTime),
          new CallbackTaskModule.CallbackTask(() => {
            if (building.isSpawned && building.buildStatus !== BuildStatusEnum.BuildDown) moveToRally();
          }),
        ).setCancellable(false),
      );
    } else {
      moveToRally();
    }
    this.status = FactoryStatus.Delivering;
    this.deliveringUnit = unit;
  }

  /** 在本体或停机坪上生产飞行器；返回 true 表示成功。第二参为生产队列项（含 .rules）。 */
  produceAircraftAt(building: any, queueItem: any, world: any): boolean {
    const dockTrait = building.traits.find(DockTraitModule.DockTrait);
    if (!dockTrait) return false;
    const dockNumber = dockTrait.getFirstAvailableDockNumber();
    if (dockNumber === undefined) return false;
    const rules = queueItem.rules;
    const aircraft = world.createUnitForPlayer(rules, building.owner);
    // 标记自产飞行器：产能判定区分自产与召唤机（空袭/伞兵/舰载机）。
    aircraft.isProducedAircraft = true;
    if (rules.trainable && building.owner.canProduceVeteran(aircraft.rules))
      aircraft.veteranTrait?.setVeteranLevel(VeteranLevelModule.VeteranLevel.Veteran);
    const dockOffset = dockTrait.getDockOffset(dockNumber);
    aircraft.position.moveToLeptons(building.position.getMapPosition());
    aircraft.position.moveByLeptons3(dockOffset);
    world.spawnObject(aircraft, aircraft.position.tile);
    dockTrait.dockUnitAt(aircraft, dockNumber);
    if (aircraft.isAircraft() && aircraft.airportBoundTrait) aircraft.airportBoundTrait.preferredAirport = building;
    world.traits.filter(NotifyProduceUnitModule.NotifyProduceUnit).forEach((trait: any) => {
      trait[NotifyProduceUnitModule.NotifyProduceUnit.onProduce](aircraft, world);
    });
    world.events.dispatch(new FactoryProduceUnitEventModule.FactoryProduceUnitEvent(aircraft));
    return true;
  }

  /** 工厂类型 → 出口坐标（兵营/战厂分支）。 */
  computeExitCoords(building: any, factoryType: FactoryType): { rx: number; ry: number } {
    if (factoryType === FactoryType.InfantryType) return this.computeBarracksDefaultExitCoords(building);
    if (factoryType === FactoryType.UnitType) return this.computeWarFactoryExitCoords(building);
    throw new Error("Unsupported factory type " + FactoryType[factoryType]);
  }

  /** 工厂类型 → 内部集结格（海军特殊处理）。 */
  computeInternalRallyPoint(building: any, factoryType: FactoryType, rallyPoint: any, map: any): any {
    let tile;
    if (factoryType === FactoryType.NavalUnitType) {
      tile = this.computeNavalInternalRallyPoint(building, rallyPoint, map);
    } else {
      let coords;
      if (factoryType === FactoryType.InfantryType) coords = this.computeBarracksInternalRallyCoords(building);
      else {
        if (factoryType !== FactoryType.UnitType) throw new Error("Unsupported factory type " + FactoryType[factoryType]);
        coords = this.computeWarFactoryInternalRallyCoords(building);
      }
      tile = map.tiles.getByMapCoords(coords.rx, coords.ry);
    }
    return tile ?? this.findTileAdjacentToBuilding(building, map);
  }

  /** 工厂类型 → 缺省集结格。 */
  computeDefaultRallyPoint(building: any, factoryType: FactoryType, map: any): any {
    let tile;
    if (factoryType === FactoryType.NavalUnitType) {
      tile = this.computeNavalDefaultRallyPoint(building, map);
    } else {
      let coords;
      if (factoryType === FactoryType.InfantryType) coords = this.computeBarracksInternalRallyCoords(building);
      else {
        if (factoryType !== FactoryType.UnitType) throw new Error("Unsupported factory type " + FactoryType[factoryType]);
        coords = this.computeWarFactoryDefaultRallyCoords(building);
      }
      tile = map.tiles.getByMapCoords(coords.rx, coords.ry);
    }
    return tile ?? this.findTileAdjacentToBuilding(building, map);
  }

  /** 找建筑占位相邻的第一个可用格（RadialTileFinder 半径 1）。 */
  findTileAdjacentToBuilding(building: any, map: any): any {
    return new RadialTileFinderModule.RadialTileFinder(
      map.tiles,
      map.mapBounds,
      building.tile,
      building.getFoundation(),
      1,
      1,
      () => true,
    ).getNextTile();
  }

  /** 兵营出口坐标：小占位走右下角，大占位走左侧或中部。 */
  computeBarracksDefaultExitCoords(building: any): { rx: number; ry: number } {
    const foundation = building.getFoundation();
    let dx, dy;
    if (foundation.width <= 2 || foundation.height <= 2) {
      dx = foundation.width - 1;
      dy = foundation.height - 1;
      if (building.rules.gdiBarracks && foundation.width > 2) dx = Math.floor(foundation.width / 2);
    } else {
      dx = 0;
      dy = foundation.height - 1;
    }
    return { rx: building.tile.rx + dx, ry: building.tile.ry + dy };
  }

  /** 兵营内部集结坐标（出口附近，GDI/NOD 有各自偏移）。 */
  computeBarracksInternalRallyCoords(building: any): { rx: number; ry: number } {
    const foundation = building.getFoundation();
    const exit = this.computeBarracksDefaultExitCoords(building);
    let rx = exit.rx;
    let ry = exit.ry;
    if (!(foundation.width <= 2 || foundation.height <= 2) || building.rules.gdiBarracks) {
      ry += 1;
    } else if (building.rules.nodBarracks) {
      rx += foundation.width <= 2 ? 1 : 0;
      ry += foundation.height <= 2 ? 1 : 0;
    }
    return { rx, ry };
  }

  /** 战车工厂出口：占位几何中心（原版 YR 行为）。 */
  computeWarFactoryExitCoords(building: any): { rx: number; ry: number } {
    const foundation = building.getFoundation();
    return { rx: building.tile.rx + Math.floor(foundation.width / 2), ry: building.tile.ry + Math.floor(foundation.height / 2) };
  }

  /**
   * 战车工厂内部集结：占位右侧一格（确保在占位外，ExitFactoryTask
   * canStopAtTile 会阻止工厂格停靠）。
   */
  computeWarFactoryInternalRallyCoords(building: any): { rx: number; ry: number } {
    const foundation = building.getFoundation();
    return { rx: building.tile.rx + foundation.width, ry: building.tile.ry + Math.floor(foundation.height / 2) };
  }

  /** 战车工厂缺省集结：右侧一格。 */
  computeWarFactoryDefaultRallyCoords(building: any): { rx: number; ry: number } {
    const foundation = building.getFoundation();
    return { rx: building.tile.rx + foundation.width, ry: building.tile.ry + Math.floor(foundation.height / 2) };
  }

  /** 海军缺省集结：从中心向四方搜索 5×5 范围内的水域格。 */
  computeNavalDefaultRallyPoint(building: any, map: any): any {
    const finder = new CardinalTileFinderModule.CardinalTileFinder(
      map.tiles,
      map.mapBounds,
      building.centerTile,
      5,
      5,
      (tile: any) =>
        tile.terrainType === TerrainTypeModule.TerrainType.Water &&
        !map.getObjectsOnTile(tile).find((obj: any) => obj.isBuilding() || (obj.isOverlay() && obj.isBridge())),
    );
    finder.diagonal = false;
    return finder.getNextTile() ?? map.tiles.getByMapCoords(
      building.tile.rx + building.getFoundation().width,
      building.tile.ry + building.getFoundation().height,
    );
  }

  /** 海军内部集结：从建筑中心向集结点方向偏移半个占位 + 1 格。 */
  computeNavalInternalRallyPoint(building: any, rallyPoint: any, map: any): any {
    const delta = new Vector2(rallyPoint.rx, rallyPoint.ry).sub(
      new Vector2(building.centerTile.rx, building.centerTile.ry),
    );
    return map.tiles.getByMapCoords(
      building.centerTile.rx + Math.sign(delta.x) * (Math.floor(building.getFoundation().width / 2) + 1),
      building.centerTile.ry + Math.sign(delta.y) * (Math.floor(building.getFoundation().height / 2) + 1),
    );
  }
}

// BuildStatus 别名（避免循环导入，Building.ts 中定义）。
const BuildStatusEnum = { BuildDown: 2, Ready: 1, BuildUp: 0 };
