/**
 * ReplayMeta — 回放清单元数据类型（孪生 execute 为空，仅导出类型）。
 *
 * 由 gui/replay/ReplayMeta.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 字段依据 ReplayManager / ReplayStorage 调用方反推，运行时无本模块导出值。
 */

/** 清单中的一条回放。 */
export interface ReplayMeta {
  /** 唯一 id（UUID）。 */
  id: string;
  /** 显示名。 */
  name: string;
  /** 是否用户保留。 */
  keep: boolean;
  /** 时间戳（ms）。 */
  timestamp?: number;
}

/** 空运行时导出（与孪生 execute 为空对齐）。 */
export {};
