/**
 * TurnTask — 原地转向任务。
 *
 * 让单位把朝向转到指定方向（DriveLocomotor 选新途经点朝向不符时、
 * 炮塔转向等场景挂这个子任务）：每 tick 按 rules.rot 的转速渐进转向，
 * 并把转向增量写入 spinVelocity（供渲染的履带/炮塔旋转动画）；
 * 到达目标朝向时 spinVelocity 清零并返回 true 结束任务。
 *
 * 注意 cancellable = false：转向一旦开始不可取消（瞬间完成的小任务）。
 *
 * 由 game/gameobject/task/TurnTask.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TurnTask extends Task {
  /** 目标朝向（0-359 度数）。 */
  direction: number;

  constructor(direction: number) {
    super();
    this.direction = direction;
    this.cancellable = false;
  }

  /**
   * 每 tick 转向：已对准 → 清自转速度并结束；否则按转速转一步，
   * 记录本 tick 转向增量后继续。
   */
  onTick(object: any): boolean {
    if (object.direction === this.direction) {
      object.spinVelocity = 0;
      return true;
    }
    const turnRate = object.rules.rot;
    const { facing, delta } = FacingUtilModule.FacingUtil.tick(object.direction, this.direction, turnRate);
    object.direction = facing;
    object.spinVelocity = delta;
    return false;
  }
}
