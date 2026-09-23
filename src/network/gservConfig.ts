/**
 * gservConfig — Game Server（gserv）协议常量。
 *
 * 由 network/gservConfig.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 关键语义（勿改）：导出名与数值与孪生逐项一致。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** gserv API 版本。 */
export const API_VERSION = 2;

/** 广播目标：全体。 */
export const RECIPIENT_ALL = "#all";

/** 广播目标：同队。 */
export const RECIPIENT_TEAM = "#team";

/** 单回合超时（毫秒）。 */
export const TURN_TIMEOUT_MILLIS = 3e4;

/** 判定 lag 状态的阈值（毫秒）。 */
export const LAG_STATE_THRESH_MILLIS = 1e3;

/** 连接信息阈值（毫秒）。 */
export const CON_INFO_THRESH_MILLIS = 2e3;

/** lag 检查间隔（毫秒）。 */
export const LAG_CHECK_INTERVAL_MILLIS = 1e3;

/** 地图传输最大字节数（2 MiB）。 */
export const MAX_MAP_TRANSFER_BYTES = 2097152;
