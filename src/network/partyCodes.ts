/**
 * partyCodes — 组队（Party）应答/错误码字符串常量表。
 *
 * 由 network/partyCodes.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 全部为字符串字面量导出（非数字），与 IRC/后端 party 协议字段一一对应。
 * - RPL_* 为成功/状态应答；ERR_* 为错误码。
 */

/** 对方已在组队中。 */
export const ERR_TARGET_IN_PARTY = "TARGET_IN_PARTY";
/** 对方已在匹配队列中。 */
export const ERR_TARGET_IN_QUEUE = "TARGET_IN_QUEUE";
/** 邀请方已在组队中。 */
export const ERR_INVITER_IN_PARTY = "INVITER_IN_PARTY";
/** 被邀请方已在组队中。 */
export const ERR_ACCEPTER_IN_PARTY = "ACCEPTER_IN_PARTY";
/** 邀请被策略阻止。 */
export const ERR_INVITE_PREVENTED = "INVITE_PREVENTED";
/** 对方没有任何待处理邀请。 */
export const ERR_TARGET_NO_INVITES = "TARGET_NO_INVITES";
/** 邀请已在等待中。 */
export const ERR_INVITE_ALREADY_PENDING = "INVITE_ALREADY_PENDING";
/** 没有待处理的邀请。 */
export const ERR_NO_INVITE = "NO_INVITE";
/** 对方不在快速匹配中。 */
export const ERR_TARGET_NOT_IN_QUICK_MATCH = "TARGET_NOT_IN_QUICK_MATCH";
/** 不能向自己发送邀请。 */
export const ERR_TARGET_SELF = "TARGET_SELF";
/** 邀请方账号过新。 */
export const ERR_INVITER_FRESH_ACCOUNT = "INVITER_FRESH_ACCOUNT";

/** 已收到组队邀请。 */
export const RPL_PARTY_INVITE = "PARTY_INVITE";
/** 组队状态更新。 */
export const RPL_PARTY_UPDATE = "PARTY_UPDATE";
/** 邀请被对方拒绝。 */
export const RPL_PARTY_INVITE_DECLINED = "PARTY_INVITE_DECLINED";
/** 自己拒绝了邀请。 */
export const RPL_PARTY_INVITE_DECLINED_SELF = "PARTY_INVITE_DECLINED_SELF";
/** 邀请已过期。 */
export const RPL_PARTY_INVITE_EXPIRED = "PARTY_INVITE_EXPIRED";
/** 邀请已发送。 */
export const RPL_PARTY_INVITE_SENT = "PARTY_INVITE_SENT";
/** 组队已成立。 */
export const RPL_PARTY_FORMED = "PARTY_FORMED";
/** 已离开组队。 */
export const RPL_PARTY_LEFT = "PARTY_LEFT";
/** 邀请预防开关相关。 */
export const RPL_PARTY_INVITE_PREVENTION = "PARTY_INVITE_PREVENTION";
/** 邀请过程错误。 */
export const RPL_PARTY_INVITE_ERROR = "PARTY_INVITE_ERROR";
