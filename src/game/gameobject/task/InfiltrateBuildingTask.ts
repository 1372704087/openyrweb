/**
 * InfiltrateBuildingTask — 潜入建筑任务（间谍进敌建筑偷钱/断电/偷科技）。
 *
 * 继承 EnterBuildingTask（走进步兵可进入的建筑），施加潜入约束：
 *  - isAllowed：目标必须可潜入（infiltrate）、可被间谍潜入（spyable）、
 *    未被摧毁，且与潜入者敌对（友军建筑不潜）；
 *  - onEnter：潜入者本体消失（unspawnObject，间谍"进了"建筑），
 *    触发 agentTrait.infiltrate 的具体效果（偷钱/改电/偷一级等），
 *    并广播 BuildingInfiltrationEvent（供 AI/音效/提示响应）。
 *
 * 由 game/gameobject/task/InfiltrateBuildingTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import * as BuildingInfiltrationEventModule from "game/event/BuildingInfiltrationEvent"; // 未转换（any-shim）
import * as EnterBuildingTaskModule from "game/gameobject/task/EnterBuildingTask"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class InfiltrateBuildingTask extends EnterBuildingTaskModule.EnterBuildingTask {
  /** 潜入资格：可潜入 + 可间谍 + 未摧毁 + 敌对目标。 */
  isAllowed(object: any): boolean {
    return (
      object.rules.infiltrate &&
      this.target.rules.spyable &&
      !this.target.isDestroyed &&
      !this.game.areFriendly(object, this.target)
    );
  }

  /** 进建筑：间谍消失并触发潜入效果，广播潜入事件（无返回值）。 */
  onEnter(object: any): void {
    this.game.unspawnObject(object);
    object.agentTrait?.infiltrate(object, this.target, this.game);
    this.game.events.dispatch(new BuildingInfiltrationEventModule.BuildingInfiltrationEvent(this.target, object));
  }
}
