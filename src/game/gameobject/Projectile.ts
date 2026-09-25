/**
 * Projectile — 弹体（炮弹/导弹/核弹载荷等）对象。
 *
 * 在 GameObject 之上实现完整飞行与引爆管线：
 *  - ProjectileState：Travel → Impact（核弹/圆盘激光延时）→ Detonation；
 *  - onSpawn：初速/仰角/提前量/散布（arcing/flak/inaccurate）与 homing 初值；
 *  - update：homing 与 ballistic 两条移动路径、障碍检测、目标锁丢失、
 *    声波（sonic）波及收集、limbo launch 归位；
 *  - detonate：死亡武器 ivan 替换、寄生/心控/时空/伪装/超载等特殊弹头分支、
 *    常规 warhead.detonate、nukeMaker 二次弹、碎片（shrapnel）散射、
 *    limbo 部队回到地图。
 *
 * 由 game/gameobject/Projectile.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameObject } from "game/gameobject/GameObject"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { Weapon } from "game/Weapon"; // 已转换
import { WeaponType } from "game/WeaponType"; // 已转换
import { FacingUtil } from "game/gameobject/unit/FacingUtil"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { LayerType } from "game/map/TileOccupation"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { RangeHelper } from "game/gameobject/unit/RangeHelper"; // 已转换
import { TargetUtil } from "game/gameobject/unit/TargetUtil"; // 已转换
import * as geometry from "game/math/geometry"; // 已转换
import { RandomTileFinder } from "game/map/tileFinder/RandomTileFinder"; // 已转换
import * as mathUtil from "util/math"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import { MovePositionHelper } from "game/gameobject/unit/MovePositionHelper"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 已转换
import { ScatterTask } from "game/gameobject/task/ScatterTask"; // 已转换
import { Warhead } from "game/Warhead"; // 已转换
import { ObjectRules } from "game/rules/ObjectRules"; // 已转换
import { CollisionHelper } from "game/gameobject/unit/CollisionHelper"; // 已转换
import { CollisionType } from "game/gameobject/unit/CollisionType"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换
import { SpecialWarheadType } from "game/SpecialWarheadType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 弹体生命周期状态。 */
export enum ProjectileState {
  /** 飞行中。 */
  Travel = 0,
  /** 命中后延时（核弹落地 / 圆盘激光蓄爆）。 */
  Impact = 1,
  /** 已引爆（destroyObject 后）。 */
  Detonation = 2,
}

export class Projectile extends GameObject {
  /** 发射者单位（limbo/寄生/老兵倍率继承用）。 */
  _fromObject: any;
  /** 碰撞检测器（按 tileOccupation 构造一次）。 */
  collisionHelper: any;
  /** 目标点（非 homing 瞄准）。 */
  aimPoint: any;
  /** 发射瞬间自身世界坐标（散布/过冲基准）。 */
  initialSelfPosition: any;
  /** 开局到目标的 tile 距离（首 afterTick 写入）。 */
  initialTileDistToTarget: number;
  /** 由武器速度与距离算出的最大速度。 */
  maxSpeed: any;
  /** 当前速度标量（updateSpeed 每 tick 更新）。 */
  speed: any;
  /** 上次目标锁定点（目标大幅移动时锁定旧点）。 */
  lastTargetLockPosition: any;
  /** 目标是否已脱离锁定。 */
  targetLockLost: boolean;
  /** homing 方向向量。 */
  homingMoveDir: any;
  /** homing 累计行程（leptons）。 */
  homingTravelDistance: number;
  /** homing 累计 tick。 */
  homingTravelTicks: number;
  /** limbo launch 专用行程 tick。 */
  limboTravelTicks: number;
  /** 弧弹过冲 tile 数（0=不过冲）。 */
  overshootTiles: any;
  /** 速度向量（leptons/tick）。 */
  velocity: any;
  /** 声波弹头已扫过的对象 → 所经过 tile 集合。 */
  sonicVisitedObjects: Map<any, Set<any>>;
  /** 碰撞类型（引爆时写入）。 */
  collisionType: any;
  /** 引爆前延时 tick。 */
  detonationTimer: number;
  /** 当前状态机。 */
  state: any;
  /** 所在区域（碰撞时由 helper 计算）。 */
  zone: any;
  /** 分片弹标记。 */
  isShrapnel: boolean;
  /** 核弹标记。 */
  isNuke: boolean;
  /** 基础伤害倍率。 */
  baseDamageMultiplier: number;
  /** 老兵伤害倍率。 */
  veteranDamageMult: number;
  /** 是否吸附到目标点。 */
  snapToTarget: boolean;
  /** 第 4 构造参：tile 占用表。 */
  tileOccupation: any;
  /** 兵种朝向（FacingUtil 换算）。 */
  direction: any;
  /** 武器引用（spawn 时由工厂写入）。 */
  fromWeapon: any;
  /** 发射方玩家（spawn 时由工厂写入）。 */
  fromPlayer: any;
  /** 目标。 */
  target: any;
  /** 命中/爆炸动画名（nukeMaker 写入 NUKEBALL，常规由外部设置）。 */
  impactAnim: any;
  /** 当前高度修正缓存（homing level 分支）。 */
  private _bridgeElev = 0;
  private _hDiff = 0;
  private _hGain = 0;

