/**
 * ActionsApi — 玩家动作门面（创建 Action 并推入队列）。
 *
 * 构造 (game, actionFactory, actionQueue, player, chatSender)：每个公开
 * 方法先 actionFactory.create(type)，填 player 与载荷，可选 init 后
 * actionQueue.push。覆盖放置/出售/维修/同盟/生产队列/超武/编队指令/聊天/
 * 调试/投降。
 *
 * 由 game/api/ActionsApi.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
import { ActionType } from "game/action/ActionType"; // 已转换
import { UpdateType } from "game/action/UpdateQueueAction"; // 已转换
import {
  DebugCommand,
  DebugCommandType,
} from "game/action/DebugAction"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ActionsApi {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  /** 动作工厂（孪生 WeakMap 字段 a = 第2参）。 */
  private actionFactory: any;
  /** 动作队列（孪生 WeakMap 字段 n = 第3参）。 */
  private actionQueue: any;
  /** Game 实例（孪生 WeakMap 字段 c = 第1参）。 */
  private game: any;
  /** 发起动作的玩家（孪生 WeakMap 字段 o = 第4参）。 */
  private player: any;
  /** sayAll 桥接（孪生 WeakMap 字段 h = 第5参）。 */
  private chatSender: any;

  constructor(
    game: any,
    actionFactory: any,
    actionQueue: any,
    player: any,
    chatSender: any,
  ) {
    // 赋值顺序与孪生 WeakMap set 一致：factory → queue → game → player → sender
    this.actionFactory = actionFactory;
    this.actionQueue = actionQueue;
    this.game = game;
    this.player = player;
    this.chatSender = chatSender;
  }

  placeBuilding(buildingName: any, x: any, y: any): void {
    this.pushAction(ActionType.PlaceBuilding, (action: any) => {
      action.buildingRules = this.game.rules.getBuilding(buildingName);
      action.tile = { x: x, y: y };
    });
  }

  sellObject(objectId: any): void {
    this.pushAction(ActionType.SellObject, (action: any) => {
      action.objectId = objectId;
    });
  }

  sellBuilding(buildingId: any): void {
    this.sellObject(buildingId);
  }

  toggleRepairWrench(buildingId: any): void {
    this.pushAction(ActionType.ToggleRepair, (action: any) => {
      action.buildingId = buildingId;
    });
  }

  toggleAlliance(toPlayerName: any, toggle: any): void {
    this.pushAction(ActionType.ToggleAlliance, (action: any) => {
      action.toPlayer = this.game.getPlayerByName(toPlayerName);
      action.toggle = toggle;
    });
  }

  pauseProduction(queueType: any): void {
    this.pushAction(ActionType.UpdateQueue, (action: any) => {
      action.queueType = queueType;
      action.updateType = UpdateType.Pause;
    });
  }

  resumeProduction(queueType: any): void {
    this.pushAction(ActionType.UpdateQueue, (action: any) => {
      action.queueType = queueType;
      action.updateType = UpdateType.Resume;
    });
  }

  queueForProduction(
    queueType: any,
    objectName: any,
    objectType: any,
    quantity: any,
  ): void {
    const item = this.game.rules.getObject(objectName, objectType);
    this.pushAction(ActionType.UpdateQueue, (action: any) => {
      action.queueType = queueType;
      action.updateType = UpdateType.Add;
      action.item = item;
      action.quantity = quantity;
    });
  }

  unqueueFromProduction(
    queueType: any,
    objectName: any,
    objectType: any,
    quantity: any,
  ): void {
    const item = this.game.rules.getObject(objectName, objectType);
    this.pushAction(ActionType.UpdateQueue, (action: any) => {
      action.queueType = queueType;
      action.updateType = UpdateType.Cancel;
      action.item = item;
      action.quantity = quantity;
    });
  }

  activateSuperWeapon(superWeaponType: any, tile: any, tile2?: any): void {
    this.pushAction(ActionType.ActivateSuperWeapon, (action: any) => {
      action.superWeaponType = superWeaponType;
      action.tile = { x: tile.rx, y: tile.ry };
      action.tile2 = tile2 ? { x: tile2.rx, y: tile2.ry } : void 0;
    });
  }

  /**
   * 选择单位并下达指令。
   * 孪生 orderUnits(unitIds, orderType, r, s, a)：
   *  - 先推 SelectUnits(unitIds)；
   *  - r 为坐标 rx 且 s(ry) 有值 → 查 tile（无则抛），a 为真时取桥；
   *  - r 为对象 id 且 s 空 → 不存在则直接 return（不再推 OrderUnits）；
   *  - 否则 createTarget 后推 OrderUnits(orderType, target)。
   */
  orderUnits(
    unitIds: any,
    orderType: any,
    r: any,
    s?: any,
    a?: any,
  ): void {
    this.pushAction(ActionType.SelectUnits, (action: any) => {
      action.unitIds = unitIds;
    });
    let target: any;
    if (r) {
      let bridge: any;
      let tile: any;
      if (s) {
        bridge = void 0;
        const mapTile = this.game.map.tiles.getByMapCoords(r, s);
        if (!mapTile) throw new Error(`No tile found at rx,ry=${r},` + s);
        tile = mapTile;
        if (a) {
          bridge = this.game.map.tileOccupation.getBridgeOnTile(mapTile);
        }
      } else {
        if (!this.game.getWorld().hasObjectId(r)) return;
        bridge = this.game.getObjectById(r);
        tile = bridge.tile;
      }
      target = this.game.createTarget(bridge, tile);
    }
    this.pushAction(ActionType.OrderUnits, (action: any) => {
      action.orderType = orderType;
      action.target = target;
    });
  }

  sayAll(text: any): void {
    this.chatSender?.sayAll(this.player.name, text);
  }

  setGlobalDebugText(text: any): void {
    if (!this.player.getDebugMode()) return;
    this.pushAction(ActionType.DebugCommand, (action: any) => {
      action.command = new DebugCommand(DebugCommandType.SetGlobalDebugText, {
        text: text || "",
      });
    });
  }

  setUnitDebugText(unitId: any, label: any): void {
    if (!this.player.getDebugMode()) return;
    this.pushAction(ActionType.DebugCommand, (action: any) => {
      action.command = new DebugCommand(DebugCommandType.SetUnitDebugText, {
        unitId: unitId,
        label: label,
      });
    });
  }

  quitGame(): void {
    this.pushAction(ActionType.ResignGame);
  }

  /**
   * 创建动作、注入 player、可选 init 后入队（孪生 WeakSet 私有方法 u）。
   * 无 init 时仅 create + player + push（与孪生 t?.(i) 一致）。
   */
  private pushAction(actionType: any, init?: (action: any) => void): void {
    const action = this.actionFactory.create(actionType);
    action.player = this.game.getPlayerByName(this.player.name);
    init?.(action);
    this.actionQueue.push(action);
  }
}
