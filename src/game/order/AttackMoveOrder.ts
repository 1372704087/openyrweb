/**
 * AttackMoveOrder — 攻击移动指令（A 键：边走边打）。
 *
 * 继承 AttackOrder：目标是 techno 时走 isTargetted 分支（点单位/建筑，
 * 攻击移动到该目标）；否则按格子扫图边走边打。
 *  - getPointerType：目标态把 AttackRange/AttackNoRange 映射为
 *    AttackMove；扫图态按通行/迷雾显示 AttackMove 或 NoMove；
 *  - isValid：单位有 attackTrait 且未 preventAttackMove；目标态叠加
 *    父类攻击校验；反馈类型固定 Move；
 *  - process：目标态 → PlantC4 / AttackMoveTargetTask；扫图态 →
 *    AttackMoveTask；
 *  - onAdd：飞行单位合并/取消已有任务；目标态地面载具挂速度惩罚。
 *
 * 由 game/order/AttackMoveOrder.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { AttackMoveTask } from "game/gameobject/task/move/AttackMoveTask"; // 已转换
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { AttackOrder } from "game/order/AttackOrder"; // 已转换
import { PlantC4Task } from "game/gameobject/task/PlantC4Task"; // 已转换
import { AttackMoveTargetTask } from "game/gameobject/task/move/AttackMoveTargetTask"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { AttackTask } from "game/gameobject/task/AttackTask"; // 已转换
import { LocomotorType } from "game/type/LocomotorType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AttackMoveOrder extends AttackOrder {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  map: any;

  constructor(game: any, map: any) {
    super(game);
    this.map = map;
    this.orderType = OrderType.AttackMove;
    this.targetOptional = false;
    this.feedbackType = OrderFeedbackType.Move;
  }

  /** 光标：目标态继承父类并把射程指针改写为 AttackMove；扫图态按通行判定。 */
  getPointerType(isMini: any, units: any): any {
    if (this.isTargetted()) {
      let pointer = super.getPointerType(isMini, units);
      return (
        (pointer !== PointerTypeModule.PointerType.AttackRange &&
          pointer !== PointerTypeModule.PointerType.AttackNoRange) ||
          (pointer = PointerTypeModule.PointerType.AttackMove),
        pointer
      );
    }
    let allowed = this.isAllowed();
    if (allowed) {
      const hasBridge = !!this.target.getBridge();
      const speedType = this.sourceObject.rules.speedType;
      const isInfantry = this.sourceObject.isInfantry();
      const isFly = this.sourceObject.rules.movementZone === MovementZone.Fly;
      allowed =
        isFly ||
        0 < this.map.terrain.getPassableSpeed(this.target.tile, speedType, isInfantry, hasBridge) ||
        !!this.game.mapShroudTrait
          .getPlayerShroud(this.sourceObject.owner)
          ?.isShrouded(this.target.tile, this.target.obj?.tileElevation);
    }
    return isMini
      ? allowed
        ? PointerTypeModule.PointerType.AttackMini
        : PointerTypeModule.PointerType.NoActionMini
      : allowed
        ? PointerTypeModule.PointerType.AttackMove
        : PointerTypeModule.PointerType.NoMove;
  }

  /** 单位可攻击移动且未禁；目标态叠加父类 isValid；反馈固定 Move。 */
  isValid(): boolean {
    const valid =
      this.sourceObject.isUnit() &&
      !!this.sourceObject.attackTrait &&
      !this.sourceObject.rules.preventAttackMove &&
      !(
        this.game.mapShroudTrait
          .getPlayerShroud(this.sourceObject.owner)
          ?.isShrouded(this.target.tile, this.target.obj?.tileElevation) &&
        !this.sourceObject.rules.moveToShroud
      ) &&
      (!this.isTargetted() || super.isValid());
    return ((this.feedbackType = OrderFeedbackType.Move), valid);
  }

  /** 非目标态额外要求 moveTrait 未瘫痪；再走父类 isAllowed。 */
  isAllowed(): boolean {
    return !(!this.isTargetted() && this.sourceObject.moveTrait.isDisabled()) && super.isAllowed();
  }

  /** 生成任务：目标态 C4/AttackMoveTargetTask；扫图态 AttackMoveTask。 */
  process(): any {
    if (this.isTargetted()) {
      if (this.isC4) return [new PlantC4Task(this.game, this.target.obj)];
      const weapon = this.sourceObject.attackTrait.selectWeaponVersus(this.sourceObject, this.target, this.game);
      return [new AttackMoveTargetTask(this.game, this.target, weapon)];
    }
    return [
      new AttackMoveTask(this.game, this.target.tile, !!this.target.getBridge(), {
        closeEnoughTiles: this.game.rules.general.closeEnough,
      }),
    ];
  }

  /** 目标是 techno（单位/建筑）时走目标攻击移动分支。 */
  isTargetted(): any {
    return this.target.obj?.isTechno();
  }

  /** 入队：飞行单位合并/取消移动与攻击任务；目标态地面载具速度惩罚。 */
  onAdd(tasks: any, isReplacing: any): boolean {
    const src = this.sourceObject;
    if (!isReplacing && src.isUnit() && this.isValid() && this.isAllowed())
      if (src.rules.movementZone === MovementZone.Fly) {
        const existing = tasks.find(
          (task: any) =>
            [MoveTask, AttackTask, AttackMoveTask, AttackMoveTargetTask].includes(task.constructor) &&
            !task.isCancelling(),
        );
        if (existing)
          if (this.isTargetted())
            (src.moveTrait.currentWaypoint?.tile === this.target.tile ||
              src.isAircraft() ||
              existing.constructor !== MoveTask) &&
              existing.forceCancel(src) &&
              tasks.splice(tasks.indexOf(existing));
          else {
            if (existing.constructor === AttackMoveTask)
              return (
                existing.updateTarget(this.target.tile, !!this.target.getBridge()),
                tasks.splice(tasks.indexOf(existing) + 1),
                src.unitOrderTrait.clearOrders(),
                false
              );
            existing.forceCancel(src) && tasks.splice(tasks.indexOf(existing));
          }
      } else
        this.isTargetted() &&
          tasks.length &&
          src.isUnit() &&
          (src.rules.locomotor === LocomotorType.Vehicle || src.rules.locomotor === LocomotorType.Ship) &&
          (src.moveTrait.speedPenalty = 0.5);
    return true;
  }
}
