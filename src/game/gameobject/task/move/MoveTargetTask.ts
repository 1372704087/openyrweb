/**
 * MoveTargetTask — 追击移动目标的任务（朝某个会动的单位走过去）。
 *
 * 继承 MoveTask，目的地跟着目标实时更新：
 *  - 强制移动（forceMove）+ 把目标本体加入寻路忽略列表
 *    （pathFinderIgnoredBlockers：贴脸追它时不被它自己挡路）；
 *  - 每次 onTick 在"到达途经点"状态时检查：目标已经挪窝
 *    （我正走向的 tile 不再是目标所在 tile）或连续 10 个途经点
 *    没刷新过 → 重设目的地为目标的当前位置（它自己在动则追它的
 *    下一途经点，追击预判）；
 *  - getTargetLinesConfig 返回带 target 的特殊形状（UI 画追踪线）。
 *
 * 由 game/gameobject/task/move/MoveTargetTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { MoveState } from "game/gameobject/trait/MoveTrait"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveTargetTask extends MoveTask {
  /** 追击的目标单位。 */
  target: any;
  /** 距上次刷新追击目的地的途经点数（超过 10 个强制刷新）。 */
  tilesSinceTargetUpdate: number;

  constructor(game: any, target: any) {
    super(game, target.tile, target.onBridge, { forceMove: true, pathFinderIgnoredBlockers: [target] });
    this.target = target;
    this.tilesSinceTargetUpdate = 0;
  }

  /**
   * 每 tick：非取消 + 走到途经点 + （目标已挪窝或我原地打转）时，
   * 把追击目的地更新到目标当前位置/它的下一途经点，再交父类驱动。
   */
  onTick(object: any): boolean {
    if (
      !(
        this.isCancelling() ||
        object.moveTrait.moveState !== MoveState.ReachedNextWaypoint ||
        (this.target.tile === this.targetTile &&
          this.target.onBridge === this.toBridge &&
          this.target.moveTrait.isIdle())
      )
    ) {
      let needsUpdate = false;
      // 我已走到记录的目标 tile 但目标又挪走了 → 立即刷新；
      // 否则每过一个途经点计数 +1，超过 10 个也强制刷新。
      // 注意 || 短路：命中前一条件时不递增计数器（与孪生一致）。
      if (
        (object.tile === this.targetTile && this.target.tile !== this.targetTile) ||
        10 < this.tilesSinceTargetUpdate++
      ) {
        needsUpdate = true;
      }
      if (needsUpdate) {
        this.tilesSinceTargetUpdate = 0;
        const targetWaypoint = this.target.moveTrait.currentWaypoint;
        if (targetWaypoint) {
          this.updateTarget(targetWaypoint.tile, !!targetWaypoint.onBridge);
        } else {
          this.updateTarget(this.target.tile, this.target.onBridge);
        }
      }
    }
    return super.onTick(object);
  }

  /** 强制取消（与父类一致，保留覆盖以维持类形状）。 */
  forceCancel(object: any): boolean {
    return super.forceCancel(object);
  }

  /** 追踪线配置：UI 需要 target 引用来画"追谁"的线。 */
  getTargetLinesConfig(object: any): any {
    return { target: this.target, pathNodes: [] };
  }
}
