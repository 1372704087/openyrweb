/**
 * MoveInWeaponRangeTask — 接近至武器射程任务（攻击走位子任务）。
 *
 * 继承 MoveTask，由 AttackTask 挂载：把单位移动到能打到目标的位置。
 * 在通用移动之上叠加武器语义：
 *  - 目的地解析：GameObject 目标取中心格（建筑）或所在格，其余直接用；
 *  - onStart：建筑目标重定向到周边可站格（防扎堆，crushMode 除外——
 *    碾压必须开上目标本体格触发 MoveTrait 碾压）；吸血武器强制对中
 *    建筑中心格（碟形放电条件）；
 *  - 最小射程重定位（recalcMinRange）：站得太近时用 bresenham 找一个
 *    既在射程带内又有视线的新落点（Chrono 移动器特殊处理）；
 *  - 战斗机蛇形接近（OpenYRWeb）：每机独立的随机侧偏与摆动相位，
 *    幅度随接近收敛，投弹后直线返回出口/基地后方点；
 *  - 轰炸机动（isBombingRun）：弹道 ROT<=1 的飞机投弹后沿 bresenham
 *    反向找机动格飞过去再返航（bomberManeuverTile 状态机）；
 *  - crushMode：开上可碾压目标的自身格（ignoredBlockers 放行目标本体）。
 *
 * STRAFE_CLOSE_ENOUGH=2：战机蛇形时"足够近"的格距阈值（模块级导出，
 * 与孪生一致对外可见）。
 *
 * 由 game/gameobject/task/move/MoveInWeaponRangeTask.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { GameObject } from "game/gameobject/GameObject"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { Coords } from "game/Coords"; // 已转换
import * as LosHelperModule from "game/gameobject/unit/LosHelper"; // 未转换（any-shim）
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { MoveState } from "game/gameobject/trait/MoveTrait"; // 已转换
import * as RandomTileFinderModule from "game/map/tileFinder/RandomTileFinder"; // 未转换（any-shim）
import { LocomotorType } from "game/type/LocomotorType"; // 已转换
import * as bresenhamModule from "util/bresenham"; // 未转换（any-shim）
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换

/** 战机蛇形接近的"足够近"格距阈值。 */
export const STRAFE_CLOSE_ENOUGH = 2;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveInWeaponRangeTask extends MoveTask {
  /** 攻击目标（GameObject 或 tile）。 */
  target: any;
  /** 使用的武器（射程/弹道参数的来源）。 */
  weapon: any;
  /** OpenYRWeb：碾压模式——开上目标本体格而非停在射程。 */
  crushMode: boolean;
  recalcMinRange: boolean;
  cancelRequested: boolean;
  /** OpenYRWeb：战机已开火 → 停止无限蛇形，当前跑位飞完即收。 */
  runCompleted: boolean;
  bomberInitialLock: boolean;
  rangeHelper: any;
  losHelper: any;
  /** 轰炸机动格（投弹后先飞向的tile），存在时 cancel 延迟生效。 */
  bomberManeuverTile: any;
  /** 机动结束后的排队员目标 tile。 */
  bomberQueuedTargetTile: any;
  /** 蛇形接近的每机随机侧偏与摆动相位（首 tick 惰性初始化）。 */
  _strafeTargetOffset: any;
  _strafePhase: number;

  constructor(game: any, target: any, toBridge: any, weapon: any, crushMode = false) {
    super(
      game,
      (target as any) instanceof GameObject ? ((target as any).isBuilding() ? (target as any).centerTile : (target as any).tile) : target,
      toBridge,
      {
        // OpenYRWeb：碾压攻击要开上可碾压目标的本体格，移动路径校验
        // 也必须把目标放行为非阻断（读 options.ignoredBlockers 而非
        // pathFinderIgnoredBlockers）——否则目标格在最后接近段过不了
        // 通行检查，走位永远重规划，碾压单位停在旁边既不碾也不打。
        // 普通攻击停在射程外不会走到这一步，只有 crushMode 需要够到
        // 目标格本身。
        ignoredBlockers: crushMode && (target as any) instanceof GameObject && 0 < weapon.range ? [target] : undefined,
        pathFinderIgnoredBlockers: (target as any) instanceof GameObject && 0 < weapon.range ? [target] : undefined,
      },
    );
    this.target = target;
    this.weapon = weapon;
    // OpenYRWeb：碾压模式——必须开到受害者格上（贴近/同格）让
    // MoveTrait 的碾压生效，而不是停在射程边缘。
    this.crushMode = crushMode;
    this.recalcMinRange = true;
    this.cancelRequested = false;
    // OpenYRWeb：战机打完最后一发时置位——停止无限蛇形改目标，
    // 让当前跑位自然飞完并自行返航。
    this.runCompleted = false;
    this.bomberInitialLock = false;
    this.rangeHelper = new RangeHelperModule.RangeHelper(game.map.tileOccupation);
    this.losHelper = new LosHelperModule.LosHelper(game.map.tiles, game.map.tileOccupation);
  }

  /**
   * 启动：建筑目标（非飞行、非碾压）重定向到周边一格的可站位置
   * （径向 1~5 格，可通行且高差 <2，距中心超过 √2 才值得挪）；
   * 吸血武器则强制对中建筑中心格；之后交父类启动移动。
   */
  onStart(object: any): void {
    const target = this.target;
    const map = this.game.map;
    // OpenYRWeb：碾压模式必须开上可碾压建筑的本体格触发碾压——
    // 绝不能把目的地改到建筑旁边的格（那正是碾压单位停在墙边
    // 既不碾也不打的原因）。
    if ((target as any) instanceof GameObject && (target as any).isBuilding() && object.rules.movementZone !== MovementZone.Fly && !this.crushMode) {
      const centerTile = target.tile;
      const foundation = target instanceof GameObject ? target.getFoundation() : { width: 1, height: 1 };
      const nearbyTile = new RadialTileFinder(
        map.tiles,
        map.mapBounds,
        centerTile,
        foundation,
        1,
        5,
        (tile: any) =>
          0 < map.terrain.getPassableSpeed(tile, object.rules.speedType, object.isInfantry(), false) &&
          Math.abs(tile.z - centerTile.z) < 2,
      ).getNextTile();
      if (nearbyTile && this.rangeHelper.tileDistance(target, nearbyTile) > Math.SQRT2) {
        this.updateTarget(nearbyTile, false);
      }
    }
    // OpenYRWeb：吸血武器打建筑——永远对中 centerTile（碟必须悬停在
    // 建筑中心正上方才开火，AttackTask Firing 态也会强制此条件）。
    // DiskLaser / 普通气球悬浮走标准接近路径（接近到射程→完成→
    // AttackTask 取消走位并开火），与坦克/光棱一致。
    this.bomberInitialLock = this.isCloseEnoughToDest(object, object.tile);
    if (
      this.weapon.rules.drainWeapon &&
      (target as any) instanceof GameObject &&
      (target as any).isBuilding() &&
      (object.tile.rx !== (target as any).centerTile.rx || object.tile.ry !== (target as any).centerTile.ry)
    ) {
      this.updateTarget((target as any).centerTile, (target as any) instanceof GameObject && !!(target as any).onBridge);
    }
    super.onStart(object);
  }

  /**
   * 沿"目标→自身"方向找射程内的接近点（几何直线法）：
   * 距离 ≤ 射程或重合 → 无需接近（null）；否则取 (射程-1) 处的点
   * （留 1 格余量防整数取整导致 isInWeaponRange 误判）。
   */
  findRangeApproachTile(fromTile: any, targetTile: any): any {
    const dx = targetTile.rx - fromTile.rx;
    const dy = targetTile.ry - fromTile.ry;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= this.weapon.range || distance <= 0) return null;
    const approachRange = Math.max(1, this.weapon.range - 1);
    const ratio = approachRange / distance;
    const rx = Math.round(targetTile.rx - dx * ratio);
    const ry = Math.round(targetTile.ry - dy * ratio);
    const tile = this.game.map.tiles[rx] && this.game.map.tiles[rx][ry];
    return tile && this.game.map.isWithinBounds(tile) ? tile : null;
  }

  /** 取消：轰炸机动中先记"待取消"，机动完成后再真正取消。 */
  cancel(): void {
    if (this.bomberManeuverTile) {
      this.cancelRequested = true;
    } else {
      super.cancel();
    }
  }

  /** 是否战机蛇形攻击：飞行 + 飞机移动器 + fighter + 弹道可转向。 */
  shouldAirStrafe(object: any): boolean {
    return (
      object.rules.movementZone === MovementZone.Fly &&
      object.rules.locomotor === LocomotorType.Aircraft &&
      object.rules.fighter &&
      1 < this.weapon.projectileRules.iniRot
    );
  }

  /** 是否轰炸跑位：飞行 + 飞机移动器 + 弹道直線（ROT<=1）。 */
  isBombingRun(object: any): boolean {
    return (
      object.rules.movementZone === MovementZone.Fly &&
      object.rules.locomotor === LocomotorType.Aircraft &&
      this.weapon.projectileRules.iniRot <= 1
    );
  }

  /** 蛇形时"足够近"：距目标 tile < min(射程, 2)。 */
  isAirStrafeCloseEnough(object: any): boolean {
    return this.rangeHelper.tileDistance(object, this.targetTile) < Math.min(this.weapon.range, 2);
  }

  /** 轰炸机动后能否返航：无机动格，或已飞到机动格 1 格内。 */
  bomberCanReturn(tile: any): boolean {
    return !this.bomberManeuverTile || this.rangeHelper.tileDistance(tile, this.bomberManeuverTile) <= 1;
  }

  /** 在射程内随机找一个蛇形射击点。 */
  findStrafeDestination(object: any, fromTile: any): any {
    const finder = new RandomTileFinderModule.RandomTileFinder(
      this.game.map.tiles,
      this.game.map.mapBounds,
      fromTile,
      this.weapon.range,
      this.game,
      (tile: any) => this.rangeHelper.isInWeaponRange(object, fromTile, this.weapon, this.game.rules, tile),
    );
    return finder.getNextTile();
  }

  /**
   * 到达判定：战机未完成跑位且还有弹药时不许"中途到达"（否则走位
   * 子任务提前结束，AttackTask 弹尽路径没有可改向的任务，飞机会直线
   * 返航而不是蛇形回摆）；跑位完成后正常判定。
   */
  hasReachedDestination(object: any): boolean {
    if (this.shouldAirStrafe(object) && !this.runCompleted && (object.ammo || 0) > 0) return false;
    return super.hasReachedDestination(object) || this.canStopAtTile(object, object.tile, object.onBridge);
  }

  /**
   * 停驻判定：
   *  - 地面单位不能停在目标占用格上（OpenYRWeb：碾压单位除外——它
   *    开上受害者本体验碾压）；目标是移动中的同 subcell 单位也不停；
   *  - 地面单位走父类通用停驻检查；空中单位检查同格静止飞机数；
   *  - 轰炸跑位必须能返航；非取消状态下必须真的"足够接近"。
   */
  canStopAtTile(object: any, tile: any, onBridge: any): boolean {
    if (
      object.zone !== ZoneType.Air &&
      (this.target as any) instanceof GameObject &&
      // OpenYRWeb：碾压单位（战斗要塞）可以停在可碾压目标身上——
      // 开上去碾，而不是停在半路。
      !object.canCrushObject(this.target) &&
      this.game.map.tileOccupation.isTileOccupiedBy(tile, this.target) &&
      (!this.target.isUnit() ||
        (this.target.tile === tile &&
          this.target.moveTrait.moveState !== MoveState.Moving &&
          this.target.position.subCell === object.position.subCell))
    ) {
      return false;
    }
    if (object.zone !== ZoneType.Air) {
      if (!super.canStopAtTile(object, tile, onBridge)) return false;
    } else if (
      this.game.map.tileOccupation
        .getAirObjectsOnTile(tile)
        .filter((obj: any) => obj.isUnit() && obj.moveTrait.moveState !== MoveState.Moving && obj !== object).length
    ) {
      return false;
    }
    return (
      !(this.isBombingRun(object) && !this.bomberCanReturn(tile)) &&
      (!!this.isCancelling() || this.isCloseEnoughToDest(object, tile))
    );
  }

  /**
   * 足够接近判定（武器语义）：
   *  - crushMode：站上目标格（距离 ≤0.5）才算；
   *  - 跑位已完成的战机：距目的地 ≤1 格即可（不再查射程）；
   *  - 吸血武器打建筑（气球悬浮非 hoverAttack）：必须在中格且有视线；
   *  - cellRangefinding 或非步兵：直接 isInWeaponRange + 视线；
   *  - 步兵：按 subcell/tile 偏移计算三维距离（isInRange3/2）+ 视线。
   */
  isCloseEnoughToDest(object: any, tile: any): boolean {
    // OpenYRWeb：碾压模式——站上受害者格才算（MoveTrait 在进格时碾压）。
    if (this.crushMode) return this.rangeHelper.tileDistance(tile, this.targetTile) <= 0.5;
    // OpenYRWeb：战机跑位已结束（已开火）——只需到达目的地格。
    if (this.runCompleted && !this.isBombingRun(object)) return this.rangeHelper.tileDistance(tile, this.targetTile) <= 1;
    // OpenYRWeb：吸血武器打建筑——只有中格才算（AttackTask Firing 亦强制）。
    if (this.weapon.rules.drainWeapon && this.target?.isBuilding?.() && object.rules.balloonHover && !object.rules.hoverAttack) {
      return (
        tile.rx === this.target.centerTile.rx &&
        tile.ry === this.target.centerTile.ry &&
        this.losHelper.hasLineOfSight(tile, this.target, this.weapon)
      );
    }
    if (this.weapon.rules.cellRangefinding || !object.isInfantry()) {
      return (
        this.rangeHelper.isInWeaponRange(object, this.target, this.weapon, this.game.rules, tile) &&
        this.losHelper.hasLineOfSight(tile, this.target, this.weapon)
      );
    }
    // 步兵：按 subcell（空中）或 tile 偏移计算三维精确距离。
    const offset =
      object.zone === ZoneType.Air
        ? object.position.computeSubCellOffset(object.position.desiredSubCell)
        : object.position.getTileOffset();
    const { minRange, range } = this.rangeHelper.computeWeaponRangeVsTarget(tile, this.target, this.weapon, this.game.rules);
    const pos = Coords.tile3dToWorld(
      tile.rx + offset.x / Coords.LEPTONS_PER_TILE,
      tile.ry + offset.y / Coords.LEPTONS_PER_TILE,
      tile.z + object.position.tileElevation,
    );
    return (
      (object.isUnit() && object.rules.movementZone === MovementZone.Fly
        ? this.rangeHelper.isInRange2(pos, this.target, minRange, range)
        : this.rangeHelper.isInRange3(pos, this.target, minRange, range)) &&
      this.losHelper.hasLineOfSight(tile, this.target, this.weapon)
    );
  }

  /** 迁就落点：飞行单位随机找一个"足够接近"的格；地面走父类。 */
  findRelocationTile(fromTile: any, fromBridge: any, object: any): any {
    if (object.rules.movementZone !== MovementZone.Fly) return super.findRelocationTile(fromTile, fromBridge, object);
    const map = this.game.map;
    const finder = new RandomTileFinderModule.RandomTileFinder(
      map.tiles,
      map.mapBounds,
      fromTile,
      1,
      this.game,
      (tile: any) => this.isCancelling() || this.isCloseEnoughToDest(object, tile),
    );
    return finder.getNextTile();
  }

  /** 改目标：轰炸机动中排队；否则立即更新并重置最小射程重定位。 */
  retarget(target: any, toBridge: any): void {
    const tile = (target as any) instanceof GameObject ? ((target as any).isBuilding() ? (target as any).centerTile : (target as any).tile) : target;
    if (this.bomberManeuverTile) {
      this.bomberQueuedTargetTile = tile;
    } else {
      this.updateTarget(tile, toBridge);
      this.recalcMinRange = true;
    }
    this.target = target;
    if (this.options?.ignoredBlockers) {
      this.options.ignoredBlockers = (target as any) instanceof GameObject ? [target] : undefined;
    }
    this.options ?? (this.options = {});
    this.options.pathFinderIgnoredBlockers = (target as any) instanceof GameObject ? [target] : undefined;
  }

  /**
   * OpenYRWeb：战机跑位收尾——已开火，停止无限蛇形改目标，并在仍在
   * 移动时转向下一个目的地（机翼保持压坡，不会减速急停后猛转）：
   *  - 空袭米格改道出口 tile 直线飞离；
   *  - 其他战机绕到目标后方的点返航。
   */
  completeRun(object: any, target: any, exitTile: any): void {
    if (this.runCompleted) return;
    this.runCompleted = true;
    // 抑制下一 tick 的最小射程重定位（否则会把飞机重新拉回射程内，
    // 抵消出口/返航改道）。
    this.recalcMinRange = false;
    // 弹道 ROT<=1 的战机自己管理轰炸机动——不动它的目的地。
    if (this.isBombingRun(object)) return;
    this.options = this.options || {};
    if (exitTile) {
      this.options.allowOutOfBoundsTarget = true;
      this.updateTarget(exitTile, false);
      return;
    }
    const targetTile = (target as any) instanceof GameObject ? ((target as any).isBuilding() ? (target as any).centerTile : (target as any).tile) : target;
    const planePos = object.position.getMapPosition();
    const dir = new Vector2(targetTile.rx + 0.5, targetTile.ry + 0.5)
      .clone()
      .multiplyScalar(Coords.LEPTONS_PER_TILE)
      .sub(planePos);
    const len = dir.length();
    // 指向目标身后一点（与飞行方向相反）：飞机绕着它压坡转向返航。
    if (len) dir.setLength(Coords.LEPTONS_PER_TILE);
    else dir.copy(FacingUtilModule.FacingUtil.toMapCoords(object.direction)).multiplyScalar(-Coords.LEPTONS_PER_TILE);
    const dest = new Vector2(targetTile.rx + 0.5, targetTile.ry + 0.5)
      .clone()
      .multiplyScalar(Coords.LEPTONS_PER_TILE)
      .sub(dir);
    const size = this.game.map.tiles.getMapSize();
    dest.x = Math.max(0, Math.min(Math.floor(dest.x / Coords.LEPTONS_PER_TILE), size.width - 1));
    dest.y = Math.max(0, Math.min(Math.floor(dest.y / Coords.LEPTONS_PER_TILE), size.height - 1));
    const tile = this.game.map.tiles.getByMapCoords(dest.x, dest.y) ?? this.game.map.tiles.getPlaceholderTile(dest.x, dest.y);
    this.updateTarget(tile, false);
  }

  onTick(object: any): boolean {
    // OpenYRWeb：crushMode 直线开上受害者——不做最小射程重定位
    // （否则会把碾压单位从可碾压目标上拉走）。
    if (this.recalcMinRange && !this.crushMode) {
      this.recalcMinRange = false;
      const minRangeTile = this.findMinRangeRelocationTile(object, this.targetTile);
      if (minRangeTile !== this.targetTile) {
        if (!minRangeTile) {
          this.cancel();
          return false;
        }
        this.updateTarget(minRangeTile, !!minRangeTile.onBridgeLandType);
      }
    }
    // OpenYRWeb：原版式蛇形接近——飞机不是一条直线飞向目标，目的地
    // 是目标点 + 横向正弦偏移（幅度随接近收敛），像 Z 字波一样反复
    // 调向、左右压坡、逐步逼近。投弹后直线返回基地方向的出口。
    if (this.shouldAirStrafe(object) && !this.isCancelling() && !this.runCompleted && (object.ammo || 0) > 0) {
      const strafeTarget =
        (this.target as any) instanceof GameObject ? ((this.target as any).isBuilding() ? (this.target as any).centerTile : (this.target as any).tile) : this.target;
      const planePos = object.position.getMapPosition();
      const targetPos = new Vector2(
        (strafeTarget.rx + 0.5) * Coords.LEPTONS_PER_TILE,
        (strafeTarget.ry + 0.5) * Coords.LEPTONS_PER_TILE,
      );
      // 每架飞机瞄自己的点——随机侧偏与独立摆动相位，多机编队不会
      // 收敛到同一点；每架米格从自己的方向进入。
      if (undefined === this._strafeTargetOffset) {
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDist = (1 + Math.random() * 2) * Coords.LEPTONS_PER_TILE;
        this._strafeTargetOffset = new Vector2(Math.cos(offsetAngle), Math.sin(offsetAngle)).multiplyScalar(offsetDist);
        this._strafePhase = Math.random() * Math.PI * 2;
      }
      const weaveCenter = targetPos.clone().add(this._strafeTargetOffset);
      const weaveDiff = weaveCenter.sub(planePos);
      const weaveDist = weaveDiff.length();
      if (1 < weaveDist) {
        this._strafePhase += 0.08;
        const weaveLateral = new Vector2(-weaveDiff.y, weaveDiff.x)
          .normalize()
          .multiplyScalar(Math.sin(this._strafePhase) * Math.min(2.5, weaveDist * 0.35) * Coords.LEPTONS_PER_TILE);
        const weaveDest = targetPos.clone().add(this._strafeTargetOffset).add(weaveLateral);
        const weaveTile =
          this.game.map.tiles.getByMapCoords(
            Math.floor(weaveDest.x / Coords.LEPTONS_PER_TILE),
            Math.floor(weaveDest.y / Coords.LEPTONS_PER_TILE),
          ) || strafeTarget;
        this.updateTarget(weaveTile, false);
      } else {
        this.updateTarget(strafeTarget, false);
      }
    }
    // 轰炸跑位：投弹后（弹药尽/已开火/初始锁定）且无机动格 →
    // 沿 bresenham 反向找一个机动格先飞过去。
    if (
      this.isBombingRun(object) &&
      !this.isCancelling() &&
      (!object.ammo || this.weapon.getBurstsFired() || this.bomberInitialLock) &&
      !this.bomberManeuverTile
    ) {
      this.bomberInitialLock = false;
      const planePos = object.position.getMapPosition();
      let runTarget =
        (this.target as any) instanceof GameObject ? ((this.target as any).isBuilding() ? (this.target as any).centerTile : (this.target as any).tile) : this.target;
      const toTarget = new Vector2(runTarget.rx + 0.5, runTarget.ry + 0.5).clone().multiplyScalar(Coords.LEPTONS_PER_TILE).sub(planePos);
      let length = toTarget.length();
      if (!length) {
        toTarget.copy(FacingUtilModule.FacingUtil.toMapCoords(object.direction));
        length = Number.EPSILON;
      }
      const beyond = planePos.clone().add(toTarget.setLength(length + 7 * Coords.LEPTONS_PER_TILE));
      runTarget = beyond.multiplyScalar(1 / Coords.LEPTONS_PER_TILE).floor();
      const line = bresenhamModule.bresenham(runTarget.x, runTarget.y, object.tile.rx, object.tile.ry);
      if (!line.length) throw new Error("Bresenham returned no tiles");
      const linePoint = line[0];
      this.bomberManeuverTile =
        this.game.map.tiles.getByMapCoords(linePoint.x, linePoint.y) ?? this.game.map.tiles.getPlaceholderTile(linePoint.x, linePoint.y);
      this.options.allowOutOfBoundsTarget = true;
      this.updateTarget(this.bomberManeuverTile, false);
    }
    // 机动结束（能返航）→ 清机动格并恢复排队员目标；待取消生效。
    if (this.bomberManeuverTile && this.bomberCanReturn(object.tile)) {
      this.bomberManeuverTile = undefined;
      if (this.bomberQueuedTargetTile) {
        this.updateTarget(this.bomberQueuedTargetTile, false);
        this.recalcMinRange = true;
        this.bomberQueuedTargetTile = undefined;
      }
    }
    if (this.cancelRequested && !this.bomberManeuverTile) {
      // 机动已结束 → 待取消生效。
      this.cancelRequested = false;
      this.cancel();
    }
    // OpenYRWeb：气球悬浮不做中途硬停。碟形 DiskLaser 像坦克一样接近
    // 到射程（hasReachedDestination → 完成 → AttackTask 取消走位开火）；
    // 旧的射程边中途停会让碟徘徊；基洛夫（垂直投弹）必须持续飞行。
    return !!(this.isBombingRun(object) && this.isCancelling() && this.forceCancel(object)) || super.onTick(object);
  }

  /** 强制取消：轰炸机动中不允许（先飞完机动）。 */
  forceCancel(object: any): boolean {
    return !this.bomberManeuverTile && super.forceCancel(object);
  }

  /**
   * 最小射程重定位：距目标太近时找射程带内的新落点。
   *  - Chrono 移动器：在 [射程-1, 射程] 内就原地，否则在 [射程-1,
   *    2×射程] 找点或保持；
   *  - 普通：在 [最小射程, ∞) 内即原地，否则在 [2×最小射程,
   *    射程-最小射程] 带内找。
   */
  findMinRangeRelocationTile(object: any, targetTile: any): any {
    const { minRange, range } = this.rangeHelper.computeWeaponRangeVsTarget(object, this.target, this.weapon, this.game.rules);
    if (object.rules.locomotor === LocomotorType.Chrono) {
      return this.rangeHelper.isInRange(object, this.target, range - 1, range, this.weapon.rules.cellRangefinding)
        ? targetTile
        : this.findTileInRange(object, targetTile, range - 1, 2 * range) ?? targetTile;
    }
    return this.rangeHelper.isInRange(object, this.target, minRange, Number.POSITIVE_INFINITY, this.weapon.rules.cellRangefinding)
      ? targetTile
      : this.findTileInRange(object, targetTile, 2 * minRange, range - minRange);
  }

  /**
   * 在射程带内找走位点：从"目标向自身方向推 minRange 格"的点沿
   * bresenham 走到目标，取首个有效 tile，在其周围径向搜符合
   * 射程/视线/通行/无障碍的落点。
   */
  findTileInRange(object: any, targetTile: any, minRange: number, maxRange: number): any {
    const map = this.game.map;
    const start = new Vector2(object.tile.rx - targetTile.rx, object.tile.ry - targetTile.ry)
      .setLength(minRange)
      .floor()
      .add(new Vector2(targetTile.rx, targetTile.ry));
    let firstTile: any;
    for (const linePoint of bresenhamModule.bresenham(start.x, start.y, targetTile.rx, targetTile.ry)) {
      firstTile = map.tiles.getByMapCoords(linePoint.x, linePoint.y);
      if (firstTile) break;
    }
    if (firstTile) {
      const finder = new RadialTileFinder(
        map.tiles,
        map.mapBounds,
        firstTile,
        { width: 1, height: 1 },
        0,
        maxRange,
        (tile: any) =>
          this.rangeHelper.isInWeaponRange(object, this.target, this.weapon, this.game.rules, tile) &&
          this.losHelper.hasLineOfSight(tile, this.target, this.weapon) &&
          0 < map.terrain.getPassableSpeed(tile, object.rules.speedType, object.isInfantry(), !!tile.onBridgeLandType) &&
          !map.terrain.findObstacles({ tile, onBridge: !!tile.onBridgeLandType }, object).length,
      );
      return finder.getNextTile();
    }
  }
}
