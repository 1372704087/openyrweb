/**
 * GameResSource — 游戏资源来源枚举。
 *
 * 数值双向映射（值 ↔ 名），编号与孪生逐项一致：
 * - Archive = 0（从归档/安装包导入）
 * - Cdn     = 1（CDN 远程加载）
 * - Local   = 2（本地目录）
 *
 * 由 engine/gameRes/GameResSource.ts.js 逆向翻译为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum GameResSource {
  /** 从归档文件（exe/zip 等）导入资源。 */
  Archive = 0,
  /** 从 CDN 远程加载资源。 */
  Cdn = 1,
  /** 从本地目录加载资源。 */
  Local = 2,
}
