/**
 * AttackMoveTask — 攻击移动任务（A 键移动：边走边打）。
 *
 * 继承 MoveTask，在移动过程中自动接敌：
 *  - 标记 isAttackMove = true（供攻击特性/警戒逻辑识别任务类型）；
 *  - 走过第一个途经点后才允许接敌（passedFirstWaypoint：避免刚下令
 *    就在脚下开火）；冷却中的武器允许带着走，但只有无冷却的武器
 *    才真正开火；
 *  - 到达途经点时用默认武器扫描敌人：扫到且武器就绪 → 挂被动固守
 *    的攻击子任务（holdGround+passive），本任务停下等待（碰撞置
 *    Waiting、速度清零、清当前途经点）；
 *  - 攻击子任务打完目标消失后（本任务被顶到前台且 isSpawned 复查）：
 *    重置接敌状态并朝原目标重新规划，继续攻击移动；
 *    若单位已不在场上（isSpawned=false）→ 强制取消并结束任务。
 *
 * 由 game/gameobject/task/move/AttackMoveTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { MoveState, CollisionState } from "game/gameobject/trait/MoveTrait"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AttackMoveTask extends MoveTask {
  /** 本轮攻击移动是否已经接敌过（用于接敌后的状态重置）。 */
  attackPerformed: boolean;
  /** 是否已走过第一个途经点（接敌的门槛条件）。 */
  passedFirstWaypoint: boolean;

  constructor(game: any, targetTile: any, toBridge: any, options?: any) {
    super(game, targetTile, toBridge, options);
    this.isAttackMove = true;
    this.attackPerformed = false;
    this.passedFirstWaypoint = false;
  }

  /** 复制任务（保持攻击移动类型）。 */
  duplicate(): AttackMoveTask {
    return new AttackMoveTask(this.game, this.targetTile, this.toBridge, this.options);
  }

  /**
   * 每 tick：移动中标记已过首途经点；到达途经点时扫描接敌，
   * 接敌子任务结束后继续向原目标攻击移动，最后交父类驱动。
   */
  onTick(object: any): boolean {
    if (object.moveTrait.moveState === MoveState.Moving) {
      this.passedFirstWaypoint = true;
    }
    if (
      object.moveTrait.moveState === MoveState.ReachedNextWaypoint &&
      object.attackTrait &&
      !object.attackTrait.isDisabled() &&
      // 悬浮气球类飞行单位不自动接敌（悬停攻击由其它逻辑处理）。
      (object.rules.movementZone !== MovementZone.Fly || !object.rules.balloonHover) &&
      // 弹药耗尽且要求手动装填的单位不自动接敌。
      (!object.ammoTrait || object.ammoTrait.ammo || !object.rules.manualReload) &&
      !this.isCancelling()
    ) {
      const defaultWeapon = object.attackTrait.selectDefaultWeapon(object);
      if (defaultWeapon && (this.passedFirstWaypoint || (defaultWeapon && !defaultWeapon.getCooldownTicks()))) {
        const scan = object.attackTrait.scanForTarget(object, defaultWeapon, this.game);
        if (scan.target) {
          const { target, weapon } = scan;
          if (!weapon.getCooldownTicks()) {
            // 接敌：挂固守被动攻击子任务，本任务原地等待。
            const attackTask = object.attackTrait.createAttackTask(this.game, target, target.tile, weapon, {
              holdGround: true,
              passive: true,
            });
            this.children.push(attackTask);
            this.useChildTargetLines = true;
            this.attackPerformed = true;
            object.moveTrait.velocity.set(0, 0, 0);
            object.moveTrait.currentWaypoint = undefined;
            object.moveTrait.collisionState = CollisionState.Waiting;
            return false;
          }
        }
      }
      if (this.attackPerformed) {
        if (!object.isSpawned) {
          // 单位已消失（被超时空传送/回收等）：必须能强制取消，否则算内部错误。
          if (!this.forceCancel(object)) throw new Error("Force cancel failed");
          return true;
        }
        // 打完继续走：重置接敌状态，朝原目标重新规划。
        this.attackPerformed = false;
        this.passedFirstWaypoint = false;
        this.useChildTargetLines = false;
        object.moveTrait.collisionState = CollisionState.Resolved;
        this.updateTarget(this.targetTile, this.toBridge);
      }
    }
    return super.onTick(object);
  }
}
