/**
 * gservCodes — 游戏服务器（Game Server / GServ）文本与二进制协议数值码常量表。
 *
 * 由 network/gservCodes.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 全部为数字字面量导出（非字符串），与 IRC 行内第二段数值码一一对应。
 * - RPL_* 为服务端应答/事件；REQ_BIN_* 为客户端二进制请求前缀与类型。
 * - RPL_BIN_* 为服务端二进制应答前缀与类型。
 */

/** 客户端版本协商：接受。 */
export const RPL_CVERS_OK = 10;
/** 客户端版本协商：过旧。 */
export const RPL_CVERS_OUTDATED = 11;
/** 客户端版本协商：缺失。 */
export const RPL_CVERS_MISSING = 12;
/** 登录成功。 */
export const RPL_LOGGED_IN = 100;
/** 已处于登录态。 */
export const RPL_ALREADY_LOGGED_IN = 101;
/** 未登录。 */
export const RPL_NOT_LOGGED_IN = 102;
/** 登录凭据错误。 */
export const RPL_BAD_LOGIN = 103;
/** 登录尝试次数过多。 */
export const RPL_TOO_MANY_LOGIN_ATTEMPTS = 104;
/** 创建游戏实例成功。 */
export const RPL_INSTANCE_CREATED = 200;
/** 游戏实例已存在。 */
export const RPL_INSTANCE_EXISTS = 201;
/** 创建实例过多。 */
export const RPL_INSTANCE_TOO_MANY = 202;
/** 参数数量不足。 */
export const RPL_NOT_ENOUGH_PARAMS = 300;
/** 参数无效。 */
export const RPL_INVALID_PARAMS = 301;
/** 触发限流。 */
export const RPL_RATE_LIMIT_EXCEEDED = 302;
/** 成功加入实例。 */
export const RPL_INSTANCE_CONNECTED = 400;
/** 实例不存在。 */
export const RPL_INSTANCE_NONEXISTENT = 401;
/** 不允许加入该实例。 */
export const RPL_INSTANCE_NOT_ALLOWED = 402;
/** 实例已开始游戏。 */
export const RPL_INSTANCE_ALREADY_STARTED = 403;
/** 当前无实例上下文。 */
export const RPL_NO_INSTANCE = 404;
/** 实例未在运行。 */
export const RPL_INSTANCE_NOT_RUNNING = 405;
/** 实例版本不匹配。 */
export const RPL_INSTANCE_VERS_MISMATCH = 406;
/** 游戏选项文本。 */
export const RPL_GAME_OPTS = 500;
/** 加载进度信息。 */
export const RPL_LOAD_INFO = 600;
/** 地图过大。 */
export const RPL_MAP_TOO_BIG = 602;
/** 地图已发送过。 */
export const RPL_MAP_ALREADY_SENT = 603;
/** 游戏开始。 */
export const RPL_GAME_START = 700;
/** 检测到不同步（desync）。 */
export const RPL_GAME_DESYNC = 801;
/** 网络速率/延迟统计变更。 */
export const RPL_NET_RATE = 802;
/** 收到挑衅（taunt）。 */
export const RPL_TAUNT = 803;
/** 玩家断开连接。 */
export const RPL_PLAYER_DISCONNECT = 804;
/** 当前不允许私聊。 */
export const RPL_PRIVMSG_NOT_ALLOWED = 805;

/** 二进制应答消息魔数前缀。 */
export const RPL_BIN_PREFIX = 2;
/** 二进制应答：玩家回合动作数据。 */
export const RPL_BIN_GAME_ACTIONS = 1;
/** 二进制应答：地图数据。 */
export const RPL_BIN_MAP_DATA = 2;

/** 二进制请求消息魔数前缀。 */
export const REQ_BIN_PREFIX = 2;
/** 二进制请求：玩家回合动作数据。 */
export const REQ_BIN_GAME_ACTIONS = 1;
/** 二进制请求：回合状态哈希。 */
export const REQ_BIN_GAME_STATE_HASH = 2;
/** 二进制请求：上传地图。 */
export const REQ_BIN_PUT_MAP = 3;
/** 二进制请求：下载地图。 */
export const REQ_BIN_GET_MAP = 4;
