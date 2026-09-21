/**
 * MoveToBlockTask — 走到阻挡物旁并尝试攻击清除的任务。
 *
 * 继承 Task（不是 MoveTask）：onStart 挂一个 MoveTask 子任务
 * （目的地 = 目标 centerTile，closeEnoughTiles = 1，pathFinderIgnoredBlockers
 * 与 stopOnBlocker 都指向目标本体）；onTick 等移动子任务报告
 * lastMoveResult === CloseEnough 后，用 selectWeaponVersus 选武器，
 * 成功则再挂 force 攻击子任务并标记 attackPerformed。
 *
 * preventOpportunityFire = false、useChildTargetLines = true：途中允许
 * 机会射击，调试目标线跟子任务走。
 *
 * 由 game/gameobject/task/move/MoveToBlockTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { MoveResult } from "game/gameobject/trait/MoveTrait"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveToBlockTask extends Task {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  /** 要清除的阻挡目标。 */
  target: any;
  /** 是否已挂过攻击子任务。 */
  attackPerformed: boolean;

  constructor(game: any, target: any) {
    super();
    this.game = game;
    this.target = target;
    this.preventOpportunityFire = false;
    this.useChildTargetLines = true;
    this.attackPerformed = false;
  }

  /** 启动：先走到目标旁（停在阻挡物上/边，closeEnough=1）。 */
  onStart(_object: any): void {
    this.children.push(
      new MoveTask(this.game, this.target.centerTile, false, {
        closeEnoughTiles: 1,
        pathFinderIgnoredBlockers: [this.target],
        stopOnBlocker: this.target,
      }),
    );
  }

  /**
   * 每 tick：已攻击过 / 取消中 / 无攻击特性 → 完成；移动未报告
   * CloseEnough → 继续等；选不出武器 → 完成；否则挂 force 攻击子任务。
   */
  onTick(object: any): boolean {
    if (this.attackPerformed || this.isCancelling() || !object.attackTrait || object.attackTrait.isDisabled())
      return true;
    if (object.moveTrait.lastMoveResult !== MoveResult.CloseEnough) return true;
    const weapon = object.attackTrait.selectWeaponVersus(object, this.target, this.game, true);
    if (!weapon) return true;
    this.children.push(
      object.attackTrait.createAttackTask(this.game, this.target, this.target.tile, weapon, { force: true }),
    );
    this.attackPerformed = true;
    return false;
  }
}
