/**
 * UnitData — 单位/Techno 扩展快照（type-only，extends GameObjectData）。
 *
 * 由 GameApi.getUnitData(id) 返回：在 GameObjectData 之上补充武器、
 * 姿态、工厂、驻军、乘客、矿石、弹药等运行时字段；按对象子类型
 * （建筑/步兵/载具/飞机/单位）条件性填入，不适用时为 undefined。
 *
 * 由 game/api/interface/UnitData.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出）；本文件仅以
 * export interface 声明类型，export {} 保持与孪生一致的零运行时导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import type { GameObjectData } from "game/api/interface/GameObjectData"; // 已转换

/** 单位快照（type-only，运行时无导出对象）。 */
export interface UnitData extends GameObjectData {
  /** 所有者玩家名（Techno 必有）。 */
  owner: any;
  /** 视野。 */
  sight: any;
  /** 老练等级。 */
  veteranLevel: any;
  /** 警戒模式。 */
  guardMode: any;
  /** 采购价值。 */
  purchaseValue: any;
  /** 主武器快照。 */
  primaryWeapon?: any;
  /** 副武器快照。 */
  secondaryWeapon?: any;
  /** 死亡武器快照。 */
  deathWeapon?: any;
  /** 攻击状态。 */
  attackState?: any;
  /** 朝向（弧度/内部单位）。 */
  direction: any;
  /** 是否在桥上（仅步兵/载具）。 */
  onBridge?: any;
  /** 移动分区（仅单位）。 */
  zone?: any;
  /** 建造状态（仅建筑）。 */
  buildStatus?: any;
  /** 工厂交付状态（仅带 FactoryTrait 的建筑）。 */
  factory?: any;
  /** 集结点（仅建筑）。 */
  rallyPoint?: any;
  /** 是否通电（仅建筑）。 */
  isPoweredOn: any;
  /** 是否可用扳手维修（仅建筑）。 */
  hasWrenchRepair: any;
  /** 炮塔朝向（仅建筑/载具）。 */
  turretFacing?: any;
  /** 炮塔编号（仅载具）。 */
  turretNo?: any;
  /** 驻军人数（仅建筑）。 */
  garrisonUnitCount?: any;
  /** 驻军容量（仅建筑）。 */
  garrisonUnitsMax?: any;
  /** 已占乘客位（仅载具）。 */
  passengerSlotCount?: any;
  /** 乘客总位（仅载具）。 */
  passengerSlotMax?: any;
  /** 是否无任务队列。 */
  isIdle: any;
  /** 能否移动（仅单位）。 */
  canMove?: any;
  /** 速度向量（仅单位，已 clone）。 */
  velocity?: any;
  /** 步兵姿态（仅步兵）。 */
  stance?: any;
  /** 已采矿量（仅载具 harvester）。 */
  harvestedOre?: any;
  /** 已采宝石量（仅载具 harvester）。 */
  harvestedGems?: any;
  /** 弹药（仅飞机）。 */
  ammo?: any;
  /** 是否已超时空传送出去。 */
  isWarpedOut: any;
  /** 被精神控制的控制器 id。 */
  mindControlledBy?: any;
  /** TNT 炸药剩余 tick。 */
  tntTimer?: any;
}

export {};