  get fromObject(): any {
    return this._fromObject;
  }
  set fromObject(v: any) {
    // 存活且带 veteranTrait 的发射者 → 继承当前老兵伤害倍率
    (this._fromObject = v) &&
      v.veteranTrait &&
      !v.isDestroyed &&
      (this.veteranDamageMult = v.veteranTrait.getVeteranDamageMultiplier());
  }

  /** 旋转角速度（度/tick）：声波固定换算，否则取规则 rot。 */
  get rot(): any {
    return this.fromWeapon.rules.isSonic
      ? ObjectRules.iniRotToDegsPerTick(this.iniRot)
      : this.rules.rot;
  }

  /** 规则 ini 旋钮值；声波固定 10。 */
  get iniRot(): any {
    return this.fromWeapon.rules.isSonic ? 10 : this.rules.iniRot;
  }

  static factory(name: any, rules: any, art: any, tileOccupation: any): any {
    return new this(name, rules, art, tileOccupation);
  }

  constructor(name: any, rules: any, art: any, tileOccupation: any) {
    // 孪生 ctor(e,t,i,r)：super(ObjectType.Projectile, e, t, i)，tileOccupation = r
    super(ObjectType.Projectile, name, rules, art);
    this.tileOccupation = tileOccupation;
    this.state = ProjectileState.Travel;
    this.detonationTimer = 0;
    this.collisionType = CollisionType.None;
    this.direction = 0;
    this.zone = ZoneType.Air;
    this.isShrapnel = false;
    this.isNuke = false;
    this.baseDamageMultiplier = 1;
    this.veteranDamageMult = 1;
    this.snapToTarget = false;
    this.targetLockLost = false;
    this.limboTravelTicks = 0;
    this.homingTravelDistance = 0;
    this.homingTravelTicks = 0;
    this.velocity = new Vector3();
    this.sonicVisitedObjects = new Map();
    this.collisionHelper = new CollisionHelper(this.tileOccupation);
  }

  onSpawn(game: any): void {
    super.onSpawn(game);
    this.initialSelfPosition = this.position.worldPosition.clone();
    // 发射瞬间预伤（跳过死亡武器/limbo/无穷速直线弹/散布类）
    if (
      this.target.obj &&
      this.fromWeapon.type !== WeaponType.DeathWeapon &&
      !this.fromWeapon.rules.limboLaunch &&
      !(!this.isHoming() && this.fromWeapon.speed === Number.POSITIVE_INFINITY) &&
      !this.rules.inaccurate &&
      !this.rules.arcing &&
      !this.rules.flakScatter
    ) {
      const base = this.computeBaseDamage(game);
      if (0 < base) {
        const dmg = this.fromWeapon.warhead.computeDamage(base, this.target.obj, game);
        this.target.obj.healthTrait?.projectDamage(dmg);
      }
    }
    game.afterTick(() => {
      const helper = new RangeHelper(this.tileOccupation);
      const d = helper.distance2(this.target.getWorldCoords(), this) / Coords.LEPTONS_PER_TILE;
      this.initialTileDistToTarget = d;
      this.maxSpeed = this.computeMaxSpeed(this.fromWeapon.speed, d, game.rules.audioVisual.gravity);
    });
    if (this.isHoming()) {
      if (1 === this.iniRot)
        this.homingMoveDir = this.target.getWorldCoords().clone().sub(this.position.worldPosition);
      if (this.fromObject?.isAircraft() && this.rules.isAntiGround && !this.rules.isAntiAir) {
        const e: any = this.target.obj;
        !e?.isVehicle() ||
          e.isDestroyed ||
          e.veteranLevel !== VeteranLevel.Elite ||
          e.unitOrderTrait.hasTasks() ||
          e.unitOrderTrait.addTask(new ScatterTask(game));
      }
    } else if (this.rules.vertical) {
      const pos: any = this.position.clone();
      pos.tileElevation = this.fromWeapon.warhead.rules.nukeMaker
        ? Coords.worldToTileHeight(this.fromWeapon.projectileRules.detonationAltitude)
        : 0;
      this.aimPoint = pos.worldPosition.clone();
    } else {
      const lock0 = this.target.getWorldCoords().clone();
      game.afterTick(() => {
        const delta = this.target.getWorldCoords().clone().sub(lock0);
        const moved = delta.length() > Coords.LEPTONS_PER_TILE;
        const aim = moved
          ? lock0
          : this.target.obj?.isUnit() &&
              this.target.obj.moveTrait.velocity.length() &&
              isFinite(this.maxSpeed)
            ? this.computeAimPointVersusMovingTarget(
                this.target.obj,
                this.maxSpeed,
                this.position.worldPosition,
                game.map,
              )
            : this.target.getWorldCoords().clone();
        this.aimPoint = aim;
        this.snapToTarget = !moved && isFinite(this.maxSpeed) && !this.fromWeapon.warhead.rules.sonic;
        (this.rules.inaccurate || this.rules.flakScatter) &&
          (this.adjustAimForBallisticScatter(game, aim), (this.snapToTarget = false));
        !moved &&
          this.rules.arcing &&
          (this.rules.inaccurate
            ? ((this.overshootTiles = this.calculateInaccurateBallisticOvershoot(game)),
              (this.snapToTarget = false))
            : this.target.obj?.isVehicle() &&
              this.target.obj.moveTrait.isMoving() &&
              ((this.overshootTiles = this.calculateBallisticOvershootVsMoving(game, this.target.obj)),
              this.overshootTiles && (this.snapToTarget = false)));
        const step = aim.clone().sub(this.position.worldPosition);
        step.length() < this.fromWeapon.speed && this.update(game);
      });
    }
  }

