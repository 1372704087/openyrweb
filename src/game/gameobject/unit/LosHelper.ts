/**
 * LosHelper — 视线（Line of Sight）检测：Bresenham 扫格判墙/崖/高桥遮挡。
 *
 * hasLineOfSight：仅在需要穿墙（warhead.rules.wall 或弹丸不受墙约束）
 * 之外、或需穿崖/发射者为 spawner 时才真正扫格；否则直接 true。
 * 扫格规则：
 *  - 目标自身格上的墙 landType 不挡视线（否则打不到墙目标）；
 *  - 中间墙仍挡（subjectToWalls=false 时）；
 *  - 悬崖：当前格 z 高于发射者视高则挡；已下坡后再上坡也挡；
 *  - 高桥：前 2 格内遇到高桥挡视线。
 *
 * 由 game/gameobject/unit/LosHelper.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as bresenham from "util/bresenham"; // 已转换
import * as LandTypeModule from "game/type/LandType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 是否为「有 position 的实体」（vs 裸 tile）。 */
const hasPosition = (o: any): boolean => void 0 !== o.position;

export class LosHelper {
  /** 地图 tile 集合。 */
  tiles: any;
  /** tile 占位管理器（查桥）。 */
  tileOccupation: any;

  constructor(tiles: any, tileOccupation: any) {
    this.tiles = tiles;
    this.tileOccupation = tileOccupation;
  }

  /**
   * 判定 attacker → target 是否有视线。
   * @param attacker 实体或 tile
   * @param target 实体或 tile（建筑取 centerTile）
   * @param context { warhead, projectileRules, rules }
   * @returns true=有视线；false=被墙/崖/桥挡住
   */
  hasLineOfSight(attacker: any, target: any, context: any): boolean {
    const ignoreWalls = context.warhead.rules.wall || !context.projectileRules.subjectToWalls;
    const checkCliffs = context.projectileRules.subjectToCliffs;
    const checkBridges = context.rules.spawner;
    let bridgeCount = 0;
    let wasDownSlope = false;
    if (!ignoreWalls || checkCliffs || checkBridges) {
      const from = hasPosition(attacker) ? attacker.tile : attacker;
      const to = hasPosition(target) ? (target.isBuilding() ? target.centerTile : target.tile) : target;
      let eyeZ = from.z;
      // 发射者在桥上时视高叠加桥面 elevation（仅需穿崖时）
      if (checkCliffs && hasPosition(attacker) && attacker.isUnit() && attacker.onBridge)
        eyeZ += this.tileOccupation.getBridgeOnTile(from)?.tileElevation ?? 0;
      for (const { x, y } of bresenham.bresenham(from.rx, from.ry, to.rx, to.ry)) {
        const tile = this.tiles.getByMapCoords(x, y);
        if (!tile) return false;
        // the target's OWN tile must not block LOS to the target —
        // a wall building sets its tile's landType to Wall, so without this
        // exemption a unit could never acquire LOS on a wall target (vanilla
        // YR allows firing at walls). Walls BETWEEN attacker and target still
        // block LOS as before.
        if (!ignoreWalls && (x !== to.rx || y !== to.ry) && tile.landType === LandTypeModule.LandType.Wall)
          return false;
        if (checkCliffs) {
          if (tile.landType === LandTypeModule.LandType.Cliff) {
            if (tile.z > eyeZ) return false;
            wasDownSlope = true;
          } else {
            if (tile.z > eyeZ && wasDownSlope) return false;
            wasDownSlope = false;
          }
        }
        if (checkBridges && bridgeCount < 2 && this.tileOccupation.getBridgeOnTile(tile)?.isHighBridge())
          return false;
        bridgeCount++;
      }
    }
    return true;
  }
}
