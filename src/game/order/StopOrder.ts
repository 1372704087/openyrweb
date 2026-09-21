/**
 * StopOrder — 停止指令。
 *
 * 所有 techno 单位/建筑有效。process 挂 CallbackTask：Vehicle/Ship
 * 载具在真正 stop 时清 speedPenalty=0。onAdd：新任务且为 Vehicle/Ship
 * 时先置 speedPenalty=0.5；建筑若有 rally 点则经 unitRepairTrait /
 * factoryTrait 重置 rally。恒返回 true。
 *
 * 由 game/order/StopOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 未转换（any-shim）
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { LocomotorType } from "game/type/LocomotorType"; // 已转换
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class StopOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  getPointerType: any;

  constructor(game: any) {
    super(OrderType.Stop);
    this.game = game;
    this.getPointerType = () => PointerTypeModule.PointerType.NoAction;
  }

  isValid(): boolean {
    return this.sourceObject.isTechno();
  }

  isAllowed(): boolean {
    return true;
  }

  process(): any[] {
    return [
      new CallbackTask((object: any) => {
        !object.isUnit() ||
          (object.rules.locomotor !== LocomotorType.Vehicle && object.rules.locomotor !== LocomotorType.Ship) ||
          (object.moveTrait.speedPenalty = 0);
      }),
    ];
  }

  onAdd(tasks: any, skip: any): boolean {
    const sourceObject = this.sourceObject;
    skip ||
      !tasks.length ||
      !sourceObject.isUnit() ||
      (sourceObject.rules.locomotor !== LocomotorType.Vehicle &&
        sourceObject.rules.locomotor !== LocomotorType.Ship) ||
      (sourceObject.moveTrait.speedPenalty = 0.5);
    sourceObject.isBuilding() &&
      sourceObject.rallyTrait?.getRallyPoint() &&
      (sourceObject.unitRepairTrait?.resetRallyPoint(sourceObject, this.game),
      sourceObject.factoryTrait?.resetRallyPoint(sourceObject, this.game));
    return true;
  }
}