  /** 弹道散布：按 ballisticScatter 与随机数偏移 aim（flak 按距离缩放）。 */
  adjustAimForBallisticScatter(game: any, aim: any): void {
    let i = game.rules.combatDamage.ballisticScatter;
    let r: number;
    r = this.rules.flakScatter
      ? (this.rules.inviso && (i *= 2), game.generateRandom() * i)
      : i / 2 + game.generateRandom() * (i / 2);
    let s = r * Coords.LEPTONS_PER_TILE;
    if (this.rules.flakScatter) {
      const n = aim.clone().sub(this.initialSelfPosition).length();
      s *= n / (this.fromWeapon.range * Coords.LEPTONS_PER_TILE);
    }
    const a = geometry.rotateVec2(new Vector2(s, 0), game.generateRandomInt(0, 360));
    const n = Coords.vecWorldToGround(aim)
      .add(a)
      .multiplyScalar(1 / Coords.LEPTONS_PER_TILE)
      .floor();
    if (game.map.tiles.getByMapCoords(n.x, n.y)) aim.add(new Vector3(a.x, 0, a.y));
  }

  /** 对移动目标的随机过冲 tile 系数（角度/距离启发式）。 */
  calculateBallisticOvershootVsMoving(game: any, target: any): any {
    const i = this.target.getWorldCoords().clone().sub(this.initialSelfPosition);
    const r0 = Coords.vecWorldToGround(i);
    const s0 = Coords.vecWorldToGround(target.moveTrait.velocity);
    const deg = geometry.angleDegBetweenVec2(r0 as any, s0 as any);
    const angN = (90 < deg ? 180 - deg : deg) / 90;
    const tiles = i.length() / Coords.LEPTONS_PER_TILE;
    const ratio = (angN * tiles) / 5;
    return game.generateRandom() <= ratio ? 2 * Math.min(1, tiles / 5) : 0;
  }

  /** inaccurate 弧弹：50% 概率过冲 2 tile。 */
  calculateInaccurateBallisticOvershoot(game: any): any {
    return game.generateRandom() <= 0.5 ? 2 : 0;
  }

  update(game: any): void {
    if (void 0 === this.maxSpeed) return;
    super.update(game);
    if (this.state === ProjectileState.Impact) {
      if (0 < this.detonationTimer) this.detonationTimer--;
      else this.detonate(game, this.collisionType);
      return;
    }
    const prevVel = this.velocity.clone();
    let prevPos = this.position.clone();
    this.velocity.set(0, 0, 0);
    if (this.fromWeapon.rules.limboLaunch) {
      if (!this.fromObject) throw new Error("Limbo launch projectile must be fired from a unit");
      if (this.fromObject.isDestroyed) {
        game.destroyObject(this);
        return;
      }
    }
    const stepLen = this.updateSpeed(this.maxSpeed);
    this.speed = stepLen;
    let lock = this.target.getWorldCoords();
    if (
      this.lastTargetLockPosition &&
      (this.targetLockLost ||
        lock.clone().sub(this.lastTargetLockPosition).length() >= Coords.LEPTONS_PER_TILE)
    ) {
      lock = this.lastTargetLockPosition;
      this.targetLockLost = true;
    } else this.lastTargetLockPosition = lock.clone();

    if (this.isHoming()) {
      if (this._updateHoming(game, lock, stepLen, prevPos, prevVel)) return;
    } else {
      if (this._updateBallistic(game, lock, stepLen, prevPos, prevVel)) return;
    }

    // 声波弹头：沿途收集可伤对象，再对仍在占用 tile 的对象造成 ambient 伤害
    const wh = this.fromWeapon.warhead;
    if (wh.rules.sonic) {
      const fwd = (11 / 30) * Coords.LEPTONS_PER_TILE;
      const p = this.position.worldPosition.clone().add(this.velocity.clone().setLength(fwd));
      const cell = Coords.vecWorldToGround(p)
        .multiplyScalar(1 / Coords.LEPTONS_PER_TILE)
        .floor();
      const tile = game.map.tiles.getByMapCoords(cell.x, cell.y);
      if (tile && tile !== this.fromObject?.tile) {
        const zone = game.map.getTileZone(tile);
        for (const obj of game.map.getGroundObjectsOnTile(tile))
          if (
            (!obj.isUnit() || !obj.onBridge) &&
            (!obj.isTechno() ||
              !obj.rules.typeImmune ||
              obj.owner !== this.fromPlayer ||
              obj.name !== this.fromObject?.name) &&
            (!obj.isAircraft() || !obj.rules.spawned) &&
            wh.canDamage(obj, tile, zone)
          ) {
            const set = this.sonicVisitedObjects.get(obj) ?? new Set();
            set.add(tile);
            this.sonicVisitedObjects.set(obj, set);
          }
      }
      for (const [obj, tiles] of this.sonicVisitedObjects) {
        for (const t of tiles) {
          if (!game.map.tileOccupation.isTileOccupiedBy(t, obj) || !obj.isSpawned) continue;
          let b = this.fromWeapon.rules.ambientDamage * this.veteranDamageMult * this.baseDamageMultiplier;
          b = wh.computeDamage(b, obj, game);
          wh.inflictDamage(
            b,
            obj,
            { player: this.fromPlayer, weapon: this.fromWeapon, obj: this.fromObject },
            game,
            obj !== this.target.obj,
          );
        }
      }
    }
  }

