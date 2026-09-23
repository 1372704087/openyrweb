/**
 * UnitSelection — 完整选择状态管理（选中集 + SelectionModel 缓存 + 编组）。
 *
 * 维护三份状态：
 *  - selectedUnits：当前选中单位 Set；
 *  - selectionModelsByUnit：每单位懒建 SelectionModel（悬停/选中位、编组号）；
 *  - groups：编组号→单位 Set（Ctrl+N 建组 / N 键选组）。
 * 选中/取消都会标 hashNeedsUpdate，getHash 惰性用 fnv32a([...ids]) 重算
 * （锁步校验）。addUnitsToGroup 默认 replace=true：先清组内旧单位的编组号
 * 再填入新单位；replace=false 时追加。
 *
 * 由 game/gameobject/selection/UnitSelection.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import * as SelectionModelModule from "game/gameobject/selection/SelectionModel"; // 已转换
import * as math from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UnitSelection {
  /** 当前选中单位集合。 */
  selectedUnits: Set<any>;
  /** 单位 → 选择状态模型（懒创建）。 */
  selectionModelsByUnit: Map<any, any>;
  /** 编组号 → 单位集合。 */
  groups: Map<number, Set<any>>;
  /** 选中集散列是否已脏（需重算）。 */
  hashNeedsUpdate: boolean;
  /** 缓存的选中集散列（fnv32a over ids）。 */
  hash: number | undefined;

  constructor() {
    this.selectedUnits = new Set();
    this.selectionModelsByUnit = new Map();
    this.groups = new Map();
    this.hashNeedsUpdate = true;
  }

  /** 取（或建）该单位的 SelectionModel。 */
  getOrCreateSelectionModel(unit: any): any {
    let model = this.selectionModelsByUnit.get(unit);
    if (!model) {
      model = new SelectionModelModule.SelectionModel(unit);
      this.selectionModelsByUnit.set(unit, model);
    }
    return model;
  }

  /** 取消全部选中（逐个 setSelected(false) 并清空集合）。 */
  deselectAll(): void {
    this.selectedUnits.forEach((u) => this.selectionModelsByUnit.get(u)?.setSelected(false));
    this.selectedUnits.clear();
    this.hashNeedsUpdate = true;
  }

  /** 加入选中（同时置 SelectionModel 的 Selected 位）。 */
  addToSelection(unit: any): void {
    this.selectedUnits.add(unit);
    this.getOrCreateSelectionModel(unit).setSelected(true);
    this.hashNeedsUpdate = true;
  }

  /** 批量移出选中。 */
  removeFromSelection(units: Iterable<any>): void {
    for (const u of units) {
      this.selectedUnits.delete(u);
      this.getOrCreateSelectionModel(u).setSelected(false);
    }
    this.hashNeedsUpdate = true;
  }

  /** 对外可见的选中列表：剔除已毁/坠毁/已销毁/未 spawn。 */
  getSelectedUnits(): any[] {
    return [...this.selectedUnits].filter(
      (u) => !u.isDestroyed && !u.isCrashing && !u.isDisposed && u.isSpawned,
    );
  }

  /** 该单位是否在选中集中。 */
  isSelected(unit: any): boolean {
    return this.selectedUnits.has(unit);
  }

  /** 单位离场清理：删模型、删选中、从所有编组移除。 */
  cleanupUnit(unit: any): void {
    this.selectionModelsByUnit.delete(unit);
    this.selectedUnits.delete(unit);
    this.removeUnitsFromGroup([unit]);
    this.hashNeedsUpdate = true;
  }

  /** 重算散列（选中单位 id 序列的 FNV）。 */
  updateHash(): void {
    this.hash = math.fnv32a([...this.selectedUnits].map((u) => u.id));
  }

  /** 惰性取散列：脏则先 updateHash。 */
  getHash(): number {
    if (this.hashNeedsUpdate) {
      this.updateHash();
      this.hashNeedsUpdate = false;
    }
    return this.hash as number;
  }

  /** 用当前选中集创建/覆盖编组 n。 */
  createGroup(n: number): void {
    this.addUnitsToGroup(n, this.getSelectedUnits());
  }

  /**
   * 往编组 n 填入 units。
   * @param replace true（默认）：先清空组内旧单位的编组号并清组，再填入
   */
  addUnitsToGroup(n: number, units: Iterable<any>, replace = true): void {
    this.removeUnitsFromGroup(units);
    let group = this.groups.get(n);
    if (!group) {
      group = new Set();
      this.groups.set(n, group);
    }
    if (replace) {
      for (const old of [...group.values()]) {
        this.selectionModelsByUnit.get(old)?.setControlGroupNumber(void 0);
      }
      group.clear();
    }
    for (const u of units) {
      group.add(u);
      this.getOrCreateSelectionModel(u).setControlGroupNumber(n);
    }
  }

  /** 把编组 n 的全部单位加入选中（不清当前选中）。 */
  addGroupToSelection(n: number): void {
    if (this.groups.has(n)) {
      for (const u of [...(this.groups.get(n) as Set<any>)]) this.addToSelection(u);
    }
  }

  /** 先全不选，再选中编组 n。 */
  selectGroup(n: number): void {
    this.deselectAll();
    this.addGroupToSelection(n);
  }

  /** 读取编组 n 的单位列表副本（无则空数组）。 */
  getGroupUnits(n: number): any[] {
    return [...(this.groups.get(n) ?? [])];
  }

  /** 从所有编组里移除 units，并清掉其编组号。 */
  removeUnitsFromGroup(units: Iterable<any>): void {
    for (const group of this.groups.values()) {
      for (const u of units) {
        group.delete(u);
        this.selectionModelsByUnit.get(u)?.setControlGroupNumber(void 0);
      }
    }
  }
}
