/**
 * GameEventBus — 游戏事件总线（全局 + 按 type 双通道订阅）。
 *
 * dispatch(e) 会同时投递给「无过滤」总线 dispatcher 与按 e.type 分片的
 * dispatchersByType。subscribe 的第一参可直接传回调（订阅全部事件），也
 * 可传 type + 回调（只订阅该 type）；返回退订函数。unsubscribe 同理。
 * 孪生中 subscribeType 惰性创建 per-type EventDispatcher 并返回退订函数。
 *
 * 由 game/GameEventBus.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GameEventBus {
  /** 无类型过滤的总线。 */
  dispatcher = new EventDispatcher();
  /** 按事件 type 分片的总线（惰性创建）。 */
  dispatchersByType = new Map<any, EventDispatcher>();

  /** 派发事件：先广播全局，再广播该 type 分片（若存在）。 */
  dispatch(event: any): void {
    this.dispatcher.dispatch(undefined, event);
    this.dispatchersByType.get(event.type)?.dispatch(undefined, event);
  }

  /**
   * 订阅。
   * - subscribe(fn)：订阅全部事件，返回退订函数；
   * - subscribe(type, fn)：只订阅该 type，返回退订函数。
   */
  subscribe(typeOrListener: any, listener?: any): any {
    let type: any = undefined;
    let fn: any;
    // 孪生: "function" == typeof e ? e : ((i = e), t)
    fn = "function" == typeof typeOrListener ? typeOrListener : ((type = typeOrListener), listener);
    return void 0 === type
      ? (this.dispatcher.subscribe(fn), () => this.unsubscribe(fn))
      : this.subscribeType(type, fn);
  }

  /** 退订：与 subscribe 的两种重载一一对应（此路径无返回值）。 */
  unsubscribe(typeOrListener: any, listener?: any): void {
    let type: any = undefined;
    let fn: any;
    fn = "function" == typeof typeOrListener ? typeOrListener : ((type = typeOrListener), listener);
    void 0 === type ? this.dispatcher.unsubscribe(fn) : this.unsubscribeType(type, fn);
  }

  /** 按 type 订阅（惰性创建分片总线），返回退订函数。 */
  subscribeType(type: any, listener: any): any {
    let d = this.dispatchersByType.get(type);
    if (!d) {
      d = new EventDispatcher();
      this.dispatchersByType.set(type, d);
    }
    d.subscribe(listener);
    return () => this.unsubscribeType(type, listener);
  }

  /** 按 type 退订（分片不存在时安全跳过）。 */
  unsubscribeType(type: any, listener: any): void {
    this.dispatchersByType.get(type)?.unsubscribe(listener);
  }
}
