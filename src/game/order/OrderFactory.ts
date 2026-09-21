/**
 * OrderFactory — 按 OrderType 构造具体 Order 实例的工厂。
 *
 * create(orderType, unitSelection?)：switch 到各具体指令构造函数；
 * Move/ForceMove 额外传入 unitSelection；Attack/ForceAttack/PlaceBomb
 * 通过 AttackOrder 选项区分 Ivan 炸弹与强攻；未识别类型抛错。
 *
 * 由 game/order/OrderFactory.ts.js 重写为 TS（行为完全一致，switch
 * 分支与构造参数脚本提取自原文件）。两个文件并存期间，本文件才是
 * 修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { OrderType } from "game/order/OrderType"; // 已转换
import * as DeployOrderModule from "game/order/DeployOrder"; // 未转换（any-shim）
import { MoveOrder } from "game/order/MoveOrder"; // 已转换
import { OccupyOrder } from "game/order/OccupyOrder"; // 已转换
import { AttackOrder } from "game/order/AttackOrder"; // 已转换
import { StopOrder } from "game/order/StopOrder"; // 已转换
import * as CheerOrderModule from "game/order/CheerOrder"; // 未转换（any-shim）
import * as DockOrderModule from "game/order/DockOrder"; // 未转换（any-shim）
import * as GatherOrderModule from "game/order/GatherOrder"; // 未转换（any-shim）
import { AttackMoveOrder } from "game/order/AttackMoveOrder"; // 已转换
import { RepairOrder } from "game/order/RepairOrder"; // 已转换
import { GuardAreaOrder } from "game/order/GuardAreaOrder"; // 已转换
import { ScatterOrder } from "game/order/ScatterOrder"; // 已转换
import * as EnterTransportOrderModule from "game/order/EnterTransportOrder"; // 未转换（any-shim）
import * as CaptureOrderModule from "game/order/CaptureOrder"; // 未转换（any-shim）
import { UnloadAllOrder } from "game/order/UnloadAllOrder"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class OrderFactory {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  map: any;

  constructor(game: any, map: any) {
    this.game = game;
    this.map = map;
  }

  /** 按指令类型构造 Order；Move 系额外接收 unitSelection。 */
  create(orderType: any, unitSelection?: any): any {
    switch (orderType) {
      case OrderType.Deploy:
        return new DeployOrderModule.DeployOrder(this.game, true);
      case OrderType.DeploySelected:
        return new DeployOrderModule.DeployOrder(this.game, false);
      case OrderType.ForceMove:
        return new MoveOrder(this.game, this.map, unitSelection, true);
      case OrderType.Move:
        return new MoveOrder(this.game, this.map, unitSelection);
      case OrderType.ForceAttack:
        return new AttackOrder(this.game, { forceAttack: true });
      case OrderType.Attack:
        return new AttackOrder(this.game, { noIvanBomb: true });
      case OrderType.PlaceBomb:
        return new AttackOrder(this.game);
      case OrderType.AttackMove:
        return new AttackMoveOrder(this.game, this.map);
      case OrderType.Capture:
        return new CaptureOrderModule.CaptureOrder(this.game);
      case OrderType.Occupy:
        return new OccupyOrder(this.game);
      case OrderType.Stop:
        return new StopOrder(this.game);
      case OrderType.Cheer:
        return new CheerOrderModule.CheerOrder();
      case OrderType.Dock:
        return new DockOrderModule.DockOrder(this.game);
      case OrderType.Gather:
        return new GatherOrderModule.GatherOrder(this.game);
      case OrderType.Repair:
        return new RepairOrder(this.game);
      case OrderType.Guard:
        return new GuardAreaOrder(this.game, false);
      case OrderType.GuardArea:
        return new GuardAreaOrder(this.game, true);
      case OrderType.Scatter:
        return new ScatterOrder(this.game);
      case OrderType.EnterTransport:
        return new EnterTransportOrderModule.EnterTransportOrder(this.game);
      case OrderType.UnloadAll:
        return new UnloadAllOrder(this.game);
      default:
        throw new Error("Unhandled order type " + OrderType[orderType]);
    }
  }
}
