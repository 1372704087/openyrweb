/**
 * CollisionHelper — 碰撞检测辅助（占位格上的墙/桥/单位/岸/崖判定）。
 *
 * checkCollisions：在目标格上收集桥 overlay、墙 overlay、存活 techno，
 * 按 options 开关依次判定：
 *  - walls：陆地 elevation≤2 且 landType=Wall → Wall；或地面单位压在
 *    elevation≤1.1 的己方不可通行格 → Wall；
 *  - shore：非 Water 陆地 → Shore（忽略 target）；
 *  - ground：自身 elevation<0 → Ground（穿地）；
 *  - 高桥：按两端高度决定 OnBridge/UnderBridge；低桥+shore 开关 → UnderBridge；
 *  - cliffs：两端 z 差 ≥4 且自身 elevation<0 → Cliff。
 * computeDetonationZone：按桥面/高度/水面推导爆炸区域（Air/Ground/Water）。
 *
 * 由 game/gameobject/unit/CollisionHelper.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as TerrainTypeModule from "engine/type/TerrainType"; // 已转换
import * as LandTypeModule from "game/type/LandType"; // 已转换
import * as CollisionTypeModule from "game/gameobject/unit/CollisionType"; // 已转换
import * as ZoneTypeModule from "game/gameobject/unit/ZoneType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CollisionHelper {
  /** tile 占位管理器（查格上对象/桥）。 */
  tileOccupation: any;

  constructor(tileOccupation: any) {
    this.tileOccupation = tileOccupation;
  }

  /**
   * 在 position 所在格做碰撞检测。
   * @param position 当前位置（含 tile / tileElevation）
   * @param prevPosition 上一帧位置（用于比对高度）
   * @param options 各类碰撞开关；units 可为 false 或 (owner)=>boolean 过滤
   * @returns { type, target? }
   */
  checkCollisions(position: any, prevPosition: any, options: any): { type: any; target?: any } {
    let tile = position.tile;
    let bridge: any;
    let techno: any;
    let wall: any;
    for (const obj of this.tileOccupation.getObjectsOnTile(tile)) {
      if (obj.isOverlay() && obj.isBridge()) bridge = obj;
      if (obj.isOverlay() && obj.wallTrait) wall = obj;
      if (obj.isTechno() && !obj.isDestroyed) techno = obj;
    }
    if (options.walls) {
      if (position.tileElevation <= 2 && tile.landType === LandTypeModule.LandType.Wall)
        return { type: CollisionTypeModule.CollisionType.Wall, target: wall };
      if (
        options.units &&
        techno?.tile === tile &&
        (!techno.isUnit() || techno.zone === ZoneTypeModule.ZoneType.Ground) &&
        position.tileElevation <= 1.1 &&
        options.units(techno.owner)
      )
        return { type: CollisionTypeModule.CollisionType.Wall, target: techno };
    }
    if (options.shore && tile.landType !== LandTypeModule.LandType.Water)
      return { type: CollisionTypeModule.CollisionType.Shore };
    if (options.ground && position.tileElevation < 0)
      return { type: CollisionTypeModule.CollisionType.Ground };

    const elev = position.tileElevation + tile.z;
    const prevElev = prevPosition.tileElevation + prevPosition.tile.z;
    if (bridge?.isHighBridge()) {
      const bridgeTop = bridge.tile.z + bridge.tileElevation;
      if (
        (bridgeTop < prevElev && elev <= bridgeTop) ||
        (prevElev < bridgeTop && bridgeTop - 1 <= elev)
      )
        return prevElev < bridgeTop
          ? { type: CollisionTypeModule.CollisionType.UnderBridge, target: bridge }
          : { type: CollisionTypeModule.CollisionType.OnBridge, target: bridge };
    } else if (bridge?.isLowBridge() && options.shore) {
      return { type: CollisionTypeModule.CollisionType.UnderBridge, target: bridge };
    }
    if (options.cliffs) {
      const dz = tile.z - prevPosition.tile.z;
      if (position.tileElevation < 0 && dz >= 4) return { type: CollisionTypeModule.CollisionType.Cliff };
    }
    return { type: CollisionTypeModule.CollisionType.None };
  }

  /**
   * 计算爆炸区域：
   *  - 无碰撞且高度 > 1.5+桥面高 → Air；
   *  - 有桥且高度>1.5，或非水面，或低桥 → Ground；
   *  - 否则 Water。
   */
  computeDetonationZone(tile: any, height: number, collisionType: any): any {
    const bridge = this.tileOccupation.getBridgeOnTile(tile);
    return collisionType === CollisionTypeModule.CollisionType.None && height > 1.5 + (bridge?.tileElevation ?? 0)
      ? ZoneTypeModule.ZoneType.Air
      : (bridge && height > 1.5) || tile.terrainType !== TerrainTypeModule.TerrainType.Water || bridge?.isLowBridge()
        ? ZoneTypeModule.ZoneType.Ground
        : ZoneTypeModule.ZoneType.Water;
  }
}