  /**
   * homing 分支：目标失效自毁、limbo 贴脸、射程判定、转向与障碍。
   * @returns true=已自毁/终止（孪生提前 return，须跳过 sonic 尾段）
   */
  private _updateHoming(game: any, lock: any, stepLen: number, prevPos: any, prevVel: any): boolean {
    if (
      this.target.obj?.isUnit() &&
      (this.target.obj.isDestroyed || this.target.obj.isCrashing || !this.target.obj.isSpawned) &&
      (this.fromWeapon.rules.limboLaunch || this.homingTravelDistance >= 2 * Coords.LEPTONS_PER_TILE)
    ) {
      this.detonate(game);
      return true;
    }
    if (!this.homingMoveDir) {
      const u = FacingUtil.toMapCoords(this.direction);
      this.homingMoveDir = new Vector3(u.x, 0, u.y);
      this.fromObject?.isAircraft() && ((this.homingMoveDir.y = -9999999), this.homingMoveDir.normalize());
    }
    if (this.fromWeapon.rules.limboLaunch) {
      if (!this.targetLockLost) {
        if (10 < this.limboTravelTicks) {
          this.position.moveToLeptons(this.target.obj.position.getMapPosition());
          this.position.tileElevation = this.target.obj.position.tileElevation;
          this.detonate(game);
          return true;
        }
        this.limboTravelTicks++;
      }
    } else if (!this.isInHomingRange(lock, game)) {
      this.detonate(game);
      return true;
    }
    const helper = new RangeHelper(this.tileOccupation);
    const distTiles0 = Math.floor(helper.distance2(lock, this) / Coords.LEPTONS_PER_TILE);
    const needTurn = 2 < distTiles0 && 1 < this.iniRot;
    const dir = lock.clone().sub(this.position.worldPosition);
    let heightCorr = 0;
    let h = distTiles0;
    // 航向锁定期间 / 需要转向 / 不需转向：与孪生 || ?: 复合式等价展开
    if (this.homingTravelTicks < this.rules.courseLockDuration) {
      // courseLock 期间不 rotate（孪生左侧短路）
    } else if (needTurn) {
      geometry.rotateVec3Towards(
        this.homingMoveDir,
        new Vector3(dir.x, this.homingMoveDir.y, dir.z),
        this.rot,
      );
      if (!this.rules.level) {
        h =
          mathUtil.clamp(Math.floor(this.initialTileDistToTarget) - 1, 0, 2) +
          mathUtil.clamp(h - 2, 0, 3);
        this._bridgeElev = this.tileOccupation.getBridgeOnTile(this.tile)?.tileElevation ?? 0;
        this._hDiff = h - (this.position.tileElevation - this._bridgeElev);
        if (this._hDiff) {
          this._hGain = 0.25 + (6 / this.iniRot) * 0.1;
          heightCorr = Coords.tileHeightToWorld(
            Math.sign(this._hDiff) * Math.min(Math.abs(this._hDiff), this._hGain),
          );
        }
      }
    } else {
      geometry.rotateVec3Towards(this.homingMoveDir, dir, this.rot);
    }
    this.direction = FacingUtil.fromMapCoords(new Vector2(this.homingMoveDir.x, this.homingMoveDir.z));

    const dist = dir.length();
    const moveLen = Math.min(dist, stepLen);
    this.homingTravelDistance += moveLen;
    this.homingTravelTicks++;
    let reach = false;
    let hit = CollisionType.None;
    let hitObj: any;
    if (dist >= Coords.LEPTONS_PER_TILE / 4) {
      const step = this.homingMoveDir.clone().setLength(moveLen);
      if (heightCorr) step.y += heightCorr;
      if (moveLen === stepLen) this.velocity.copy(step);
      const next = step.clone().add(this.position.worldPosition);
      game.map.mapBounds.isWithinHardBounds(next) ? this.position.moveByLeptons3(step) : (reach = true);
      const col = this.checkObstacles(prevPos, game);
      hit = col.type;
      hitObj = col.target;
      if (hit) reach = true;
      else {
        const rem = lock.clone().sub(this.position.worldPosition);
        const remLen = rem.length();
        dist < remLen && remLen < 2 * Coords.LEPTONS_PER_TILE && (reach = true);
      }
    } else {
      game.map.isWithinHardBounds(lock) && this.position.moveByLeptons3(dir);
      reach = true;
    }
    if (reach) {
      if (hitObj && hit === CollisionType.Wall) {
        const p = hitObj.position.worldPosition;
        this.position.moveByLeptons3(p.clone().sub(this.position.worldPosition));
      }
      this.collisionType = hit;
      this.detonate(game, hit);
    }
    return false;
  }

