/**
 * AttackerInfo — 攻击方信息占位（纯类型/空运行时模块）。
 *
 * 由 game/AttackerInfo.ts.js 重写为 TS。孪生 execute 为空（SystemJS
 * 无运行时导出），编译后同样不产生运行时代码；本文件仅保留空模块导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 说明：消费方（如 Weapon/Warhead 链路中的 attackerInfo 字段）目前以
 * any 或结构化字面量形式持有，尚未在本模块声明具名类型；保持与孪生
 * 一致的零导出状态，避免引入额外运行时符号。
 */
export {};
