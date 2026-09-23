/**
 * Span — VXL 单列体素跨度的占位模块。
 *
 * 孪生 SystemJS 模块无任何导出（仅注册空 execute）；
 * 实际 span 形态由 vxl/Section 内联对象字面量表达。
 *
 * 由 data/vxl/Span.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export {};
