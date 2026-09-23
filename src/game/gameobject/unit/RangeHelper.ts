/**
 * RangeHelper — 射程判定（建筑占位扩展、高低差、飞行/地面/格子三种算法）。
 *
 * isInWeaponRange：先算 limboLaunch 高差排除，再 computeWeaponRangeVsTarget
 * 得 {minRange, range}；按 cellRangefinding / 飞行单位 / 地面三种路径判定。
 * computeWeaponRangeVsTarget：对建筑取 foundation 补偿（非弧线弹）；
 * subjectToElevation 时高打低加 elevationModel 加成；对空弹+发射者有
 * airRangeBonus 时对 Air 目标加成。
 * distance3/distance2：实体→worldPosition、Vector→自身、tile→tile 中心换算。
 * isInTileRange：目标为单位时用其 mapPosition（lepton→tile），否则 tileDistance
 * （占位多格取最近对）；再 isBetween(min, max)。
 *
 * 由 game/gameobject/unit/RangeHelper.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as CoordsModule from "game/Coords"; // 已转换
import * as math from "util/math"; // 已转换
import * as ZoneTypeModule from "game/gameobject/unit/ZoneType"; // 已转换
import * as MovementZoneModule from "game/type/MovementZone"; // 已转换
import * as Vector2Module from "game/math/Vector2"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 是否为「有 position 的实体」。 */
const hasPosition = (o: any): boolean => void 0 !== o.position;
/** 是否为 Vector2 风格（有 addScalar）。 */
const isVec = (o: any): boolean => void 0 !== o.addScalar;

export class RangeHelper {
  /** tile 占位管理器（算多格占位时用）。 */
  tileOccupation: any;

  constructor(tileOccupation: any) {
    this.tileOccupation = tileOccupation;
  }

  /**
   * 武器射程判定（含 limboLaunch 高差、建筑/ elevation/对空加成）。
   * @param shooter 发射者（实体或 tile/坐标）
   * @param target 目标
   * @param weapon 武器（含 rules / warhead / minRange / range）
   * @param rules 世界规则（elevationModel 等）
   * @param originOverride 可选：用作 shooter 位置的另一实体（limbo 语义）
   */
  isInWeaponRange(shooter: any, target: any, weapon: any, rules: any, originOverride?: any): boolean {
    const from = originOverride ?? shooter;
    if (
      weapon.rules.limboLaunch &&
      Math.abs(
        (hasPosition(from) ? from.position.tileElevation + from.tile.z : from.z) -
          (hasPosition(target) ? target.position.tileElevation + target.tile.z : target.z),
      ) > 2
    )
      return false;
    const { minRange, range } = this.computeWeaponRangeVsTarget(from, target, weapon, rules);
    return weapon.rules.cellRangefinding
      ? this.isInTileRange(from, target, minRange, range)
      : shooter.isUnit() && shooter.rules.movementZone === MovementZoneModule.MovementZone.Fly
        ? this.isInRange2(from, target, minRange, range)
        : this.isInRange3(from, target, minRange, range);
  }

  /**
   * 计算武器对目标的有效射程（建筑占位 / 高差 / 对空加成叠加到 range）。
   * @returns { minRange, range }
   */
  computeWeaponRangeVsTarget(shooter: any, target: any, weapon: any, rules: any): { minRange: number; range: number } {
    let bonus = 0;
    // 孪生：建筑且非弧线/非垂直 → (ivanBomb && 占位和>2) || (s += (w+h)/4)
    // 即：ivan 大建筑不加成；其余加 (w+h)/4
    if (hasPosition(target) && target.isBuilding() && !weapon.projectileRules.arcing && !weapon.projectileRules.vertical) {
      const foundation = target.getFoundation();
      if (!(weapon.warhead.rules.ivanBomb && foundation.width + foundation.height > 2))
        bonus += (foundation.width + foundation.height) / 4;
    }
    if (weapon.projectileRules.subjectToElevation && !(weapon.projectileRules.arcing && !hasPosition(target))) {
      const fromZ = hasPosition(shooter) ? shooter.tile.z + shooter.tileElevation : shooter.z;
      const toZ = hasPosition(target) ? target.tile.z + target.tileElevation : target.z;
      if (toZ < fromZ) bonus += rules.elevationModel.getBonus(fromZ, toZ);
    }
    if (
      weapon.projectileRules.isAntiAir &&
      hasPosition(shooter) &&
      shooter.isTechno() &&
      hasPosition(target) &&
      target.isUnit() &&
      target.zone === ZoneTypeModule.ZoneType.Air
    )
      bonus += shooter.rules.airRangeBonus;
    return { minRange: weapon.minRange, range: weapon.range + bonus };
  }

