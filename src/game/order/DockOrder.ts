/**
 * DockOrder — 进坞指令（矿场回收 / 维修 / 油井码头 / 坦克碉堡）。
 *
 * 目标须为已就绪、未 warp、带 dockTrait 的友军建筑，源对象为单位。
 * process 分支：
 *  - refinery + 载具矿车 → ReturnOreTask；
 *  - unitRepairTrait 或规则 dock 列表 → MoveToDockTask；
 *  - tankBunkerTrait → EnterTankBunkerTask。
 * 坦克碉堡：isAllowed 直接看 bunkeredVehicle 是否空；isValid 用
 * canVehicleEnter 做容量校验。
 *
 * 由 game/order/DockOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 已转换
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { BuildStatus } from "game/gameobject/Building"; // 已转换
import { ReturnOreTask } from "game/gameobject/task/harvester/ReturnOreTask"; // 已转换
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换
import { MoveToDockTask } from "game/gameobject/task/MoveToDockTask"; // 已转换
import { EnterTankBunkerTask } from "game/gameobject/task/EnterTankBunkerTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DockOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;

  constructor(game: any) {
    super(OrderType.Dock);
    this.game = game;
    this.targetOptional = false;
    this.feedbackType = OrderFeedbackType.Move;
  }

  getPointerType(isMini: any): any {
    return isMini
      ? this.isAllowed()
        ? PointerTypeModule.PointerType.OccupyMini
        : PointerTypeModule.PointerType.NoActionMini
      : this.isAllowed()
        ? PointerTypeModule.PointerType.Occupy
        : PointerTypeModule.PointerType.NoOccupy;
  }

  isValid(): boolean {
    if (
      !this.target.obj?.isBuilding() ||
      this.target.obj.isDestroyed ||
      !this.target.obj.dockTrait ||
      this.target.obj.buildStatus !== BuildStatus.Ready ||
      !this.sourceObject.isUnit() ||
      this.target.obj.warpedOutTrait.isActive()
    )
      return false;
    var isPlainDock = !(this.target.obj.rules.refinery || this.target.obj.unitRepairTrait);
    return (
      this.game.areFriendly(this.target.obj, this.sourceObject) &&
      this.target.obj.dockTrait.isValidUnitForDock(this.sourceObject) &&
      !this.target.obj.dockTrait.isDocked(this.sourceObject) &&
      !(
        this.target.obj.unitRepairTrait &&
        !this.sourceObject.rules.dock.includes(this.target.obj.name) &&
        100 === this.sourceObject.healthTrait.health
      ) &&
      (!isPlainDock ||
        0 < (this.target.obj.dockTrait.getAvailableDockCount() ?? 0) ||
        this.target.obj.dockTrait.hasReservedDockForUnit(this.sourceObject) ||
        // Tank Bunker: use TankBunkerTrait capacity check (DockTrait doesn't track bunkered state)
        !!(this.target.obj.tankBunkerTrait && this.target.obj.tankBunkerTrait.canVehicleEnter(this.sourceObject)))
    );
  }

  isAllowed(): boolean {
    // Tank Bunker: check TankBunkerTrait capacity directly (DockTrait is bypassed)
    if (this.target?.obj?.tankBunkerTrait) {
      return !this.target.obj.tankBunkerTrait.bunkeredVehicle;
    }
    return true;
  }

  process(): any[] {
    if (!this.isAllowed()) return [];
    var target = this.target.obj;
    return target.rules.refinery && this.sourceObject.isVehicle() && this.sourceObject.harvesterTrait
      ? [new ReturnOreTask(this.game, target, true, true)]
      : target.unitRepairTrait || this.sourceObject.rules.dock.includes(target.name)
        ? [new MoveToDockTask(this.game, target)]
        : target.tankBunkerTrait
          ? [new EnterTankBunkerTask(this.game, target)]
          : [];
  }
}
