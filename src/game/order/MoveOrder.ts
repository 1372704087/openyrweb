/**
 * MoveOrder — 移动指令（右键点地/点单位）。
 *
 * 绑定 unitSelection：校验目标格可走（飞行/地面/两栖、伪装敌人、
 * 友军选中单位点自己 = 不移动）、建筑部署/集结点特殊路径：
 *  - 建筑且 undeploysInto → UndeployIntoTask + MoveTask；
 *  - 建筑且有集结点 → onAdd 直接改集结点，不入任务队列；
 *  - 载具 forceMove 撞敌建筑 → MoveToBlockTask；
 *  - forceMove 跟移动中的步兵 → MoveTargetTask；
 *  - 其余 → MoveTask（closeEnough + forceMove）。
 *
 * 光标：地雷/不可通行时 NoMove；已在 isAllowed 且强移/建筑/战争迷雾
 * 时直接 Move，否则按地形通行速度重算。
 *
 * 由 game/order/MoveOrder.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标。
 */
import { Order } from "game/order/Order"; // 已转换
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { UndeployIntoTask } from "game/gameobject/task/morph/UndeployIntoTask"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换
import * as RallyPointChangeEventModule from "game/event/RallyPointChangeEvent"; // 未转换（any-shim）
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { AttackTask } from "game/gameobject/task/AttackTask"; // 已转换
import { BuildStatus } from "game/gameobject/Building"; // 已转换
import { WaitForBuildUpTask } from "game/gameobject/task/WaitForBuildUpTask"; // 已转换
import { MoveToBlockTask } from "game/gameobject/task/move/MoveToBlockTask"; // 已转换
import { LandType } from "game/type/LandType"; // 已转换
import { AttackMoveTask } from "game/gameobject/task/move/AttackMoveTask"; // 已转换
import { AttackMoveTargetTask } from "game/gameobject/task/move/AttackMoveTargetTask"; // 已转换
import { MoveTargetTask } from "game/gameobject/task/move/MoveTargetTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveOrder extends Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  map: any;
  unitSelection: any;
  forceMove: boolean;

  constructor(game: any, map: any, unitSelection: any, forceMove = false) {
    super(forceMove ? OrderType.ForceMove : OrderType.Move);
    this.game = game;
    this.map = map;
    this.unitSelection = unitSelection;
    this.forceMove = forceMove;
    this.targetOptional = false;
    this.feedbackType = OrderFeedbackType.Move;
  }

  /** 光标：不可走/禁移动 → NoMove；可走 → Move（迷你版另取）。 */
  getPointerType(isMini: any): any {
    let allowed = this.isAllowed();
    // 碉堡内载具显示默认箭头光标，而不是 NoMove/NoAction
    if (!allowed && this.sourceObject.bunkeredAt) {
      return PointerTypeModule.PointerType.Default;
    }
    // 与孪生一致：isAllowed 为 false 时短路保持 false；
    // forceMove/建筑/战争迷雾时信任 isAllowed 直接 Move；
    // 否则按地形通行速度重算 allowed。
    const skipRecheck =
      !allowed ||
      this.forceMove ||
      this.sourceObject.isBuilding() ||
      this.game.mapShroudTrait
        .getPlayerShroud(this.sourceObject.owner)
        ?.isShrouded(this.target.tile, this.target.obj?.tileElevation);
    if (!skipRecheck) {
      const hasBridge = !!this.target.getBridge();
      const speedType = this.sourceObject.rules.speedType;
      const isInfantry = this.sourceObject.isInfantry();
      const isFly = this.sourceObject.rules.movementZone === MovementZone.Fly;
      const hasTerrainDisguise = this.map
        .getObjectsOnTile(this.target.tile)
        .some((obj: any) => (obj.isInfantry() || obj.isVehicle()) && obj.disguiseTrait?.hasTerrainDisguise());
      allowed = isFly
        ? this.sourceObject.rules.airportBound ||
          this.target.tile.landType === LandType.Cliff ||
          (0 < this.map.terrain.getPassableSpeed(this.target.tile, SpeedType.Amphibious, false, hasBridge) && !hasTerrainDisguise)
        : 0 < this.map.terrain.getPassableSpeed(this.target.tile, speedType, isInfantry, hasBridge) &&
          !hasTerrainDisguise &&
          !(this.target.obj?.isTechno() && !this.game.areFriendly(this.target.obj, this.sourceObject));
    }
    return isMini
      ? allowed
        ? PointerTypeModule.PointerType.MoveMini
        : PointerTypeModule.PointerType.NoActionMini
      : allowed
        ? PointerTypeModule.PointerType.Move
        : PointerTypeModule.PointerType.NoMove;
  }

  /** 目标形态：建筑无部署且无集结点不可移动；点到墙/己方选中/伪装/敌军可走。 */
  isValid(): boolean {
    return (
      !(
        this.sourceObject.isBuilding() &&
        (!this.sourceObject.rules.undeploysInto ||
          (this.sourceObject.rules.constructionYard && !this.game.gameOpts.mcvRepacks)) &&
        !this.sourceObject.rallyTrait?.getRallyPoint()
      ) &&
      (this.forceMove ||
        !this.target.obj ||
        ((this.target.obj.isOverlay() || this.target.obj.isBuilding()) && this.target.obj.rules.wall) ||
        (this.target.obj.isTechno() &&
          this.target.obj.owner === this.sourceObject.owner &&
          this.unitSelection.isSelected(this.target.obj)) ||
        ((this.target.obj.isInfantry() || this.target.obj.isVehicle()) &&
          !!this.target.obj.disguiseTrait?.hasTerrainDisguise()) ||
        (this.target.obj.isTechno() && !this.game.areFriendly(this.target.obj, this.sourceObject)))
    );
  }

  /** 允许性：单位 moveTrait 未禁用；战争迷雾时要求 moveToShroud；点己方选中单位不允许（除非强移）。 */
  isAllowed(): boolean {
    return (
      (!this.sourceObject.isUnit() || !this.sourceObject.moveTrait.isDisabled()) &&
      (this.game.mapShroudTrait
        .getPlayerShroud(this.sourceObject.owner)
        ?.isShrouded(this.target.tile, this.target.obj?.tileElevation)
        ? this.sourceObject.rules.moveToShroud
        : !(
            !this.forceMove &&
            this.target.obj?.isTechno() &&
            this.target.obj.owner === this.sourceObject.owner &&
            this.unitSelection.isSelected(this.target.obj)
          ))
    );
  }

  /** 生成移动任务（见类注释分支）；建筑带集结点时返回 undefined（onAdd 改集结点）。 */
  process(): any {
    const src = this.sourceObject;
    // 部署开火单位先解除部署再移动
    src.isUnit() && src.deployerTrait?.isDeployed() && src.deployerTrait.setDeployed(false);
    if (!src.isBuilding() || !src.rallyTrait?.getRallyPoint()) {
      const closeEnoughTiles = this.game.rules.general.closeEnough;
      return src.isBuilding() && src.rules.undeploysInto
        ? [
            new UndeployIntoTask(this.game),
            new MoveTask(this.game, this.target.tile, !!this.target.getBridge(), {
              closeEnoughTiles,
              forceMove: this.forceMove,
            }),
          ]
        : src.isUnit()
          ? this.isEnemyBuildingBlock()
            ? [new MoveToBlockTask(this.game, this.target.obj)]
            : this.isFollowMove()
              ? [new MoveTargetTask(this.game, this.target.obj)]
              : [
                  new MoveTask(this.game, this.target.tile, !!this.target.getBridge(), {
                    closeEnoughTiles,
                    forceMove: this.forceMove,
                  }),
                ]
          : undefined;
    }
  }

  /** forceMove 撞敌方建筑（非飞行器载具）。 */
  isEnemyBuildingBlock(): boolean {
    return (
      this.forceMove &&
      this.sourceObject.isVehicle() &&
      !this.sourceObject.rules.consideredAircraft &&
      this.target.obj?.isBuilding() &&
      !this.game.areFriendly(this.sourceObject, this.target.obj)
    );
  }

  /** forceMove 跟随移动中的步兵。 */
  isFollowMove(): boolean {
    return (
      this.forceMove &&
      this.target.obj?.isInfantry() &&
      this.sourceObject.isVehicle() &&
      !this.sourceObject.rules.consideredAircraft &&
      !this.target.obj.moveTrait.isIdle()
    );
  }

  /**
   * 入队拦截：建造中→放行 WaitForBuildUp；建筑集结点→改集结点不入队；
   * 同队已有 MoveTask→更新其目标并清后续；飞行单位→取消攻击类任务。
   */
  onAdd(tasks: any, isReplacing: any): boolean {
    const isUndeployBuilding = this.sourceObject.isBuilding() && this.sourceObject.rules.undeploysInto;
    if (isUndeployBuilding && this.sourceObject.buildStatus === BuildStatus.BuildUp)
      return (
        this.sourceObject.unitOrderTrait
          .getTasks()
          .find((task: any) => task instanceof WaitForBuildUpTask)
          ?.setCancellable(true),
        true
      );
    if (!isUndeployBuilding && this.sourceObject.isBuilding() && this.sourceObject.rallyTrait?.getRallyPoint())
      return (
        this.sourceObject.rallyTrait.changeRallyPoint(this.target.tile, this.sourceObject, this.game),
        this.game.events.dispatch(new RallyPointChangeEventModule.RallyPointChangeEvent(this.sourceObject)),
        false
      );
    if (!this.isEnemyBuildingBlock() && !this.isFollowMove() && !isReplacing && this.isValid() && this.isAllowed()) {
      this.sourceObject.attackTrait?.cancelOpportunityFire();
      const moveTask = tasks.find((task: any) => task.constructor === MoveTask && !task.isCancelling());
      if (moveTask)
        return (
          moveTask.setForceMove(this.forceMove),
          moveTask.updateTarget(this.target.tile, !!this.target.getBridge(), true),
          moveTask.children.length &&
            moveTask.children[0] instanceof AttackTask &&
            moveTask.children[0].cancel(),
          tasks.splice(tasks.indexOf(moveTask) + 1),
          this.sourceObject.unitOrderTrait.clearOrders(),
          false
        );
      if (this.sourceObject.isUnit() && this.sourceObject.rules.movementZone === MovementZone.Fly) {
        const flyTask = tasks.find(
          (task: any) =>
            [AttackTask, AttackMoveTask, AttackMoveTargetTask].includes(task.constructor) &&
            !task.isCancelling(),
        );
        flyTask && flyTask.forceCancel(this.sourceObject) && tasks.splice(tasks.indexOf(flyTask));
      }
    }
    return true;
  }
}
