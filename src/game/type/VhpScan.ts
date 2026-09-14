/**
 * VhpScan — VPL 体素光照的扫描强度档位。
 *
 * 由 game/type/VhpScan.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum VhpScan {
  /** 不扫描 */
  None = 0,
  /** 常规 */
  Normal = 1,
  /** 增强 */
  Strong = 2,
}
