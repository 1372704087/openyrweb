/**
 * Tile — 地块类型占位（type-only，无运行时导出）。
 *
 * 孪生 game/map/Tile.ts.js 仅注册空 SystemJS 模块（无 execute 导出），
 * 真正的 Tile 形状以 TileCollection 构造时写出的字面量为准（rx/ry/dx/dy/z/
 * landType/terrainType 等）。本文件保持与孪生一致：空模块导出。
 *
 * 由 game/map/Tile.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

export {};
