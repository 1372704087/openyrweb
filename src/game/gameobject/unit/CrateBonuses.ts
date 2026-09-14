/**
 * CrateBonuses — 箱子加成（升级工具箱）带来的倍率集。
 *
 * 拾取武器/装甲/速度升级箱后各分量 >1，战斗计算时与基础值相乘。
 * 由 GameObject（Techno 一族）持有，初始全部为 1（无加成）。
 *
 * 由 game/gameobject/unit/CrateBonuses.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export class CrateBonuses {
  /** 火力倍率。 */
  firepower = 1;
  /** 装甲倍率。 */
  armor = 1;
  /** 速度倍率。 */
  speed = 1;
}
