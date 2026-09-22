/**
 * UpdateQueueAction — 更新玩家生产队列（增/删/暂停/恢复/置顶）。
 *
 * UpdateType：Add=0, Cancel=1, Pause=2, Resume=3, AddNext=4。
 * 序列化：queueType(u8) + updateType(u8)；Add/Cancel/AddNext 额外
 * item.index(u32)+item.type(u8)+quantity(u16)。process 按类型改队列
 * 状态或入队/出队；入队时应用建筑产量上限与 Industrial Plant 成本
 * 折扣（getCostBonusMultiplier），取消全部数量时退还 creditsSpent。
 *
 * 由 game/action/UpdateQueueAction.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as DataStreamModule from "data/DataStream"; // 未转换（any-shim）
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import * as ActionModule from "game/action/Action"; // 已转换
import { QueueType, QueueStatus } from "game/player/production/ProductionQueue"; // 已转换
import * as ActionTypeModule from "game/action/ActionType"; // 已转换
export enum UpdateType {
  Add = 0,
  Cancel = 1,
  Pause = 2,
  Resume = 3,
  AddNext = 4,
}

export class UpdateQueueAction extends ActionModule.Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  /** 处理时由 Action 队列外部注入（孪生基类无此字段声明）。 */
  player: any;
  queueType: any;
  updateType: any;
  item: any;
  quantity: any;

  constructor(game: any) {
    super(ActionTypeModule.ActionType.UpdateQueue);
    this.game = game;
  }

  unserialize(data: any): void {
    const stream = new DataStreamModule.DataStream(data);
    this.queueType = stream.readUint8();
    this.updateType = stream.readUint8();
    if (
      this.updateType === UpdateType.Add ||
      this.updateType === UpdateType.Cancel ||
      this.updateType === UpdateType.AddNext
    ) {
      const itemIndex = stream.readUint32();
      const itemType = stream.readUint8();
      this.item = this.game.rules.getTechnoByInternalId(itemIndex, itemType);
      this.quantity = stream.readUint16();
    }
  }

  serialize(): any {
    const stream = new DataStreamModule.DataStream(9);
    stream.dynamicSize = false;
    stream.writeUint8(this.queueType);
    stream.writeUint8(this.updateType);
    if (
      this.updateType === UpdateType.Add ||
      this.updateType === UpdateType.Cancel ||
      this.updateType === UpdateType.AddNext
    ) {
      if (this.quantity === void 0) throw new Error("Missing quantity");
      if (this.quantity > 65535) throw new Error("Maximum quantity exceeded");
      stream.writeUint32(this.item.index);
      stream.writeUint8(this.item.type);
      stream.writeUint16(this.quantity);
    }
    return new Uint8Array(stream.buffer, stream.byteOffset, stream.position);
  }

  print(): string {
    if (this.updateType === UpdateType.Resume)
      return "Resume queue " + QueueType[this.queueType];
    if (this.updateType === UpdateType.Add)
      return `Add to queue ${this.item.name} x ` + this.quantity;
    if (this.updateType === UpdateType.AddNext)
      return `Add next in queue ${this.item.name} x ` + this.quantity;
    if (this.updateType === UpdateType.Pause)
      return `Put queue ${QueueType[this.queueType]} on hold.`;
    if (this.updateType === UpdateType.Cancel)
      return `Cancel ${this.item.name} x ` + this.quantity;
    return "Unhandled queue update type " + this.updateType;
  }

  process(): void {
    const player = this.player;
    const item = this.item;
    const queue = player.production.getQueue(this.queueType);

    if (this.updateType === UpdateType.Resume) {
      if (queue.status === QueueStatus.OnHold)
        queue.status = QueueStatus.Active;
      return;
    }

    if (
      this.updateType === UpdateType.Add ||
      this.updateType === UpdateType.AddNext
    ) {
      const existing = queue.find(item);
      const canQueue =
        queue.status === QueueStatus.Active ||
        queue.status === QueueStatus.Idle ||
        (queue.status === QueueStatus.OnHold &&
          existing[0] !== queue.getFirst()) ||
        (queue.status === QueueStatus.Ready &&
          item.type !== ObjectType.Building);
      if (!canQueue) return;

      const existingQuantity = existing.reduce(
        (sum: any, entry: any) => sum + entry.quantity,
        0,
      );
      let remainingLimit: number;
      if (
        player.production.cheatsBypassBuildLimits ||
        !Number.isFinite(item.buildLimit)
      ) {
        remainingLimit = Number.POSITIVE_INFINITY;
      } else {
        const owned =
          item.buildLimit >= 0
            ? player
                .getOwnedObjectsByType(item.type, true)
                .filter((obj: any) => obj.name === item.name).length
            : player.getLimitedUnitsBuilt(item.name);
        remainingLimit = Math.max(
          0,
          Math.abs(item.buildLimit) - (owned + existingQuantity),
        );
      }
      if (!remainingLimit || !player.production.isAvailableForProduction(item))
        return;

      const capacity = Math.min(
        queue.maxSize - queue.currentSize,
        queue.maxItemQuantity - existingQuantity,
        remainingLimit,
      );
      const toQueue = Math.min(this.quantity, capacity);
      if (toQueue <= 0) return;
      // apply Industrial Plant (NAINDP) cost bonus to the per-item
      // cost when queueing. getCostBonusMultiplier scans the player's buildings
      // for UnitsCostBonus/InfantryCostBonus/etc. and returns the cheapest factor
      // (1 = no discount). Rounded to an integer cost like the vanilla engine.
      const creditsEach = Math.round(
        item.cost * player.production.getCostBonusMultiplier(item.type),
      );
      if (this.updateType === UpdateType.AddNext)
        queue.insertAfterFirst(item, toQueue, creditsEach);
      else queue.push(item, toQueue, creditsEach);
      return;
    }

    if (this.updateType === UpdateType.Cancel) {
      if (
        [QueueStatus.Ready, QueueStatus.OnHold, QueueStatus.Active].includes(
          queue.status,
        )
      ) {
        const existing = queue.find(item);
        if (!existing.length) return;
        const existingQuantity = existing.reduce(
          (sum: any, entry: any) => sum + entry.quantity,
          0,
        );
        const toCancel = Math.min(existingQuantity, this.quantity);
        if (toCancel <= 0) return;
        queue.pop(item, toCancel);
        if (toCancel === existingQuantity)
          player.credits += existing[0].creditsSpent;
      }
      return;
    }

    if (
      this.updateType === UpdateType.Pause &&
      queue.status === QueueStatus.Active
    ) {
      queue.status = QueueStatus.OnHold;
    }
  }
}
