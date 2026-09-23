/**
 * qmCodes — 快速匹配（Quick Match）请求/应答/标签码字符串常量表。
 *
 * 由 network/qmCodes.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - REQ_* 为客户端请求动作；RPL_* 为服务端应答；TAG_* 为统计标签短码。
 * - 全部为字符串字面量（非数字），与 matchbot 协议字段一一对应。
 */

/** 请求发起匹配。 */
export const REQ_MATCH = "Match";
/** 请求查询统计。 */
export const REQ_STATS = "Stats";
/** 请求列出队列。 */
export const REQ_LIST_QUEUES = "ListQueues";

/** 应答：处理中。 */
export const RPL_WORKING = "Working";
/** 应答：统计数据。 */
export const RPL_STATS = "Stats";
/** 应答：队列列表。 */
export const RPL_QUEUE_LIST = "QueueList";
/** 应答：版本不匹配。 */
export const RPL_BAD_VERS = "Badvers";
/** 应答：mod hash 不匹配。 */
export const RPL_BAD_HASH = "Badhash";
/** 应答：模式不可用。 */
export const RPL_MODE_UNAVAIL = "Unavailable";
/** 应答：触发限流。 */
export const RPL_RATE_LIMITED = "RateLimited";
/** 应答：已在队列中。 */
export const RPL_ALREADY_QUEUED = "AlreadyQueued";
/** 应答：已匹配成功。 */
export const RPL_MATCHED = "Matched";
/** 应答：需重新入队。 */
export const RPL_REQUEUE = "Requeue";
/** 应答：已移出队列。 */
export const RPL_REMOVED_FROM_QUEUE = "Removed";

/** 统计标签：国家。 */
export const TAG_COUNTRY = "COU";
/** 统计标签：颜色。 */
export const TAG_COLOR = "COL";
/** 统计标签：排位。 */
export const TAG_RANKED = "RKD";
/** 统计标签：版本。 */
export const TAG_VERSION = "VRS";
/** 统计标签：mod hash。 */
export const TAG_MODHASH = "MOD";
