/**
 * Hashable — 可散列对象占位（纯类型/空运行时模块）。
 *
 * 由 game/Hashable.ts.js 重写为 TS。孪生 execute 为空（SystemJS
 * 无运行时导出），编译后同样不产生运行时代码；本文件仅保留空模块导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 说明：需要 getHash() 的对象（Game/Player/Alliances/Trait 等）在各自
 * 模块上直接声明该方法，本接口模块未从孪生恢复出运行时成员，故保持
 * 与孪生一致的零导出状态。
 */
export {};
