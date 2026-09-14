/**
 * InfDeathType — 步兵死亡表现分类。
 *
 * 决定步兵阵亡时播放哪一组死亡动画（原版每类步兵有一套按死亡方式
 * 索引的 DeathAnims 序列）。弹头通过 InfDeath= 指定死亡方式。
 *
 * 由 game/gameobject/infantry/InfDeathType.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
export enum InfDeathType {
  None = 0,
  /** 枪击。 */
  Gunfire = 1,
  /** 爆炸。 */
  Explode = 2,
  /** 爆炸（备用表现）。 */
  ExplodeAlt = 3,
  /** 火焰烧死。 */
  Fire = 4,
  /** 电击（特斯拉/磁暴）。 */
  Electro = 5,
  /** 爆头（狙击）。 */
  HeadExplode = 6,
  /** 核辐射/核爆。 */
  Nuke = 7,
  /** 原版 YR：病毒狙杀（Virus 单位）。 */
  Virus = 8,
  /** 原版 YR：基因突变（Genetic Mutator 弹头——受害者不死亡而是变成狂兽人，在 Warhead.inflictDamage 中处理）。 */
  Mutate = 9,
  /** 原版 YR 用 InfDeath=10 的少数弹头：索引受害者 DeathAnims 序列第 11 项（尤里专属死亡动画）；登记此值使 getEnumNumeric 对原版取值不再告警。 */
  YuriDeath = 10,
}
