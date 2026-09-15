/**
 * ProductionQueue — 生产队列（同类对象的排队/扣款进度/状态机）。
 *
 * 每条队列对应一类工厂产出（QueueType），条目为 {rules, quantity,
 * creditsEach, creditsSpent, creditsSpentLeftover, progress}：
 *  - push 追加到队尾（与队尾同规则时合并数量）；
 *  - insertAfterFirst 插队到队首条目之后（"置顶"生产，原版 TsShrink
 *    等行为用）——队首条目被拆为 1 个 + 剩余数量两段；
 *  - remove 支持从队尾（pop）或队首（shift）方向扣减数量；
 *  - maxSize 收缩时从队尾截断条目（maxSize setter）。
 * 任何数量/状态变化都经 _onUpdate 派发，sidebar 据此刷新。
 *
 * 由 game/player/production/ProductionQueue.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import { EventDispatcher } from "util/event";

/** 生产队列类别（决定从哪种工厂出）。 */
export enum QueueType {
  /** 建筑（基地车建造）。 */
  Structures = 0,
  /** 防御建筑（兵营生产线）。 */
  Armory = 1,
  /** 步兵。 */
  Infantry = 2,
  /** 载具。 */
  Vehicles = 3,
  /** 飞行器。 */
  Aircrafts = 4,
  /** 舰船。 */
  Ships = 5,
}

/** 队列状态：空闲 / 生产中 / 挂起 / 首个条目就绪待放置。 */
export enum QueueStatus {
  Idle = 0,
  Active = 1,
  OnHold = 2,
  Ready = 3,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ProductionQueue {
  type: QueueType;
  _maxSize: number;
  maxItemQuantity: number;
  items: any[];
  size: number;
  _status: QueueStatus;
  _onUpdate: EventDispatcher;

  /** 队列变化事件（只读视图），sidebar/生产逻辑订阅。 */
  get onUpdate(): EventDispatcher {
    return this._onUpdate.asEvent();
  }

  constructor(type: QueueType, maxSize: number, maxItemQuantity: number) {
    this.type = type;
    this._maxSize = maxSize;
    this.maxItemQuantity = maxItemQuantity;
    this.items = [];
    this.size = 0;
    this._status = QueueStatus.Idle;
    this._onUpdate = new EventDispatcher();
  }

  get status(): QueueStatus {
    return this._status;
  }

  set status(status: QueueStatus) {
    const previous = this._status;
    if ((this._status = status) !== previous) this._onUpdate.dispatch(this);
  }

  get maxSize(): number {
    return this._maxSize;
  }

  /** 收缩队列上限：从队尾截断超出部分（截断后空队列回 Idle）。 */
  set maxSize(maxSize: number) {
    const previousSize = this.size;
    this.size = Math.min(maxSize, this.size);
    let processedQuantity = 0;
    let index = 0;
    while (processedQuantity <= this.size && index < this.items.length) {
      const item = this.items[index];
      processedQuantity += item.quantity;
      if (processedQuantity > this.size) item.quantity -= processedQuantity - this.size;
      if (item.quantity > 0) index++;
    }
    this._maxSize = maxSize;
    if (this.items[index]) this.items.splice(index);
    if (previousSize !== this.size) {
      if (!this.size) this._status = QueueStatus.Idle;
      this._onUpdate.dispatch(this);
    }
  }

  get currentSize(): number {
    return this.size;
  }

  /** 取与指定规则相同的全部条目。 */
  find(rules: any): any[] {
    return this.items.filter((item) => item.rules === rules);
  }

  getFirst(): any {
    return this.items[0];
  }

  getAll(): any[] {
    return [...this.items];
  }

  /**
   * 追加数量：先按队列剩余容量、再按同规则最大数量截断；与队尾同规则
   * 的条目直接合并。数量为 0 时不产生变化。
   */
  push(rules: any, quantity: number, creditsEach: number): void {
    quantity = Math.min(this.maxSize - this.size, quantity);
    const existing = this.find(rules).reduce((sum, item) => sum + item.quantity, 0);
    quantity = Math.min(this.maxItemQuantity - existing, quantity);
    if (quantity) {
      if (this.items[this.items.length - 1]?.rules === rules) {
        this.items[this.items.length - 1].quantity += quantity;
      } else {
        this.items.push({
          rules,
          quantity,
          creditsEach,
          creditsSpent: 0,
          creditsSpentLeftover: 0,
          progress: 0,
        });
      }
      this.size += quantity;
      if (this._status === QueueStatus.Idle) this._status = QueueStatus.Active;
      this._onUpdate.dispatch(this);
    }
  }

  /**
   * 插队：新条目排在队首条目之后（队首条目拆出 1 个保留在第一位）。
   * 空队列时退化为 push。
   */
  insertAfterFirst(rules: any, quantity: number, creditsEach: number): void {
    quantity = Math.min(this.maxSize - this.size, quantity);
    const existing = this.find(rules).reduce((sum, item) => sum + item.quantity, 0);
    quantity = Math.min(this.maxItemQuantity - existing, quantity);
    if (quantity) {
      if (this.items.length) {
        const first = this.items[0];
        const firstQuantity = first.quantity;
        const remainder = Math.max(0, firstQuantity - 1);
        first.quantity = 1;
        const newItems = [first];
        const rest = this.items.slice(1);
        newItems.push({
          rules,
          quantity,
          creditsEach,
          creditsSpent: 0,
          creditsSpentLeftover: 0,
          progress: 0,
        });
        if (remainder > 0)
          newItems.push({
            rules: first.rules,
            quantity: remainder,
            creditsEach: first.creditsEach,
            creditsSpent: 0,
            creditsSpentLeftover: 0,
            progress: 0,
          });
        newItems.push(...rest);
        this.items = newItems;
        this.size += quantity;
        if (this._status === QueueStatus.Idle) this._status = QueueStatus.Active;
        this._onUpdate.dispatch(this);
      } else {
        this.push(rules, quantity, creditsEach);
      }
    }
  }

  /** 从队尾方向移除数量。 */
  pop(rules: any, quantity: number): void {
    this.remove(rules, quantity, false);
  }

  /** 从队首方向移除数量。 */
  shift(rules: any, quantity: number): void {
    this.remove(rules, quantity, true);
  }

  /**
   * 移除指定规则的数量：按 direction 从队首/队尾逐条扣减，条目数量
   * 归零即从队列删除；若删除的是队首且队列非空，状态回 Active。
   */
  remove(rules: any, quantity: number, fromFront: boolean): void {
    const matching = this.find(rules);
    if (!matching.length) throw new Error(`Can't remove non-existent item ${rules.name} from queue ` + QueueType[this.type]);
    if (matching.reduce((sum, item) => sum + item.quantity, 0) < quantity)
      throw new Error(`Attempted to remove a quantity larger than the one in queue (${rules.name})`);
    let remaining = quantity;
    while (remaining > 0) {
      const item = fromFront ? matching.shift() : matching.pop();
      if (item.quantity <= remaining) {
        const wasFirst = this.getFirst() === item;
        this.items.splice(this.items.indexOf(item), 1);
        if (wasFirst) this._status = QueueStatus.Active;
        remaining -= item.quantity;
      } else {
        item.quantity -= remaining;
        remaining = 0;
      }
    }
    this.size -= quantity;
    if (quantity) {
      if (!this.size) this._status = QueueStatus.Idle;
      this._onUpdate.dispatch(this);
    }
  }

  /** 手动触发更新事件（外部直接改队列内容后调用）。 */
  notifyUpdated(): void {
    this._onUpdate.dispatch(this);
  }
}
