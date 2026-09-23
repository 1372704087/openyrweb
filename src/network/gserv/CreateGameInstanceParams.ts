/**
 * CreateGameInstanceParams — 创建游戏实例请求参数类型
 * （类型导出；孪生 execute 为空）。
 *
 * 由 network/gserv/CreateGameInstanceParams.ts.js 重写为 TS。孪生为
 * SystemJS 空 execute，说明原 TS 仅导出类型/接口（编译后被擦除）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段按 gserv 建局上下文宽松标注（原名已 minify）。
 */

/** 创建游戏实例的参数载荷。 */
export interface CreateGameInstanceParams {
  /** 游戏频道名（转义前/后由调用方约定）。 */
  channelName?: string;
  /** 地图相关。 */
  mapName?: string;
  /** 主机账号。 */
  hostName?: string;
  /** 客户端 SKU。 */
  sku?: number;
  /** 其余协议字段（宽松索引，避免过度收窄）。 */
  [key: string]: unknown;
}
