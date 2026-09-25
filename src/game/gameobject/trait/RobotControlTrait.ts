/**
 * RobotControlTrait — 遥控坦克（ROBOT）与机器人控制中心（GACSPH）共生。
 *
 * 原版 YR：遥控坦克 Powered=yes，依赖控制中心供电。控制中心被毁/被卖/
 * 玩家低电（建筑断电）时，全部遥控坦克瘫痪（不能移动/攻击）；水上则沉没。
 * 电力恢复后重新升起并恢复操控。
 *
 * 瘫痪实现：moveTrait/attackTrait.setDisabled(true/false)。
 * 落地/升起为高度动画；HoverBobTrait 在瘫痪期间必须禁用，否则差分 bob
 * 会把相对高度压成负数导致沉入地形下方。
 *
 * 由 game/gameobject/trait/RobotControlTrait.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { EventType } from "game/event/EventType"; // 已转换

/** HoverBobTrait 结构子集（避免硬依赖未转换类）。 */
interface HoverBobLike {
  disabled: boolean;
  prevHoverBobLeptons: number;
  spawnTick: number;
  computeHoverBobLeptons(tick: number, hover: any): number;
  setBaseElevation(object: any, world: any): void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RobotControlTrait {
  obj: any;
  paralyzed = false;
  wasParalyzed = false;
  spawnGameTick = -1;
  // 落地动画
  landing = false;
  landStartTick = 0;
  landDuration = 30;
  landStartElevation = 0;
  landBodyStartDir = 0;
  landBodyPhase1Total = 0;
  landTurretStartDir = 0;
  landTurretPhase1Total = 0;
  landTurretPhase2Target = 0;
  // 升起动画
  rising = false;
  riseStartTick = 0;
  riseDuration = 20;
  riseStartElevation = 0;
  riseEndElevation = 0;
  hbTrait: HoverBobLike | null = null;

  constructor(obj: any) {
    this.obj = obj;
    this.paralyzed = false;
    this.wasParalyzed = false;
    this.spawnGameTick = -1;
    this.landing = false;
    this.landStartTick = 0;
    this.landDuration = 30;
    this.landStartElevation = 0;
    this.landBodyStartDir = 0;
    this.landBodyPhase1Total = 0;
    this.landTurretStartDir = 0;
    this.landTurretPhase1Total = 0;
    this.landTurretPhase2Target = 0;
    this.rising = false;
    this.riseStartTick = 0;
    this.riseDuration = 20;
    this.riseStartElevation = 0;
    this.riseEndElevation = 0;
    this.hbTrait = null;
    // Vehicle 工厂经 traits.add() 先挂 HoverBob，ObjectFactory 之后才重建
    // cachedTraits.tick——故必须扫 traits.getAll()，不能扫 tick 缓存。
    this.hbTrait = this.findHoverBobTrait(obj);
  }

  private findHoverBobTrait(obj: any): HoverBobLike | null {
    if (!obj?.traits?.getAll) return null;
    const all = obj.traits.getAll();
    for (const trait of all) {
      if (trait.disabled !== undefined && trait.computeHoverBobLeptons) return trait;
    }
    return null;
  }

  /** 懒解析：构造时若 traits 尚未齐全，在 onTick 里再找一次。 */
  ensureHoverBobResolved(obj: any): HoverBobLike | null {
    if (this.hbTrait || !obj) return this.hbTrait;
    this.hbTrait = this.findHoverBobTrait(obj);
    return this.hbTrait;
  }

  /**
   * 是否存在可运作的控制中心（powersUnit 匹配本单位、BuildStatus.Ready、
   * 已供电）。用 PowersUnit/PoweredUnit 而非 Prerequisite，避免把生产
   * 建筑（如 GAWEAP）误判为供电源。
   */
  hasOperationalControlCenter(): boolean {
    const obj = this.obj;
    if (!obj?.owner) return false;
    const unitName = obj.rules.name;
    if (!unitName) return false;
    for (const building of obj.owner.buildings) {
      if (building.buildStatus !== 1) continue;
      if (building.rules.powersUnit !== unitName) continue;
      const pt = building.poweredTrait;
      if (!pt || pt.isPoweredOn()) return true;
    }
    return false;
  }

  isParalyzed(): boolean {
    return this.paralyzed;
  }

  /** 单位是否仍在工厂占位上（deployTime 窗口内禁止瘫痪）。 */
  isUnitOnFactoryTile(obj: any, world: any): boolean {
    if (!obj.owner || !obj.tile) return false;
    for (const building of obj.owner.buildings) {
      if (!building.factoryTrait || building.buildStatus !== 1) continue;
      if (world.map.tileOccupation.isTileOccupiedBy(obj.tile, building)) return true;
    }
    return false;
  }

  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    if (!object || object.isDestroyed || !object.isVehicle()) return;
    const hbTrait = this.ensureHoverBobResolved(object);
    const curTask = object.unitOrderTrait?.getCurrentTask?.();
    if ((curTask && curTask.factory) || this.isUnitOnFactoryTile(object, world)) {
      this.paralyzed = false;
      this.wasParalyzed = false;
      object.moveTrait?.setDisabled(false);
      object.attackTrait?.setDisabled(false);
      return;
    }
    const operational = this.hasOperationalControlCenter();
    this.paralyzed = !operational;
    if (this.paralyzed) {
      object.moveTrait?.setDisabled(true);
      object.attackTrait?.setDisabled(true);
      // 水上瘫痪 → 沉没
      if (!this.wasParalyzed && object.zone === ZoneType.Water && object.isSinker) {
        object.deathType = DeathType.Sink;
        world.destroyObject(object, undefined, true);
        return;
      }
      // 首帧：开始落地动画，并立刻禁用 HoverBob
      if (!this.wasParalyzed) {
        this.landing = true;
        this.landStartTick = world.currentTick;
        this.landDuration = Math.floor(30 + 30 * Math.random());
        this.landStartElevation = object.position.tileElevation;
        this.landBodyStartDir = object.direction;
        if (hbTrait) {
          hbTrait.disabled = true;
          hbTrait.prevHoverBobLeptons = 0;
        }
        const isCW = Math.random() > 0.5;
        const bodyRot = Math.floor(180 + 170 * Math.random());
        this.landBodyPhase1Total = isCW ? bodyRot : -bodyRot;
        const turretExtra = Math.floor(10 + 21 * Math.random());
        this.landTurretPhase1Total = isCW ? bodyRot + turretExtra : -(bodyRot + turretExtra);
        if (object.turretTrait) {
          this.landTurretStartDir = object.turretTrait.facing;
          const p1End = (((this.landTurretStartDir + this.landTurretPhase1Total) % 360) + 360) % 360;
          const phase1WasCW = this.landTurretPhase1Total > 0;
          const validTargets: number[] = [];
          for (const candidate of [0, 90, 180, 270]) {
            let d = candidate - p1End;
            while (d > 180) d -= 360;
            while (d < -180) d += 360;
            const isReverse = phase1WasCW ? d < 0 : d > 0;
            if (isReverse && Math.abs(d) >= 90) validTargets.push(candidate);
          }
          this.landTurretPhase2Target =
            validTargets[Math.floor(Math.random() * validTargets.length)];
        }
        object.spinVelocity = 0;
      }
      if (this.landing) {
        const rawProgress = Math.min(1, (world.currentTick - this.landStartTick) / this.landDuration);
        const eased = 1 - (1 - rawProgress) * (1 - rawProgress);
        // 相对高度钳到地面（0），避免 residual bob 沉入地形下
        object.position.tileElevation = Math.max(0, this.landStartElevation * (1 - eased));
        if (rawProgress < 0.5) {
          const p1 = rawProgress * 2;
          object.direction = (((this.landBodyStartDir + this.landBodyPhase1Total * p1) % 360) + 360) % 360;
          if (object.turretTrait) {
            object.turretTrait.facing =
              (((this.landTurretStartDir + this.landTurretPhase1Total * p1) % 360) + 360) % 360;
            object.turretTrait.desiredFacing = object.turretTrait.facing;
          }
        } else {
          const p2 = (rawProgress - 0.5) * 2;
          object.direction = (((this.landBodyStartDir + this.landBodyPhase1Total) % 360) + 360) % 360;
          if (object.turretTrait) {
            const turretPhase1End =
              (((this.landTurretStartDir + this.landTurretPhase1Total) % 360) + 360) % 360;
            let turretDiff = this.landTurretPhase2Target - turretPhase1End;
            while (turretDiff > 180) turretDiff -= 360;
            while (turretDiff < -180) turretDiff += 360;
            object.turretTrait.facing =
              (((turretPhase1End + turretDiff * p2) % 360) + 360) % 360;
            object.turretTrait.desiredFacing = object.turretTrait.facing;
          }
        }
        if (rawProgress >= 1) {
          this.landing = false;
          object.direction =
            (((this.landBodyStartDir + this.landBodyPhase1Total) % 360) + 360) % 360;
          if (object.turretTrait) {
            object.turretTrait.facing = this.landTurretPhase2Target;
            object.turretTrait.desiredFacing = this.landTurretPhase2Target;
          }
          if (hbTrait) hbTrait.disabled = true;
          const landGroundElev = this.groundElevation(object, world);
          object.position.tileElevation = Math.max(landGroundElev, 0);
        }
      } else {
        // 已落地：每帧钉在地面，禁止 bob 漂移
        if (hbTrait) hbTrait.disabled = true;
        const groundElev = this.groundElevation(object, world);
        object.position.tileElevation = Math.max(groundElev, 0);
      }
    } else {
      if (this.wasParalyzed) {
        this.rising = true;
        this.riseStartTick = world.currentTick;
        this.riseDuration = Math.floor(30 + 30 * Math.random());
        this.riseStartElevation = object.position.tileElevation;
        this.landing = false;
        const brH = this.groundElevation(object, world);
        this.riseEndElevation = brH + Coords.worldToTileHeight(world.rules.general.hover.height);
      }
      if (this.rising) {
        const riseProgress = Math.min(1, (world.currentTick - this.riseStartTick) / this.riseDuration);
        const riseEased = 1 - (1 - riseProgress) * (1 - riseProgress);
        object.position.tileElevation =
          this.riseStartElevation + (this.riseEndElevation - this.riseStartElevation) * riseEased;
        if (hbTrait) hbTrait.disabled = true;
        object.moveTrait?.setDisabled(true);
        object.attackTrait?.setDisabled(true);
        if (riseProgress >= 1) {
          this.rising = false;
          object.position.tileElevation = this.riseEndElevation;
          if (hbTrait) {
            hbTrait.disabled = false;
            hbTrait.prevHoverBobLeptons = hbTrait.computeHoverBobLeptons(
              world.currentTick,
              world.rules.general.hover,
            );
            hbTrait.spawnTick = world.currentTick;
            hbTrait.setBaseElevation(object, world);
          }
          object.moveTrait?.setDisabled(false);
          object.attackTrait?.setDisabled(false);
        }
      } else {
        if (hbTrait && hbTrait.disabled) {
          hbTrait.disabled = false;
          hbTrait.prevHoverBobLeptons = hbTrait.computeHoverBobLeptons(
            world.currentTick,
            world.rules.general.hover,
          );
          hbTrait.spawnTick = world.currentTick;
          hbTrait.setBaseElevation(object, world);
        }
        object.moveTrait?.setDisabled(false);
        object.attackTrait?.setDisabled(false);
      }
      this.landing = false;
    }
    if (this.paralyzed !== this.wasParalyzed) {
      world.events.dispatch({
        type: EventType.RobotPowerStateChange,
        gameObject: object,
        activated: !this.paralyzed,
      });
    }
    this.wasParalyzed = this.paralyzed;
  }

  /** 相对地面高度：桥面用桥 elevation，否则 0（tileElevation 相对地形）。 */
  private groundElevation(object: any, world: any): number {
    if (!object.onBridge) return 0;
    return world.map.tileOccupation.getBridgeOnTile(object.tile)?.tileElevation ?? 0;
  }

  dispose(): void {
    this.obj = undefined;
  }
}
