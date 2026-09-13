/**
 * EventDispatcher — 轻量事件总线（Set 存储监听器，保序触发）。
 *
 * 供游戏逻辑对象暴露"事件"用，例如 ObjectPosition.onPositionChange。
 * 注意 dispatch 的参数顺序是反的：dispatch(type, data) 会以
 * listener(data, type) 回调——这是原始实现的约定，保持不变。
 *
 * 由 util/event.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EventDispatcher {
  listeners = new Set<Function>();

  /** 常驻订阅：直到显式 unsubscribe 前每次 dispatch 都会触发。 */
  subscribe(listener: Function): void {
    this.listeners.add(listener);
  }

  /** 一次性订阅：首次触发后自动退订。 */
  subscribeOnce(listener: Function): void {
    const self = this;
    let wrapper: Function | undefined = (data: any, type: any) => {
      listener(data, type);
      self.unsubscribe(wrapper!);
      wrapper = undefined;
    };
    this.subscribe(wrapper);
  }

  unsubscribe(listener: Function): void {
    this.listeners.delete(listener);
  }

  /** 触发全部监听器；参数顺序反转：listener 收到 (data, type)。 */
  dispatch(type: any, data: any): void {
    this.listeners.forEach((listener) => listener(data, type));
  }

  /** 以只读事件接口暴露自身（防止外部误用 subscribe 以外的方法）。 */
  asEvent(): this {
    return this;
  }
}
