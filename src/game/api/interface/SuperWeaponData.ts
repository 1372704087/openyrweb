/**
 * SuperWeaponData — 超级武器状态条目（type-only）。
 *
 * 由 GameApi.getAllSuperWeaponData() 展平返回：玩家名 + 超武类型、
 * 状态与剩余秒数。
 *
 * 由 game/api/interface/SuperWeaponData.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出）；本文件仅以
 * export interface 声明类型，export {} 保持与孪生一致的零运行时导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
/** 超武数据（type-only，运行时无导出对象）。 */
export interface SuperWeaponData {
  /** 所属玩家名。 */
  playerName: any;
  /** SuperWeaponType。 */
  type: any;
  /** 当前状态。 */
  status: any;
  /** 剩余充能秒。 */
  timerSeconds: any;
}

export {};