  /**
   * 弹道（非 homing）分支：弧弹高度解算、过冲、snap、Impact 计时。
   * @returns true=已 unspawn 终止（孪生提前 return，须跳过 sonic 尾段）
   */
  private _updateBallistic(game: any, lock: any, stepLen: number, prevPos: any, prevVel: any): boolean {
    let toAim = this.aimPoint.clone().sub(this.position.worldPosition);
    this.rules.vertical || (this.direction = FacingUtil.fromMapCoords(new Vector2(toAim.x, toAim.z)));
    if (this.rules.arcing) toAim.y = 0;
    const p = Math.min(toAim.length(), stepLen);
    toAim.setLength(p);
    if (this.rules.arcing) {
      const proj = Coords.vecWorldToGround(
        this.position.worldPosition.clone().sub(this.initialSelfPosition).add(toAim),
      );
      const delta = this.aimPoint.clone().sub(this.initialSelfPosition);
      const a = proj.length();
      const d = Coords.vecWorldToGround(delta).length();
      const f = delta.y;
      const g = game.rules.audioVisual.gravity;
      if (d)
        toAim.y =
          (((f / d) * stepLen + ((g / 2) * d) / stepLen) * a) / stepLen -
          (g * (a / stepLen) * (a / stepLen)) / 2 +
          this.initialSelfPosition.y -
          this.position.worldPosition.y;
    }
    let reach = false;
    const next = toAim.clone().add(this.position.worldPosition);
    game.map.isWithinHardBounds(next) ? this.position.moveByLeptons3(toAim) : (reach = true);
    let hit = CollisionType.None;
    let hitObj: any;
    if (1 <= p) {
      // 孪生：(p !== stepLen && !overshoot) || velocity.copy(toAim)
      // 左侧为 true 时不 copy；为 false 时执行 copy（赋值表达式为真）
      if (!(p !== stepLen && !this.overshootTiles)) this.velocity.copy(toAim);
      const col = this.checkObstacles(prevPos, game);
      hit = col.type;
      hitObj = col.target;
      if (hit || p < stepLen) reach = true;
    } else reach = true;
    if (reach) {
      if (hit) {
        if (hitObj && hit === CollisionType.Wall) {
          const wp = hitObj.isBuilding()
            ? Coords.tile3dToWorld(hitObj.tile.rx + 0.5, hitObj.tile.ry + 0.5, hitObj.tile.z)
            : hitObj.position.worldPosition;
          this.position.moveByLeptons3(wp.clone().sub(this.position.worldPosition));
        }
      } else if (this.overshootTiles) {
        const dir = Coords.vecWorldToGround(prevVel).setLength(
          this.overshootTiles * Coords.LEPTONS_PER_TILE,
        );
        geometry.rotateVec2(dir, game.generateRandomInt(-45, 45));
        const a = Coords.vecGroundToWorld(dir).add(this.position.worldPosition);
        if (!game.map.isWithinHardBounds(a)) {
          game.unspawnObject(this);
          return true;
        }
        this.position.moveByLeptons(dir.x, dir.y);
      } else if (this.snapToTarget && !this.targetLockLost) {
        if (!game.map.isWithinHardBounds(lock)) {
          game.unspawnObject(this);
          return true;
        }
        this.position.moveByLeptons3(lock.clone().sub(this.position.worldPosition));
      }
      this.collisionType = hit;
      if (this.isNuke) {
        this.state = ProjectileState.Impact;
        this.detonationTimer = 2.5 * GameSpeed.BASE_TICKS_PER_SECOND;
      } else if (
        this.fromWeapon.rules.isDiskLaser &&
        !this.isHoming() &&
        !this.rules.inaccurate
      ) {
        this.state = ProjectileState.Impact;
        this.detonationTimer = Math.max(1, Math.floor(this.fromWeapon.rules.laserDuration * 0.7));
      } else this.detonate(game, hit);
    }
    return false;
  }

  /** 是否 homing（有旋转且非弧弹）。 */
  isHoming(): any {
    return !!this.rot && !this.rules.arcing;
  }

