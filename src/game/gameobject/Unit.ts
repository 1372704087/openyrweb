/**
 * Unit — 占位模块。
 *
 * 原始工程中此处为空导出（"单位"概念由 Vehicle/Infantry 等具体类承担，
 * 它们的 isUnit() 各自覆写为 true）。保留空模块仅为维持模块图完整。
 *
 * 由 game/gameobject/Unit.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export {};
