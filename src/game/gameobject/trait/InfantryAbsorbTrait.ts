/**
 * InfantryAbsorbTrait — 生物反应堆吸收驻军 trait（YABIOP）。
 *
 * 继承 GarrisonTrait，复用运输系统 Enter/EvacuateTransportTask 而非
 * 自建驻军队列；loadQueue 与 garrison units 共用同一数组语义。
 * 伤害/出售/摧毁均不逐出内部步兵（原版 YR）：吸收后与建筑同亡。
 * 实现 TransportTrait 容器接口供进出场任务调用。
 *
 * 由 game/gameobject/trait/InfantryAbsorbTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GarrisonTrait } from "game/gameobject/trait/GarrisonTrait"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 已转换
import * as NotifySellModule from "game/gameobject/trait/interface/NotifySell"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import { EvacuateTransportTask } from "game/gameobject/task/EvacuateTransportTask"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class InfantryAbsorbTrait extends GarrisonTrait {
  /** 运输装载队列（EnterTransportTask 管理）。 */
  loadQueue: any[];

  constructor(building: any, maxOccupants: number) {
    super(building, maxOccupants);
    // transport load queue, managed by EnterTransportTask
    this.loadQueue = [];
  }

  /** 总可被驻入。 */
  canBeOccupied(): boolean {
    return !0;
  }

  /** 受伤：不逐出吸收步兵。 */
  [NotifyDamageModule.NotifyDamage.onDamage](): void {}

  /** 出售：内部步兵随建筑销毁并清空装载队列。 */
  [NotifySellModule.NotifySell.onSell](building: any, world: any): void {
    for (const unit of this.units) world.destroyObject(unit, { player: building.owner });
    this.units = [];
    this.loadQueue.length = 0;
  }

  /** 销毁：内部步兵随建筑死亡并清空装载队列。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](building: any, world: any, attackerInfo: any): void {
    for (const unit of this.units) {
      unit.deathType = building.deathType;
      world.destroyObject(unit, attackerInfo, !0);
    }
    this.units = [];
    this.loadQueue.length = 0;
  }

  /** 换主：清空装载队列。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](_o: any, _old: any, _n: any): void {
    this.loadQueue.length = 0;
  }

  /** 每 tick：丢弃已毁/坠毁的装载条目（与 TransportTrait 一致）。 */
  [NotifyTickModule.NotifyTick.onTick](): void {
    this.loadQueue = this.loadQueue.filter((unit) => !unit.isDestroyed && !unit.isCrashing);
  }

  // ---- TransportTrait container interface (shared with Enter/EvacuateTransportTask) ----

  /** 单位是否能装入（尺寸 ≤ 建筑上限且 ≤ 剩余容量）。 */
  unitFitsInside(unit: any): boolean {
    return (
      !!unit &&
      unit.rules.size <= (this.building.rules.sizeLimit ?? this.building.rules.maxNumberOccupants) &&
      unit.rules.size <= this.getAvailableCapacity()
    );
  }

  /** 已占用容量（size 求和）。 */
  getOccupiedCapacity(): number {
    return this.units.reduce((sum, unit) => sum + unit.rules.size, 0);
  }

  /** 最大容量（passengers 或构造 maxOccupants）。 */
  getMaxCapacity(): number {
    return this.building.rules.passengers || this.maxOccupants;
  }

  /** 剩余可用容量。 */
  getAvailableCapacity(): number {
    return this.getMaxCapacity() - this.getOccupiedCapacity();
  }

  /** 入装载队列，返回新下标。 */
  addToLoadQueue(unit: any): number {
    this.loadQueue.push(unit);
    return this.loadQueue.length - 1;
  }

  /** 是否为装载队列队首。 */
  unitIsFirstInLoadQueue(unit: any): boolean {
    return this.loadQueue[0] === unit;
  }

  /** 从装载队列移除。 */
  removeFromLoadQueue(unit: any): void {
    const idx = this.loadQueue.indexOf(unit);
    if (idx !== -1) this.loadQueue.splice(idx, 1);
  }

  /** 撤出：清空装载队列并派发 EvacuateTransportTask（LIFO 逐个出场）。 */
  evacuate(world: any, _destroyIfNoTile = false): void {
    this.loadQueue.length = 0;
    if (this.units.length && this.building) {
      this.building.unitOrderTrait.addTask(new EvacuateTransportTask(world, !0));
    }
  }
}