  /** 追击时是否仍落在武器射程走廊内（飞行/地面速度比启发式）。 */
  isInHomingRange(target: any, game: any): any {
    let ok = true;
    const enemy = this.target.obj;
    if (enemy?.isUnit() && this.fromObject) {
      const helper = new RangeHelper(this.tileOccupation);
      const range = helper.computeWeaponRangeVsTarget(this.fromObject, enemy, this.fromWeapon, game.rules)
        .range;
      if (this.fromWeapon.rules.limboLaunch) {
        ok = helper.isInRange3(this.initialSelfPosition, target, 0, range + 0.5);
      } else {
        const es = enemy.moveTrait.velocity.length();
        // 孪生：es===0 时右侧短路，ok 保持 true；
        // 速度比条件不满足时也不写入 ok（保持 true）；满足时写入 isInRange 结果。
        if (es) {
          if (this.fromObject.rules.movementZone === MovementZone.Fly) {
            if (5 < this.speed / es)
              ok = helper.isInRange2(this.initialSelfPosition, this.position.worldPosition, 0, range);
          } else {
            if (isFinite(this.fromWeapon.speed) && 3.5 < this.fromWeapon.speed / enemy.rules.speed)
              ok = helper.isInRange3(this.initialSelfPosition, this.position.worldPosition, 0, range);
          }
        }
      }
    }
    return ok;
  }

  /** homing/vertical 起步加速上限。 */
  updateSpeed(max: any): any {
    if (this.isHoming() || this.rules.vertical)
      return void 0 === this.speed
        ? Math.min(max, this.rules.acceleration)
        : Math.min(max, this.speed + this.rules.acceleration);
    return max;
  }

  /** 弧弹重力衰减 / 声波按距离封顶 的最大速度。 */
  computeMaxSpeed(base: any, distTiles: any, gravity: any): any {
    let v = base;
    if (this.rules.arcing) {
      v *= (1 + gravity / 6) / 2;
      distTiles = Math.floor(distTiles);
      v *= distTiles <= 8 ? 1 : 1 + (distTiles / 8) * 0.5;
    }
    if (this.fromWeapon.warhead.rules.sonic) v = Math.ceil((distTiles * Coords.LEPTONS_PER_TILE) / 21);
    return v;
  }

  /** 一步位移的障碍检测（limbo 跳过；否则 CollisionHelper）。 */
  checkObstacles(from: any, game: any): any {
    if (this.fromWeapon.rules.limboLaunch) return { type: CollisionType.None };
    return this.collisionHelper.checkCollisions(this.position, from, {
      cliffs: this.rules.subjectToCliffs,
      ground: this.isHoming(),
      shore: this.rules.level,
      walls: this.rules.subjectToWalls,
      units:
        !this.rules.inaccurate &&
        ((owner: any) =>
          this.fromPlayer !== owner && !game.alliances.areAllied(this.fromPlayer, owner)),
    });
  }

  /** 基础伤害：Damage × baseMult × ivan 替换 × 死亡武器修正 × 老兵倍率。 */
  computeBaseDamage(game: any): any {
    const weapon = this.fromWeapon;
    const warhead = weapon.warhead;
    let dmg = weapon.rules.damage;
    if (weapon.type === WeaponType.DeathWeapon && warhead.rules.ivanBomb)
      dmg = game.rules.combatDamage.ivanDamage;
    let out = dmg * this.baseDamageMultiplier;
    if (weapon.type === WeaponType.DeathWeapon && this.fromObject)
      out *= this.fromObject.rules.deathWeaponDamageModifier;
    out *= this.veteranDamageMult;
    return out;
  }

