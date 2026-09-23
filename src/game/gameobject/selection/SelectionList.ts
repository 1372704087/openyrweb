/**
 * SelectionList — 占位模块（type-only 空导出）。
 *
 * 原始工程中此处无运行时导出（SelectionList 相关类型可能仅作 type-only
 * 使用，或实现已并入 UnitSelection/SelectionModel）。保留空模块仅为维持
 * 模块图完整，与孪生 SystemJS 空 execute 块行为一致。
 *
 * 由 game/gameobject/selection/SelectionList.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
export {};
