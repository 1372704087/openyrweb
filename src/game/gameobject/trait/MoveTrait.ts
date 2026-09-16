/**
 * MoveTrait — 单位移动 trait（路径预留/碰撞/碾压/传送/区域切换）。
 *
 * 挂在 Infantry/Vehicle/Aircraft 上，与 Locomotor 协作驱动移动：
 *  - moveState 状态机（Idle/ReachedNextWaypoint/PlanMove/Moving）与
 *    collisionState（Waiting/Resolved）由上层 Locomotor/任务控制；
 *  - 速度合成 baseSpeed：规则速度 × 老兵倍率 × 箱子加成 × 低血载具惩罚
 *    × (1 − speedPenalty)；
 *  - handleTileChange：进入新 tile 时更新占位/桥面/区域/碾压判定/
 *    箱子拾取/路径预留清理，并派发 NotifyTileChange + EnterTileEvent；
 *  - 碾压：canCrushObject 过滤后，载具走 CrushWarhead 伤害链路
 *    （含爆炸动画），步兵/墙走直接摧毁；配合 TiltsWhenCrushes 的
 *    crushTilt 缓动在 onTick 中驱动；
 *  - teleportUnitToTile：超时空传送入口
 *    (newTile, bridgeOrOld, isChronoshift, isReverse, world)；
 *
 * 由 game/gameobject/trait/MoveTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import { ZoneType, getZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { InfDeathType } from "game/gameobject/infantry/InfDeathType"; // 已转换
import * as ObjectTeleportEventModule from "game/event/ObjectTeleportEvent"; // 未转换（any-shim）
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import * as NotifyTeleportModule from "game/gameobject/trait/interface/NotifyTeleport"; // 未转换（any-shim）
import { LocomotorType } from "game/type/LocomotorType"; // 已转换
import * as JumpjetLocomotorModule from "game/gameobject/locomotor/JumpjetLocomotor"; // 未转换（any-shim）
import { SpeedType } from "game/type/SpeedType"; // 已转换
import * as WingedLocomotorModule from "game/gameobject/locomotor/WingedLocomotor"; // 未转换（any-shim）
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import * as NotifyTileChangeGameModule from "game/trait/interface/NotifyTileChange"; // 未转换（any-shim）
import * as NotifyTileChangeGOModule from "game/gameobject/trait/interface/NotifyTileChange"; // 未转换（any-shim）
import * as EnterTileEventModule from "game/event/EnterTileEvent"; // 未转换（any-shim）
import { Vector3 } from "game/math/Vector3"; // 已转换
import * as NotifyElevationChangeModule from "game/trait/interface/NotifyElevationChange"; // 未转换（any-shim）
import * as WarheadModule from "game/Warhead"; // 已转换
import * as WarheadDetonateEventModule from "game/event/WarheadDetonateEvent"; // 未转换（any-shim）

/** 移动状态。 */
export enum MoveState {
  Idle = 0,
  ReachedNextWaypoint = 1,
  PlanMove = 2,
  Moving = 3,
}

/** 移动结果。 */
export enum MoveResult {
  Success = 0,
  Cancel = 1,
  CloseEnough = 2,
  Fail = 3,
}

/** 碰撞状态：等待（有阻挡）或已解决。 */
export enum CollisionState {
  Waiting = 0,
  Resolved = 1,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 递归判断任务（或其子任务首层）是否为 MoveTask。 */
const isMoveTask = (task: any): boolean =>
  task instanceof MoveTaskModule.MoveTask || (task.children[0] && isMoveTask(task.children[0]));

export class MoveTrait {
  gameObject: any;
  tileOccupation: any;
  disabled = false;
  speedPenalty = 0;
  velocity = new Vector3();
  reservedPathNodes: any[] = [];
  moveState: MoveState = MoveState.Idle;
  collisionState: CollisionState = CollisionState.Resolved;
  /** 以下字段由 Locomotor / 任务侧动态赋值。 */
  locomotor: any;
  currentWaypoint: any;
  lastTargetOffset: any;
  lastVelocity: any;
  lastMoveResult: MoveResult;
  lastTeleportTick: any;
  /** 以下由 FactoryTrait / Building 侧注入。 */
  dockTrait: any;
  rallyTrait: any;
  attackTrait: any;
  turretTrait: any;
  moveTrait: any;

