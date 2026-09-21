/**
 * EnterRecyclerTask — 单位进入回收站/部队回收（Grinder / Cloning）。
 *
 * 继承 EnterBuildingTask：走到门口再进入。isAllowed 约束：
 *  - 非飞行、非超时空、非工程师；
 *  - 卖出退款 >0；
 *  - 目标是 cloning（步兵）或 grinding；
 *  - 目标未毁、BuildStatus=Ready、与单位同属。
 *
 * onEnter：建筑播研磨动画；运输载具内乘员一并退款销毁；退款记到
 * 回收站所有者（而非单位当前所有者，避免心灵控制回退后退给敌方）；
 * unspawn + UnitRecycleEvent + dispose。
 *
 * 由 game/gameobject/task/EnterRecyclerTask.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */
import { BuildStatus } from "game/gameobject/Building"; // 已转换
import { LocomotorType } from "game/type/LocomotorType"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import * as UnitRecycleEventModule from "game/event/UnitRecycleEvent"; // 未转换（any-shim）
import { EnterBuildingTask } from "game/gameobject/task/EnterBuildingTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EnterRecyclerTask extends EnterBuildingTask {
  isAllowed(object: any): boolean {
    return (
      object.rules.movementZone !== MovementZone.Fly &&
      object.rules.locomotor !== LocomotorType.Chrono &&
      !object.rules.engineer &&
      this.game.sellTrait.computeRefundValue(object) > 0 &&
      ((object.isInfantry() && this.target.rules.cloning) || !!this.target.rules.grinding) &&
      !this.target.isDestroyed &&
      this.target.buildStatus === BuildStatus.Ready &&
      object.owner === this.target.owner
    );
  }

  onEnter(object: any): void {
    const game = this.game;
    // 研磨动画计数：渲染器在 >0 时播 SpecialAnim。
    this.target._grindingAnimTicks = 600;
    // 运输载具进回收站：乘员一并退款销毁。
    if (object.transportTrait && object.transportTrait.units.length) {
      for (const passenger of object.transportTrait.units.slice()) {
        passenger.transport = undefined;
        passenger.garrisonedAt = undefined;
        this.target.owner.credits += game.sellTrait.computeRefundValue(passenger);
        game.destroyObject(passenger, { player: passenger.owner });
      }
      object.transportTrait.units.length = 0;
    }
    // 退款记到回收站所有者；unspawn 避免死亡动画/成员逃出。
    this.target.owner.credits += game.sellTrait.computeRefundValue(object);
    game.unspawnObject(object);
    game.events.dispatch(new UnitRecycleEventModule.UnitRecycleEvent(object));
    object.dispose();
  }
}
