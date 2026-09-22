/**
 * OrderUnitsAction — 对选中单位批量下达指令的动作。
 *
 * unserialize 读 orderType + 可选 target（tile + obj/bridge id + queue 标志）；
 * process 先按战争迷雾过滤目标，再 validateOrders 按优先级为每个单位生成
 * Order，随后按 Move / Scatter / DeploySelected / Cheer 分类做位置重算与
 * 冷却检查，最后把有效指令写入 unitOrderTrait 并维护队列 waypointPath。
 *
 * 由 game/action/OrderUnitsAction.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { orderPriorities } from "game/order/orderPriorities"; // 已转换
import { ActionType } from "game/action/ActionType"; // 已转换
import * as DataStreamModule from "data/DataStream"; // 未转换（any-shim）
import { OrderType } from "game/order/OrderType"; // 已转换
import { MoveOrder } from "game/order/MoveOrder"; // 已转换
import { DeployOrder } from "game/order/DeployOrder"; // 已转换
import * as DeployNotAllowedEventModule from "game/event/DeployNotAllowedEvent"; // 未转换（any-shim）
import * as ScatterPositionHelperModule from "game/gameobject/unit/ScatterPositionHelper"; // 未转换（any-shim）
import { Action } from "game/action/Action"; // 已转换
import * as MovePositionHelperModule from "game/gameobject/unit/MovePositionHelper"; // 未转换（any-shim）
import * as CheerEventModule from "game/event/CheerEvent"; // 未转换（any-shim）

/** 单次 OrderUnits 最多处理的单位数。 */
export const ORDER_UNIT_LIMIT = 128;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class OrderUnitsAction extends Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  map: any;
  orderActionContext: any;
  orderFactory: any;
  queue: boolean;
  isInvalid: boolean;
  player: any;
  orderType: any;
  target: any;

  constructor(game: any, map: any, orderActionContext: any, orderFactory: any) {
    super(ActionType.OrderUnits);
    this.game = game;
    this.map = map;
    this.orderActionContext = orderActionContext;
    this.orderFactory = orderFactory;
    this.queue = false;
    this.isInvalid = false;
  }

  unserialize(data: any): void {
    const stream = new DataStreamModule.DataStream(data);
    this.orderType = stream.readUint8();
    let version = stream.readUint8();
    if (version === 0) return;

    const rx = stream.readUint16();
    const ry = stream.readUint16();
    this.queue = version > 2 && Boolean(stream.readUint8());
    let obj: any;
    if (version > 3) {
      const objectId = stream.readUint32();
      if (!this.game.getWorld().hasObjectId(objectId)) {
        this.isInvalid = true;
        return;
      }
      obj = this.game.getObjectById(objectId);
    } else {
      obj = undefined;
    }
    const tile = this.map.tiles.getByMapCoords(rx, ry);
    if (tile) {
      this.target = this.game.createTarget(obj, tile);
    } else {
      this.isInvalid = true;
    }
  }

  serialize(): Uint8Array {
    const stream = new DataStreamModule.DataStream(11);
    stream.dynamicSize = false;
    stream.writeUint8(this.orderType);
    let version = 0;
    stream.writeUint8(version);
    if (this.target) {
      stream.writeUint16(this.target.tile.rx);
      stream.writeUint16(this.target.tile.ry);
      version += 2;
      const objectId = (this.target.obj || this.target.getBridge())?.id;
      if (this.queue || objectId !== undefined) {
        stream.writeUint8(Number(this.queue));
        version += 1;
      }
      if (objectId !== undefined) {
        stream.writeUint32(objectId);
        version += 1;
      }
    }
    const position = stream.position;
    if (version > 0) {
      stream.seek(1);
      stream.writeUint8(version);
    }
    return new Uint8Array(stream.buffer, stream.byteOffset, position);
  }

  print(): string {
    if (this.isInvalid) return "";
    return (
      OrderType[this.orderType] +
      " order " +
      (this.target
        ? `[obj: ${(this.target.obj || this.target.getBridge())?.name || "<none>"}, ` +
          `tile: ${this.target.tile.rx},${this.target.tile.ry}]` +
          (this.queue ? "(queue)" : "")
        : "")
    );
  }

  process(): void {
    if (this.isInvalid) return;
    const player = this.player;
    const shroud = this.game.mapShroudTrait.getPlayerShroud(player);
    if (!shroud) return;

    const targetObj = this.target?.obj;
    if (targetObj) {
      const tiles = this.game.map.tileOccupation.calculateTilesForGameObject(
        targetObj.tile,
        targetObj,
      );
      // 目标完全被迷雾覆盖时不下达指令
      if (
        !tiles.find(
          (tile: any) => !shroud.isShrouded(tile, targetObj.tileElevation),
        )
      )
        return;
    }

    const validated = this.validateOrders(player).slice(0, ORDER_UNIT_LIMIT);
    const otherOrders: any[] = [];
    const moveOrders: any[] = [];
    const scatterOrders: any[] = [];
    const deployOrders: any[] = [];
    const cheerOrders: any[] = [];

    validated.forEach((order: any) => {
      if (order instanceof MoveOrder) {
        moveOrders.push(order);
      } else if (order.orderType === OrderType.Scatter) {
        scatterOrders.push(order);
      } else if (order.orderType === OrderType.DeploySelected) {
        deployOrders.push(order);
      } else if (order.orderType === OrderType.Cheer) {
        cheerOrders.push(order);
      } else {
        otherOrders.push(order);
      }
    });

    if (moveOrders.length && this.target) {
      const isEnemyBuildingBlock = moveOrders[0].isEnemyBuildingBlock();
      const isFollowMove = moveOrders[0].isFollowMove();
      if (isEnemyBuildingBlock || isFollowMove) {
        moveOrders.forEach((order) => otherOrders.push(order));
      } else {
        const bridge = this.target.getBridge();
        const forceMove = moveOrders[0].forceMove;
        const sourceObjects = moveOrders.map((order) => order.sourceObject);
        const positions = new MovePositionHelperModule.MovePositionHelper(
          this.map,
        ).findPositions(sourceObjects, this.target.tile, bridge, forceMove);
        moveOrders.forEach((order) => {
          const pos = positions.get(order.sourceObject);
          const tileBridge =
            !bridge || bridge.isHighBridge()
              ? this.map.tileOccupation.getBridgeOnTile(pos)
              : bridge;
          order.target = this.game.createTarget(tileBridge, pos);
          otherOrders.push(order);
        });
      }
    }

    if (scatterOrders.length) {
      const scatterObjects = scatterOrders
        .map((order) => order.sourceObject)
        .filter((obj: any) => obj.isInfantry() || obj.isVehicle());
      const scatterPositions =
        new ScatterPositionHelperModule.ScatterPositionHelper(
          this.game,
        ).findPositions(scatterObjects);
      scatterOrders.forEach((order) => {
        const pos = scatterPositions.get(order.sourceObject);
        if (pos) {
          order.target = this.game.createTarget(pos.onBridge, pos.tile);
          otherOrders.push(order);
        }
      });
    }

    if (deployOrders.length) {
      const deployable: any[] = [];
      deployOrders.forEach((order) => {
        if (
          (order.sourceObject.isInfantry() || order.sourceObject.isVehicle()) &&
          order.sourceObject.deployerTrait
        ) {
          deployable.push(order);
        } else {
          otherOrders.push(order);
        }
      });
      const undeployed = deployable.filter(
        (order) => !order.sourceObject.deployerTrait.isDeployed(),
      );
      if (undeployed.length) {
        undeployed.forEach((order) => otherOrders.push(order));
      } else {
        deployable.forEach((order) => otherOrders.push(order));
      }
    }

    if (cheerOrders.length && !player.cheerCooldownTicks) {
      player.cheerCooldownTicks = this.game.rules.general.maximumCheerRate;
      otherOrders.push(...cheerOrders);
      this.game.events.dispatch(new CheerEventModule.CheerEvent(player));
    }

    otherOrders.forEach((order) => {
      order.sourceObject.unitOrderTrait.addOrder(order, this.queue);
    });
    this.updateWaypointPaths(otherOrders);
  }

  /** 按 orderType / 优先级列表为玩家选中单位生成合法 Order。 */
  validateOrders(player: any): any[] {
    const selection = this.orderActionContext.getOrCreateSelection(player);
    const selectedUnits = selection.getSelectedUnits();
    const probe = this.orderFactory.create(this.orderType, selection);
    probe.target = this.target;
    const orders: any[] = [];

    for (const unit of selectedUnits) {
      if (
        unit.owner !== player ||
        unit.rules.spawned ||
        unit.isDestroyed ||
        unit.isCrashing ||
        unit.isDisposed ||
        unit.warpedOutTrait.isActive()
      ) {
        continue;
      }
      probe.sourceObject = unit;
      if (
        probe instanceof DeployOrder &&
        probe.isValid() &&
        !probe.isAllowed()
      ) {
        this.game.events.dispatch(
          new DeployNotAllowedEventModule.DeployNotAllowedEvent(unit),
        );
      }
      if (probe.singleSelectionRequired && selectedUnits.length > 1) continue;

      if (
        (this.target || probe.targetOptional) &&
        probe.isValid() &&
        probe.isAllowed()
      ) {
        const order = this.orderFactory.create(this.orderType, selection);
        order.set(unit, this.target);
        orders.push(order);
      } else {
        let matched = false;
        for (const priorityType of orderPriorities) {
          const order = this.orderFactory.create(priorityType, selection);
          order.set(unit, this.target);
          if (
            !(order.singleSelectionRequired && selectedUnits.length > 1) &&
            order.targetOptional === !this.target &&
            order.isValid() &&
            order.isAllowed()
          ) {
            orders.push(order);
            matched = true;
            break;
          }
        }
        if (!matched && this.target && this.orderType !== OrderType.Deploy) {
          const moveOrder = this.orderFactory.create(OrderType.Move, selection);
          moveOrder.set(unit, this.target);
          if (moveOrder.isValid() && moveOrder.isAllowed())
            orders.push(moveOrder);
        }
      }
    }
    return orders;
  }

  /** 队列下令时维护单位 waypointPath（合并/追加）。 */
  updateWaypointPaths(orders: any[]): void {
    if (!this.queue || !this.target) return;
    const sourceObjects = orders.map((order) => order.sourceObject);
    const existingPaths = [
      ...new Set(
        sourceObjects
          .map((obj: any) => obj.unitOrderTrait.waypointPath)
          .filter(isNotNullOrUndefined),
      ),
    ];
    if (existingPaths.length > 1) return;

    const waypoint = {
      orderType: this.orderType,
      target: this.target,
      terminal: orders.some((order) => order.terminal),
      next: undefined as any,
    };
    if (existingPaths.length === 0) {
      const path = { units: sourceObjects, waypoints: [waypoint] };
      sourceObjects.forEach((obj: any) => {
        obj.unitOrderTrait.waypointPath = path;
      });
    } else {
      const path = existingPaths[0];
      path.waypoints[path.waypoints.length - 1].next = waypoint;
      path.waypoints.push(waypoint);
    }
  }
}
