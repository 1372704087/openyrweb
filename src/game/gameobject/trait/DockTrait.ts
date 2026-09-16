/**
 * DockTrait — 建筑停靠管理（泊位分配/占用/预订/疏散）。
 *
 * 管理建筑（战车工厂/船坞/停机坪/修理厂/坦克碉堡）的泊位：
 *  - unitsByDockNumber 按泊位序号记录停靠单位；
 *  - dockTiles 按泊位序号缓存停靠格（spawn 时从 DockingOffset 计算，
 *    坦克碉堡有特殊偏移修正——对齐占位最右列入口）；
 *  - reservedDocks 记录已被前往中单位预订的泊位（MoveToDockTask 使用）；
 *  - 建筑被售时：停机坪疏散飞行器至其他停机坪/坠毁、修理厂出售载具、
 *    其余 undock；建筑被毁时：非时间弹头且可修理的码头单位一同摧毁；
 *  - 每 tick 清理已销毁/已移动的"幽灵"停靠单位（无 DockableTrait 者兜底）。
 *
 * 由 game/gameobject/trait/DockTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换：可改具名导入
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import * as NotifySellModule from "game/gameobject/trait/interface/NotifySell"; // 已转换
import * as DockableTraitModule from "game/gameobject/trait/DockableTrait"; // 未转换（any-shim）
import { Coords } from "game/Coords";
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard";
import * as MoveToDockTaskModule from "game/gameobject/task/MoveToDockTask"; // 未转换（any-shim）
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import * as CallbackTaskModule from "game/gameobject/task/system/CallbackTask"; // 已转换
import * as TaskGroupModule from "game/gameobject/task/system/TaskGroup"; // 已转换
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DockTrait {
  building: any;
  tiles: any;
  numberOfDocks: number;
  dockingOffsets: any;
  ticksWhenWarpedOut = true;
  unitsByDockNumber: any[];
  reservedDocks: any[];
  /** spawn 时从 DockingOffset 计算的每泊位停靠格。 */
  dockTiles: any[];

  constructor(building: any, tiles: any, numberOfDocks: number, dockingOffsets: any) {
    this.building = building;
    this.tiles = tiles;
    this.numberOfDocks = numberOfDocks;
    this.dockingOffsets = dockingOffsets;
    this.ticksWhenWarpedOut = true;
    this.unitsByDockNumber = new Array(numberOfDocks).fill(undefined);
    this.reservedDocks = new Array(numberOfDocks).fill(undefined);
  }

  /** 出生：计算每个泊位的停靠格。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](): void {
    this.dockTiles = [];
    for (let i = 0; i < this.numberOfDocks; i++) {
      const tile = this.findDockTile(i);
      if (!tile) throw new Error(`Docking tile ${i} not found for object "${this.building.name}"`);
      this.dockTiles[i] = tile;
    }
  }

  /** 离场：解除全部泊位预订。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](): void {
    for (let i = 0; i < this.numberOfDocks; i++) this.unreserveDockAt(i);
  }

  /** 每 tick：清理已销毁/已移动的"幽灵"停靠单位（无 DockableTrait 者兜底）。 */
  [NotifyTickModule.NotifyTick.onTick](): void {
    for (let i = 0; i < this.numberOfDocks; i++) {
      const unit = this.unitsByDockNumber[i];
      if (unit && (unit.isDestroyed || unit.isDisposed || unit.tile !== this.getDockTile(i))) {
        this.undockUnit(unit);
      }
    }
  }

  /** 建筑被摧毁：可修理的码头内单位一同摧毁（非时间弹头）。实参顺序 (object, game, attacker, temporal)。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, game: any, attacker: any, temporal: any): void {
    const destroyDocked =
      (object.rules.unitRepair || object.helipadTrait) && !object.rules.naval && !attacker?.weapon?.warhead.rules.temporal;
    if (destroyDocked) {
      for (const unit of this.unitsByDockNumber) {
        if (unit && !unit.isDestroyed) {
          if (destroyDocked) game.destroyObject(unit, attacker, temporal);
          else this.undockUnit(unit);
        }
      }
    }
  }

  /** 建筑被出售：停机坪疏散飞行器至其他停机坪/坠毁；修理厂出售载具；其余 undock。 */
  [NotifySellModule.NotifySell.onSell](object: any, game: any): void {
    if (object.helipadTrait && this.hasDockedUnits()) {
      // 停机坪：找其他有空位的停机坪分配疏散目标；找不到的坠落。
      const targetAirports: any[] = [];
      let assigned = 0;
      for (const airport of [...object.owner.buildings].filter(
        (b: any) => b.helipadTrait && (b.dockTrait?.getAvailableDockCount() ?? false) && b !== object,
      )) {
        let available = airport.dockTrait?.getAvailableDockCount() ?? 0;
        while (available > 0 && assigned < this.unitsByDockNumber.length) {
          targetAirports.push(airport);
          available--;
          assigned++;
        }
        if (assigned === this.unitsByDockNumber.length) break;
      }
      let index = 0;
      for (const unit of this.unitsByDockNumber) {
        if (unit) {
          const targetAirport = targetAirports[index];
          if (targetAirport) {
            unit.unitOrderTrait.addTask(new MoveToDockTaskModule.MoveToDockTask(game, targetAirport));
          } else {
            unit.unitOrderTrait.addTask(
              new TaskGroupModule.TaskGroup(
                new MoveTaskModule.MoveTask(game, unit.tile, false),
                new CallbackTaskModule.CallbackTask((world: any) => {
                  if (unit.crashableTrait) unit.crashableTrait.crash({ player: object.owner });
                  else world.destroyObject(unit, { player: object.owner });
                }),
              ).setCancellable(false),
            );
          }
          index++;
        }
      }
    } else {
      // 非停机坪（修理厂等）：可修理 → sell（返还资金），否则 undock。
      const canRepair = object.rules.unitRepair && !object.rules.naval;
      for (const unit of this.unitsByDockNumber) {
        if (unit) {
          if (canRepair) game.sellTrait.sell(unit);
          else this.undockUnit(unit);
        }
      }
    }
  }

  /** 换主：全部停靠单位转移给新主人。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](object: any, oldOwner: any, newOwner: any): void {
    for (const unit of this.unitsByDockNumber) {
      if (unit) newOwner.changeObjectOwner(unit, object.owner);
    }
  }

  /** 找第一个空闲且未预订的泊位（黑屏中返回 undefined）。 */
  getFirstAvailableDockNumber(): number | undefined {
    if (!this.building?.warpedOutTrait.isActive()) {
      const index = this.unitsByDockNumber.findIndex((unit, i) => !unit && !this.reservedDocks[i]);
      if (index !== -1) return index;
    }
    return undefined;
  }

  /** 空闲泊位数（黑屏中为 0）。 */
  getAvailableDockCount(): number {
    return this.building?.warpedOutTrait.isActive()
      ? 0
      : this.unitsByDockNumber.filter((unit, i) => !unit && !this.reservedDocks[i]).length;
  }

  /** 第一个空泊位（忽略预订状态）。 */
  getFirstEmptyDockNumber(): number | undefined {
    if (!this.building?.warpedOutTrait.isActive()) {
      const index = this.unitsByDockNumber.findIndex((unit) => !unit);
      if (index !== -1) return index;
    }
    return undefined;
  }

  /** 取泊位的停靠偏移（lepton）；越界抛 RangeError。 */
  getDockOffset(dockNumber: number): any {
    if (dockNumber > this.numberOfDocks - 1)
      throw new RangeError(`Index ${dockNumber} exceeds available docks (${this.numberOfDocks})`);
    return this.dockingOffsets[dockNumber];
  }

  /** 取泊位的停靠格；越界抛 RangeError。 */
  getDockTile(dockNumber: number): any {
    if (dockNumber > this.numberOfDocks - 1)
      throw new RangeError(`Index ${dockNumber} exceeds available docks (${this.numberOfDocks})`);
    return this.dockTiles[dockNumber];
  }

  /** 按停靠格反查泊位序号；不在本建筑返回 undefined。 */
  getDockNumberByTile(tile: any): number | undefined {
    const index = this.dockTiles.indexOf(tile);
    if (index !== -1) return index;
    return undefined;
  }

  getAllDockTiles(): any[] {
    return [...this.dockTiles];
  }

  /**
   * 计算泊位的停靠格：建筑地图坐标 + DockingOffset。
   * 坦克碉堡特殊修正：原始 artmd.ini 的 DockingOffset 是 -1,-1,0 占位值，
   * 改为对齐占位最右列（入口侧，因 NumberImpassableRows 可通行）。
   */
  findDockTile(dockNumber: number): any {
    if (dockNumber > this.numberOfDocks - 1)
      throw new RangeError(`Index ${dockNumber} exceeds available docks (${this.numberOfDocks})`);
    const mapPos = this.building.position.getMapPosition();
    let offset = this.getDockOffset(dockNumber);
    if (this.building.tankBunkerTrait) {
      const foundation = this.building.getFoundation();
      offset = offset.clone();
      offset.x = ((foundation.width - 1) * Coords.LEPTONS_PER_TILE) / 2;
      offset.z = ((1 - foundation.height) * Coords.LEPTONS_PER_TILE) / 2;
    }
    return this.tiles.getByMapCoords(
      Math.floor((mapPos.x + offset.x) / Coords.LEPTONS_PER_TILE),
      Math.floor((mapPos.y + offset.z) / Coords.LEPTONS_PER_TILE),
    );
  }

  /**
   * 单位是否可停靠本建筑：
   *  - 坦克碉堡：载具且 TankBunkerTrait.canVehicleEnter 通过；
   *  - 修理厂：载具 + 非停机坪 +（非飞行器或可降落）；
   *  - 通用：Dock= 列表含本建筑名 + 飞行器须有停机坪；且海军属性一致。
   */
  isValidUnitForDock(unit: any): boolean {
    return (
      (this.building.tankBunkerTrait && unit.isVehicle() && this.building.tankBunkerTrait.canVehicleEnter(unit)) ||
      (((this.building.unitRepairTrait &&
        unit.isVehicle() &&
        !this.building.helipadTrait &&
        (!unit.rules.consideredAircraft || unit.rules.landable)) ||
        (unit.rules.dock.includes(this.building.name) && !(unit.isAircraft() && !this.building.helipadTrait))) &&
        this.building.rules.naval === unit.rules.naval)
    );
  }

  /** 单位停靠到指定泊位（越界/已占用抛错）。 */
  dockUnitAt(unit: any, dockNumber: number): void {
    if (dockNumber > this.numberOfDocks - 1)
      throw new RangeError(`Index ${dockNumber} exceeds available docks (${this.numberOfDocks})`);
    if (this.unitsByDockNumber[dockNumber]) throw new Error("Another unit is already docked at dock #" + dockNumber);
    this.unitsByDockNumber[dockNumber] = unit;
    // 部分飞行器（如侦察机）可能缺少 DockableTrait，仅占位不回写引用。
    const dockable = unit.traits.find(DockableTraitModule.DockableTrait);
    if (dockable) dockable.dock = this.building;
  }

  /** 按泊位序号解除停靠。 */
  undockUnitAt(dockNumber: number): void {
    if (dockNumber > this.numberOfDocks - 1)
      throw new RangeError(`Index ${dockNumber} exceeds available docks (${this.numberOfDocks})`);
    const unit = this.unitsByDockNumber[dockNumber];
    if (unit) {
      this.unitsByDockNumber[dockNumber] = undefined;
      const dockable = unit.traits.find(DockableTraitModule.DockableTrait);
      if (dockable) dockable.dock = undefined;
    }
  }

  /** 按单位引用解除停靠。 */
  undockUnit(unit: any): void {
    const index = this.unitsByDockNumber.indexOf(unit);
    if (index !== -1) this.undockUnitAt(index);
  }

  isDocked(unit: any): boolean {
    return this.unitsByDockNumber.includes(unit);
  }

  hasDockedUnits(): boolean {
    return !!this.unitsByDockNumber.find((unit) => unit);
  }

  /** 全部停靠单位（过滤空位）。 */
  getDockedUnits(): any[] {
    return this.unitsByDockNumber.filter(isNotNullOrUndefined);
  }

  /** 预订泊位（MoveToDockTask 前往途中锁定）；重复预订抛错。 */
  reserveDockAt(unit: any, dockNumber: number): void {
    if (dockNumber > this.numberOfDocks - 1)
      throw new RangeError(`Index ${dockNumber} exceeds available docks (${this.numberOfDocks})`);
    if (this.reservedDocks[dockNumber])
      throw new Error(`Dock #${dockNumber} is already reserved by ` + this.reservedDocks[dockNumber].name);
    this.reservedDocks[dockNumber] = unit;
    const dockable = unit.traits.get(DockableTraitModule.DockableTrait);
    if (dockable.reservedDock?.dockTrait) dockable.reservedDock.dockTrait.unreserveDockForUnit(unit);
    unit.traits.get(DockableTraitModule.DockableTrait).reservedDock = this.building;
  }

  unreserveDockAt(dockNumber: number): void {
    if (dockNumber > this.numberOfDocks - 1)
      throw new RangeError(`Index ${dockNumber} exceeds available docks (${this.numberOfDocks})`);
    const unit = this.reservedDocks[dockNumber];
    if (unit) {
      this.reservedDocks[dockNumber] = undefined;
      const dockable = unit.traits.get(DockableTraitModule.DockableTrait);
      if (dockable) dockable.reservedDock = undefined;
    }
  }

  unreserveDockForUnit(unit: any): void {
    const index = this.reservedDocks.indexOf(unit);
    if (index !== -1) this.unreserveDockAt(index);
  }

  hasReservedDockForUnit(unit: any): boolean {
    return !!this.reservedDocks.includes(unit);
  }

  hasReservedDockAt(dockNumber: number): boolean {
    return !!this.reservedDocks[dockNumber];
  }

  getReservedDockForUnit(unit: any): number | undefined {
    const index = this.reservedDocks.indexOf(unit);
    if (index !== -1) return index;
    return undefined;
  }

  dispose(): void {
    this.building = undefined;
  }
}