  /**
   * 引爆主流程：destroy 自身 → 特殊弹头分支 → 常规 warhead.detonate →
   * nukeMaker → shrapnel → limbo 归位。
   */
  detonate(game: any, colType: any = CollisionType.None): void {
    const weapon: any = this.fromWeapon;
    let warhead: any = weapon.warhead;
    const zone = (this.zone = this.collisionHelper.computeDetonationZone(
      this.tile,
      this.tileElevation,
      colType,
    ));
    const tile = this.tile;
    if (weapon.type === WeaponType.DeathWeapon && warhead.rules.ivanBomb)
      warhead = new Warhead(game.rules.getWarhead(game.rules.combatDamage.ivanWarhead));
    const base = this.computeBaseDamage(game);
    game.destroyObject(this);
    this.state = ProjectileState.Detonation;
    const target = this.target.obj;
    let parasiteOk = false;
    let dmgBase = base;
    if (
      warhead.rules.parasite &&
      target?.isUnit() &&
      tile === target.tile &&
      warhead.canDamage(target, tile, zone) &&
      !target.bunkeredAt
    ) {
      if (target.isInfantry()) {
        // 步兵：寄生弹头致死伤害（孪生 a = Infinity）
        dmgBase = Number.POSITIVE_INFINITY;
      } else if (target.parasiteableTrait && this.fromObject?.isUnit()) {
        if (!(weapon instanceof Weapon))
          throw new Error("Projectile with parasite warhead must have a weapon reference");
        target.parasiteableTrait.infest(this.fromObject, weapon);
        parasiteOk = true;
      }
    }
    let doNormal = true;
    if (parasiteOk) doNormal = false;
    if (warhead.rules.sonic) doNormal = false;
    if (warhead.rules.ivanBomb) {
      doNormal = false;
      if (
        target?.isTechno() &&
        target.tntChargeTrait &&
        !target.tntChargeTrait.hasCharge() &&
        !target.isDestroyed &&
        !target.warpedOutTrait.isInvulnerable()
      )
        target.tntChargeTrait.setCharge(game.rules.combatDamage.ivanTimedDelay, game.currentTick, {
          player: this.fromPlayer,
          obj: this.fromObject,
        });
    }
    if (warhead.rules.bombDisarm) {
      doNormal = false;
      target?.isTechno() &&
        target.tntChargeTrait?.hasCharge() &&
        !target.isDestroyed &&
        target.tntChargeTrait.removeCharge();
    }
    if (warhead.rules.mindControl) {
      doNormal = false;
      if (
        this.fromObject &&
        !this.fromObject.isDestroyed &&
        target?.isTechno() &&
        target.mindControllableTrait &&
        !target.mindControllableTrait?.isActive() &&
        // harvesters (Harvester=yes) cannot be mind-controlled in vanilla YR.
        !target.rules.harvester &&
        !game.areFriendly(target, this.fromObject) &&
        warhead.canDamage(target, tile, zone) &&
        !target.invulnerableTrait.isActive() &&
        // mind control respects Verses. Controller has 0% against building
        // armors (Yuri Clone/Mastermind cannot control buildings); ControllerBuilding
        // has 100% (Yuri X can control buildings).
        0 < warhead.rules.verses.get(target.rules.armor)
      ) {
        this.fromObject.mindControllerTrait.control(target, game);
      }
    }
    if (warhead.rules.temporal) {
      doNormal = false;
      if (
        this.fromObject &&
        !this.fromObject.isDestroyed &&
        target?.isTechno() &&
        warhead.canDamage(target, tile, zone) &&
        !target.invulnerableTrait.isActive()
      ) {
        warhead.inflictDamage(0, target, { player: this.fromPlayer, weapon, obj: this.fromObject }, game);
        this.fromObject.temporalTrait.updateTarget(target, weapon, game);
      }
    }
    if (warhead.rules.makesDisguise) {
      doNormal = false;
      if (
        this.fromObject &&
        !this.fromObject.isDestroyed &&
        (this.fromObject.isInfantry() || this.fromObject.isVehicle()) &&
        target?.isUnit() &&
        target.type === this.fromObject.type
      )
        this.fromObject.disguiseTrait?.disguiseAs(target, this.fromObject, game);
    }
    if (warhead.rules.electricAssault) {
      if (
        this.fromObject?.isUnit() &&
        !this.fromObject.isDestroyed &&
        target?.isBuilding() &&
        !target.isDestroyed &&
        target.overpoweredTrait &&
        target.owner === this.fromPlayer
      )
        target.overpoweredTrait.chargeFrom(this.fromObject);
      doNormal = false;
    }
    if (doNormal)
      warhead.detonate(
        game,
        dmgBase,
        tile,
        this.tileElevation,
        this.position.worldPosition,
        zone,
        colType,
        this.target,
        { player: this.fromPlayer, weapon, obj: this.fromObject },
        this.isShrapnel ? SpecialWarheadType.Shrapnel : SpecialWarheadType.None,
        this.impactAnim,
      );

    if (warhead.rules.nukeMaker) {
      const nuke: any = this.fromObject
        ? (() => {
            const w = Weapon.factory(
              Weapon.NUKE_PAYLOAD_NAME,
              WeaponType.Primary,
              this.fromObject,
              game.rules,
            );
            return game.createProjectile(w.projectileRules.name, this.fromObject, w, this.target, false);
          })()
        : game.createLooseProjectile(Weapon.NUKE_PAYLOAD_NAME, this.fromPlayer, this.target);
      nuke.isNuke = true;
      nuke.impactAnim = "NUKEBALL";
      const t = this.target.tile;
      nuke.position.moveToTileCoords(t.rx + 0.5, t.ry + 0.5);
      nuke.position.tileElevation = this.position.tileElevation;
      game.spawnObject(nuke, t);
    }

    // 碎片弹：命中地面可伤目标时按 shrapnelCount 散射
    if (
      this.rules.shrapnelCount &&
      this.rules.shrapnelWeapon &&
      ((this.target.obj
        ? !this.target.obj.isBuilding()
        : game.map
            .getGroundObjectsOnTile(this.target.tile)
            .some((e: any) => e.isTerrain() || e.isTechno()) &&
          !weapon.projectileRules.isAntiAir) ||
        this.isShrapnel)
    ) {
      const shapWeapon = game.rules.getWeapon(this.rules.shrapnelWeapon);
      const shapProj = game.rules.getProjectile(shapWeapon.projectile);
      let budget: any = this.rules.shrapnelCount;
      const helper = new RangeHelper(game.map.tileOccupation);
      const ring = new RadialTileFinder(
        game.map.tiles,
        game.map.mapBounds,
        tile,
        { width: 1, height: 1 },
        1,
        shapWeapon.range,
        (t: any) => helper.isInTileRange(tile, t, shapWeapon.minimumRange, shapWeapon.range),
      );
      const picked = new Set<any>();
      for (; 0 < Math.floor(budget); ) {
        const t = ring.getNextTile();
        if (!t) break;
        for (const obj of game.map.tileOccupation
          .getObjectsOnTileByLayer(t, shapProj.isAntiAir ? LayerType.Air : LayerType.Ground)
          .filter(
            (e: any) =>
              game.isValidTarget(e) &&
              (e.isTerrain() ||
                (e.isTechno() &&
                  e.owner !== this.fromPlayer &&
                  !game.alliances.areAllied(e.owner, this.fromPlayer) &&
                  !(e.isInfantry() && e.stance === StanceType.Paradrop))),
          ))
          if (
            !picked.has(obj) &&
            (picked.add(obj), (budget = Math.max(0, budget - 1 - (obj.isTechno() ? 0.5 : 0))), Math.floor(budget) <= 0)
          )
            break;
      }
      for (const obj of picked) {
        const tgt = game.createTarget(obj.isTerrain() ? void 0 : obj, obj.tile);
        this.createShrapnel(game, tgt, shapWeapon.name);
      }
      budget = Math.floor(budget);
      const rand = new RandomTileFinder(
        game.map.tiles,
        game.map.mapBounds,
        tile,
        shapWeapon.range,
        game,
        (t: any) => helper.isInTileRange(tile, t, shapWeapon.minimumRange, shapWeapon.range),
      );
      for (let n = 0; n < budget; n++) {
        const t = rand.getNextTile();
        if (!t) break;
        this.createShrapnel(game, game.createTarget(void 0, t), shapWeapon.name);
      }
    }

    // limbo launch：发射者回到地图（地面找落点，飞行保留原 tile）
    if (weapon.rules.limboLaunch && !parasiteOk && this.fromObject?.isUnit()) {
      const unit = this.fromObject;
      if (
        warhead.rules.parasite &&
        (this.target.obj.isVehicle() || this.target.obj?.isAircraft()) &&
        this.target.obj.parasiteableTrait
      )
        this.target.obj.parasiteableTrait.beingBoarded = false;
      let land: any, onBridge: any;
      const flying = unit.rules.movementZone === MovementZone.Fly;
      if (flying) {
        land = tile;
        onBridge = false;
      } else {
        const skipBridge =
          this.target.obj.isUnit() &&
          this.target.obj.tile.onBridgeLandType &&
          !this.target.obj.onBridge
            ? void 0
            : game.map.tileOccupation.getBridgeOnTile(tile);
        const posHelper = new MovePositionHelper(game.map);
        const finder = new RadialTileFinder(
          game.map.tiles,
          game.map.mapBounds,
          tile,
          { width: 1, height: 1 },
          0,
          1,
          (t: any) => {
            const br = game.map.tileOccupation.getBridgeOnTile(t);
            return (
              0 < game.map.terrain.getPassableSpeed(t, unit.rules.speedType, unit.isInfantry(), !!br) &&
              posHelper.isEligibleTile(t, br, skipBridge, tile) &&
              (t === tile || !game.map.terrain.findObstacles({ tile: t, onBridge: skipBridge }, unit).length)
            );
          },
        );
        land = finder.getNextTile();
        onBridge = !!land?.onBridgeLandType;
      }
      if (land) {
        if (!flying && this.target.obj.isUnit()) {
          unit.onBridge = onBridge;
          unit.position.tileElevation = onBridge
            ? (game.map.tileOccupation.getBridgeOnTile(land)?.tileElevation ?? 0)
            : 0;
        }
        game.unlimboObject(unit, land);
        if (unit.isInfantry()) unit.position.subCell = this.target.obj.position.subCell;
        unit.direction = this.direction;
      } else unit.owner.removeOwnedObject(unit);
    }
  }

