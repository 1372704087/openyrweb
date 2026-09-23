/**
 * GameResClientInfo — 战报（GameRes）客户端侧状态类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/gameres/GameResClientInfo.ts.js 重写为 TS。孪生为 SystemJS
 * 空 execute，说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 字段形状与 gameres/GameRes.fromGame/fromFlat 读写的 this.client 一致
 * （孪生 GameRes.ts.js 中逐字段构造）。
 */

/** 客户端在本局结束时的状态快照（战报 client 段）。 */
export interface GameResClientInfo {
  /** 平均帧率。 */
  avgFps: number;
  /** 平均往返延迟（ms）。 */
  avgRtt: number;
  /** 是否正常打完。 */
  finished: boolean;
  /** 客户端 SKU。 */
  gameSku: number;
  /** 是否出现不同步。 */
  outOfSync: boolean;
  /** 收到的 ping 数。 */
  pingsRecv: number;
  /** 发出的 ping 数。 */
  pingsSent: number;
  /** 客户端版本字符串。 */
  clientVers: string;
  /** 登录账号名。 */
  accountName: string;
  /** 是否异常掉线。 */
  suddenDisconnect: boolean;
  /** 是否主动退出（从完成状态推导）。 */
  quit: boolean;
}
