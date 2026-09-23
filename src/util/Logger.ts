/**
 * Logger — 应用日志器（re-export js-logger 单例）。
 *
 * 模块仅把第三方 js-logger 默认导出原样暴露为 AppLogger，
 * 供各业务模块统一引用。
 * 由 util/Logger.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import AppLogger from "js-logger"; // 孪生（第三方，非 .ts 逆向）

export { AppLogger };
