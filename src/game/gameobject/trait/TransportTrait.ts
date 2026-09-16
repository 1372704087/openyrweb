/**
 * TransportTrait — 运输车货舱管理（装载/容量/疏散/销毁处理）。
 *
 * 挂在带 passengers= 的运输车上，管理货舱内的单位：
 *  - unitFitsInside 按 size/sizeLimit/剩余容量判定能否装入；
 *  - 装载队列 loadQueue 与 unitOrderTrait 配合实现"排队进入"；
 *  - 运输车被毁：根据死因决定乘员是否幸存散开 / 一同摧毁 / 溺水；
 *  - 幸存者保留选择状态并挂 ScatterTask 散开。
 *
 * 由 game/gameobject/trait/TransportTrait.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import { fnv32a } from "util/math";
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as ScatterTaskModule from "game/gameobject/task/ScatterTask"; // 未转换（any-shim）
import * as LeaveTransportEventModule from "game/event/LeaveTransportEvent"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TransportTrait {
  obj: any;
  units: any[] = [];
  loadQueue: any[] = [];

  constructor(object: any) {
    this.obj = object;
    this.units = [];
    this.loadQueue = [];
  }

  /** 单位能否装入：size ≤ sizeLimit 且 ≤ 剩余容量。 */
  unitFitsInside(unit: any): boolean {
    return !!unit && unit.rules.size <= this.obj.rules.sizeLimit && unit.rules.size <= this.getAvailableCapacity();
  }

  /** 已占用容量（全部乘员的 size 之和）。 */
  getOccupiedCapacity(): number {
    return this.units.reduce((sum, unit) => sum + unit.rules.size, 0);
  }

  /** 最大容量（rules.Passengers）。 */
  getMaxCapacity(): number {
    return this.obj.rules.passengers;
  }

  getAvailableCapacity(): number {
    return this.getMaxCapacity() - this.getOccupiedCapacity();
  }

  /** 加入装载排队队列，返回排队序号。 */
  addToLoadQueue(unit: any): number {
    this.loadQueue.push(unit);
    return this.loadQueue.length - 1;
  }

  unitIsFirstInLoadQueue(unit: any): boolean {
    return this.loadQueue[0] === unit;
  }

  removeFromLoadQueue(unit: any): void {
    const index = this.loadQueue.indexOf(unit);
    if (index !== -1) this.loadQueue.splice(index, 1);
  }

  /** 每 tick：清掉已销毁/坠毁中的排队单位。 */
  [NotifyTickModule.NotifyTick.onTick](world: any, _building: any): void {
    this.loadQueue = this.loadQueue.filter((unit) => !unit.isDestroyed && !unit.isCrashing);
  }

  /**
   * 运输车被毁：根据死因决定乘员命运——
   *  - 主目标被毁 / 死亡武器 / 空中被毁 → 乘员一同摧毁（继承位置/区域/死型）；
   *  - 寄生弹头 → 清除死亡武器（不被寄生者带走）；
   *  - 其余 → 幸存者散开（Selectable 保留选择 + ScatterTask）。
   */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, world: any, attacker: any, isPrimary: any): void {
    const hasDeathWeapon = !!object.armedTrait?.deathWeapon;
    const isParasite = attacker?.weapon?.warhead.rules.parasite;
    if (isPrimary || hasDeathWeapon || object.zone === ZoneType.Air || isParasite) {
      for (const unit of this.units) {
        if (hasDeathWeapon && unit.armedTrait) unit.armedTrait.deathWeapon = undefined;
        unit.position.tileElevation = object.position.tileElevation;
        unit.zone = object.zone;
        unit.onBridge = object.onBridge;
        unit.position.tile = object.tile;
        unit.deathType = object.deathType;
        unit.transport = undefined;
        world.destroyObject(unit, attacker, true);
      }
    } else {
      this.spawnSurvivors(world);
    }
    this.units = [];
  }

  /** 幸存者散开：可通行的单位 unlimbo + ScatterTask，不可通行（水面）的单位溺亡。 */
  spawnSurvivors(world: any): void {
    const transport = this.obj;
    if (this.units.length) {
      for (const unit of this.units) {
        if (world.map.terrain.getPassableSpeed(transport.tile, unit.rules.speedType, unit.isInfantry(), transport.onBridge) > 0) {
          // 可通行：重新归属 + 解除 limbo + 散开。
          unit.owner.addOwnedObject(unit);
          unit.position.tileElevation = transport.onBridge
            ? world.map.tileOccupation.getBridgeOnTile(transport.tile).tileElevation
            : 0;
          unit.onBridge = transport.onBridge;
          unit.zone = world.map.getTileZone(transport.tile, !transport.onBridge);
          unit.transport = undefined;
          world.unlimboObject(unit, transport.tile);
          unit.unitOrderTrait.addTask(new ScatterTaskModule.ScatterTask(world));
          const selection = world.getUnitSelection();
          if (selection.isSelected(transport)) selection.addToSelection(unit);
        } else {
          // 水面不可通行 → 溺亡。
          unit.position.tileElevation = transport.position.tileElevation;
          unit.zone = transport.zone;
          unit.onBridge = transport.onBridge;
          unit.position.tile = transport.tile;
          if (unit.zone === ZoneType.Water) unit.deathType = DeathType.Sink;
          if (unit.armedTrait?.deathWeapon) unit.armedTrait.deathWeapon = undefined;
          unit.transport = undefined;
          world.destroyObject(unit, { player: unit.owner });
        }
      }
      world.events.dispatch(new LeaveTransportEventModule.LeaveTransportEvent(transport));
    }
  }

  /** 锁步校验散列：全部乘员散列的 FNV。 */
  getHash(): number {
    return fnv32a(this.units.map((unit) => unit.getHash()));
  }

  debugGetState() {
    return this.units.map((unit) => unit.debugGetState());
  }

  dispose(): void {
    this.obj = undefined;
  }
}
