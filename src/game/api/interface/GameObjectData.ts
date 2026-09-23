/**
 * GameObjectData — 通用游戏对象只读快照（type-only）。
 *
 * 由 GameApi.getGameObjectData(id) 返回：id/type/name/rules/tile 等
 * 基础字段 + 生命值与 owner；单位类字段由 UnitData 扩展。
 *
 * 由 game/api/interface/GameObjectData.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出）；本文件仅以
 * export interface 声明类型，export {} 保持与孪生一致的零运行时导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
/** 通用游戏对象快照（type-only，运行时无导出对象）。 */
export interface GameObjectData {
  /** 对象唯一 id。 */
  id: any;
  /** ObjectType 枚举值。 */
  type: any;
  /** 规则名（如 "AMGT"）。 */
  name: any;
  /** 绑定的规则对象。 */
  rules: any;
  /** 所在 tile。 */
  tile: any;
  /** 高度（桥上/地面 elevation）。 */
  tileElevation: any;
  /** 世界坐标（已 clone，可安全改写）。 */
  worldPosition: any;
  /** 占地 foundation。 */
  foundation: any;
  /** 当前 HP（无 healthTrait 时为 undefined）。 */
  hitPoints: any;
  /** 最大 HP。 */
  maxHitPoints: any;
  /** 所有者玩家名（仅 Techno；否则 undefined）。 */
  owner?: any;
}

export {};
