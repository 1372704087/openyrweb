/**
 * ExitFactoryTask — 工厂出厂任务（生产完成后从厂房开到集结点）。
 *
 * 继承 MoveTask：目的地由调用方给定（通常是出厂门口/集结方向），
 * 构造时：
 *  - ignoredBlockers = [factory]（厂房本身不挡路，允许压过地基）；
 *  - closeEnoughTiles = 0、strictCloseEnough = true（必须精确到位）；
 *  - forceWaitOnPathBlocked = 工厂不是步兵营（载具厂被挡时在厂内死等，
 *    步兵营可立刻重规划）；
 *  - preventOpportunityFire = true、cancellable = false（出厂过程不
 *    被机会射击/玩家取消打断）。
 *
 * onStart：载具厂额外计算"坡道占用格"（checkRampTiles）——出厂路径上
 * 可通行的地基格，onTick 时若这些格上有其它单位，对其挂不可取消的
 * ScatterTask（必要时先 duplicate+cancel 其移动/攻击类任务）。
 *
 * onTick：
 *  - 反卡死：forceWaitOnPathBlocked 连续等超过 90 tick → 关闭死等，
 *    让 MoveTask 重规划（仍忽略厂房 blocker）；
 *  - 坡道清障：见上；首次推送后返回 false，清完后丢弃 checkRampTiles；
 *  - 到达下一途经点且厂房已不再挡路：清 ignoredBlockers、允许机会
 *    射击；有集结点则改道集结点 tile，放宽 closeEnough 并允许取消。
 *
 * 由 game/gameobject/task/move/ExitFactoryTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { MoveState } from "game/gameobject/trait/MoveTrait"; // 已转换
import { FactoryType } from "game/rules/TechnoRules"; // 已转换
import { ScatterTask } from "game/gameobject/task/ScatterTask"; // 已转换
import { AttackTask } from "game/gameobject/task/AttackTask"; // 已转换
import { AttackMoveTargetTask } from "game/gameobject/task/move/AttackMoveTargetTask"; // 已转换
import { AttackMoveTask } from "game/gameobject/task/move/AttackMoveTask"; // 已转换

/** 出厂死等反卡死阈值（tick）：超过后放弃 forceWaitOnPathBlocked。 */
const EXIT_FACTORY_STALL_TICKS = 90;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ExitFactoryTask extends MoveTask {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  /** 生产工厂建筑（ignoredBlockers / 坡道计算的对象）。 */
  factory: any;
  /** 集结点（离开厂房阻塞后改道的目标，可选）。 */
  rallyPoint: any;
  /** 坡道清障是否已推送过 Scatter（推送当 tick 返回 false）。 */
  rampBlockersPushed: boolean;
  /** 厂房坡道上需要清障的可通行地基格（仅载具厂设置）。 */
  checkRampTiles: any;
  /** forceWaitOnPathBlocked 连续等待 tick 计数（反卡死）。 */
  stallTicks: any;

  constructor(game: any, factory: any, targetTile: any, rallyPoint: any) {
    super(game, targetTile, false, {
      ignoredBlockers: [factory],
      closeEnoughTiles: 0,
      strictCloseEnough: true,
      forceWaitOnPathBlocked: factory.factoryTrait?.type !== FactoryType.InfantryType,
    });
    this.factory = factory;
    this.rallyPoint = rallyPoint;
    this.preventOpportunityFire = true;
    this.rampBlockersPushed = false;
    this.cancellable = false;
  }

  /** 启动：交父类寻路；载具厂预计算坡道占用格。 */
  onStart(object: any): void {
    super.onStart(object);
    if (this.factory.factoryTrait?.type === FactoryType.UnitType) {
      this.checkRampTiles = this.game.map.tileOccupation
        .calculateTilesForGameObject(this.factory.tile, this.factory)
        .filter(
          (tile: any) =>
            0 < this.game.map.terrain.getPassableSpeed(tile, object.rules.speedType, object.isInfantry(), false),
        );
    }
  }

  /** 停驻判定：当前格不被工厂占用，且父类通用停驻检查通过。 */
  canStopAtTile(object: any, tile: any, onBridge: any): boolean {
    return (
      !this.game.map.tileOccupation.isTileOccupiedBy(tile, this.factory) && super.canStopAtTile(object, tile, onBridge)
    );
  }

  /**
   * 每 tick：反卡死重规划 → 坡道清障 → 离开厂房阻塞后改道集结点，
   * 最后交父类驱动移动。
   */
  onTick(object: any): boolean {
    // anti-stall. If a vehicle cannot clear the factory for a while (e.g.
    // surrounding buildings permanently block the direct path to the rally point and
    // forceWaitOnPathBlocked keeps it waiting inside forever), give up on the strict
    // wait and let MoveTask repath. The factory-building blocker is still ignored
    // (ignoredBlockers), so the unit can drive over the factory foundation to exit,
    // then path normally to the rally point. Without this, a tightly-packed base leaves
    // produced vehicles stuck inside the war factory indefinitely.
    this.stallTicks = (this.stallTicks ?? 0) + 1;
    if (this.stallTicks > EXIT_FACTORY_STALL_TICKS && this.options?.forceWaitOnPathBlocked) {
      this.options.forceWaitOnPathBlocked = false;
      this.stallTicks = undefined;
      if (this.game && this.log) this.log(object, "exit_factory_repath_after_stall");
    }
    if (this.checkRampTiles) {
      for (const rampTile of this.checkRampTiles) {
        for (const groundObject of this.game.map.tileOccupation.getGroundObjectsOnTile(rampTile)) {
          if (!groundObject.isUnit()) continue;
          if (this.rampBlockersPushed) return false;
          const scatter = new ScatterTask(this.game, undefined, { excludedTiles: this.checkRampTiles });
          scatter.setCancellable(false);
          const currentTask = groundObject.unitOrderTrait.getCurrentTask();
          if (currentTask) {
            const isMoveOrAttack =
              currentTask.constructor === MoveTask ||
              currentTask.constructor === AttackTask ||
              currentTask.constructor === AttackMoveTask ||
              currentTask.constructor === AttackMoveTargetTask;
            if (isMoveOrAttack) {
              const duplicated = currentTask.duplicate();
              currentTask.cancel();
              groundObject.unitOrderTrait.addTaskNext(duplicated);
              groundObject.unitOrderTrait.addTaskNext(scatter);
            }
          } else {
            groundObject.unitOrderTrait.addTask(scatter);
          }
        }
      }
      if (!this.rampBlockersPushed) {
        this.rampBlockersPushed = true;
        return false;
      }
      this.checkRampTiles = undefined;
    }
    if (
      object.moveTrait.moveState === MoveState.ReachedNextWaypoint &&
      this.options?.ignoredBlockers &&
      !this.game.map.terrain.isBlockerObject(
        this.factory,
        object.tile,
        false,
        object.rules.speedType,
        object.isInfantry(),
      )
    ) {
      this.options.ignoredBlockers = undefined;
      this.preventOpportunityFire = false;
      if (this.rallyPoint) {
        this.updateTarget(this.rallyPoint.tile, !!this.rallyPoint.onBridge);
        this.cancellable = true;
        this.options.closeEnoughTiles = this.game.rules.general.closeEnough;
        this.options.strictCloseEnough = false;
        this.options.forceWaitOnPathBlocked = false;
      }
    }
    return super.onTick(object);
  }
}
