/**
 * HarvesterTrait — 采矿车采矿循环状态机。
 *
 * 九状态自动采集循环：Idle → LookingForOreSite → MovingToOreSite →
 * Harvesting → LookingForRefinery → MovingToRefinery → Docking →
 * Unloading → Idle。实际移动/采集由 GatherOreTask / ReturnOreTask
 * 驱动，本 trait 只维护状态标志与超时回退：
 *  - LookingForRefinery 超 5 秒无任务 → 挂 ReturnOreTask 或回 Idle；
 *  - LookingForOreSite 超 20 秒无任务 → 重挂 GatherOreTask；
 *  - 空闲且 autoGatherOnNextIdle 且站在矿石上 → 自动开始采集；
 *  - 玩家下达移动/攻击移动/强制移动/散开指令时重置为 Idle 并取消
 *    自动采集（NotifyOrder.onPush）；
 *  - 超时空传送后自动重新开始采集（teleporter 弹头）。
 *
 * storage 容量、ore/gems 计数、bails 按矿石类型分账。
 * getHash 返回 ore×100+gems 供锁步校验。
 *
 * 由 game/gameobject/trait/HarvesterTrait.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as ReturnOreTaskModule from "game/gameobject/task/harvester/ReturnOreTask"; // 未转换（any-shim）
import * as GatherOreTaskModule from "game/gameobject/task/harvester/GatherOreTask"; // 未转换（any-shim）
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import * as NotifyTeleportModule from "game/gameobject/trait/interface/NotifyTeleport"; // 未转换（any-shim）
import * as NotifyOrderModule from "game/gameobject/trait/interface/NotifyOrder"; // 未转换（any-shim）
import * as OrderTypeModule from "game/order/OrderType"; // 未转换（any-shim）
import * as LandTypeModule from "game/type/LandType"; // 未转换（any-shim）
import * as TiberiumTypeModule from "engine/type/TiberiumType"; // 未转换（any-shim）

/** 采矿车状态。 */
export enum HarvesterStatus {
  Idle = 0,
  LookingForOreSite = 1,
  MovingToOreSite = 2,
  Harvesting = 3,
  LookingForRefinery = 4,
  MovingToRefinery = 5,
  Docking = 6,
  PreparingToUnload = 7,
  Unloading = 8,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class HarvesterTrait {
  /** 矿仓容量（rules.Storage）。 */
  storage: number;
  _ore = 0;
  _gems = 0;
  /** 按矿石类型分账（TiberiumType → 数量）。 */
  bails = new Map();
  status: HarvesterStatus = HarvesterStatus.Idle;
  lastGatherExplicit = false;
  autoGatherOnNextIdle = false;
  ticksSinceLastRefineryCheck = 0;
  ticksSinceLastOreCheck = 0;
  lastOreSite: any;

  constructor(storage: number) {
    this.storage = storage;
    this._ore = 0;
    this._gems = 0;
    this.bails = new Map();
    this.status = HarvesterStatus.Idle;
    this.lastGatherExplicit = false;
    this.autoGatherOnNextIdle = false;
    this.ticksSinceLastRefineryCheck = 0;
    this.ticksSinceLastOreCheck = 0;
  }

  /** 当前矿石装载量。 */
  get ore(): number {
    return this._ore;
  }

  /** 当前宝石装载量。 */
  get gems(): number {
    return this._gems;
  }

  /** 累计装载（按 TiberiumType 分账到 ore/gems）。 */
  addBails(type: any, amount: number): void {
    this.bails.set(type, (this.bails.get(type) ?? 0) + amount);
    if (type === TiberiumTypeModule.TiberiumType.Gems) this._gems += amount;
    else this._ore += amount;
  }

  /** 装载明细（[[type, amount], ...]）。 */
  getBails(): any[][] {
    return [...this.bails.entries()];
  }

  /** 出生：战斗方矿车自动开始采集（延迟到 afterTick 以保证完整初始化）。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any): void {
    if (object.owner.isCombatant()) {
      world.afterTick(() => {
        object.unitOrderTrait.addTask(new GatherOreTaskModule.GatherOreTask(world));
      });
      object.attackTrait?.increasePassiveScanCooldown(1);
    }
  }

  /** 换主/结盟后重新开始采集。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](object: any, oldOwner: any, world: any): void {
    if (
      (!oldOwner.isCombatant() && object.owner.isCombatant()) ||
      world.alliances.areAllied(object.owner, oldOwner)
    ) {
      world.afterTick(() => {
        object.unitOrderTrait.addTask(new GatherOreTaskModule.GatherOreTask(world));
      });
    }
  }

  /** 每 tick：超时回退与自动采集触发。 */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    if (this.status === HarvesterStatus.LookingForRefinery) {
      // 找精炼厂超 5 秒：有任务则额外等 25 秒，无精炼厂/显式采集则挂 ReturnOreTask，否则回 Idle。
      if (this.ticksSinceLastRefineryCheck++ > 5 * GameSpeed.BASE_TICKS_PER_SECOND) {
        this.ticksSinceLastRefineryCheck = 0;
        if (object.unitOrderTrait.hasTasks()) {
          this.ticksSinceLastRefineryCheck = -25 * GameSpeed.BASE_TICKS_PER_SECOND;
        } else if ([...object.owner.buildings].some((b: any) => b.rules.refinery) || this.lastGatherExplicit) {
          object.unitOrderTrait.addTask(new ReturnOreTaskModule.ReturnOreTask(world));
        } else {
          this.status = HarvesterStatus.Idle;
        }
      }
    } else if (this.status === HarvesterStatus.LookingForOreSite) {
      // 找矿超 20 秒且无任务 → 重挂 GatherOreTask。
      if (this.ticksSinceLastOreCheck++ > 20 * GameSpeed.BASE_TICKS_PER_SECOND) {
        this.ticksSinceLastOreCheck = 0;
        if (!object.unitOrderTrait.hasTasks()) object.unitOrderTrait.addTask(new GatherOreTaskModule.GatherOreTask(world));
      }
    } else if (this.status === HarvesterStatus.Idle && this.autoGatherOnNextIdle && object.unitOrderTrait.isIdle() && object.tile.landType === LandTypeModule.LandType.Tiberium) {
      this.autoGatherOnNextIdle = false;
      object.unitOrderTrait.addTask(new GatherOreTaskModule.GatherOreTask(world, object.tile, true));
    }
  }

