/**
 * SelectGroupCmd — 选中编组；400ms 内重复按键仅选中不居中。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/SelectGroupCmd.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 编组选择命令。 */
export class SelectGroupCmd {
  /** 编组号。 */
  groupNum: any;
  /** 单位选择处理器。 */
  unitSelectionHandler: any;
  /** 目标线。 */
  targetLines: any;
  /** 地图平移辅助。 */
  mapPanningHelper: any;
  /** 镜头平移。 */
  cameraPan: any;
  /** 上次执行时间（performance.now）。 */
  lastSelectTime: number | undefined;

  /**
   * @param groupNum 编组号
   * @param unitSelectionHandler 选择处理器
   * @param targetLines 目标线
   * @param mapPanningHelper 平移辅助
   * @param cameraPan 镜头平移
   */
  constructor(
    groupNum: any,
    unitSelectionHandler: any,
    targetLines: any,
    mapPanningHelper: any,
    cameraPan: any,
  ) {
    this.groupNum = groupNum;
    this.unitSelectionHandler = unitSelectionHandler;
    this.targetLines = targetLines;
    this.mapPanningHelper = mapPanningHelper;
    this.cameraPan = cameraPan;
  }

  /** 选组并强制显示目标线；间隔>400ms 才居中。 */
  execute(): void {
    this.unitSelectionHandler.selectGroup(this.groupNum);
    this.targetLines.forceShow();
    const now = performance.now();
    let shouldCenter = true;
    if (!this.lastSelectTime || now - this.lastSelectTime > 400) {
      shouldCenter = false;
      this.lastSelectTime = now;
    }
    if (!shouldCenter) return;
    const units = this.unitSelectionHandler.getSelectedUnits();
    if (units.length) {
      const tile = this.computePanTile(units);
      const pan = this.mapPanningHelper.computeCameraPanFromTile(tile.rx, tile.ry);
      this.cameraPan.setPan(pan);
    }
  }

  /**
   * 计算选中单位 tile 中心（向下取整平均）。
   * @param units 单位列表
   */
  computePanTile(units: any[]): { rx: number; ry: number } {
    return {
      rx: Math.floor(units.reduce((sum, u) => sum + u.tile.rx, 0) / units.length),
      ry: Math.floor(units.reduce((sum, u) => sum + u.tile.ry, 0) / units.length),
    };
  }
}
