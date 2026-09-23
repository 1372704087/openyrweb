/**
 * LocomotorType — 移动器（Locomotor）类型枚举 + CLSID 映射表。
 *
 * Locomotor 是 RA2 单位的"移动方式插件"：rules 里每类单位声明一个
 * CLSID（如 {4A582741-...}），引擎据此决定寻路算法与运动学表现
 * （履带转向 vs 悬浮平移 vs 弹道飞行等）。
 *
 *  - locomotorTypesByClsId ：INI 的 CLSID 字符串 → 枚举值（规则解析用）；
 *  - defaultSpeedsByLocomotor：各类移动器的默认 SpeedType（Speed 未声明
 *    时的缺省行走类型，影响可通行地形判定）。
 *
 * 由 game/type/LocomotorType.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { SpeedType } from "game/type/SpeedType";

export enum LocomotorType {
  /** 静止不动（建筑、固定哨炮）。 */
  Statue = 0,
  /** 飞行器（空中直线巡航）。 */
  Aircraft = 1,
  /** 超时空移动（瞬移）。 */
  Chrono = 2,
  /** 悬浮（不受斜坡影响，如磁电坦克目标）。 */
  Hover = 3,
  /** 步兵（双腿，有转向与队形）。 */
  Infantry = 4,
  /** 跳跃机（Jumpjet，抛物线空中机动）。 */
  Jumpjet = 5,
  /** 导弹（直线弹道）。 */
  Missile = 6,
  /** 舰船（水面浮行）。 */
  Ship = 7,
  /** 载具（地面履带/轮胎）。 */
  Vehicle = 8,
}

/** INI 中 Locomotor 字段的 CLSID → 移动器类型。 */
export const locomotorTypesByClsId = new Map<string, LocomotorType>([
  ["{4A582746-9839-11d1-B709-00A024DDAFD1}", LocomotorType.Aircraft],
  ["{4A582747-9839-11d1-B709-00A024DDAFD1}", LocomotorType.Chrono],
  ["{4A582742-9839-11d1-B709-00A024DDAFD1}", LocomotorType.Hover],
  ["{4A582744-9839-11d1-B709-00A024DDAFD1}", LocomotorType.Infantry],
  ["{92612C46-F71F-11d1-AC9F-006008055BB5}", LocomotorType.Jumpjet],
  ["{B7B49766-E576-11d3-9BD9-00104B972FE8}", LocomotorType.Missile],
  ["{2BEA74E1-7CCA-11d3-BE14-00104B62A16C}", LocomotorType.Ship],
  ["{4A582741-9839-11d1-B709-00A024DDAFD1}", LocomotorType.Vehicle],
]);

/** 未声明 Speed 时的缺省行走类型（按移动器类型）。 */
export const defaultSpeedsByLocomotor = new Map<LocomotorType, SpeedType>([
  [LocomotorType.Infantry, SpeedType.Foot],
  [LocomotorType.Ship, SpeedType.Float],
  [LocomotorType.Hover, SpeedType.Hover],
  [LocomotorType.Jumpjet, SpeedType.Winged],
  [LocomotorType.Aircraft, SpeedType.Winged],
  [LocomotorType.Missile, SpeedType.Winged],
]);
