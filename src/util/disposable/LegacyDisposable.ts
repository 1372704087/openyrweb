/**
 * LegacyDisposable — 空模块占位。
 *
 * 孪生 execute 为空（无导出）；历史上可能已迁移到 CompositeDisposable /
 * Disposable，本文件保留同名空模块以对齐 SystemJS 注册表。
 *
 * 由 util/disposable/LegacyDisposable.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */

export {};