  /** 生成一枚碎片子弹并继承老兵倍率/位置。 */
  createShrapnel(game: any, target: any, weaponName: any): void {
    const s = game.createLooseProjectile(weaponName, this.fromPlayer, target);
    s.isShrapnel = true;
    s.veteranDamageMult = this.veteranDamageMult;
    s.position.moveToLeptons(this.position.getMapPosition());
    s.position.tileElevation = this.position.tileElevation;
    game.spawnObject(s, s.position.tile);
  }

  /** 对移动目标的提前量落点（拦截点 + 非空判定）。 */
  computeAimPointVersusMovingTarget(target: any, mySpeed: any, from: any, map: any): any {
    const pos = target.position.worldPosition;
    let best = pos.clone();
    const enemySpeed = target.moveTrait.velocity.length();
    if (mySpeed < 3 * enemySpeed) return pos.clone();
    let intercept = TargetUtil.computeInterceptPoint(from, mySpeed, pos, target.moveTrait.velocity);
    if (intercept.length()) {
      const delta = intercept.clone().sub(pos);
      const dist = delta.length();
      const eta = enemySpeed ? Math.ceil(dist / enemySpeed) : 0;
      intercept = pos.clone().add((delta as any).setLength(eta * enemySpeed));
      if (map.isWithinHardBounds(intercept)) {
        if (target.zone !== ZoneType.Air) {
          intercept.multiplyScalar(1 / Coords.LEPTONS_PER_TILE);
          const p = target.position.clone();
          p.moveToTileCoords(intercept.x, intercept.z);
          best = p.worldPosition;
        } else best = intercept;
      } else best = pos;
    }
    return best.clone();
  }
}