  constructor(gameObject: any, tileOccupation: any) {
    this.gameObject = gameObject;
    this.tileOccupation = tileOccupation;
    this.disabled = false;
    this.speedPenalty = 0;
    this.velocity = new Vector3();
    this.reservedPathNodes = [];
    this.moveState = MoveState.Idle;
    this.collisionState = CollisionState.Resolved;
  }

  /** 基础速度合成：规则速度 × 老兵 × 箱子 × 低血载具惩罚 × (1 − speedPenalty)。 */
  get baseSpeed(): number {
    return (
      this.gameObject.rules.speed *
      (this.gameObject.veteranTrait?.getVeteranSpeedMultiplier() ?? 1) *
      this.gameObject.crateBonuses.speed *
      (this.gameObject.isVehicle() &&
      this.gameObject.healthTrait.health <= 50 &&
      this.gameObject.rules.locomotor !== LocomotorType.Hover
        ? 0.75
        : 1) *
      (1 - this.speedPenalty)
    );
  }

  isDisabled(): boolean {
    return this.disabled;
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  isMoving(): boolean {
    return this.moveState === MoveState.Moving;
  }

  isIdle(): boolean {
    return this.moveState === MoveState.Idle;
  }

  isWaiting(): boolean {
    return this.collisionState === CollisionState.Waiting;
  }

  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    // 碾压俯仰缓动：计时器 >0 递减（新鲜碾压会刷新），归零后目标角回落 0；
    // crushTilt 以 0.3 插值系数逼近目标角，绝对值 <0.5 归零（消除抖动）。
    if (object.crushTiltTimer > 0) object.crushTiltTimer--;
    else object.crushTiltTarget = 0;
    object.crushTilt += (object.crushTiltTarget - object.crushTilt) * 0.3;
    if (Math.abs(object.crushTilt) < 0.5) object.crushTilt = 0;
    // 当前任务链不含 MoveTask → 停止移动（清速度/状态/移动器）；
    // 无任务且无攻击目标且是带炮塔的载具 → 炮塔回正车身方向。
    if (this.moveState !== MoveState.Idle && this.collisionState === CollisionState.Resolved) {
      const currentTask = object.unitOrderTrait.getCurrentTask();
      if ((currentTask && isMoveTask(currentTask)) || false) {
        // 任务链仍含移动任务，继续由 Locomotor 驱动
      } else {
        this.velocity.set(0, 0, 0);
        this.moveState = MoveState.Idle;
        this.locomotor = undefined;
        if (!currentTask && !object.attackTrait?.currentTarget && object.isVehicle() && object.turretTrait) {
          object.turretTrait.desiredFacing = object.direction;
        }
      }
    }
    // Idle 状态时跳跃机/飞行器原地悬浮/盘旋动画。
    if (this.moveState === MoveState.Idle) {
      if (object.rules.locomotor === LocomotorType.Jumpjet) {
        JumpjetLocomotorModule.JumpjetLocomotor.tickStationary(object, world);
      } else if (object.isAircraft() && object.rules.locomotor === LocomotorType.Aircraft) {
        WingedLocomotorModule.WingedLocomotor.tickStationary(object, world);
      }
    }
  }