  /** 超时空传送前置：重置状态；有传送器且为战斗方时自动重新采集。 */
  [NotifyTeleportModule.NotifyTeleport.onBeforeTeleport](object: any, world: any, target: any, isReverse: any): void {
    if (!isReverse && object.owner.isCombatant()) {
      this.status = HarvesterStatus.Idle;
      this.lastOreSite = undefined;
      if (target && object.rules.teleporter) {
        world.afterTick(() => {
          object.unitOrderTrait.addTask(
            new (this.isFull() ? ReturnOreTaskModule.ReturnOreTask : GatherOreTaskModule.GatherOreTask)(world),
          );
        });
      }
    }
  }

  /**
   * 玩家指令推送：移动类指令（含散开）置位 autoGatherOnNextIdle，
   * 其余指令清除；LookingFor* 状态一律回 Idle。
   */
  [NotifyOrderModule.NotifyOrder.onPush](object: any, orderType: any): void {
    this.autoGatherOnNextIdle = [
      OrderTypeModule.OrderType.AttackMove,
      OrderTypeModule.OrderType.Move,
      OrderTypeModule.OrderType.ForceMove,
      OrderTypeModule.OrderType.Scatter,
    ].includes(orderType);
    if ([HarvesterStatus.LookingForRefinery, HarvesterStatus.LookingForOreSite].includes(this.status)) {
      this.status = HarvesterStatus.Idle;
    }
  }

  isFull(): boolean {
    return this.ore + this.gems >= this.storage;
  }

  isEmpty(): boolean {
    return !this.ore && !this.gems;
  }

  empty(): void {
    this.bails.clear();
    this._ore = this._gems = 0;
  }

  /** 锁步校验值：ore×100 + gems（保证数值可区分）。 */
  getHash(): number {
    return 100 * this.ore + this.gems;
  }

  debugGetState() {
    return { ore: this.ore, gems: this.gems };
  }
}
