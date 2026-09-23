/**
 * ProductionApi — 玩家生产队列只读门面。
 *
 * 构造时注入 player.production；isAvailableForProduction /
 * getAvailableObjects / getQueueTypeForObject / getQueueData 均委托底层，
 * getQueueData 摊平为 { size, maxSize, status, type, items[] }。
 *
 * 由 game/api/ProductionApi.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class ProductionApi {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  /** 底层 ProductionTrait（孪生为 WeakMap 私有）。 */
  private production: any;

  constructor(production: any) {
    this.production = production;
  }

  isAvailableForProduction(rules: any): any {
    return this.production.isAvailableForProduction(rules);
  }

  getAvailableObjects(queueType?: any): any {
    let objects = this.production.getAvailableObjects();
    if (queueType !== void 0) {
      objects = objects.filter(
        (obj: any) => this.getQueueTypeForObject(obj) === queueType,
      );
    }
    return objects;
  }

  getQueueTypeForObject(rules: any): any {
    return this.production.getQueueTypeForObject(rules);
  }

  getQueueData(queueType: any): any {
    const queue = this.production.getQueue(queueType);
    return {
      size: queue.currentSize,
      maxSize: queue.maxSize,
      status: queue.status,
      type: queue.type,
      items: queue.getAll().map((entry: any) => ({
        rules: entry.rules,
        quantity: entry.quantity,
      })),
    };
  }
}