  /** 对象被毁：解除全部路径预留。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, _world: any): void {
    this.unreservePathNodes();
  }

  /**
   * 超时空传送入口。实参与调用方一致：
   * (newTile, oldTile/bridge, isChronoshift, isReverse, world)
   */
  teleportUnitToTile(newTile: any, oldTile: any, isChronoshift: any, isReverse: any, world: any): void {
    const object = this.gameObject;
    const previousTile = object.tile;
    object.traits.filter(NotifyTeleportModule.NotifyTeleport).forEach((trait: any) => {
      trait[NotifyTeleportModule.NotifyTeleport.onBeforeTeleport](object, world, isChronoshift, isReverse);
    });
    object.position.tileElevation = object.tileElevation;
    object.position.tile = newTile;
    object.position.subCell = object.position.desiredSubCell;
    this.handleTileChange(previousTile, oldTile, true, world, true);
    if (!isReverse) {
      this.unreservePathNodes();
      this.speedPenalty = 0;
      this.velocity.set(0, 0, 0);
      this.moveState = MoveState.Idle;
      this.collisionState = CollisionState.Resolved;
      this.locomotor = undefined;
      this.currentWaypoint = undefined;
      this.lastTargetOffset = undefined;
      this.lastVelocity = undefined;
      this.lastMoveResult = MoveResult.Cancel;
      if (object.isVehicle()) {
        object.spinVelocity = 0;
        if (object.turretTrait) object.turretTrait.desiredFacing = object.direction;
      }
    }
    this.lastTeleportTick = world.currentTick;
    world.events.dispatch(new ObjectTeleportEventModule.ObjectTeleportEvent(object, isChronoshift, previousTile));
  }

