/**
 * GservError — Game Server（GServ）协议错误类型 + 错误码枚举。
 *
 * 由 network/GservError.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 继承 Error；构造 (message, code) 把 code 挂到实例上。
 * - Code 为数值枚举（0..10），带反向名称映射，与孪生逐项一致。
 * - 孪生仅导出 GservError，Code 挂在 GservError.Code（类+命名空间合并）。
 */

/** GServ 协议错误。 */
export class GservError extends Error {
  /** GServ 错误码。 */
  code: GservError.Code;

  constructor(message: string, code: GservError.Code) {
    super(message);
    this.code = code;
  }
}

/** GServ 错误码（数值与反向映射与孪生一致）；与类合并导出 GservError.Code。 */
export namespace GservError {
  /** 错误码枚举（数值 ↔ 名称双向映射，与孪生一致）。 */
  export enum Code {
    /** 未知错误。 */
    Unknown = 0,
    /** 客户端版本过旧。 */
    OutdatedClient = 1,
    /** 登录凭据错误。 */
    BadLogin = 2,
    /** 登录尝试过于频繁。 */
    TooManyLoginAttempts = 3,
    /** 已登录（重复登录）。 */
    AlreadyLoggedIn = 4,
    /** 游戏实例不存在。 */
    InstanceNonExistent = 5,
    /** 游戏实例已存在。 */
    InstanceAlreadyExists = 6,
    /** 不允许创建该类实例。 */
    InstanceNotAllowed = 7,
    /** 实例已开始。 */
    InstanceAlreadyStarted = 8,
    /** 实例版本不匹配。 */
    InstanceVersMismatch = 9,
    /** 创建实例次数过多。 */
    CreatedTooManyInstances = 10,
  }
}