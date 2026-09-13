/**
 * SideType — 阵营（side）枚举。
 *
 * RA2 的"side"是比国家（Country）更高一层的分组：同一 side 下的多个
 * 国家共享科技树、载具外观等规则入口。GDI/Nod 沿袭自泰伯利亚之日
 * 引擎的遗留命名，在 RA2 中实际承载盟军/苏军两大阵营。
 *
 * 由 game/SideType.ts.js 重写为 TS（行为完全一致，枚举值经脚本提取
 * 核对）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */
export enum SideType {
  /** 遗留命名：RA2 中承载盟军（Allies）阵营。 */
  GDI = 0,
  /** 遗留命名：RA2 中承载苏军（Soviet）阵营。 */
  Nod = 1,
  /** 第三阵营（尤里）。 */
  ThirdSide = 2,
  /** 平民阵营：中立平民国家；PlayerList.getCivilian() 按 side===Civilian 查找。 */
  Civilian = 3,
  /** 变异人阵营（Yuri's Revenge 的 Mutant 单位分组）。 */
  Mutant = 4,
}
