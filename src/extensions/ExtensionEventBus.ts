/**
 * ExtensionEventBus — 扩展级事件总线（插件间 / 引擎→插件的松耦合通信）。
 *
 * 与 game/GameEventBus 的区别：
 *  - GameEventBus 是游戏逻辑事件（对象生成、开火等），绑定单局 Game；
 *  - ExtensionEventBus 是扩展生态内部总线，跨对局存活，用于插件间
 *    发布/订阅自定义事件（如 "ares.weapon-enhanced"）。
 *
 * 命名约定：事件名建议用 `<extId>.<event>` 小写点分，避免插件间碰撞。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type Listener = (data: any, eventName: string) => void;

export class ExtensionEventBus {
  private listeners = new Map<string, Set<Listener>>();
  private anyListeners = new Set<Listener>();

  /** 订阅具名事件；返回退订函数。 */
  on(eventName: string, listener: Listener): () => void {
    let set = this.listeners.get(eventName);
    if (!set) {
      set = new Set();
      this.listeners.set(eventName, set);
    }
    set.add(listener);
    return () => {
      set!.delete(listener);
      if (set!.size === 0) this.listeners.delete(eventName);
    };
  }

  /** 一次性订阅。 */
  once(eventName: string, listener: Listener): () => void {
    const off = this.on(eventName, (data, name) => {
      off();
      listener(data, name);
    });
    return off;
  }

  /** 订阅全部事件（调试/日志用）。返回退订函数。 */
  onAny(listener: Listener): () => void {
    this.anyListeners.add(listener);
    return () => this.anyListeners.delete(listener);
  }

  /** 发布事件。 */
  emit(eventName: string, data?: any): void {
    const set = this.listeners.get(eventName);
    if (set) {
      for (const fn of [...set]) {
        try {
          fn(data, eventName);
        } catch (err) {
          console.warn(`ExtensionEventBus listener for "${eventName}" failed`, err);
        }
      }
    }
    for (const fn of [...this.anyListeners]) {
      try {
        fn(data, eventName);
      } catch (err) {
        console.warn(`ExtensionEventBus onAny listener failed`, err);
      }
    }
  }

  /** 清空全部订阅（对局重置 / 测试用）。 */
  clear(): void {
    this.listeners.clear();
    this.anyListeners.clear();
  }
}
