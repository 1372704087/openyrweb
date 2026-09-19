/**
 * DeployIntoTask — 部署变形任务（如恐怖机器人/武装直升机展开成建筑）。
 *
 * 继承 MorphIntoTask：启动时从 rules.deploysInto 取目标类型
 * （必须是建筑类），缺省即抛错（该单位根本不会部署）；
 * 变形过程不可被移动打断的方式由父类驱动，本任务只在取消时
 * 立即返回完成（isCancelling 短路，不执行父类的变形 tick）。
 *
 * 由 game/gameobject/task/morph/DeployIntoTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import * as MorphIntoTaskModule from "game/gameobject/task/morph/MorphIntoTask"; // 未转换（any-shim）
import { ObjectType } from "engine/type/ObjectType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DeployIntoTask extends MorphIntoTaskModule.MorphIntoTask {
  /** 启动：解析 deploysInto 目标类型（建筑）后交给父类启动变形。 */
  onStart(object: any): void {
    const deploysInto = object.rules.deploysInto;
    if (!deploysInto) throw new Error(`Object type "${object.name}" doesn't deploy into anything`);
    this.morphInto = this.game.rules.getObject(deploysInto, ObjectType.Building);
    super.onStart(object);
  }

  /** 每 tick：取消中直接完成；否则由父类推进变形。 */
  onTick(object: any): boolean {
    if (this.isCancelling()) return true;
    return super.onTick(object);
  }
}
