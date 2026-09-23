/**
 * CenterViewCmd — 镜头居中到当前选中单位。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/CenterViewCmd.ts.js
 * 重写为 TS（行为完全一致）。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 选中单位居中命令。 */
export class CenterViewCmd {
  /** 单位选择处理器。 */
  unitSelectionHandler: any;
  /** 地图平移辅助。 */
  mapPanningHelper: any;
  /** 镜头平移。 */
  cameraPan: any;

  /**
   * @param unitSelectionHandler 选择处理器
   * @param mapPanningHelper 平移辅助
   * @param cameraPan 镜头平移
   */
  constructor(unitSelectionHandler: any, mapPanningHelper: any, cameraPan: any) {
    this.unitSelectionHandler = unitSelectionHandler;
    this.mapPanningHelper = mapPanningHelper;
    this.cameraPan = cameraPan;
  }

  /** 若有选中则居中到中心 tile。 */
  execute(): void {
    let units = this.unitSelectionHandler.getSelectedUnits();
    if (units.length) {
      const tile = this.computePanTile(units);
      const pan = this.mapPanningHelper.computeCameraPanFromTile(tile.rx, tile.ry);
      this.cameraPan.setPan(pan);
    }
  }

  /**
   * 计算单位 tile 中心（向下取整平均）。
   * @param units 单位列表
   */
  computePanTile(units: any[]): { rx: number; ry: number } {
    return {
      rx: Math.floor(units.reduce((sum, u) => sum + u.tile.rx, 0) / units.length),
      ry: Math.floor(units.reduce((sum, u) => sum + u.tile.ry, 0) / units.length),
    };
  }
}
