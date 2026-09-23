/**
 * Archive — 虚拟文件系统归档占位模块。
 *
 * 孪生 SystemJS 模块无任何导出（仅注册空 execute）；
 * 此处保持一致：仅空导出以免打包器误删，不声明任何 API。
 *
 * 由 data/vfs/Archive.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export {};
