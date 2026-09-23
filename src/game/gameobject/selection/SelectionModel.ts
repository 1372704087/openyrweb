/**
 * SelectionModel — 单个对象的选择状态模型（位掩码级别 + 编组号）。
 *
 * 每个可选对象对应一份 SelectionModel（由 UnitSelection 懒创建并缓存）。
 * maxSelectionLevel 在构造时按对象类型/规则封顶：
 *  - 建筑且 rules.wall（墙体）→ 永远不可选中（None）；
 *  - rules.selectable → 可 Selected|Hover；
 *  - 否则只允许 Hover。
 * setSelectionLevel 以 Math.min 把当前级别钳到 max；setHover/setSelected
 * 用位或/位反操作 Hover、Selected 位；isSelected 用数值比较（>= Selected）。
 *
 * 由 game/gameobject/selection/SelectionModel.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import * as SelectionLevelModule from "game/gameobject/selection/SelectionLevel"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SelectionModel {
  /** 当前选择级别（位掩码）。 */
  selectionLevel: number;
  /** 该对象允许的最高选择级别（构造时按规则封顶）。 */
  maxSelectionLevel: number;
  /** 编组号（Ctrl+数字），由 UnitSelection 维护。 */
  controlGroupNumber: number | undefined;

  constructor(obj: any) {
    this.selectionLevel = SelectionLevelModule.SelectionLevel.None;
    if (obj.isBuilding() && obj.rules.wall) {
      this.maxSelectionLevel = SelectionLevelModule.SelectionLevel.None;
    } else {
      this.maxSelectionLevel = obj.rules.selectable
        ? SelectionLevelModule.SelectionLevel.Selected | SelectionLevelModule.SelectionLevel.Hover
        : SelectionLevelModule.SelectionLevel.Hover;
    }
  }

  /** 读取当前选择级别。 */
  getSelectionLevel(): number {
    return this.selectionLevel;
  }

  /** 写入选择级别（钳到 maxSelectionLevel）。 */
  setSelectionLevel(level: number): void {
    this.selectionLevel = Math.min(this.maxSelectionLevel, level);
  }

  /** 悬停开关：置/清 Hover 位（经 setSelectionLevel 封顶）。 */
  setHover(hover: boolean): void {
    this.setSelectionLevel(
      hover
        ? this.selectionLevel | SelectionLevelModule.SelectionLevel.Hover
        : this.selectionLevel & ~SelectionLevelModule.SelectionLevel.Hover,
    );
  }

  /** 选中开关：置/清 Selected 位（经 setSelectionLevel 封顶）。 */
  setSelected(selected: boolean): void {
    this.setSelectionLevel(
      selected
        ? this.selectionLevel | SelectionLevelModule.SelectionLevel.Selected
        : this.selectionLevel & ~SelectionLevelModule.SelectionLevel.Selected,
    );
  }

  /** 是否处于悬停（测 Hover 位）。 */
  isHovered(): boolean {
    return Boolean(this.selectionLevel & SelectionLevelModule.SelectionLevel.Hover);
  }

  /** 是否已选中（数值 >= Selected，与孪生一致）。 */
  isSelected(): boolean {
    return this.selectionLevel >= SelectionLevelModule.SelectionLevel.Selected;
  }

  /** 读取编组号。 */
  getControlGroupNumber(): number | undefined {
    return this.controlGroupNumber;
  }

  /** 写入编组号。 */
  setControlGroupNumber(n: number | undefined): void {
    this.controlGroupNumber = n;
  }
}
