/**
 * WolError — WOL 连接层错误类，携带数值错误码与可选原因文本。
 *
 * 由 network/WolError.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 继承 Error；构造为 (message, code, reason?)。
 * - Code 为数值双向映射（值↔名），编号与孪生逐项一致；挂 WolError.Code。
 */

/** WOL 连接层错误。 */
export class WolError extends Error {
  /** 数值错误码（见 WolError.Code）。 */
  code: WolError.Code;
  /** 服务端返回的补充原因文本（可选）。 */
  reason?: string;

  /**
   * @param message 错误消息。
   * @param code 数值错误码。
   * @param reason 服务端补充原因（可选）。
   */
  constructor(message: string, code: WolError.Code, reason?: string) {
    super(message);
    this.code = code;
    this.reason = reason;
  }
}

/** WOL 协议/登录相关错误码命名空间导出（与类合并）。 */
export namespace WolError {
  /** 错误码枚举（数值 ↔ 名称双向映射，与孪生一致）。 */
  export enum Code {
    /** 客户端版本过旧。 */
    OutdatedClient = 0,
    /** 登录凭据错误。 */
    BadLogin = 1,
    /** 频道密码错误。 */
    BadChannelPass = 2,
    /** 对局已关闭。 */
    GameHasClosed = 3,
    /** 频道已满。 */
    ChannelFull = 4,
    /** 被禁止进入频道。 */
    BannedFromChannel = 5,
    /** 被禁止进入服务器。 */
    BannedFromServer = 6,
    /** 频道不存在。 */
    NoSuchChannel = 7,
    /** 服务器已满。 */
    ServerFull = 8,
  }
}