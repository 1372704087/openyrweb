/**
 * MagnetronDragTask — 磁电坦克磁场光束拖拽任务（原版尤里复仇行为还原）。
 *
 * 原版 YR 行为参考（ModEnc / CnC Wiki 考证）：
 *  - IsLocomotor=yes 弹头命中载具后，临时将目标的 Locomotor 替换为
 *    Jumpjet，使其升空并拖向磁电。受害者变为空中单位（zone=Air），
 *    可被防空武器攻击，自身武器失效（战斗要塞内部乘员例外）；
 *  - 磁电持续开火（ROF=20）时每次命中刷新 locomotor，维持拖拽。磁电
 *    停止开火（死亡、新命令、目标被毁、超射程）时 locomotor 失效，
 *    受害者坠落；
 *  - 受害者被拖到磁电附近后，扔在磁电附近一个随机的、尽量空闲的格子上；
 *  - 落点格子上的地面单位被碾压，伤害值 = 坠落单位的 base
 *    （CurrentStrengthDamage ? 当前血量 : 最大血量），经 CrushWarhead；
 *  - 非两栖单位落水 → 沉没摧毁；受控投放到空旷地面 → 安全落地；
 *  - 非受控坠落（光束断裂/磁电死亡）时，坠落单位自身另受
 *    base × FallingDamageMultiplier（默认 1.0）伤害。受控投放不结算
 *    自身坠落伤害（否则默认系数会把空地投放打成自杀，与原版磁电
 *    可安全投放的玩法矛盾）。
 *
 * 本引擎实现说明：
 *  - 直接编辑受害者位置（不使用真实 Jumpjet locomotor），但正确模拟
 *    zone=Air、事件分发（ObjectLiftOffEvent/ObjectLandEvent）和坠落伤害；
 *  - AttackTask 的 magDragging 标志已跳过 canTarget 检查，磁电的纯对地
 *    MagneticBeam 武器在受害者变为 Air 后仍能持续锁定目标；
 *  - 拖拽持续判定：检查磁电是否有活跃 AttackTask 指向受害者——近似
 *    原版的"持续开火即拖拽"行为；
 *  - 自包含：每 tick 直接驱动受害者位置，不派生 MoveTask 子任务；保持
 *    moveTrait.moveState = Idle 使 MoveTrait.NotifyTick 休眠；
 *  - `_controlledDrop`：拖到磁电附近并投放（含就地投放）为受控；
 *    光束断裂/磁电消失为非受控，触地时才结算自身坠落伤害；
 *  - onEnd 在 `_aborted` 时只回滚本任务建立的状态，不动别人的拖拽链接。
 *
 * 拖拽物理参数：巡航高度 500 leptons、爬升 20/tick、水平漂移 20/tick、
 * 重力 4/tick²、拖近到 2 格内寻找落点（半径 2 格搜索）。
 *
 * 由 game/gameobject/task/MagnetronDragTask.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as RandomTileFinderModule from "game/map/tileFinder/RandomTileFinder"; // 未转换（any-shim）
import { Coords } from "game/Coords"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换
import { ZoneType, getZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { MoveState } from "game/gameobject/trait/MoveTrait"; // 已转换
import * as ObjectLandEventModule from "game/event/ObjectLandEvent"; // 未转换（any-shim）
import * as ObjectLiftOffEventModule from "game/event/ObjectLiftOffEvent"; // 未转换（any-shim）
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import { LandType } from "game/type/LandType"; // 已转换
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { Warhead } from "game/Warhead"; // 已转换
import { AttackState } from "game/gameobject/trait/AttackTrait"; // 已转换

// 拖拽物理参数。
const CRUISE_HEIGHT = 500; // 地面以上 leptons
const CLIMB_RATE = 20; // leptons/帧 爬升速度
const HORIZ_SPEED = 20; // leptons/帧 水平漂移速度
const FALL_GRAVITY = 4; // leptons/帧² 重力加速度
const DRAG_DIST_TILES = 2; // 到达此距离内时寻找落点
const DROP_SEARCH_RADIUS = 2; // 落点搜索半径（格）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MagnetronDragTask extends Task {
  game: any;
  victim: any;
  magnetron: any;
  _tickCount: number;
  _dropped: boolean;
  _dropping: boolean;
  _fallSpeed: number;
  _dropTile: any;
  _movingToDrop: boolean;
  /** 安全上限（约 20 秒）。超时但仍在空中时，onEnd 强制落地。 */
  _maxTicks: number;
  /** 受控投放（磁电拖到位后放下）：不结算自身坠落伤害。 */
  _controlledDrop: boolean;
  _aborted: boolean;

  constructor(game: any, victim: any, magnetron: any) {
    super();
    this.game = game;
    this.victim = victim;
    this.magnetron = magnetron;
    this._tickCount = 0;
    this._dropped = false;
    this._dropping = false;
    this._fallSpeed = 0;
    this._dropTile = null;
    this._movingToDrop = false;
    this._maxTicks = 300;
    this._controlledDrop = false;
    this.cancellable = true;
    this.blocking = true;
    this.preventOpportunityFire = true;
  }

  /**
   * 启动：受害者有效性校验（不存在/已销毁/缺移动特性/已被其它磁电
   * 拖拽 → 中止）；将受害者置为空中单位（zone=Air）并派发升空事件，
   * 建立双向链接（victim.magnetronDraggedBy / magnetron.magnetronDragging，
   * 后者供磁电渲染器绘制持续牵引光束），保持 MoveTrait 休眠。
   */
  onStart(unit: any): void {
    const victim = this.victim;
    if (!victim || victim.isDisposed || victim.isDestroyed) {
      this._aborted = true;
      return;
    }
    if (!victim.moveTrait || !victim.unitOrderTrait) {
      this._aborted = true;
      return;
    }
    if (victim.magnetronDraggedBy) {
      this._aborted = true;
      return;
    }
    // 原版 YR：IsLocomotor 弹头将受害者的 Locomotor 替换为 Jumpjet，
    // 使其变为空中单位。AttackTask 的 magDragging 标志已跳过 canTarget
    // 检查，磁电的纯对地武器在受害者变为 Air 后仍能持续锁定。
    victim.zone = ZoneType.Air;
    victim.onBridge = false;
    try {
      this.game.events.dispatch(new ObjectLiftOffEventModule.ObjectLiftOffEvent(victim));
    } catch (err) {}
    victim.magnetronDraggedBy = this.magnetron;
    // 反向链接：磁电渲染器（MagnetronBeamPlugin）读取此字段绘制光束。
    this.magnetron.magnetronDragging = victim;
    // 保持 MoveTrait 休眠，不干扰直接位置编辑。
    try {
      victim.moveTrait.locomotor = undefined;
      victim.moveTrait.moveState = MoveState.Idle;
      if (victim.moveTrait.velocity) victim.moveTrait.velocity.set(0, 0, 0);
    } catch (err) {}
  }

  /** 每 tick 驱动拖拽/坠落物理（见类注释）。 */
  onTick(unit: any): boolean {
    if (this._aborted) return true;
    const victim = this.victim;
    if (!victim || victim.isDisposed || victim.isDestroyed) return true;
    if (++this._tickCount > this._maxTicks) return true;
    // 坠落阶段——仅驱动重力下落。
    if (this._dropping) {
      return this._descend(victim);
    }
    const magnetron = this.magnetron;
    const magnetronGone = !magnetron || magnetron.isDisposed || magnetron.isDestroyed;
    if (magnetronGone) {
      // 磁电没了 → 断束坠落（非受控）。
      this._startDrop(magnetron, victim);
      return this._descend(victim);
    }
    if (this._isBeamBroken(magnetron, victim)) {
      this._startDrop(magnetron, victim);
      return this._descend(victim);
    }
    // 光束活跃：保持磁电视觉上持续开火（连续光束）。
    magnetron.isFiring = true;
    // 若正在移向落点格子，继续水平移动。
    if (this._movingToDrop && this._dropTile) {
      this._moveToDropTile(victim, magnetron);
      if (this._dropping) return this._descend(victim);
      return false;
    }
    // 爬升到巡航高度并向磁电水平漂移。
    this._liftAndDrag(victim, magnetron);
    if (this._dropping) return this._descend(victim);
    return false;
  }

  /** 磁场光束期间：将受害者提升到巡航高度并水平拉向磁电。 */
  _liftAndDrag(victim: any, magnetron: any): void {
    const pos = victim.position;
    const beforeTile = victim.tile;
    const worldY = pos.worldPosition.y;
    const groundY = this._groundWorldY(victim);
    const targetY = groundY + CRUISE_HEIGHT;
    if (worldY < targetY - 0.5) {
      // 爬升阶段：向巡航高度上升。无水平移动，无浮动。
      const dy = Math.min(CLIMB_RATE, targetY - worldY);
      try {
        pos.moveByLeptons3(new Vector3(0, dy, 0));
      } catch (err) {}
      this._syncTile(victim, beforeTile);
      return;
    }
    // 巡航高度——向磁电水平拖拽。
    let dx = 0;
    let dz = 0;
    if (magnetron && magnetron.position) {
      const victimPos = pos.getMapPosition();
      const magnetronPos = magnetron.position.getMapPosition();
      const hx = magnetronPos.x - victimPos.x;
      const hz = magnetronPos.y - victimPos.y;
      const hlen = Math.hypot(hx, hz);
      const minSep = DRAG_DIST_TILES * Coords.LEPTONS_PER_TILE;
      // 已拖到磁电附近——寻找随机落点（原版行为，受控投放）。
      if (hlen <= minSep + 0.01) {
        this._initiateDrop(victim, magnetron);
        return;
      }
      const want = Math.max(0, hlen - minSep);
      const step = Math.min(HORIZ_SPEED, want);
      if (hlen > 0.001 && step > 0) {
        dx = (hx / hlen) * step;
        dz = (hz / hlen) * step;
      }
    }
    if (dx !== 0 || dz !== 0) {
      try {
        pos.moveByLeptons3(new Vector3(dx, 0, dz));
      } catch (err) {}
    }
    this._syncTile(victim, beforeTile);
    // 在巡航高度上叠加波浪浮动效果（约 5 秒一个完整起伏周期）。
    const floatAmplitude = 30;
    const floatFrequency = 0.02094;
    const floatOffset = floatAmplitude * Math.sin(this._tickCount * floatFrequency);
    let finalY = targetY + floatOffset;
    if (finalY < groundY + 10) finalY = groundY + 10;
    try {
      pos.setAbsoluteElevationWorld(finalY);
    } catch (err) {}
  }

  /** 受害者到达磁电附近：寻找随机空闲落点并开始移向该格（受控投放）。 */
  _initiateDrop(victim: any, magnetron: any): void {
    this._controlledDrop = true;
    const dropTile = this._findDropTile(magnetron);
    if (dropTile) {
      this._dropTile = dropTile;
      this._movingToDrop = true;
    } else {
      // 未找到空闲格子——就地受控坠落。
      this._dropping = true;
      this._fallSpeed = 0;
      this._startDrop(magnetron, victim);
    }
  }

  /** 向落点格子水平移动（巡航高度不变），到格子上方开始坠落。 */
  _moveToDropTile(victim: any, magnetron: any): void {
    const pos = victim.position;
    const beforeTile = victim.tile;
    const targetTile = this._dropTile;
    if (!targetTile) {
      this._dropping = true;
      this._fallSpeed = 0;
      this._startDrop(magnetron, victim);
      return;
    }
    // 落点格子的世界坐标中心。
    const targetLeptons = new Vector2(
      targetTile.rx * Coords.LEPTONS_PER_TILE + Coords.LEPTONS_PER_TILE / 2,
      targetTile.ry * Coords.LEPTONS_PER_TILE + Coords.LEPTONS_PER_TILE / 2,
    );
    const victimPos = pos.getMapPosition();
    const dx = targetLeptons.x - victimPos.x;
    const dz = targetLeptons.y - victimPos.y;
    const hlen = Math.hypot(dx, dz);
    if (hlen <= HORIZ_SPEED + 0.01) {
      // 到达落点格子上方——开始坠落。
      try {
        pos.moveByLeptons3(new Vector3(dx, 0, dz));
      } catch (err) {}
      this._syncTile(victim, beforeTile);
      this._dropping = true;
      this._fallSpeed = 0;
      this._startDrop(magnetron, victim);
      return;
    }
    const step = Math.min(HORIZ_SPEED, hlen);
    if (hlen > 0.001 && step > 0) {
      try {
        pos.moveByLeptons3(new Vector3((dx / hlen) * step, 0, (dz / hlen) * step));
      } catch (err) {}
    }
    this._syncTile(victim, beforeTile);
    // 保持巡航高度 + 浮动。
    const groundY = this._groundWorldY(victim);
    const targetY = groundY + CRUISE_HEIGHT;
    const floatAmplitude = 30;
    const floatFrequency = 0.02094;
    const floatOffset = floatAmplitude * Math.sin(this._tickCount * floatFrequency);
    let finalY = targetY + floatOffset;
    if (finalY < groundY + 10) finalY = groundY + 10;
    try {
      pos.setAbsoluteElevationWorld(finalY);
    } catch (err) {}
  }

  /**
   * 在磁电附近找一个随机的空闲地面格子作为落点。
   * 缺 prng 时用确定性回退（始终取候选下界），避免联机/回放分叉。
   */
  _findDropTile(magnetron: any): any {
    try {
      const game = this.game;
      const victim = this.victim;
      const rng =
        game.prng && game.prng.generateRandomInt
          ? game.prng
          : {
              generateRandomInt: function (a: number, _b: number) {
                return a;
              },
            };
      const finder = new RandomTileFinderModule.RandomTileFinder(
        game.map.tiles,
        game.map,
        magnetron.tile,
        DROP_SEARCH_RADIUS,
        rng,
        (tile: any) => {
          if (!tile) return false;
          // 排除被其他地面 techno 占据的格子。
          const objs = game.map.tileOccupation.getGroundObjectsOnTile(tile);
          for (let i = 0; i < objs.length; i++) {
            const o = objs[i];
            if (o !== victim && o.isTechno && o.isTechno()) return false;
          }
          return true;
        },
        false, // includeStartTile
        true, // checkBounds
      );
      return finder.getNextTile();
    } catch (err) {
      return null;
    }
  }

  /**
   * 判断磁电是否已不再主动攻击此受害者（近似原版"持续开火即拖拽"：
   * 存在以该受害者为目标的活跃 AttackTask 时光束存活）。
   */
  _isBeamBroken(magnetron: any, victim: any): boolean {
    if (!magnetron || magnetron.isDisposed || magnetron.isDestroyed) return true;
    try {
      const unitOrderTrait = magnetron.unitOrderTrait;
      if (unitOrderTrait) {
        const tasks = unitOrderTrait.getTasks();
        for (let ti = 0; ti < tasks.length; ti++) {
          const t = tasks[ti];
          if (t && !t.isCancelling() && t.target && t.target.obj === victim && typeof t.getWeapon === "function") {
            return false;
          }
        }
      }
    } catch (err) {}
    return true;
  }

  /**
   * 标记光束断裂：清除磁电拖拽状态、停止视觉光束，并取消仍以该受害者
   * 为目标的 AttackTask（磁电不再重新攻击已落地的受害者）。
   */
  _startDrop(magnetron: any, victim: any): void {
    if (!magnetron || magnetron.magnetronDragging !== victim) return;
    magnetron.magnetronDragging = undefined;
    magnetron.isFiring = false;
    try {
      const unitOrderTrait = magnetron.unitOrderTrait;
      if (unitOrderTrait) {
        const tasks = unitOrderTrait.getTasks();
        for (let ti = 0; ti < tasks.length; ti++) {
          const t = tasks[ti];
          if (t && !t.isCancelling() && t.target && t.target.obj === victim && typeof t.getWeapon === "function") {
            t.cancel();
          }
        }
      }
      if (magnetron.attackTrait) {
        const currentTarget = magnetron.attackTrait.currentTarget;
        if (!currentTarget || currentTarget.obj === victim) {
          magnetron.attackTrait.currentTarget = undefined;
          magnetron.attackTrait.attackState = AttackState.Idle;
        }
      }
    } catch (err) {}
  }

  /** 坠落阶段：重力加速下落，触地后恢复 zone 并结算坠落伤害。 */
  _descend(victim: any): boolean {
    if (this._dropped) return true;
    this._dropping = true;
    const pos = victim.position;
    const groundY = this._groundWorldY(victim);
    const worldY = pos.worldPosition.y;
    if (worldY > groundY + 0.5) {
      this._fallSpeed += FALL_GRAVITY;
      const step = Math.min(this._fallSpeed, worldY - groundY);
      try {
        pos.setAbsoluteElevationWorld(worldY - step);
      } catch (err) {}
      return false;
    }
    try {
      pos.setAbsoluteElevationWorld(groundY);
    } catch (err) {}
    this._dropped = true;
    this._fallSpeed = 0;
    // 原版 YR：落地时恢复 zone=Ground，分发 ObjectLandEvent。
    this._restoreZone(victim);
    this._applyDrop(victim, this.game);
    return true;
  }

  /** 恢复受害者的 zone 为地面（按落点地形，含桥面）。 */
  _restoreZone(victim: any): void {
    try {
      const tile = victim.tile;
      if (tile) {
        const landType = tile.onBridgeLandType != null ? tile.onBridgeLandType : tile.landType;
        victim.zone = getZoneType(landType);
      } else {
        victim.zone = ZoneType.Ground;
      }
      this.game.events.dispatch(new ObjectLandEventModule.ObjectLandEvent(victim));
    } catch (err) {}
  }

  /** 受害者所在格子的地面世界 Y 坐标（tile.z 换算）。 */
  _groundWorldY(victim: any): number {
    const tile = victim.tile;
    const z = tile ? tile.z : 0;
    return Coords.tileHeightToWorld(z);
  }

  /** 漂移过程中保持受害者在当前格子上的注册（跨格时迁移占据）。 */
  _syncTile(victim: any, beforeTile: any): void {
    try {
      const after = victim.tile;
      if (beforeTile && after && (beforeTile.rx !== after.rx || beforeTile.ry !== after.ry)) {
        this.game.map.tileOccupation.unoccupyTileRange(beforeTile, victim);
        this.game.map.tileOccupation.occupyTileRange(after, victim);
        if (this.game.map.technosByTile) this.game.map.technosByTile.updateObject(victim);
      }
    } catch (err) {}
  }

  /**
   * 落地结算（ModEnc 考证 + 玩法一致性）：
   *  - base = CurrentStrengthDamage ? 当前血量 : 最大血量；
   *  - 落点地面 techno：CrushWarhead 碾压，伤害 = base；
   *  - 非两栖落水 → DeathType.Sink 摧毁；
   *  - 自身坠落伤害 = base × FallingDamageMultiplier：仅非受控坠落
   *    （光束断裂等）结算；受控投放空地/砸人时自身安全。
   */
  _applyDrop(victim: any, game: any): void {
    try {
      if (!victim || victim.isDisposed || victim.isDestroyed || !victim.healthTrait) return;
      const combatDamage = game.rules && game.rules.combatDamage;
      const multiplier = combatDamage ? combatDamage.fallingDamageMultiplier : 1;
      const useCurrent = combatDamage ? combatDamage.currentStrengthDamage : true;
      const baseStrength = useCurrent ? victim.healthTrait.getHitPoints() : victim.healthTrait.maxHitPoints;
      const fallDmg = Math.max(1, Math.round(baseStrength * (multiplier == null ? 1 : multiplier)));
      // 碾压所有站在落点格子上的地面 techno。
      const targets = [];
      try {
        const onTile = game.map.tileOccupation.getGroundObjectsOnTile(victim.tile) || [];
        for (let oi = 0; oi < onTile.length; oi++) {
          const o = onTile[oi];
          if (!o || o === victim || o.isDestroyed) continue;
          if (!o.isTechno || !o.isTechno()) continue;
          if (!o.healthTrait) continue;
          targets.push(o);
        }
      } catch (err) {}
      if (targets.length) {
        const crushWarheadName = (combatDamage && combatDamage.crushWarhead) || "Crush";
        let crushWarhead: any = undefined;
        try {
          const warheadRules = game.rules.getWarhead && game.rules.getWarhead(crushWarheadName);
          if (warheadRules) crushWarhead = new Warhead(warheadRules);
        } catch (err) {}
        const attackerInfo = { obj: victim, player: victim.owner, weapon: undefined };
        for (let ti = 0; ti < targets.length; ti++) {
          const target = targets[ti];
          try {
            if (target.isInfantry && target.isInfantry()) target.infDeathType = 0;
            target.deathType = DeathType.Crush;
            if (crushWarhead && crushWarhead.computeDamage && crushWarhead.inflictDamage) {
              const reduced = crushWarhead.computeDamage(baseStrength, target, game);
              crushWarhead.inflictDamage(reduced, target, attackerInfo, game);
            } else {
              target.healthTrait.inflictDamage(baseStrength, attackerInfo, game);
              if ((target.healthTrait && target.healthTrait.getHitPoints() <= 0) || target.isDestroyed) {
                this._forceDestroyObject(target, game, attackerInfo);
              }
            }
          } catch (err) {}
        }
      }
      // 非两栖载具在水格上 → 直接摧毁（沉没）。有碾压对象时落点仍是该格，同样适用。
      if (victim.tile && victim.tile.landType === LandType.Water && victim.rules && victim.rules.speedType !== SpeedType.Amphibious) {
        try {
          victim.deathType = DeathType.Sink;
          this._forceDestroyObject(victim, game);
        } catch (err) {}
        return;
      }
      // 自身坠落伤害：仅非受控坠落。受控投放（含砸中地面单位）自身安全。
      if (!this._controlledDrop && !victim.isDestroyed && victim.healthTrait) {
        try {
          victim.deathType = DeathType.Crush;
          victim.healthTrait.inflictDamage(fallDmg, { obj: undefined }, game);
          if ((victim.healthTrait && victim.healthTrait.getHitPoints() <= 0) || victim.isDestroyed) {
            this._forceDestroyObject(victim, game);
          }
        } catch (err) {}
      }
    } catch (err) {}
  }

  /**
   * OpenYRWeb：安全销毁无 limboData 的 techno 对象。game.destroyObject
   * 强制要求 techno 有 limboData，但被磁电拖拽的单位（zone=Air）并未
   * 经过 limbo 流程，直接调用会抛异常——回退为手动标记销毁并从世界移除。
   */
  _forceDestroyObject(obj: any, game: any, attackerInfo?: any): void {
    const info = attackerInfo || { obj: undefined };
    try {
      game.destroyObject(obj, info);
    } catch (e) {
      if (!obj || obj.isDestroyed || obj.isDisposed) return;
      try {
        obj.isDestroyed = true;
        if (obj.healthTrait) obj.healthTrait.health = 0;
        obj.onDestroy(game, info);
        game.map.tileOccupation.unoccupyTileRange(obj.tile, obj);
        if (obj.isTechno && obj.isTechno()) {
          if (game.unitSelection) game.unitSelection.cleanupUnit(obj);
          if (game.map.technosByTile) game.map.technosByTile.remove(obj);
          if (obj.owner) obj.owner.removeOwnedObject(obj);
        }
        game.world.removeObject(obj);
        game.updatableObjects.delete(obj);
        obj.onUnspawn(game);
      } catch (e2) {}
    }
  }

  /**
   * 收尾：`_aborted` 时只回滚本任务可能写入的状态（且不碰别人建立的
   * 拖拽链接）；正常结束时强制落地、结算未完成的坠落、恢复 MoveTrait、
   * 清除双向链接并取消残留 AttackTask。
   */
  onEnd(unit: any): void {
    const victim = this.victim;
    if (this._aborted) {
      // onStart 校验失败：本任务未建立拖拽。绝不 clear 别人的 magnetronDraggedBy。
      if (victim && this.magnetron && this.magnetron.magnetronDragging === victim && victim.magnetronDraggedBy === this.magnetron) {
        this.magnetron.magnetronDragging = undefined;
        victim.magnetronDraggedBy = undefined;
      }
      this._aborted = false;
      return;
    }
    if (!victim || victim.isDisposed || victim.isDestroyed) {
      return;
    }
    try {
      if (victim.position) {
        const groundY = this._groundWorldY(victim);
        if (victim.position.worldPosition.y > groundY + 0.5) victim.position.setAbsoluteElevationWorld(groundY);
      }
      if (victim.zone === ZoneType.Air) this._restoreZone(victim);
    } catch (err) {}
    // 取消/超时：走完落地结算（受控标志保持，决定是否算自身坠落伤害）。
    if (!this._dropped) {
      try {
        this._applyDrop(victim, this.game);
      } catch (err) {}
    }
    // 恢复受害者的移动状态。
    if (victim.moveTrait) {
      victim.moveTrait.locomotor = undefined;
      victim.moveTrait.moveState = MoveState.Idle;
      if (victim.moveTrait.velocity) victim.moveTrait.velocity.set(0, 0, 0);
    }
    // 只清本任务建立的正向链接。
    if (victim.magnetronDraggedBy === this.magnetron) {
      victim.magnetronDraggedBy = undefined;
    }
    // 清除反向链接并取消残留 AttackTask。
    if (this.magnetron && this.magnetron.magnetronDragging === victim) {
      this.magnetron.magnetronDragging = undefined;
      try {
        const unitOrderTrait = this.magnetron.unitOrderTrait;
        if (unitOrderTrait) {
          const tasks = unitOrderTrait.getTasks();
          for (let ti = 0; ti < tasks.length; ti++) {
            const t = tasks[ti];
            if (t && !t.isCancelling() && t.target && t.target.obj === victim && typeof t.getWeapon === "function") {
              t.cancel();
            }
          }
        }
        if (this.magnetron.attackTrait) {
          const currentTarget = this.magnetron.attackTrait.currentTarget;
          if (!currentTarget || currentTarget.obj === victim) {
            this.magnetron.attackTrait.currentTarget = undefined;
            this.magnetron.attackTrait.attackState = AttackState.Idle;
            this.magnetron.isFiring = false;
          }
        }
      } catch (err) {}
    }
  }
}