  /** 通用射程判定：byTile=true 走格子；否则飞行走 distance2、地面 distance3。 */
  isInRange(shooter: any, target: any, minRange: number, range: number, byTile = false): boolean {
    return byTile
      ? this.isInTileRange(shooter, target, minRange, range)
      : shooter.isUnit() && shooter.rules.movementZone === MovementZoneModule.MovementZone.Fly
        ? this.isInRange2(shooter, target, minRange, range)
        : this.isInRange3(shooter, target, minRange, range);
  }

  /** 三维距离（lepton），转 tile 单位后 isBetween。 */
  isInRange3(shooter: any, target: any, minRange: number, range: number): boolean {
    return math.isBetween(this.distance3(shooter, target) / CoordsModule.Coords.LEPTONS_PER_TILE, minRange, range);
  }

  /** 平面距离（lepton），转 tile 单位后 isBetween。 */
  isInRange2(shooter: any, target: any, minRange: number, range: number): boolean {
    return math.isBetween(this.distance2(shooter, target) / CoordsModule.Coords.LEPTONS_PER_TILE, minRange, range);
  }

  /** 三维世界距离：实体→worldPosition、Vector→自身、tile→tile 中心 world。 */
  distance3(a: any, b: any): number {
    const pa = hasPosition(a)
      ? a.position.worldPosition
      : isVec(a)
        ? a
        : CoordsModule.Coords.tile3dToWorld(a.rx + 0.5, a.ry + 0.5, a.z);
    const pb = hasPosition(b)
      ? b.position.worldPosition
      : isVec(b)
        ? b
        : CoordsModule.Coords.tile3dToWorld(b.rx + 0.5, b.ry + 0.5, b.z);
    return pa.distanceTo(pb);
  }

  /** 平面（x/z）距离：实体→Vector2(x,z)、Vector→(x,z)、tile→中心×LPT。 */
  distance2(a: any, b: any): number {
    const pa = hasPosition(a)
      ? new Vector2Module.Vector2(a.position.worldPosition.x, a.position.worldPosition.z)
      : isVec(a)
        ? new Vector2Module.Vector2(a.x, a.z)
        : new Vector2Module.Vector2(a.rx + 0.5, a.ry + 0.5).multiplyScalar(CoordsModule.Coords.LEPTONS_PER_TILE);
    const pb = hasPosition(b)
      ? new Vector2Module.Vector2(b.position.worldPosition.x, b.position.worldPosition.z)
      : isVec(b)
        ? new Vector2Module.Vector2(b.x, b.z)
        : new Vector2Module.Vector2(b.rx + 0.5, b.ry + 0.5).multiplyScalar(CoordsModule.Coords.LEPTONS_PER_TILE);
    return pa.distanceTo(pb);
  }

  /** 格子射程：非数组目标且是单位 → tile 中心到其 mapPosition（/LPT）；否则 tileDistance。 */
  isInTileRange(shooter: any, target: any, minRange: number, range: number): boolean {
    let dist: number;
    if (!Array.isArray(shooter) && hasPosition(target) && target.isUnit()) {
      const tile = hasPosition(shooter) ? shooter.tile : shooter;
      dist = new Vector2Module.Vector2(tile.rx + 0.5, tile.ry + 0.5).distanceTo(
        target.position.getMapPosition().multiplyScalar(1 / CoordsModule.Coords.LEPTONS_PER_TILE),
      );
    } else dist = this.tileDistance(shooter, target);
    return math.isBetween(dist, minRange, range);
  }

  /** 多格占位的最近格对距离（tile 中心 Vector2 欧氏距离，取最小）。 */
  tileDistance(a: any, b: any): number {
    const tilesA = hasPosition(a) ? this.tileOccupation.calculateTilesForGameObject(a.tile, a) : Array.isArray(a) ? a : [a];
    const tilesB = hasPosition(b) ? this.tileOccupation.calculateTilesForGameObject(b.tile, b) : Array.isArray(b) ? b : [b];
    const va = new Vector2Module.Vector2();
    const vb = new Vector2Module.Vector2();
    let min = Number.POSITIVE_INFINITY;
    for (const ta of tilesA)
      for (const tb of tilesB) {
        va.set(ta.rx, ta.ry);
        vb.set(tb.rx, tb.ry);
        const d = va.distanceTo(vb);
        if (d <= min) min = d;
      }
    return min;
  }
}
