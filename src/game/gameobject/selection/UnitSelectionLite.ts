/**
 * UnitSelectionLite — 轻量选择集（Bot/回放等无需完整 SelectionModel 的场景）。
 *
 * 只维护 selectedUnits 集合与一次过滤：
 *  - update：若候选列表中存在非本方单位，则只保留「倒序最后一个非本方」
 *    （单敌选择语义）；随后清空重填，仅保留 rules.selectable 的单位。
 *  - getSelectedUnits：映射 disposed→replacedBy（被替换对象转发），
 *    并过滤 isDestroyed / isCrashing。
 *  - isSelected：直接查 Set。
 *
 * 由 game/gameobject/selection/UnitSelectionLite.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UnitSelectionLite {
  /** 所属玩家（决定 update 是否落入「单敌」分支）。 */
  player: any;
  /** 当前选中单位集合。 */
  selectedUnits: Set<any>;

  constructor(player: any) {
    this.player = player;
    this.selectedUnits = new Set();
  }

  /** 以候选列表重建选中集（单敌截断 + selectable 过滤）。 */
  update(candidates: Iterable<any>): void {
    let units = candidates as any;
    // 孪生：[...e].reverse().find(e => e.owner !== this.player)
    const foreign = [...(candidates as Iterable<any>)].reverse().find((u: any) => u.owner !== this.player);
    if (foreign) units = [foreign];
    this.selectedUnits.clear();
    for (const u of units) {
      if (u.rules.selectable) this.selectedUnits.add(u);
    }
  }

  /** 对外可见的选中列表：转发 replacedBy 并剔除已毁/坠毁。 */
  getSelectedUnits(): any[] {
    return [...this.selectedUnits]
      .map((u: any) => (u.isDisposed && u.replacedBy ? u.replacedBy : u))
      .filter((u: any) => !u.isDestroyed && !u.isCrashing);
  }

  /** 该对象是否在选中集中（原始引用，不做 replacedBy 转发）。 */
  isSelected(obj: any): boolean {
    return this.selectedUnits.has(obj);
  }
}
