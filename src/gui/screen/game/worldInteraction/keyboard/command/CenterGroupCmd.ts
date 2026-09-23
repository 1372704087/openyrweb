/**
 * CenterGroupCmd — 选中编组并居中到编组中心。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/CenterGroupCmd.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 编组居中命令。 */
export class CenterGroupCmd {
  /** 编组号。 */
  groupNum: any;
  /** 单位选择处理器。 */
  unitSelectionHandler: any;
  /** 地图平移辅助。 */
  mapPanningHelper: any;
  /** 镜头平移。 */
  cameraPan: any;

  /**
   * @param groupNum 编组号
   * @param unitSelectionHandler 选择处理器
   * @param mapPanningHelper 平移辅助
   * @param cameraPan 镜头平移
   */
  constructor(groupNum: any, unitSelectionHandler: any, mapPanningHelper: any, cameraPan: any) {
    this.groupNum = groupNum;
    this.unitSelectionHandler = unitSelectionHandler;
    this.mapPanningHelper = mapPanningHelper;
    this.cameraPan = cameraPan;
  }

  /** 选组 → 若有单位则居中。 */
  execute(): void {
    this.unitSelectionHandler.selectGroup(this.groupNum);
    let units = this.unitSelectionHandler.getGroupUnits(this.groupNum);
    if (units.length) {
      const tile = this.computePanTile(units);
      const pan = this.mapPanningHelper.computeCameraPanFromTile(tile.rx, tile.ry);
      this.cameraPan.setPan(pan);
    }
  }

  /**
   * 计算单位 tile 的中心（向下取整平均）。
   * @param units 单位列表
   */
  computePanTile(units: any[]): { rx: number; ry: number } {
    return {
      rx: Math.floor(units.reduce((sum, u) => sum + u.tile.rx, 0) / units.length),
      ry: Math.floor(units.reduce((sum, u) => sum + u.tile.ry, 0) / units.length),
    };
  }
}
