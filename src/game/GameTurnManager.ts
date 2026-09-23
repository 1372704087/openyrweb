/**
 * GameTurnManager — 回合/帧步进管理占位（纯类型/空运行时模块）。
 *
 * 由 game/GameTurnManager.ts.js 重写为 TS。孪生 execute 为空（SystemJS
 * 无运行时导出），编译后同样不产生运行时代码；本文件仅保留空模块导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 说明：联机锁步/单机回放的真实步进逻辑位于 network/gamestate 下的
 * LockstepManager / SoloPlayTurnManager / ReplayTurnManager；本根模块
 * 在孪生中无运行时导出，故不额外造类。
 */
export {};
