/**
 * SharedDetectDisguiseTrait — 共享伪装检测 trait（挂在玩家上）。
 *
 * 汇总本方（及盟友共享）的反伪装探测器，对范围内伪装单位执行
 * detect/undetect：
 *  - 全局探测器（detectDisguiseRange>0）spawn/unspawn/换主/移动时
 *    刷新周围可伪装单位；
 *  - 低电力时过滤掉断电的建筑探测器；电力恢复刷新全部；
 *  - detect：对每个非友方探测器，若距离内且供电正常，把目标加入
 *    探测者及其盟友的 sharedDetectDisguiseTrait；
 *  - undetect：从全部 combatant 的 sharedDetectDisguiseTrait 移除。
 *
 * 由 game/trait/SharedDetectDisguiseTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifyOwnerChangeModule from "game/trait/interface/NotifyOwnerChange"; // 本组新写
import * as NotifySpawnModule from "game/trait/interface/NotifySpawn"; // 孪生
import * as NotifyTileChangeModule from "game/trait/interface/NotifyTileChange"; // 已转换
import * as NotifyUnspawnModule from "game/trait/interface/NotifyUnspawn"; // 孪生
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import * as NotifyPowerModule from "game/trait/interface/NotifyPower"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 孪生
import * as Box2Module from "game/math/Box2"; // 未转换（any-shim）
const { Box2 } = Box2Module as any;

export class SharedDetectDisguiseTrait {
  /** 全局反伪装探测器集合。 */
  readonly detectors: Set<any>;

  constructor() {
    this.detectors = new Set();
  }

  /** 出生：登记全局探测器并刷新周围；可伪装对象则立刻 detect。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any): void {
    if (this.isGlobalDetector(object)) {
      this.detectors.add(object);
      this.updateAroundDetector(object, world);
    }
    if (this.isDisguisable(object)) this.detect(object, world);
  }

  /** 离场：注销探测器并刷新周围；可伪装对象 undetect。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any, world: any): void {
    if (!object.isTechno()) return;
    if (this.isGlobalDetector(object)) {
      this.detectors.delete(object);
      this.updateAroundDetector(object, world);
    }
    if (this.isDisguisable(object)) this.undetect(object, world);
  }

  /** 换主：刷新探测器周围；可伪装对象先 undetect 再 detect。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](
    object: any,
    _oldOwner: any,
    world: any,
  ): void {
    if (this.isGlobalDetector(object)) this.updateAroundDetector(object, world);
    if (this.isDisguisable(object)) {
      this.undetect(object, world);
      this.detect(object, world);
    }
  }

  /** 移动：先用旧 tile 再用新 tile 刷新；可伪装对象重新 detect。 */
  [NotifyTileChangeModule.NotifyTileChange.onTileChange](
    object: any,
    world: any,
    oldTile: any,
  ): void {
    if (this.isGlobalDetector(object)) {
      this.updateAroundDetector(object, world, oldTile);
      this.updateAroundDetector(object, world);
    }
    if (this.isDisguisable(object)) {
      this.undetect(object, world);
      this.detect(object, world);
    }
  }

  /** 进入低电力：刷新该玩家断电建筑探测器周围。 */
  [NotifyPowerModule.NotifyPower.onPowerLow](player: any, world: any): void {
    const list = [...this.detectors].filter(
      (d) =>
        d.owner === player &&
        d.isBuilding() &&
        d.poweredTrait &&
        !d.poweredTrait.isPoweredOn(),
    );
    this.updateAroundDetectors(list, world);
  }

  /** 电力恢复：刷新该玩家全部建筑探测器周围。 */
  [NotifyPowerModule.NotifyPower.onPowerRestore](player: any, world: any): void {
    const list = [...this.detectors].filter(
      (d) => d.owner === player && d.isBuilding() && d.poweredTrait,
    );
    this.updateAroundDetectors(list, world);
  }

  /** 电力数值变化：已在 Low/Restore 处理，空实现。 */
  [NotifyPowerModule.NotifyPower.onPowerChange](_player: any, _world: any): void {}

  /** 批量刷新多个探测器周围（去重后 detect/undetect）。 */
  updateAroundDetectors(detectors: any[], world: any): void {
    const seen = new Set();
    for (const d of detectors) {
      for (const t of this.findTechnosAroundDetector(d, world, d.tile)) seen.add(t);
    }
    for (const t of seen) {
      if (this.isDisguisable(t)) {
        this.undetect(t, world);
        this.detect(t, world);
      }
    }
  }

  /** 刷新单个探测器周围（origin 默认当前 tile）。 */
  updateAroundDetector(detector: any, world: any, origin = detector.tile): void {
    for (const t of this.findTechnosAroundDetector(detector, world, origin)) {
      if (this.isDisguisable(t)) {
        this.undetect(t, world);
        this.detect(t, world);
      }
    }
  }

  /**
   * 在探测器周围 detectDisguiseRange+地基半宽 范围内查 technos。
   * 用 Vector2±range 构造 Box2 交给 technosByTile.queryRange。
   */
  findTechnosAroundDetector(detector: any, world: any, origin: any): any[] {
    const foundation = detector.getFoundation();
    const half = Math.max(foundation.width, foundation.height);
    const range = detector.rules.detectDisguiseRange + half;
    const min = new Vector2(origin.rx, origin.ry).addScalar(-range);
    const max = new Vector2(origin.rx, origin.ry).addScalar(range);
    return world.map.technosByTile.queryRange(new Box2(min, max));
  }

  /**
   * 检测伪装：对每个非友方探测器，若供电正常且距离 ≤ range，
   * 把目标加入该探测者及其盟友的 sharedDetectDisguiseTrait。
   */
  detect(object: any, world: any): void {
    const owners = new Set<any>();
    const helper = new RangeHelperModule.RangeHelper(world.map.tileOccupation);
    for (const detector of this.detectors) {
      if (world.areFriendly(detector, object)) continue;
      const owner = detector.owner;
      const range = detector.rules.detectDisguiseRange;
      if (owners.has(owner)) continue;
      if (detector.isBuilding() && detector.poweredTrait && !detector.poweredTrait.isPoweredOn()) {
        continue;
      }
      if (helper.tileDistance(object, detector.tile) <= range) {
        for (const p of [owner, ...world.alliances.getAllies(owner)]) owners.add(p);
      }
    }
    for (const owner of owners) owner.sharedDetectDisguiseTrait?.add(object);
  }

  /** 从全部 combatant 的 sharedDetectDisguiseTrait 移除该对象。 */
  undetect(object: any, world: any): void {
    for (const player of world.getCombatants()) {
      player.sharedDetectDisguiseTrait?.delete(object);
    }
  }

  /** 是否全局探测器：Techno 且 detectDisguiseRange>0。 */
  isGlobalDetector(object: any): boolean {
    return !!object.isTechno() && !!object.rules.detectDisguiseRange;
  }

  /** 是否可伪装对象：步兵/载具且挂了 disguiseTrait。 */
  isDisguisable(object: any): boolean {
    if (!object.isInfantry() && !object.isVehicle()) return false;
    return !!object.disguiseTrait;
  }
}
