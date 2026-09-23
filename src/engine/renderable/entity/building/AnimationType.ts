/**
 * AnimationType — 建筑动画类型枚举（Idle/Production/Active/Special/Super/Buildup 等）。
 *
 * 由 engine/renderable/entity/building/AnimationType.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum AnimationType {
  /** 待机动画（IdleAnim*）。 */
  IDLE = 0,
  /** 生产中动画（ProductionAnim）。 */
  PRODUCTION = 1,
  /** 激活/工作动画（ActiveAnim*，默认受电力影响）。 */
  ACTIVE = 2,
  /** 特殊动画（SpecialAnim*）。 */
  SPECIAL = 3,
  /** 超武动画（SuperAnim*）。 */
  SUPER = 4,
  /** 建造展开动画（Buildup）。 */
  BUILDUP = 5,
  /** 拆除反播动画（Buildup 反向）。 */
  UNBUILD = 6,
  /** 工厂展开（DeployingAnim/UnderDoorAnim 时机）。 */
  FACTORY_DEPLOYING = 7,
  /** 工厂屋顶展开（RoofDeployingAnim/UnderRoofDoorAnim）。 */
  FACTORY_ROOF_DEPLOYING = 8,
  /** 超武待机（SUPER_IDLE）。 */
  SUPER_IDLE = 9,
  /** 超武充能开始。 */
  SUPER_CHARGE_START = 10,
  /** 超武充能循环。 */
  SUPER_CHARGE_LOOP = 11,
  /** 超武充能结束。 */
  SUPER_CHARGE_END = 12,
  /** 特殊停靠（SPECIAL_DOCKING）。 */
  SPECIAL_DOCKING = 13,
  /** 特殊维修开始。 */
  SPECIAL_REPAIR_START = 14,
  /** 特殊维修循环。 */
  SPECIAL_REPAIR_LOOP = 15,
  /** 特殊维修结束。 */
  SPECIAL_REPAIR_END = 16,
  /** 特殊开火（SPECIAL_SHOOT）。 */
  SPECIAL_SHOOT = 17,
  /** 门下沉（FACTORY_UNDER_DOOR）。 */
  FACTORY_UNDER_DOOR = 18,
  /** 屋顶门下沉（FACTORY_UNDER_ROOF_DOOR）。 */
  FACTORY_UNDER_ROOF_DOOR = 19,
  // Tank Bunker — exit animation (walls going down, SpecialAnimThree).
  /** 坦克碉堡出口动画（围墙落下，SpecialAnimThree）。 */
  SPECIAL_UNDOCKING = 20,
  // Grinder (Grinding=yes) — grind animation (SpecialAnim) played
  // while a unit is being recycled.
  /** 磨碎机（Grinding=yes）：单位被回收时播放的磨碎动画（SpecialAnim）。 */
  SPECIAL_GRIND = 21,
}
