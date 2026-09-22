/**
 * GameEvent — 游戏事件基载荷类型（纯类型模块）。
 *
 * 由 game/event/GameEvent.ts.js 重写为 TS。孪生 execute 为空（SystemJS
 * 无运行时导出），编译后同样不产生运行时代码；本文件仅提供类型导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 从消费方（game/GameEventBus 的 subscribe 回调、各 *Event 类字段）
 * 反推：所有事件都携带判别字段 type（EventType 枚举值）。具体事件类
 * （PowerChangeEvent、ObjectDestroyEvent 等）在此基础上扩展业务字段。
 */
export type GameEvent = {
  /** 事件判别类型，取值见 game/event/EventType。 */
  type: number;
};
