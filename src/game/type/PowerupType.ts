/**
 * PowerupType — 箱子（Crate）掉落增益类型枚举。
 *
 * 对应 Powerups 段首列类型名，以及部分触发器动作里引用的箱子效果编号。
 * UNSUPPORTED_POWERUP_TYPES（CrateGeneratorTrait）会过滤尚未实现的类型。
 *
 * 由 game/type/PowerupType.ts.js 重写为 TS（行为完全一致，枚举值脚本
 * 提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum PowerupType {
  /** 护甲提升。 */
  Armor = 0,
  /** 火力提升。 */
  Firepower = 1,
  /** 修复基地（治疗己方单位）。 */
  HealBase = 2,
  /** 金钱。 */
  Money = 3,
  /** 开图揭示。 */
  Reveal = 4,
  /** 速度提升。 */
  Speed = 5,
  /** 老兵等级提升。 */
  Veteran = 6,
  /** 免费单位。 */
  Unit = 7,
  /** 短暂无敌。 */
  Invulnerability = 8,
  /** 离子风暴。 */
  IonStorm = 9,
  /** 毒气。 */
  Gas = 10,
  /** 泰伯利亚矿（原版遗留名）。 */
  Tiberium = 11,
  /** 伞兵编队。 */
  Pod = 12,
  /** 隐形。 */
  Cloak = 13,
  /** 黑暗（全图黑）。 */
  Darkness = 14,
  /** 爆炸（对拾取者造成伤害）。 */
  Explosion = 15,
  /** 洲际导弹（剧情箱）。 */
  ICBM = 16,
  /** 火焰（剧情箱）。 */
  Napalm = 17,
  /** 小队单位。 */
  Squad = 18,
}
