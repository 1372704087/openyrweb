/**
 * EngineType — 引擎/游戏版本类型。
 *
 * 由 engine/EngineType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 *
 * YR-only engine：枚举仅保留 YurisRevenge；历史 AutoDetect / TiberianSun /
 * Firestorm / RedAlert2 条目已因 RA2 支持不再维护而删除。数值 4 保留
 * 以兼容任何已持久化状态中的二进制值。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum EngineType {
  /** 尤里的复仇（Yuri's Revenge），数值固定为 4 以保持二进制兼容 */
  YurisRevenge = 4,
}
