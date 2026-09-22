/**
 * SharedDetectCloakTrait — 共享反隐形侦测 trait（挂在世界）。
 *
 * 全局侦测器（Sensors/sensorArray + sensorsSight）进出/换格/电力恢复
 * 时刷新周边可隐形单位；每 tick 对已暴露未隐形单位再探测。
 * 命中敌方侦测器视野则 uncloak 并向雷达广播 GenericNonCombat 事件。
 *
 * 由 game/trait/SharedDetectCloakTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifyOwnerChangeModule from "game/trait/interface/NotifyOwnerChange"; // 已转换
import * as NotifySpawnModule from "game/trait/interface/NotifySpawn"; // 已转换
import * as NotifyTileChangeModule from "game/trait/interface/NotifyTileChange"; // 已转换
import * as NotifyUnspawnModule from "game/trait/interface/NotifyUnspawn"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import * as NotifyPowerModule from "game/trait/interface/NotifyPower"; // 已转换
import * as NotifyTickModule from "game/trait/interface/NotifyTick"; // 已转换
import { RadarTrait } from "game/trait/RadarTrait"; // 已转换
import { RadarEventType } from "game/rules/general/RadarRules"; // 未转换（any-shim）
import * as NotifyObjectTraitAddModule from "game/trait/interface/NotifyObjectTraitAdd"; // 未转换（any-shim）
import { CloakableTrait } from "game/gameobject/trait/CloakableTrait"; // 已转换
import { SensorsTrait } from "game/gameobject/trait/SensorsTrait"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import * as Box2Module from "game/math/Box2"; // 未转换（any-shim）
const { Box2 } = Box2Module as any;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SharedDetectCloakTrait {
  /** 全局侦测器集合。 */
  detectors: Set<any>;

  constructor() {
    this.detectors = new Set();
  }

  /** 出生：登记全局侦测器并刷新周边；对可隐形对象直接探测。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](obj: any, world: any): void {
    if (this.isGlobalDetector(obj)) {
      this.detectors.add(obj);
      this.updateAroundDetector(obj, world);
    }
    if (this.isCloakable(obj)) this.detect(obj, world);
  }

  /** 离场：移除全局侦测器。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](obj: any): void {
    if (obj.isTechno() && this.isGlobalDetector(obj)) this.detectors.delete(obj);
  }

  /** 换主：刷新周边并探测目标。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](obj: any, _old: any, world: any): void {
    if (this.isGlobalDetector(obj)) this.updateAroundDetector(obj, world);
    if (this.isCloakable(obj)) this.detect(obj, world);
  }

  /** 换格：刷新周边并探测。 */
  [NotifyTileChangeModule.NotifyTileChange.onTileChange](obj: any, world: any): void {
    if (this.isGlobalDetector(obj)) this.updateAroundDetector(obj, world);
    if (this.isCloakable(obj)) this.detect(obj, world);
  }

  /** 动态挂载 trait：Cloakable/Sensors 时立即生效。 */
  [NotifyObjectTraitAddModule.NotifyObjectTraitAdd.onAdd](
    obj: any,
    trait: any,
    world: any,
  ): void {
    if (!obj.isTechno()) return;
    if (trait instanceof CloakableTrait) {
      if (this.isCloakable(obj)) this.detect(obj, world);
    } else if (trait instanceof SensorsTrait && this.isGlobalDetector(obj)) {
      this.updateAroundDetector(obj, world);
    }
  }

  /** 低电：不处理（与孪生空实现一致）。 */
  [NotifyPowerModule.NotifyPower.onPowerLow](_player: any, _world: any): void {}

  /** 电力恢复：刷新该玩家已通电的全局侦测器周边。 */
  [NotifyPowerModule.NotifyPower.onPowerRestore](player: any, world: any): void {
    const powered = [...this.detectors].filter(
      (d) => d.owner === player && d.isBuilding() && d.poweredTrait,
    );
    this.updateAroundDetectors(powered, world);
  }

  /** 电力变化：不处理（与孪生空实现一致）。 */
  [NotifyPowerModule.NotifyPower.onPowerChange](_player: any, _world: any): void {}

  /** 每 tick：对未隐形的可隐形单位再探测一次。 */
  [NotifyTickModule.NotifyTick.onTick](world: any): void {
    for (const player of world.getCombatants()) {
      for (const obj of player.getOwnedObjects()) {
        if (obj.cloakableTrait && !obj.cloakableTrait.isCloaked()) this.detect(obj, world);
      }
    }
  }

  /** 批量刷新多个侦测器周边。 */
  updateAroundDetectors(detectors: any[], world: any): void {
    const seen = new Set<any>();
    for (const det of detectors) {
      for (const techno of this.findTechnosAroundDetector(det, world)) seen.add(techno);
    }
    for (const techno of seen) {
      if (this.isCloakable(techno)) this.detect(techno, world);
    }
  }

  /** 刷新单侦测器周边。 */
  updateAroundDetector(detector: any, world: any): void {
    for (const techno of this.findTechnosAroundDetector(detector, world)) {
      if (this.isCloakable(techno)) this.detect(techno, world);
    }
  }

  /** 视野方框内 techno 查询。 */
  findTechnosAroundDetector(detector: any, world: any): any[] {
    const foundation = detector.getFoundation();
    const pad = Math.max(foundation.width, foundation.height);
    const range = detector.rules.sensorsSight + pad;
    const min = new Vector2(detector.tile.rx, detector.tile.ry).addScalar(-range);
    const max = new Vector2(detector.tile.rx, detector.tile.ry).addScalar(range);
    return world.map.technosByTile.queryRange(new Box2Module.Box2(min, max));
  }

  /** 对目标尝试反隐：敌方侦测器在视距内则 uncloak + 雷达事件。 */
  detect(target: any, world: any): void {
    const helper = new RangeHelperModule.RangeHelper(world.map.tileOccupation);
    for (const det of this.detectors) {
      if (world.areFriendly(det, target)) continue;
      const sight = det.rules.sensorsSight;
      if (det.isBuilding() && det.poweredTrait && !det.poweredTrait.isPoweredOn()) continue;
      if (helper.tileDistance(target, det.tile) > sight) continue;
      const wasCloaked = target.cloakableTrait?.isCloaked();
      target.cloakableTrait.uncloak(world);
      if (wasCloaked) {
        for (const player of [det.owner, ...world.alliances.getAllies(det.owner)]) {
          world.traits
            .get(RadarTrait)
            .addEventForPlayer(RadarEventType.GenericNonCombat, player, target.tile, world);
        }
      }
      break;
    }
  }

  /** 是否为全局侦测器（Sensors 或 SensorArray 且有 sensorsSight）。 */
  isGlobalDetector(obj: any): boolean {
    return !(
      !obj.isTechno() ||
      (!obj.sensorsTrait && !obj.rules.sensorArray) ||
      !obj.rules.sensorsSight
    );
  }

  /** 是否可隐形对象。 */
  isCloakable(obj: any): boolean {
    return obj.isTechno() && !!obj.cloakableTrait;
  }
}
