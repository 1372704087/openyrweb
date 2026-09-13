/**
 * SideType — 枚举（脚本提取自 game/SideType.ts.js，值连续无断档）。
 *
 * 由 game/SideType.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum SideType {
  GDI = 0,
  Nod = 1,
  ThirdSide = 2,
  Civilian = 3,
  Mutant = 4,
}
