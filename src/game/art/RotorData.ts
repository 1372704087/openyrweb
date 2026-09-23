/**
 * RotorData — 直升机旋翼数据占位模块。
 *
 * 由 game/art/RotorData.ts.js 重写为 TS：孪生 execute 为空（SystemJS 模块
 * 无任何运行时导出），本文件同样不导出运行时成员，仅保留模块壳。
 * 旋翼实际数据在 ObjectArt.readRotors 中解析并挂在 ObjectArt.rotors 上。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export {};
