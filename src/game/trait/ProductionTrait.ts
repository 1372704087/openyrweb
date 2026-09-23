/**
 * ProductionTrait — 挂在游戏世界上的生产驱动 trait。
 *
 * 每逻辑 tick 遍历全部战斗方的全部队列做扣款/推进（tickQueue）：
 *  - 建造耗时 = (单价 / 建造速度) × buildTimeMultiplier，向下取整到
 *    54 tick（一个建造帧 ≈3.6s）的整数倍且最短一帧；秒建作弊开启时
 *    1 tick 完成；
 *  - 速度合成：基础速度 × 低电力修正 × 多工厂系数
 *    （multipleFactory^(工厂数-1)）× 墙体系数；
 *  - 每 tick 按比例扣款（保留小数余量 creditsSpentLeftover），进度到
 *    1 → 队列 Ready；资金耗尽派发 InsufficientFundsEvent；
 *  - 电力：onPowerLow/onPowerChange 时按低电力惩罚公式重算
 *    buildSpeedModifier，onPowerRestore 复位为 1；
 *  - 工厂登记：建筑 spawn/unspawn/换主时维护主工厂与工厂数量，并同步
 *    飞行器队列容量（停机坪泊位 − 已占用，见 updateAircraftQueueMaxSize）。
 *
 * [NotifyUnspawn] 的奴隶矿车变形例外：MorphIntoTask 置 _morphInFlight
 * 后跳过 ensurePrerequisites（YAREFN↔YASLMN 变形期间前置实质仍满足），
 * 真正的摧毁/出售照常取消。
 *
 * 由 game/trait/ProductionTrait.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/trait/interface/NotifyTick";
import * as NotifyUnspawnModule from "game/trait/interface/NotifyUnspawn";
import * as NotifyOwnerChangeModule from "game/trait/interface/NotifyOwnerChange";
import { QueueStatus } from "game/player/production/ProductionQueue";
import * as InsufficientFundsEventModule from "game/event/InsufficientFundsEvent"; // 未转换（any-shim）
import { FactoryType } from "game/rules/TechnoRules";
import * as NotifySpawnModule from "game/trait/interface/NotifySpawn";
import * as NotifyPowerModule from "game/trait/interface/NotifyPower";
import { PowerLevel } from "game/player/trait/PowerTrait";
import { clamp, floorTo } from "util/math";
import { GameSpeed } from "game/GameSpeed";
import { ObjectType } from "engine/type/ObjectType";
import { GameMath } from "game/math/GameMath";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ProductionTrait {
  rules: any;
  /** 秒建作弊开关（调试用）。 */
  speedCheat: any;
  /** 全部有 Owner 声明的对象规则（可建造候选集）。 */
  availableObjectRules: Set<any>;
  /** 每 tick 基础建造进度比例（由 buildSpeed 换算）。 */
  baseBuildSpeed: number;

  constructor(rules: any, speedCheat: any) {
    this.rules = rules;
    this.speedCheat = speedCheat;
    this.availableObjectRules = new Set();
    // buildSpeed（INI 刻度）→ 每 tick 比例：60×buildSpeed×15tps/1000。
    const buildTicks = 60 * rules.general.buildSpeed * GameSpeed.BASE_TICKS_PER_SECOND;
    this.baseBuildSpeed = 1 / (buildTicks / 1000);
    // 收集全部有 Owner 声明的规则（无 Owner 的内部对象不可建造）。
    [
      ...rules.buildingRules.values(),
      ...rules.infantryRules.values(),
      ...rules.vehicleRules.values(),
      ...rules.aircraftRules.values(),
    ].forEach((rules) => {
      if (rules.owner.length) this.availableObjectRules.add(rules);
    });
  }

  /** 每 tick：遍历全部战斗方的全部队列推进生产。 */
  [NotifyTickModule.NotifyTick.onTick](world: any): void {
    for (const player of world.getCombatants()) {
      for (const queue of player.production.getAllQueues()) this.tickQueue(queue, player, world);
    }
  }

  /** 建筑出生：登记主工厂/工厂数量；飞行器出生：同步飞行器队列容量。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any): void {
    if (object.isBuilding() && object.owner.production) {
      const factoryType = object.rules.factory;
      if (factoryType) {
        if (!object.owner.production.getPrimaryFactory(factoryType))
          object.owner.production.setPrimaryFactory(object);
        object.owner.production.incrementFactoryCount(factoryType);
        if (factoryType === FactoryType.AircraftType) this.updateAircraftQueueMaxSize(object.owner, world);
      }
    } else if (object.isAircraft() && object.owner.production) {
      this.updateAircraftQueueMaxSize(object.owner, world);
    }
  }

  /**
   * 建筑离场：确保队列前置仍满足（否则退款取消），维护主工厂继承与
   * 工厂数量。奴隶矿车变形例外（见类注释）。
   */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any, world: any): void {
    if (object.isBuilding() && object.owner.production) {
      // 奴隶矿车 deploy/undeploy 变形不得取消进行中的生产：MorphIntoTask
      // 先置 slaveMinerTrait._morphInFlight=true 再 unspawn，建筑很快以另一
      // 形态重生（YAREFN↔YASLMN），前置实质仍满足。仅变形跳过
      // ensurePrerequisites；真正的摧毁/出售照常取消（与原版一致）。
      if (!(object.slaveMinerTrait && object.slaveMinerTrait._morphInFlight)) this.ensurePrerequisites(object.owner);
      const factoryType = object.rules.factory;
      if (factoryType) {
        if (object.owner.production.getPrimaryFactory(factoryType) === object)
          object.owner.production.crownPrimaryFactoryHeir(factoryType);
        object.owner.production.decrementFactoryCount(factoryType);
        if (factoryType === FactoryType.AircraftType) this.updateAircraftQueueMaxSize(object.owner, world);
      }
    } else if (object.isAircraft() && object.owner.production) {
      this.updateAircraftQueueMaxSize(object.owner, world);
    }
  }

  /** 建筑换主：旧主退数量/找继承者，新主登记主工厂并补数量，飞行器队列同步。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](object: any, oldOwner: any, newOwner: any): void {
    if (object.isBuilding()) {
      this.ensurePrerequisites(oldOwner);
      const factoryType = object.rules.factory;
      if (factoryType) {
        if (newOwner.production?.getPrimaryFactory(factoryType) === object)
          newOwner.production.crownPrimaryFactoryHeir(factoryType);
        if (object.owner.production && !object.owner.production.getPrimaryFactory(factoryType))
          object.owner.production.setPrimaryFactory(object);
        oldOwner.production?.decrementFactoryCount(factoryType);
        object.owner.production?.incrementFactoryCount(factoryType);
        if (factoryType === FactoryType.AircraftType) {
          this.updateAircraftQueueMaxSize(object.owner, newOwner);
          this.updateAircraftQueueMaxSize(newOwner, newOwner);
        }
      }
    } else if (object.isAircraft()) {
      this.updateAircraftQueueMaxSize(object.owner, newOwner);
      this.updateAircraftQueueMaxSize(newOwner, newOwner);
    }
  }

  /** 进入低电力：按公式重算建造速度修正。 */
  [NotifyPowerModule.NotifyPower.onPowerLow](player: any): void {
    if (player.production) {
      player.production.buildSpeedModifier = this.computeLowPowerBuildSpeedModifier(
        player.powerTrait.power,
        player.powerTrait.drain,
      );
    }
  }

  /** 电力恢复：速度修正复位为 1。 */
  [NotifyPowerModule.NotifyPower.onPowerRestore](player: any): void {
    if (player.production) player.production.buildSpeedModifier = 1;
  }

  /** 电力数值变化时若已处于 Low 状态则即时刷新修正。 */
  [NotifyPowerModule.NotifyPower.onPowerChange](player: any): void {
    if (player.powerTrait?.level === PowerLevel.Low && player.production) {
      player.production.buildSpeedModifier = this.computeLowPowerBuildSpeedModifier(
        player.powerTrait.power,
        player.powerTrait.drain,
      );
    }
  }

  /**
   * 低电力建造速度修正：
   *   penalty = 0.3 × lowPowerPenaltyModifier × (1 − min(1, 电量/消耗)) / 0.15
   *   modifier = clamp(1 − penalty, minLowPower, maxLowPower)
   */
  computeLowPowerBuildSpeedModifier(power: number, drain: number): number {
    const deficit = 1 - Math.min(1, power / drain);
    const general = this.rules.general;
    const penalty = (0.3 * general.lowPowerPenaltyModifier * deficit) / 0.15;
    return clamp(1 - penalty, general.minLowPowerProductionSpeed, general.maxLowPowerProductionSpeed);
  }

  /**
   * 飞行器队列容量同步：容量 = 停机坪泊位总数 − 已占用的自产飞行器数。
   * 直接写 _maxSize 避开 setter 的条目截断副作用；写入后 notifyUpdated
   * 让 sidebar 感知（启用/禁用生产按钮）。
   */
  updateAircraftQueueMaxSize(player: any, _world: any): void {
    if (!player.production) return;
    const totalDocks = [...player.buildings]
      .filter((building) => building.helipadTrait)
      .reduce((sum, building) => sum + building.dockTrait.numberOfDocks, 0);
    const ownedAircraft = player.getOwnedObjectsByType(ObjectType.Aircraft, true);
    // 占用产能的飞行器 = 自产（isProducedAircraft，含作弊出生的 Spawned 型）
    // + 非出生型（如开局赠送）。召唤机（空袭米格/伞兵/舰载机）虽
    // Spawned=yes 但从未被生产，不占产能。
    const consumed = ownedAircraft.filter((aircraft: any) => aircraft.isProducedAircraft || !aircraft.rules.spawned).length;
    // 直接写 _maxSize 避开 setter 的条目截断副作用；不动 q.size（push/remove 自管）。
    const queue = player.production.getQueueForFactory(FactoryType.AircraftType);
    queue._maxSize = Math.max(0, totalDocks - consumed);
    // _maxSize 变化后通知队列，sidebar 据此启用/禁用生产按钮。
    queue.notifyUpdated();
  }

  /**
   * 推进单条队列（仅 Active 状态）：
   *  - 建造耗时按单价/速度取整到 54 tick 的整数倍（秒建除外）；
   *  - 每 tick 扣款 min(余额, 本帧应扣, 剩余)，保留小数余量；
   *  - 零单价对象按进度推进；
   *  - 进度到 1 → Ready；资金从有到无 → InsufficientFundsEvent。
   */
  tickQueue(queue: any, player: any, world: any): void {
    if (queue.status !== QueueStatus.Active) return;
    let changed = false;
    const first = queue.getFirst();
    const factoryType = player.production.getFactoryTypeForQueueType(queue.type);
    const factoryCount = player.production.getFactoryCount(factoryType);
    const speedModifier = player.production.buildSpeedModifier;
    const multiFactoryFactor = 1 / GameMath.pow(this.rules.general.multipleFactory, factoryCount - 1);
    const wallFactor = first.rules.wall ? 1 / this.rules.general.wallBuildSpeedCoefficient : 1;
    const buildSpeed = this.baseBuildSpeed * speedModifier * multiFactoryFactor * wallFactor;
    const creditsEach = first.creditsEach;
    // 秒建作弊开启时 1 tick 内完成建造，不再保留 54 tick（一个建造帧，
    // 约 3.6s）的最短计时；未开启时维持原版行为：建造时间取整到 54 tick
    // 的整数倍，且最短一个建造帧。
    let buildTicks = this.speedCheat.value
      ? 1
      : creditsEach
        ? floorTo((creditsEach / buildSpeed) * first.rules.buildTimeMultiplier, 54)
        : 54;
    buildTicks = Math.max(this.speedCheat.value ? 1 : 54, buildTicks);
    const creditsBefore = player.credits;
    const creditsRemaining = first.creditsEach - first.creditsSpent;
    const spend = Math.min(player.credits, creditsEach / buildTicks + first.creditsSpentLeftover, creditsRemaining);
    if (spend > 0) {
      const whole = Math.floor(spend);
      first.creditsSpentLeftover = spend - whole;
      if (whole) {
        first.creditsSpent += whole;
        first.progress = first.creditsSpent / first.creditsEach;
        player.credits -= whole;
        changed = true;
      }
    } else if (!first.creditsEach) {
      // 零造价对象（如特殊建筑）：按 tick 均摊进度。
      const progressDelta = first.progress * buildTicks;
      first.progress = Math.min(1, (1 + progressDelta) / buildTicks);
      changed = true;
    }
    if (changed && first.progress === 1) queue.status = QueueStatus.Ready;
    if (creditsBefore > 0 && !player.credits)
      world.events.dispatch(new InsufficientFundsEventModule.InsufficientFundsEvent(player));
    if (changed) queue.notifyUpdated();
  }

  /** 队列中的条目不再可建造时退款并移除（建筑被毁/换主后调用）。 */
  ensurePrerequisites(player: any): void {
    if (!player.production) return;
    for (const queue of player.production.getAllQueues()) {
      for (const item of queue
        .getAll()
        .map((item) => ({ rules: item.rules, quantity: item.quantity, creditsSpent: item.creditsSpent }))) {
        if (!player.production.isAvailableForProduction(item.rules)) {
          queue.pop(item.rules, item.quantity);
          player.credits += item.creditsSpent;
        }
      }
    }
  }

  getAvailableObjects(): any[] {
    return [...this.availableObjectRules];
  }
}
