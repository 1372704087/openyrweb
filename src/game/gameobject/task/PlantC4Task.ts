/**
 * PlantC4Task — 安放 C4 炸药任务（Tanya/海豹突击队炸建筑）。
 *
 * 继承 EnterBuildingTask（走近并进入目标建筑），施加爆破约束：
 *  - isAllowed：目标未被摧毁且不在无敌状态（invulnerableTrait，
 *    如铁幕保护下的建筑不能炸）；
 *  - onEnter：按 rules.combatDamage.c4Delay（分钟）换算成 tick 数，
 *    在目标身上挂 c4ChargeTrait 定时炸药（记录安放者归属），
 *    广播 EnterObjectEvent，返回 false 表示"进入动作完成但任务
 *    结果由外部（爆炸）决定"；
 *  - getTargetLinesConfig：isAttack = true（UI 按攻击线画目标线）。
 *
 * 由 game/gameobject/task/PlantC4Task.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { GameSpeed } from "game/GameSpeed"; // 已转换
import * as EnterObjectEventModule from "game/event/EnterObjectEvent"; // 未转换（any-shim）
import { EnterBuildingTask } from "game/gameobject/task/EnterBuildingTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PlantC4Task extends EnterBuildingTask {
  /** 安放资格：目标未摧毁且未处于无敌保护。 */
  isAllowed(object: any): boolean {
    return !this.target.isDestroyed && !this.target.invulnerableTrait.isActive();
  }

  /** 进建筑：挂 C4 定时炸药；返回 false = 父类视为拒绝进入 → MoveOutside 退出。 */
  onEnter(object: any): boolean {
    const fuseTicks = Math.floor(60 * this.game.rules.combatDamage.c4Delay * GameSpeed.BASE_TICKS_PER_SECOND);
    this.target.c4ChargeTrait.setCharge(fuseTicks, { player: object.owner, obj: object });
    this.game.events.dispatch(new EnterObjectEventModule.EnterObjectEvent(this.target, object));
    return false;
  }

  /** 目标线：按攻击样式（红色）画到目标建筑。 */
  getTargetLinesConfig(object: any): any {
    return { target: this.target, pathNodes: [], isAttack: true };
  }
}
