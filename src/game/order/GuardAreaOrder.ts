/**
 * GuardAreaOrder — 警戒 / 区域警戒指令。
 *
 * targeted=true 时为 GuardArea（右键指定警戒格，可移动过去）；
 * targeted=false 时为 Guard（原地警戒，目标可选）。载具矿车在警戒时
 * 挂采矿循环（满载 ReturnOre / 否则 GatherOre），其它单位到位后置
 * guardMode。驻军建筑也可下达 Guard（无 moveTrait 时仅取消攻击固守）。
 *
 * 由 game/order/GuardAreaOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 未转换（any-shim）
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import * as OrderFeedbackTypeModule from "game/order/OrderFeedbackType"; // 未转换（any-shim）
import { MoveResult } from "game/gameobject/trait/MoveTrait"; // 已转换
import { GatherOreTask } from "game/gameobject/task/harvester/GatherOreTask"; // 已转换
import { ReturnOreTask } from "game/gameobject/task/harvester/ReturnOreTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GuardAreaOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  targeted: any;
  getPointerType: any;

  constructor(game: any, targeted: any) {
    super(targeted ? OrderType.GuardArea : OrderType.Guard);
    this.game = game;
    this.targeted = targeted;
    this.getPointerType = (isMini: any) =>
      isMini
        ? this.isAllowed()
          ? PointerTypeModule.PointerType.GuardMini
          : PointerTypeModule.PointerType.NoActionMini
        : this.isAllowed()
          ? PointerTypeModule.PointerType.Guard
          : PointerTypeModule.PointerType.NoMove;
    this.terminal = true;
    this.targetOptional = !targeted;
    this.minimapAllowed = targeted;
    this.feedbackType = targeted
      ? OrderFeedbackTypeModule.OrderFeedbackType.Move
      : OrderFeedbackTypeModule.OrderFeedbackType.None;
  }

  isValid(): boolean {
    const sourceObject = this.sourceObject;
    // garrisoned buildings (bunkers/huts) can receive Guard too — they
    // have no unit moveTrait, but a selected garrisoned building should be able to
    // cancel its current attack and hold ground (vanilla YR behaviour). Plain
    // buildings without a garrison still reject Guard.
    return (
      (sourceObject.isUnit() || (sourceObject.isBuilding() && !!sourceObject.garrisonTrait)) &&
      (!!this.targetOptional || !sourceObject.moveTrait?.isDisabled()) &&
      !(
        this.target &&
        this.game.mapShroudTrait
          .getPlayerShroud(sourceObject.owner)
          ?.isShrouded(this.target.tile, this.target.obj?.tileElevation) &&
        !sourceObject.rules.moveToShroud
      )
    );
  }

  isAllowed(): boolean {
    return true;
  }

  process(): any[] {
    let guardTile = this.targeted ? this.target.tile : undefined;
    const sourceObject = this.sourceObject;
    let tasks: any[] = [];
    // only units move to the guard-area tile — buildings (incl.
    // garrisoned ones) cannot move, they just hold ground where they are.
    guardTile &&
      sourceObject.isUnit() &&
      tasks.push(
        new MoveTask(this.game, guardTile, !!this.target.getBridge(), {
          closeEnoughTiles: this.game.rules.general.closeEnough,
        }),
      );
    sourceObject.isVehicle() && sourceObject.harvesterTrait
      ? tasks.push(
          new CallbackTask(() => (sourceObject.harvesterTrait.lastOreSite = undefined)),
          sourceObject.harvesterTrait.isFull()
            ? new ReturnOreTask(this.game, undefined, undefined, true)
            : new GatherOreTask(this.game, undefined, true),
        )
      : tasks.push(
          new CallbackTask(() => {
            (guardTile &&
              this.sourceObject.isUnit() &&
              ![MoveResult.Success, MoveResult.CloseEnough].includes(
                this.sourceObject.moveTrait?.lastMoveResult,
              )) ||
              (this.sourceObject.guardMode = true);
          }),
        );
    return tasks;
  }
}