  /**
   * 进入新 tile 的核心处理。第二参为新位置的桥对象（或 undefined），
   * 不是 newTile——object.tile 已在调用方更新为新格。
   */
  handleTileChange(previousTile: any, newBridge: any, isTeleport: boolean, world: any, isReverse = false): void {
    const object = this.gameObject;
    world.map.tileOccupation.unoccupyTileRange(previousTile, object);
    world.map.tileOccupation.occupyTileRange(object.tile, object);
    world.map.technosByTile.updateObject(object);
    if (object.zone !== ZoneType.Air) {
      // 旧桥：仍用更新前的 onBridge 标志从 previousTile 推导。
      const previousBridge = object.onBridge ? world.map.tileOccupation.getBridgeOnTile(previousTile) : undefined;
      const oldLandType = object.onBridge ? previousTile.onBridgeLandType : previousTile.landType;
      // 新陆地类型：第二参（新桥）存在则用新格的 onBridgeLandType。
      const newLandType = newBridge ? object.tile.onBridgeLandType : object.tile.landType;
      if (
        newLandType !== oldLandType &&
        (world.rules.getLandRules(newLandType).getSpeedModifier(object.rules.speedType) > 0 ||
          object.rules.speedType === SpeedType.Amphibious ||
          isReverse)
      ) {
        object.zone = getZoneType(newLandType);
      }
      // 桥面切换时调整海拔并更新 onBridge。
      if (newBridge !== previousBridge) {
        object.position.tileElevation += -(previousBridge?.tileElevation ?? 0) + (newBridge?.tileElevation ?? 0);
        object.onBridge = !!newBridge;
      }
      // 路径预留清理：当前 tile 不再需要预留。
      const reservedIndex = object.moveTrait.reservedPathNodes.findIndex(
        (node: any) => node.tile === object.tile,
      );
      if (reservedIndex !== -1) object.moveTrait.reservedPathNodes.splice(reservedIndex, 1);
      // 碾压判定与执行。
      if (object.crusher) {
        for (const target of world.map
          .getGroundObjectsOnTile(object.tile)
          .filter(
            (obj: any) =>
              !(obj.isOverlay() && obj.isBridge?.()) &&
              (!obj.isUnit() || obj.onBridge === object.onBridge) &&
              object.canCrushObject(obj) &&
              !(obj.isInfantry() && obj.stance === StanceType.Paradrop) &&
              (!(obj.isTechno() && !isTeleport) ||
                !world.areFriendly(obj, object) ||
                (object.isForceAttacking && obj === object.currentAttackTarget)),
          )) {
          if (target.isDestroyed) continue;
          if (target.isInfantry()) target.infDeathType = InfDeathType.None;
          // 碾压俯仰：载具碾墙/载具时车头上抬 20° 持续 8 tick。
          if (object.isVehicle() && object.rules.isTilter) {
            if ((target.isOverlay() || target.isBuilding()) && target.rules.wall) {
              object.crushTiltTarget = 20;
              object.crushTiltTimer = 8;
            } else if (target.isVehicle()) {
              object.crushTiltTarget = 20;
              object.crushTiltTimer = 8;
            }
          }
          target.deathType = DeathType.Crush;
          // 载具被碾压走 [CombatDamage] CrushWarhead 绝对伤害（无视护甲/HP
          // 直接判定摧毁）；目标 HP 归零后走正常死亡/爆炸流程。围墙不适用
          // 该链路（Crush 对 Wall 护甲 Verses 为 0），保持直接强制销毁。
          if (target.isVehicle() && target.healthTrait) {
            (() => {
              try {
                const cd = world.rules.combatDamage;
                const warheadName = (cd && cd.crushWarhead) || "Crush";
                const warheadRules = world.rules.getWarhead(warheadName);
                if (warheadRules) {
                  const warhead = new WarheadModule.Warhead(warheadRules);
                  const damage = warhead.computeDamage(target.healthTrait.maxHitPoints, target, world);
                  const pos = target.position.worldPosition.clone();
                  const animName = warhead.pickExplodeAnim(damage, target, ZoneType.Ground, world, false);
                  if (animName)
                    world.events.dispatch(new WarheadDetonateEventModule.WarheadDetonateEvent(warhead, pos, animName, false));
                  warhead.inflictDamage(damage, target, { obj: object, player: object.owner }, world);
                }
              } catch (err) {}
              // 绝对伤害兜底：即使 veteran/装甲修正导致未归零也强制摧毁。
              if (!target.isDestroyed) world.destroyObject(target, { player: object.owner, obj: object });
            })();
          } else {
            world.destroyObject(target, { player: object.owner, obj: object });
          }
        }
      }
      // 箱子拾取（非桥面）。
      if (!object.onBridge) {
        const crate = world.map.tileOccupation
          .getGroundObjectsOnTile(object.tile)
          .find((obj: any) => obj.isOverlay() && obj.rules.crate);
        if (crate) world.crateGeneratorTrait.pickupCrate(object, crate, world);
      }
    }
    // NotifyTileChange 广播（两套接口：game/trait + game/gameobject/trait）。
    world.traits.filter(NotifyTileChangeGameModule.NotifyTileChange).forEach((trait: any) => {
      trait[NotifyTileChangeGameModule.NotifyTileChange.onTileChange](object, world, previousTile, isReverse);
    });
    object.traits.filter(NotifyTileChangeGOModule.NotifyTileChange).forEach((trait: any) => {
      trait[NotifyTileChangeGOModule.NotifyTileChange.onTileChange](object, world, previousTile, isReverse);
    });
    world.events.dispatch(new EnterTileEventModule.EnterTileEvent(object.tile, object));
  }

  /** 海拔变化：广播 NotifyElevationChange trait。 */
  handleElevationChange(_oldElevation: any, world: any): void {
    world.traits.filter(NotifyElevationChangeModule.NotifyElevationChange).forEach((trait: any) => {
      trait[NotifyElevationChangeModule.NotifyElevationChange.onElevationChange](this.gameObject, world, _oldElevation);
    });
  }

  /** 解除全部路径预留。 */
  unreservePathNodes(): void {
    this.reservedPathNodes.forEach((node: any) => {
      if (node.tile !== this.gameObject.tile) {
        this.tileOccupation.unoccupySingleTile(node.tile, this.gameObject);
      }
    });
    this.reservedPathNodes.length = 0;
  }

  dispose(): void {
    this.gameObject = undefined;
  }
}
