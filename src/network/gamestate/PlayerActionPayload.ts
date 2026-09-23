/**
 * PlayerActionPayload — 单条玩家动作的序列化载荷类型
 * （类型导出；孪生 execute 为空）。
 *
 * 由 network/gamestate/PlayerActionPayload.ts.js 重写为 TS。孪生为 SystemJS
 * 空 execute，说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段形状与 ActionSerializer.getActionPayload 返回值一致
 * （{ id: actionType, params: serialize() 的 Uint8Array }）。
 */

/** 一条动作的 id + 二进制参数。 */
export interface PlayerActionPayload {
  /** 动作类型 id（与 game/action/ActionType 数值一致）。 */
  id: number;
  /** 动作序列化参数（未压缩的字节串）。 */
  params: Uint8Array;
}
