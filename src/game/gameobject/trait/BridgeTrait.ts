/**
 * BridgeTrait — 桥梁碎块（受伤刷新图像；摧毁时多米诺与桥上单位疏散/击杀）。
 *
 * onDamage 置 needsImageUpdate，下一 tick 调 bridges.handlePieceHealthChange。
 * onDestroy：未处理多米诺则连锁摧毁关联碎块；计算碎块占格，对低桥可通行
 * 单位或 Paradrop 步兵下桥（清 onBridge、reservedPathNodes），其余步兵
 * InfDeathType.None 后 destroyObject。
 *
 * 由 game/gameobject/trait/BridgeTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as InfDeathTypeModule from "game/gameobject/infantry/InfDeathType"; // 未转换（any-shim）
import * as LandTypeModule from "game/type/LandType"; // 已转换
import * as ZoneTypeModule from "game/gameobject/unit/ZoneType"; // 未转换（any-shim）
import * as StanceTypeModule from "game/gameobject/infantry/StanceType"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class BridgeTrait {
  /** 桥梁系统管理器。 */
  bridges: any;
  /** 是否需要刷新碎块图像。 */
  needsImageUpdate: boolean;
  /** 多米诺连锁是否已由上游处理（防重复连锁）。 */
  dominoHandled: boolean;

  constructor(bridges: any) {
    this.bridges = bridges;
    this.needsImageUpdate = false;
    this.dominoHandled = false;
  }

  /** 受伤：标记下一 tick 刷新图像。 */
  [NotifyDamageModule.NotifyDamage.onDamage]() {
    this.needsImageUpdate = true;
  }

  /** 每 tick：若有待刷新则处理当前 tile 碎块生命变化。 */
  [NotifyTickModule.NotifyTick.onTick](object: any) {
    if (this.needsImageUpdate) {
      this.needsImageUpdate = false;
      this.bridges.handlePieceHealthChange(this.bridges.getPieceAtTile(object.tile));
    }
  }

  /** 碎块摧毁：多米诺连锁 + 桥上单位疏散/击杀。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, world: any, attackerInfo: any) {
    const piece = this.bridges.getPieceAtTile(object.tile);
    if (!this.dominoHandled) {
      this.bridges
        .findDominoPieces(piece)
        .filter((p: any) => !p.obj.isDestroyed)
        .forEach((p: any) => {
          (p.obj.traits.get(BridgeTrait) as BridgeTrait).dominoHandled = true;
          world.destroyObject(p.obj, attackerInfo);
        });
    }
    const tiles = world.map.tileOccupation.calculateTilesForGameObject(object.tile, object);
    tiles.forEach((tile: any) => {
      const landType = LandTypeModule.getLandType(tile.terrainType);
      const landRules = world.rules.getLandRules(landType);
      world.map.getGroundObjectsOnTile(tile).forEach((groundObj: any) => {
        if (
          groundObj.isUnit() &&
          (groundObj.onBridge || groundObj.moveTrait.reservedPathNodes.some((n: any) => n.onBridge === object)) &&
          !groundObj.isDestroyed
        ) {
          if (
            (object.isLowBridge() && landRules.getSpeedModifier(groundObj.rules.speedType) > 0) ||
            (groundObj.isInfantry() && groundObj.stance === StanceTypeModule.StanceType.Paradrop)
          ) {
            if (groundObj.onBridge) {
              groundObj.onBridge = false;
              groundObj.zone = ZoneTypeModule.getZoneType(landType);
            }
            for (const node of groundObj.moveTrait.reservedPathNodes) {
              if (node.onBridge === object) node.onBridge = undefined;
            }
            if (groundObj.moveTrait.currentWaypoint?.onBridge === object) {
              groundObj.moveTrait.currentWaypoint.onBridge = undefined;
            }
          } else {
            if (groundObj.isInfantry()) groundObj.infDeathType = InfDeathTypeModule.InfDeathType.None;
            world.destroyObject(groundObj, attackerInfo, true);
          }
        }
      });
    });
  }
}
