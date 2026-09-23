/**
 * userAgent — 浏览器平台探测（iPad / Mac / Mac 上的 Firefox）。
 *
 * 由 util/userAgent.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** navigator.platform 是否包含 "Mac"（含 iPadOS 伪装成 MacIntel 的情况）。 */
function isMacImpl(): boolean {
  return navigator.platform.includes("Mac");
}

/** iPad：UA 含 iPad，或 MacIntel + 有触点（iPadOS 桌面站点伪装）。 */
export function isIpad(): boolean {
  return (
    /iPad/i.test(navigator.userAgent) ||
    (/MacIntel/i.test(navigator.platform) && !!navigator.maxTouchPoints)
  );
}

/** 是否 Mac 平台。 */
export function isMac(): boolean {
  return isMacImpl();
}

/** Mac 上的 Firefox（platform 含 Mac 且 UA 小写后含 firefox）。 */
export function isMacFirefox(): boolean {
  return isMacImpl() && -1 !== navigator.userAgent.toLowerCase().indexOf("firefox");
}
