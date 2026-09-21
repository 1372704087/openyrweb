/**
 * CheerTask — 欢呼任务（胜利/庆祝时的步兵 Cheer 动画）。
 *
 *  - 非步兵 / 无 Cheer 序列 / 姿态非 None|Guard → onTick 返回 true 结束；
 *  - 条件满足：stance=Cheer，挂 WaitMinutesTask(1/60).setCancellable(false)，
 *    executed=true，onTick 返回 false 继续等待；
 *  - executed 后：stance 复位 None，onTick 返回 true 结束任务。
 *
 * constructor 设置 executed=false、cancellable=false（不可取消）。
 *
 * 由 game/gameobject/task/CheerTask.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as SequenceTypeModule from "game/art/SequenceType"; // 未转换（any-shim）
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import { WaitMinutesTask } from "game/gameobject/task/system/WaitMinutesTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CheerTask extends Task {
  executed: boolean;

  constructor() {
    super();
    this.executed = false;
    this.cancellable = false;
  }

  /** 条件满足则进入 Cheer 并等待；否则直接结束。executed 后复位姿态并结束。 */
  onTick(object: any): boolean {
    return this.executed
      ? ((object.stance = StanceType.None), true)
      : !object.isInfantry() ||
          !object.art.sequences.has(SequenceTypeModule.SequenceType.Cheer) ||
          (object.stance !== StanceType.None && object.stance !== StanceType.Guard) ||
          ((object.stance = StanceType.Cheer),
          this.children.push(new WaitMinutesTask(1 / 60).setCancellable(false)),
          !(this.executed = true));
  }
}
