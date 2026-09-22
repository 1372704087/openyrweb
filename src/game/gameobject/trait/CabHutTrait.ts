/**
 * CabHutTrait — 工兵小屋桥梁维修/爆破（findClosest → repair/demolish）。
 *
 * findClosestBridgeBounds 缓存最近桥 bounds；repairBridge 按高低桥算
 * overlayId 并在 destroyed 碎块 tile 重生 Overlay、疏散/上桥单位；
 * demolishBridge 对可炸碎块置 DeathType.Demolish 并 destroyObject。
 *
 * 由 game/gameobject/trait/CabHutTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换
import * as BridgeOverlayTypesModule from "game/map/BridgeOverlayTypes"; // 未转换（any-shim）
import * as ScatterTaskModule from "game/gameobject/task/ScatterTask"; // 未转换（any-shim）
import * as ZoneTypeModule from "game/gameobject/unit/ZoneType"; // 未转换（any-shim）
import * as DeathTypeModule from "game/gameobject/common/DeathType"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CabHutTrait {
  /** 所属小屋建筑。 */
  gameObject: any;
  /** 桥梁系统。 */
  bridges: any;
  /** 是否已尝试查找最近桥。 */
  checkedClosestBridge: boolean;
  /** 缓存的最近桥 bounds。 */
  closestBridge: any;

  constructor(gameObject: any, bridges: any) {
    this.gameObject = gameObject;
    this.bridges = bridges;
    this.checkedClosestBridge = false;
  }

  /** 桥是否可修；无桥时告警并返回 false。 */
  canRepairBridge() {
    const bounds = this.findClosestBridgeBounds();
    if (bounds) return this.bridges.canBeRepaired(bounds);
    console.warn(`No bridge associated with hut at ${this.gameObject.tile.rx}, ${this.gameObject.tile.ry}.`);
    return false;
  }

  /**
   * 修复桥：在被毁碎块 tile 重生 overlay，并更新桥上/桥下单位状态。
   * @param world 游戏世界
   * @param attackerInfo 攻击者信息（疏散参数）
   */
  repairBridge(world: any, attackerInfo: any) {
    const bounds = this.findClosestBridgeBounds();
    if (!bounds) throw new Error("No bridge bounds found");
    const destroyedTiles = this.bridges.findDestroyedPieceTiles(bounds);
    const horizontal = bounds.start.rx !== bounds.end.rx;
    const overlayId = bounds.isHigh
      ? BridgeOverlayTypesModule.BridgeOverlayTypes.calculateHighBridgeOverlayId(bounds.type, horizontal)
      : BridgeOverlayTypesModule.BridgeOverlayTypes.calculateLowBridgeOverlayId(bounds.type, horizontal);
    const overlayName = world.rules.getOverlayName(overlayId);
    for (const tile of destroyedTiles) {
      const overlay = world.createObject(ObjectTypeModule.ObjectType.Overlay, overlayName);
      overlay.overlayId = overlayId;
      overlay.value = 0;
      overlay.position.tileElevation = bounds.isHigh ? 4 : 0;
      world.spawnObject(overlay, tile);
      this.updateUnitsUnderBridgePiece(tile, bounds, world, attackerInfo);
    }
    for (const piece of this.bridges.findBridgePieces(bounds)) {
      piece.obj.bridgeTrait.bridgeSpec = bounds;
    }
  }

  /** 高桥：过大单位 ScatterTask 疏散；低桥：可走则上桥，不可走则销毁。 */
  updateUnitsUnderBridgePiece(tile: any, bounds: any, world: any, attackerInfo: any) {
    for (const pieceTile of this.bridges.getPieceTiles(this.bridges.getPieceAtTile(tile))) {
      if (bounds.isHigh) {
        const tooBig = world.map
          .getGroundObjectsOnTile(pieceTile)
          .filter(
            (obj: any) =>
              obj.tile === pieceTile && obj.isUnit() && !obj.unitOrderTrait.hasTasks() && obj.rules.tooBigToFitUnderBridge,
          );
        tooBig.forEach((obj: any) => obj.unitOrderTrait.addTask(new ScatterTaskModule.ScatterTask(world)));
      } else {
        for (const groundObj of world.map.getGroundObjectsOnTile(pieceTile)) {
          if (groundObj.isUnit()) {
            if (
              world.map.terrain.getPassableSpeed(pieceTile, groundObj.rules.speedType, groundObj.isInfantry(), true)
            ) {
              groundObj.zone = ZoneTypeModule.ZoneType.Ground;
              groundObj.onBridge = true;
            } else if (!groundObj.isDestroyed) {
              world.destroyObject(groundObj, { player: attackerInfo });
            }
          }
        }
      }
    }
  }

  /**
   * 爆破所属桥：低桥且不在水域则跳过，其余置 Demolish 并摧毁。
   * @param world 游戏世界
   * @param attackerInfo 攻击者信息
   */
  demolishBridge(world: any, attackerInfo: any) {
    const pieces = this.getBridgePieces();
    if (pieces) {
      for (const piece of pieces) {
        const skipLow =
          piece.obj.isLowBridge() && world.map.getTileZone(piece.obj.tile, true) !== ZoneTypeModule.ZoneType.Water;
        if (skipLow || piece.obj.isDestroyed) continue;
        piece.obj.deathType = DeathTypeModule.DeathType.Demolish;
        world.destroyObject(piece.obj, attackerInfo, true);
      }
    }
  }

  /** 所属桥的全部碎块（无桥则 undefined）。 */
  getBridgePieces() {
    const bounds = this.findClosestBridgeBounds();
    if (bounds) return this.bridges.findBridgePieces(bounds);
  }

  /** 惰性查找并缓存最近桥 bounds。 */
  findClosestBridgeBounds() {
    if (!this.checkedClosestBridge) {
      this.checkedClosestBridge = true;
      this.closestBridge = this.bridges.findClosestBridgeSpec(this.gameObject.tile);
    }
    return this.closestBridge;
  }

  /** 释放对象引用。 */
  dispose() {
    this.gameObject = undefined;
  }
}
