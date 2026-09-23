/**
 * wolCodes — WOL/IRC 扩展应答与错误数值码常量表。
 *
 * 由 network/wolCodes.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 全部为数字字面量导出（非字符串），与 IRC 行内第二段数值码一一对应。
 * - RPL_* 为成功/状态应答；ERR_* 为错误码。
 * - 数值与原版 WOL 协议兼容，勿改编号。
 */

/** 获取语言/区域设置。 */
export const RPL_GET_LOCALE = 309;
/** 设置语言/区域设置。 */
export const RPL_SET_LOCALE = 310;
/** 频道/列表开始。 */
export const RPL_LISTSTART = 321;
/** 列表条目。 */
export const RPL_LIST = 322;
/** 频道模式信息。 */
export const RPL_CHANNELMODEIS = 324;
/** 游戏频道信息。 */
export const RPL_GAME_CHANNEL = 326;
/** 频道信息。 */
export const RPL_CHANNEL = 327;
/** 列表结束。 */
export const RPL_LISTEND = 323;
/** 频道主题。 */
export const RPL_TOPIC = 332;
/** 频道昵称列表。 */
export const RPL_NAMREPLY = 353;
/** 频道昵称列表结束。 */
export const RPL_ENDOFNAMES = 366;
/** MOTD 正文。 */
export const RPL_MOTD = 372;
/** MOTD 开始。 */
export const RPL_MOTDSTART = 375;
/** MOTD 结束。 */
export const RPL_ENDOFMOTD = 376;
/** 登录失败。 */
export const RPL_BAD_LOGIN = 378;
/** 未知错误。 */
export const ERR_UNKNOWNERROR = 400;
/** 无此昵称。 */
export const ERR_NOSUCHNICK = 401;
/** 无此频道。 */
export const ERR_NOSUCHCHANNEL = 403;
/** 未知命令。 */
export const ERR_UNKNOWNCOMMAND = 421;
/** 用户不在频道内。 */
export const ERR_USERNOTINCHANNEL = 441;
/** 自己不在频道内。 */
export const ERR_NOTONCHANNEL = 442;
/** 参数不足。 */
export const ERR_NEEDMOREPARAMS = 461;
/** 已注册/已登录。 */
export const ERR_ALREADYREGISTERED = 462;
/** 被封禁（经典 WOL 文案 YOUREBANNEDCREEP）。 */
export const ERR_YOUREBANNEDCREEP = 465;
/** 频道密码错误。 */
export const ERR_BADCHANNELKEY = 475;
/** 游戏已关闭。 */
export const ERR_GAMEHASCLOSED = 478;
/** 频道已满。 */
export const ERR_CHANNELISFULL = 471;
/** 未知模式。 */
export const ERR_UNKNOWNMODE = 472;
/** 被禁止进入频道。 */
export const ERR_BANNEDFROMCHAN = 474;
/** 需要频道 op 权限。 */
export const ERR_CHANOPRIVSNEEDED = 482;
/** 受限操作。 */
export const ERR_RESTRICTED = 484;
/** 未知用户模式标志。 */
export const ERR_UMODEUNKNOWNFLAG = 501;
/** 玩家退出（QUIT 事件应答化）。 */
export const RPL_QUIT = 607;
/** 客户端版本协商：接受。 */
export const RPL_CVERS_OK = 700;
/** 客户端版本协商：过旧。 */
export const RPL_CVERS_OUTDATED = 701;
/** 客户端版本协商：未知。 */
export const ERR_CVERS_UNKNOWN = 702;
/** 参数错误。 */
export const ERR_BAD_PARAMS = 710;
/** 触发限流。 */
export const ERR_RATE_LIMIT_EXCEEDED = 711;
/** 登录排队提示。 */
export const RPL_LOGIN_QUEUE = 720;
/** 服务器已满。 */
export const ERR_SERVER_FULL = 721;
/** 战报（game report）推送。 */
export const RPL_GAME_REPORT = 730;
/** 组队状态更新。 */
export const RPL_PARTY_UPDATE = 731;
