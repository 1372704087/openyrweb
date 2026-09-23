/**
 * EventsApi — 对外事件订阅门面（内部 EventType → ApiEventType 映射）。
 *
 * subscribe(fn) 或 subscribe(type, fn)：底层订阅 game 事件总线，经
 * mapEvent 过滤/投影后回调；返回退订函数并记入 subscriptions，dispose
 * 时批量退订并清空。ApiEventType：ObjectOwnerChange=0、ObjectSpawn=1、
 * ObjectUnspawn=2、ObjectDestroy=3（投射物销毁不对外）。
 *
 * 由 game/api/EventsApi.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 对外事件类型（与孪生 ApiEventType 数值一致）。 */
export enum ApiEventType {
  ObjectOwnerChange = 0,
  ObjectSpawn = 1,
  ObjectUnspawn = 2,
  ObjectDestroy = 3,
}

export class EventsApi {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  /** 底层事件总线（孪生为 WeakMap 私有）。 */
  private bus: any;
  /** 已登记的退订函数（孪生为 WeakMap 私有数组）。 */
  private subscriptions: any[];

  constructor(bus: any) {
    this.bus = bus;
    this.subscriptions = [];
  }

  subscribe(typeOrListener: any, listener?: any): any {
    let type: any = void 0;
    let fn: any;
    // 孪生: "function" == typeof e ? e : ((i = e), t)
    fn = "function" == typeof typeOrListener ? typeOrListener : ((type = typeOrListener), listener);
    const off = this.bus.subscribe((raw: any) => {
      const mapped = this.mapEvent(raw);
      if (!mapped) return;
      if (type !== void 0 && type !== mapped.type) return;
      fn(mapped);
    });
    this.subscriptions.push(off);
    return off;
  }

  dispose(): void {
    for (const off of this.subscriptions) off();
    this.subscriptions.length = 0;
  }

  /** 内部事件 → 对外 ApiEventType 投影（无匹配返回 undefined）。 */
  private mapEvent(event: any): any {
    switch (event.type) {
      case EventType.ObjectOwnerChange:
        return {
          type: ApiEventType.ObjectOwnerChange,
          prevOwnerName: event.prevOwner.name,
          newOwnerName: event.target.owner.name,
          target: event.target.id,
        };
      case EventType.ObjectSpawn:
        return { type: ApiEventType.ObjectSpawn, target: event.gameObject.id };
      case EventType.ObjectUnspawn:
        return { type: ApiEventType.ObjectUnspawn, target: event.gameObject.id };
      case EventType.ObjectDestroy: {
        const e = event;
        // 投影物销毁不对外暴露
        if (e.target.isProjectile()) return void 0;
        return {
          type: ApiEventType.ObjectDestroy,
          target: e.target.id,
          attackerInfo: e.attackerInfo
            ? {
                playerName: e.attackerInfo.player.name,
                objId: e.attackerInfo.obj?.id,
                weaponName: e.attackerInfo.weapon?.rules.name,
              }
            : void 0,
        };
      }
      default:
        return void 0;
    }
  }
}
