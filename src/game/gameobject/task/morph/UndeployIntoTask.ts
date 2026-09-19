/**
 * UndeployIntoTask — 解除部署变形任务（展开的建筑形态变回载具）。
 *
 * 继承 MorphIntoTask：启动时从 rules.undeploysInto 取目标类型
 * （必须是载具类），缺省即抛错（该单位本来就没部署能力），
 * 之后完全由父类驱动变形流程。
 *
 * 由 game/gameobject/task/morph/UndeployIntoTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import * as MorphIntoTaskModule from "game/gameobject/task/morph/MorphIntoTask"; // 未转换（any-shim）
import { ObjectType } from "engine/type/ObjectType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UndeployIntoTask extends MorphIntoTaskModule.MorphIntoTask {
  /** 启动：解析 undeploysInto 目标类型（载具）后交给父类启动变形。 */
  onStart(object: any): void {
    const undeploysInto = object.rules.undeploysInto;
    if (!undeploysInto) throw new Error(`Object type "${object.name}" doesn't undeploy into anything`);
    this.morphInto = this.game.rules.getObject(undeploysInto, ObjectType.Vehicle);
    super.onStart(object);
  }
}
