/**
 * RepairBuildingTask — 工程师修理建筑 / 修桥任务。
 *
 * 继承 EnterBuildingTask（工程师走近并进入目标）。目标带 cabHutTrait 时走
 * 修桥分支（canRepairBridge / repairBridge），否则按普通建筑修理条件
 * （工程师 + 可修 + 未毁 + 血量 <100 + 友军或非战斗方驻军建筑）。
 *
 *  - isAllowed：桥舱分支或普通修理条件（见上）；
 *  - onEnter：先 unspawnObject，再按分支 healToFull 或 repairBridge，
 *    并广播对应事件。返回 undefined → 父类结束任务。
 *
 * 由 game/gameobject/task/RepairBuildingTask.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import * as BuildingRepairFullEventModule from "game/event/BuildingRepairFullEvent"; // 未转换（any-shim）
import * as BridgeRepairEventModule from "game/event/BridgeRepairEvent"; // 未转换（any-shim）
import { EnterBuildingTask } from "game/gameobject/task/EnterBuildingTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RepairBuildingTask extends EnterBuildingTask {
  /** 修理资格：桥舱可修桥，或工程师可修未毁且血量 <100 的友军/非战斗驻军建筑。 */
  isAllowed(object: any): boolean {
    return this.target.cabHutTrait
      ? this.target.cabHutTrait.canRepairBridge()
      : object.rules.engineer &&
          !this.target.isDestroyed &&
          this.target.rules.repairable &&
          this.target.healthTrait.health < 100 &&
          ((!this.target.owner.isCombatant() && !!this.target.garrisonTrait) ||
            this.game.areFriendly(object, this.target));
  }

  /** 进建筑：unspawn 后修桥或回满血并广播事件；返回 undefined → 父类结束任务。 */
  onEnter(object: any): void {
    this.game.unspawnObject(object);
    if (this.target.cabHutTrait) {
      this.target.cabHutTrait.repairBridge(this.game, object.owner);
      this.game.events.dispatch(
        new BridgeRepairEventModule.BridgeRepairEvent(object.owner, this.target.centerTile),
      );
    } else {
      this.target.healthTrait.healToFull(object, this.game);
      this.game.events.dispatch(
        new BuildingRepairFullEventModule.BuildingRepairFullEvent(this.target, object.owner),
      );
    }
  }
}
