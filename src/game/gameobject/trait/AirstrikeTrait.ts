/**
 * AirstrikeTrait — Boris 空袭制导 trait。
 *
 * 空袭需要 Boris 持续激光制导：在炸弹投下前他移动或死亡会中断制导，
 * 飞机放弃攻击返航；仍在空中时重新锁定目标可召回他们。
 *
 * 状态机（见 update 分发器）：
 *  - 首次触发 → Execute：立刻刷出 MiG 编队并标记目标；
 *  - 中断后再次触发 → 重新锁定召回返航中的飞机；
 *  - 仍有挂弹飞机时切换目标 → 仅把挂弹飞机转向新目标；
 *  - 全部投弹完毕 → _armPendingLaunch：激光锁定建筑，等
 *    AirstrikeRechargeTime 倒数后刷下一波；
 *  - Cancel：制导断裂（Boris 移动/死亡），全部返航并播任务中止语音；
 *  - Reset：全部 MiG 飞出地图或被毁后归零，重新空袭需等冷却。
 *
 * 自动重锁：空袭后幸存的建筑会被自动重新锁定，持续轰炸直到摧毁。
 *
 * 由 game/gameobject/trait/AirstrikeTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 孪生
import { FacingUtil } from "game/gameobject/unit/FacingUtil"; // 孪生
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 孪生
import { AttackTask } from "game/gameobject/task/AttackTask"; // 孪生
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 孪生
import { Coords } from "game/Coords"; // 孪生
import { Vector2 } from "game/math/Vector2"; // 孪生
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 本组新写
import * as TriggerSoundFxEventModule from "game/event/TriggerSoundFxEvent"; // 孪生
import { FactoryType } from "game/rules/TechnoRules"; // 孪生

export class AirstrikeTrait {
  /** 下一波空袭冷却剩余 tick（>0 且无 pendingLaunch 时不可再触发）。 */
  cooldownTicks: number;
  /** 原版 AirstrikeClass::Fired：已刷出飞机，直到全部离场才回 false。 */
  fired: boolean;
  /** 制导已中断（Boris 在投弹前移动/死亡），重新锁定可召回。 */
  interrupted: boolean;
  /** 开火后短暂忽略移动的宽限 tick（避免刚下令的减速误取消制导）。 */
  _guideGraceTicks: number;
  /** 已请求下一波：激光先锁定，旧波清空且冷却归零后才刷机。 */
  pendingLaunch: boolean;
  /** 原版 AirstrikeClass::TeamList：当前在空中的本波飞机。 */
  teamMiGs: any[];
  /** 目标建筑/格（渲染侧 AirstrikeLaserPlugin 读取画制导光束）。 */
  targetObject: any;
  targetTile: any;
  /** 首架 MiG 开火时播一次「Target acquired!」。 */
  _targetAcquiredVoicePlayed: boolean;
  /** 已投弹的 MiG（Ammo 耗尽，不可再被重定向）。 */
  _migFired: Set<any>;
  /** 已播坠毁语音的 MiG。 */
  _migDeathVoiced: Set<any>;
  /** 是否正由本 trait 强制 Boris 的攻击动画（仅本 trait 可清除）。 */
  _guidanceAnimating: boolean;
  /** 活动激光引用（dispose 清空；渲染侧可读）。 */
  activeLaser: any;

  constructor() {
    this.cooldownTicks = 0;
    this.fired = false;
    this.interrupted = false;
    this._guideGraceTicks = 0;
    this.pendingLaunch = false;
    this.teamMiGs = [];
    this.targetObject = null;
    this.targetTile = null;
    this._targetAcquiredVoicePlayed = false;
    this._migFired = new Set();
    this._migDeathVoiced = new Set();
    this._guidanceAnimating = false;
    // activeLaser 不在构造中初始化（与孪生一致，运行时再挂载）
  }

  /**
   * 是否可再次下令空袭：冷却中且无 pendingLaunch 则不可；有规则
   * airstrikeTeamType 才可用。pendingLaunch 时仍允许点击以移动锁定。
   */
  isReady(gameObject: any): boolean {
    if (this.cooldownTicks > 0 && !this.pendingLaunch) return false;
    const rules = gameObject.rules;
    if (!rules.airstrikeTeamType) return false;
    return true;
  }

  /** 按 Elite 级取编队配置（数量/机型/冷却），普通级回落默认。 */
  getAirstrikeTeam(gameObject: any) {
    const isElite = gameObject.veteranTrait && gameObject.veteranTrait.isElite();
    if (isElite) {
      return {
        count: gameObject.rules.eliteAirstrikeTeam || gameObject.rules.airstrikeTeam || 2,
        planeType:
          gameObject.rules.eliteAirstrikeTeamType || gameObject.rules.airstrikeTeamType,
        rechargeTime:
          gameObject.rules.eliteAirstrikeRechargeTime ||
          gameObject.rules.airstrikeRechargeTime ||
          50,
      };
    }
    return {
      count: gameObject.rules.airstrikeTeam || 2,
      planeType: gameObject.rules.airstrikeTeamType,
      rechargeTime: gameObject.rules.airstrikeRechargeTime || 100,
    };
  }

  /** 是否仍有挂弹飞机（未开火且未毁/未坠毁）。 */
  _hasArmedPlanes(): boolean {
    for (let i = 0; i < this.teamMiGs.length; i++) {
      const mig = this.teamMiGs[i];
      if (!mig.isDestroyed && !mig.isCrashing && !this._migFired.has(mig.id)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 锁定激光并武装下一波：实际刷机延后——旧波清空后先等
   * AirstrikeRechargeTime，再 execute。
   */
  _armPendingLaunch(_gameObject: any, targetObj: any, targetTile: any): void {
    this.pendingLaunch = true;
    this._guideGraceTicks = 15;
    if (this.targetObject) this.targetObject.airstrikeLaserTarget = false;
    this.targetObject = targetObj || null;
    this.targetTile = targetTile || null;
    if (this.targetObject) this.targetObject.airstrikeLaserTarget = true;
  }

  /**
   * 分发器（对照 临时源码/boris_airstrike_reconstructed.cpp）：
   *  - !fired → execute（刷机）；
   *  - interrupted → changeTarget（重新锁定召回）；
   *  - 仍有挂弹且目标不同 → changeTarget（转向）；
   *  - 全部投弹 → _armPendingLaunch（锁定并等待冷却）。
   */
  update(game: any, gameObject: any, targetObj: any, targetTile: any): void {
    if (!this.fired) {
      if (this.cooldownTicks > 0 && !this.pendingLaunch) return;
      this.execute(game, gameObject, targetObj, targetTile);
      return;
    }
    if (this.interrupted) {
      this.changeTarget(game, gameObject, targetObj, targetTile);
      return;
    }
    if (this._hasArmedPlanes()) {
      // 仍有挂弹飞机——换建筑才转向。
      if (targetObj !== this.targetObject) {
        this.changeTarget(game, gameObject, targetObj, targetTile);
      }
      return;
    }
    // 全部已投弹离场。本次点击请求下一波：激光先锁定建筑；
    // 冷却在旧波清空后才启动（见 onTick）。
    this._armPendingLaunch(gameObject, targetObj, targetTile);
  }

  /**
   * 原版 AirstrikeClass::Execute：标记 fired 并立刻刷出 MiG 编队。
   * 上一波仍在离场的飞机继续跟踪（append）以便幕后清理；_migFired
   * 不清空，已耗尽的飞机永不再被重定向。刷机失败且无旧波则回滚。
   */
  execute(game: any, gameObject: any, targetObj: any, targetTile: any): void {
    this.fired = true;
    this.interrupted = false;
    this._guideGraceTicks = 15;
    if (this.targetObject) this.targetObject.airstrikeLaserTarget = false;
    this.targetObject = targetObj || null;
    this.targetTile = targetTile || null;
    this._targetAcquiredVoicePlayed = false;
    this._migDeathVoiced.clear();
    // 标记目标建筑供渲染层染红。
    if (this.targetObject) this.targetObject.airstrikeLaserTarget = true;
    const oldMiGs = this.teamMiGs.filter((mig) => !mig.isDestroyed);
    const miGs = this.spawnMiGs(game, gameObject, targetTile, targetObj);
    if (miGs.length === 0 && oldMiGs.length === 0) {
      // 一架都刷不出且无旧波在空——回滚让 Boris 可重试。
      this.fired = false;
      this.clearTarget();
      return;
    }
    this.teamMiGs = oldMiGs.concat(miGs);
  }

  /**
   * 重定向/召回在途飞机。仅仍挂弹（未开火）的飞机被转向；
   * 已耗尽的飞机继续飞离场，不做无意义折返。
   */
  changeTarget(game: any, gameObject: any, targetObj: any, targetTile: any): void {
    let redirected = false;
    const mapSize = game.map.tiles.getMapSize();
    for (let i = 0; i < this.teamMiGs.length; i++) {
      const mig = this.teamMiGs[i];
      if (mig.isDestroyed || mig.isCrashing || !mig.unitOrderTrait) continue;
      if (this._migFired.has(mig.id)) continue; // 无弹
      redirected = true;
      mig.unitOrderTrait.cancelAllTasks();
      const attackTarget =
        targetObj && !targetObj.isDestroyed
          ? game.createTarget(targetObj, targetObj.tile)
          : game.createTarget(undefined, targetTile);
      // 全部从己方一侧飞出地图；exitTile 交给 AttackTask 让战机开火后
      // 立刻侧倾转向出口，而非空中急停急转。
      const exitTile = this.computeExitTile(game, gameObject, targetTile, mapSize);
      const attackWeapon = mig.armedTrait ? mig.armedTrait.primaryWeapon : undefined;
      if (attackWeapon) {
        mig.unitOrderTrait.addTask(
          new AttackTask(game, attackTarget, attackWeapon, {
            force: true,
            airstrikeExitTile: exitTile,
          }),
        );
      } else {
        mig.unitOrderTrait.addTask(
          new MoveTask(game, targetTile, false, { allowOutOfBoundsTarget: true }),
        );
      }
      mig.unitOrderTrait.addTask(
        new MoveTask(game, exitTile, false, { allowOutOfBoundsTarget: true }),
      );
      mig.unitOrderTrait.addTask(
        new CallbackTask(() => {
          if (!mig.isDestroyed) {
            game.destroyObject(mig, { player: mig.owner, obj: mig });
          }
        }),
      );
    }
    if (!redirected) return; // 全部已耗尽——无可转向
    this.interrupted = false;
    this._guideGraceTicks = 15;
    if (this.targetObject) this.targetObject.airstrikeLaserTarget = false;
    this.targetObject = targetObj || null;
    this.targetTile = targetTile || null;
    if (this.targetObject) this.targetObject.airstrikeLaserTarget = true;
    this._targetAcquiredVoicePlayed = false;
  }

  /** 清除目标引用与红色激光染色标志。 */
  clearTarget(): void {
    if (this.targetObject) this.targetObject.airstrikeLaserTarget = false;
    this.targetObject = null;
    this.targetTile = null;
  }

  /**
   * 刷出 MiG 编队：同一定点出生（同一图边进场），各自随机返航出口。
   * 每架挂 OutOfBoundsCleanupTrait（出界即自毁，与 Boris 生命周期无关）。
   * 刷机后播空袭语音（AirstrikeAttackVoice / VoiceSecondaryWeaponAttack）。
   */
  spawnMiGs(game: any, gameObject: any, targetTile: any, targetObj: any): any[] {
    const team = this.getAirstrikeTeam(gameObject);
    let migRules: any;
    try {
      migRules = game.rules.getObject(team.planeType, ObjectType.Aircraft);
    } catch {
      console.warn(`AirstrikeTrait: Could not find aircraft type "${team.planeType}"`);
      return [];
    }
    const mapSize = game.map.tiles.getMapSize();
    const miGs: any[] = [];
    const spawnPos = this.computeEdgeSpawnPosition(
      game,
      gameObject,
      targetTile,
      mapSize,
      0,
      team.count,
    );
    for (let i = 0; i < team.count; i++) {
      const mig = game.createUnitForPlayer(migRules, gameObject.owner);
      game.spawnObject(mig, spawnPos.tile);
      game.addObjectTrait(mig, new OutOfBoundsCleanupTrait());
      mig.position.tileElevation = Coords.worldToTileHeight(
        mig.rules.flightLevel ?? game.rules.general.flightLevel,
      );
      mig.zone = ZoneType.Air;
      mig.onBridge = false;
      mig.direction = FacingUtil.fromMapCoords(
        new Vector2(targetTile.rx - spawnPos.tile.rx, targetTile.ry - spawnPos.tile.ry),
      );
      const attackTarget =
        targetObj && !targetObj.isDestroyed
          ? game.createTarget(targetObj, targetObj.tile)
          : game.createTarget(undefined, targetTile);
      const exitTile = this.computeExitTile(game, gameObject, targetTile, mapSize);
      const attackWeapon = mig.armedTrait ? mig.armedTrait.primaryWeapon : undefined;
      if (attackWeapon) {
        mig.unitOrderTrait.addTask(
          new AttackTask(game, attackTarget, attackWeapon, {
            force: true,
            airstrikeExitTile: exitTile,
          }),
        );
      } else {
        mig.unitOrderTrait.addTask(
          new MoveTask(game, targetTile, false, { allowOutOfBoundsTarget: true }),
        );
      }
      mig.unitOrderTrait.addTask(
        new MoveTask(game, exitTile, false, { allowOutOfBoundsTarget: true }),
      );
      mig.unitOrderTrait.addTask(
        new CallbackTask(() => {
          if (!mig.isDestroyed) {
            game.destroyObject(mig, { player: mig.owner, obj: mig });
          }
        }),
      );
      miGs.push(mig);
    }
    // 原版 YR：刷机时播单位空袭语音（"MiG's on the way"）。
    const voice =
      (game.rules && game.rules.audioVisual && game.rules.audioVisual.airstrikeAttackVoice) ||
      gameObject.rules.voiceSecondaryWeaponAttack;
    if (voice) {
      game.events.dispatch(new TriggerSoundFxEventModule.TriggerSoundFxEvent(voice, gameObject.tile));
    }
    return miGs;
  }

  /**
   * 玩家主基地：主建造厂工厂，回落第一座存活 Construction Yard。
   * 飞机从距此最近的图边进场。
   */
  findMainBaseTile(gameObject: any): any {
    const owner = gameObject.owner;
    if (!owner) return null;
    const primary =
      owner.production && FactoryType
        ? owner.production.getPrimaryFactory(FactoryType.BuildingType)
        : null;
    if (primary && !primary.isDestroyed && primary.tile) return primary.tile;
    if (owner.buildings) {
      for (const b of owner.buildings) {
        if (b && !b.isDestroyed && b.rules && b.rules.constructionYard) return b.tile;
      }
    }
    return null;
  }

  /**
   * 选离主基地最近的图边出生点：两条最近边（水平/垂直）之一随机
   * 沿边+入深偏移（整 tile，避免分数索引 wrap）。无基地回落出生点，
   * 再回落目标所在边。槽位若在建筑内则沿边找空位。
   */
  computeEdgeSpawnPosition(
    game: any,
    gameObject: any,
    targetTile: any,
    mapSize: any,
    _index: number,
    _total: number,
  ): { tile: any } {
    let anchorTile = this.findMainBaseTile(gameObject);
    if (!anchorTile) {
      const owner = gameObject.owner;
      if (owner && owner.startLocation != null && game.map.startingLocations) {
        const loc = game.map.startingLocations[owner.startLocation];
        if (loc) {
          anchorTile =
            game.map.tiles.getByMapCoords(loc.x, loc.y) ||
            game.map.tiles.getPlaceholderTile(loc.x, loc.y);
        }
      }
    }
    anchorTile = anchorTile || targetTile;
    // 沿边随机偏移（tile）；入深 0..3（保证 octree 在界内）。
    const edgeSpread = 8;
    const depth = Math.floor(game.generateRandom() * 4);
    const randRy = Math.max(
      0,
      Math.min(
        mapSize.height - 1,
        anchorTile.ry + Math.round((game.generateRandom() * 2 - 1) * edgeSpread),
      ),
    );
    const randRx = Math.max(
      0,
      Math.min(
        mapSize.width - 1,
        anchorTile.rx + Math.round((game.generateRandom() * 2 - 1) * edgeSpread),
      ),
    );
    const left = { edgeX: depth, edgeY: randRy, verticalEdge: true };
    const right = { edgeX: mapSize.width - 1 - depth, edgeY: randRy, verticalEdge: true };
    const top = { edgeX: randRx, edgeY: depth, verticalEdge: false };
    const bottom = { edgeX: randRx, edgeY: mapSize.height - 1 - depth, verticalEdge: false };
    const horizontal = anchorTile.rx < mapSize.width / 2 ? left : right;
    const vertical = anchorTile.ry < mapSize.height / 2 ? top : bottom;
    const chosen = [horizontal, vertical][Math.floor(game.generateRandom() * 2)];
    const edgeX = Math.max(0, Math.min(Math.round(chosen.edgeX), mapSize.width - 1));
    const edgeY = Math.max(0, Math.min(Math.round(chosen.edgeY), mapSize.height - 1));
    let tile = this.findFreeEdgeSlot(game, edgeX, edgeY, mapSize, chosen.verticalEdge);
    if (!tile) tile = game.map.tiles.getPlaceholderTile(edgeX, edgeY);
    return { tile };
  }

  /** 沿边交替上下/左右走，找第一个不在未毁建筑内的 tile。 */
  findFreeEdgeSlot(
    game: any,
    edgeX: number,
    edgeY: number,
    mapSize: any,
    verticalEdge: boolean,
  ): any {
    const axisMax = verticalEdge ? mapSize.height : mapSize.width;
    for (let i = 0; i < axisMax; i++) {
      const delta = i % 2 === 0 ? i / 2 : -(i + 1) / 2;
      const x = verticalEdge
        ? edgeX
        : Math.max(0, Math.min(edgeX + delta, mapSize.width - 1));
      const y = verticalEdge
        ? Math.max(0, Math.min(edgeY + delta, mapSize.height - 1))
        : edgeY;
      const tile = game.map.tiles.getByMapCoords(x, y);
      if (
        tile &&
        !game.map
          .getGroundObjectsOnTile(tile)
          .some((e: any) => e.isBuilding() && !e.isDestroyed)
      ) {
        return tile;
      }
    }
    return null;
  }

  /**
   * 返航出口：从两条最近边（水平/垂直）中随机取一，垂直向外投影
   * 到图外（约 12~16 tile）。无基地则随机一边。出口坐标带随机沿边
   * 偏移，避免可预测的固定点。
   */
  computeExitTile(
    game: any,
    gameObject: any,
    _targetTile: any,
    mapSize: any,
  ): any {
    let anchorTile = this.findMainBaseTile(gameObject);
    if (!anchorTile) {
      const owner = gameObject.owner;
      if (owner && owner.startLocation != null && game.map.startingLocations) {
        const loc = game.map.startingLocations[owner.startLocation];
        if (loc) {
          anchorTile =
            game.map.tiles.getByMapCoords(loc.x, loc.y) ||
            game.map.tiles.getPlaceholderTile(loc.x, loc.y);
        }
      }
    }
    const offset = 12;
    if (!anchorTile) {
      const dir = Math.floor(game.generateRandom() * 4);
      let rx: number, ry: number;
      switch (dir) {
        case 0:
          rx = -offset;
          ry = Math.floor(game.generateRandom() * mapSize.height);
          break;
        case 1:
          rx = mapSize.width - 1 + offset;
          ry = Math.floor(game.generateRandom() * mapSize.height);
          break;
        case 2:
          rx = Math.floor(game.generateRandom() * mapSize.width);
          ry = -offset;
          break;
        default:
          rx = Math.floor(game.generateRandom() * mapSize.width);
          ry = mapSize.height - 1 + offset;
          break;
      }
      return game.map.tiles.getPlaceholderTile(rx, ry);
    }
    const ax = anchorTile.rx;
    const ay = anchorTile.ry;
    const edgeSpread = 8;
    const depth = 12 + Math.floor(game.generateRandom() * 5);
    const exitRy = Math.max(
      0,
      Math.min(mapSize.height - 1, ay + (game.generateRandom() * 2 - 1) * edgeSpread),
    );
    const exitRx = Math.max(
      0,
      Math.min(mapSize.width - 1, ax + (game.generateRandom() * 2 - 1) * edgeSpread),
    );
    const horizontal =
      ax < mapSize.width / 2
        ? { rx: -depth, ry: exitRy }
        : { rx: mapSize.width - 1 + depth, ry: exitRy };
    const vertical =
      ay < mapSize.height / 2
        ? { rx: exitRx, ry: -depth }
        : { rx: exitRx, ry: mapSize.height - 1 + depth };
    const pick = [horizontal, vertical][Math.floor(game.generateRandom() * 2)];
    return game.map.tiles.getPlaceholderTile(pick.rx, pick.ry);
  }

  /**
   * 制导中断（Boris 移动/死亡）：全部返航（飞出地图自毁）并播任务
   * 中止语音。fired 保持 1 直到最后一架离场；空中时重新锁定可召回。
   */
  cancel(game: any, gameObject: any): void {
    this.interrupted = true;
    this.playAbortVoice(game, gameObject);
    const mapSize = game.map.tiles.getMapSize();
    for (let i = 0; i < this.teamMiGs.length; i++) {
      const mig = this.teamMiGs[i];
      if (!mig.isDestroyed && !mig.isCrashing && mig.unitOrderTrait) {
        mig.unitOrderTrait.cancelAllTasks();
        const exitTile = this.computeExitTile(game, gameObject, null, mapSize);
        mig.unitOrderTrait.addTask(
          new MoveTask(game, exitTile, false, { allowOutOfBoundsTarget: true }),
        );
        mig.unitOrderTrait.addTask(
          new CallbackTask(() => {
            if (!mig.isDestroyed) {
              game.destroyObject(mig, { player: mig.owner, obj: mig });
            }
          }),
        );
      }
    }
    this.clearTarget();
  }

  /** 「Mission Aborted」语音：AirstrikeAbortSound / MIGMissionAborted。 */
  playAbortVoice(game: any, gameObject: any): void {
    const av =
      (game.rules && game.rules.audioVisual && game.rules.audioVisual.airstrikeAbortSound) ||
      "MIGMissionAborted";
    if (av) {
      game.events.dispatch(new TriggerSoundFxEventModule.TriggerSoundFxEvent(av, gameObject.tile));
    }
  }

  /**
   * 每 tick 驱动整个空袭状态机：
   *  1. 冷却倒数；归零且 pendingLaunch → execute 下一波；
   *  2. 制导宽限倒数；
   *  3. fired 且未中断且 Boris 移动（超宽限）→ cancel 或仅清锁定；
   *  4. 有目标且 Boris 未移动 → 强制次要开火动画并面向目标；
   *  5. 首架开火 → 播 Target acquired，并记录已投弹飞机；
   *  6. 首次坠毁 → 播坠毁语音（若无自有 VoiceCrashing）；
   *  7. 目标已毁 → 播中止语音并 clearTarget；
   *  8. 目标幸存且全部投弹 → 自动 _armPendingLaunch 重锁继续炸；
   *  9. 飞机出界 4 tile → destroyObject；从 team 过滤已毁；
   * 10. pendingLaunch 且旧波清空 → 设 cooldown；正常 reset（fired=0）。
   */
  [NotifyTickModule.NotifyTick.onTick](gameObject: any, game: any): void {
    if (this.cooldownTicks > 0) {
      this.cooldownTicks--;
      if (this.cooldownTicks === 0 && this.pendingLaunch) {
        this.pendingLaunch = false;
        if (this.targetObject || this.targetTile) {
          this.execute(game, gameObject, this.targetObject, this.targetTile);
        }
      }
    }
    if (this._guideGraceTicks > 0) this._guideGraceTicks--;
    // Boris 移动停止制导。投弹前空袭依赖激光，飞机返航（可召回）；
    // 投弹后空袭已定，仅丢光束/红染/待发锁定。
    if (
      this.fired &&
      !this.interrupted &&
      this.targetObject &&
      this._guideGraceTicks <= 0 &&
      gameObject.moveTrait &&
      gameObject.moveTrait.isMoving()
    ) {
      if (!this._targetAcquiredVoicePlayed) {
        this.cancel(game, gameObject);
      } else {
        this.pendingLaunch = false;
        this.clearTarget();
      }
    }
    // 制导期间播放专属次要开火（Flare 举手）序列并面向锁定建筑。
    if (this.targetObject && !gameObject.isMoving) {
      gameObject.isFiring = true;
      gameObject.isFiringSecondary = true;
      this._guidanceAnimating = true;
      const tPos = this.targetObject.position.worldPosition;
      const sPos = gameObject.position.worldPosition;
      gameObject.direction = FacingUtil.fromMapCoords(
        new Vector2(tPos.x - sPos.x, tPos.z - sPos.z),
      );
    } else if (this._guidanceAnimating) {
      // 仅当本 trait 设置过动画才清除——不得打断普通攻击。
      gameObject.isFiring = false;
      gameObject.isFiringSecondary = false;
      this._guidanceAnimating = false;
    }
    // Target acquired：首架开火播一次；记录所有已投弹飞机。
    // AttackState: Firing=4, JustFired=5。
    let anyFiring = false;
    let firstFiringMig: any = null;
    for (let i = 0; i < this.teamMiGs.length; i++) {
      const mig = this.teamMiGs[i];
      if (
        !mig.isDestroyed &&
        mig.attackTrait &&
        (mig.attackTrait.attackState === 4 || mig.attackTrait.attackState === 5)
      ) {
        this._migFired.add(mig.id);
        if (!anyFiring) {
          anyFiring = true;
          firstFiringMig = mig;
        }
      }
    }
    if (!this._targetAcquiredVoicePlayed && anyFiring) {
      this._targetAcquiredVoicePlayed = true;
      const tav =
        (game.rules && game.rules.audioVisual &&
          game.rules.audioVisual.airstrikeTargetAcquiredSound) ||
        "MIGAttackVoice";
      if (tav && firstFiringMig) {
        // 在 MiG 位置播——语音属于该机。
        game.events.dispatch(
          new TriggerSoundFxEventModule.TriggerSoundFxEvent(tav, firstFiringMig.tile),
        );
      }
    }
    // MiG going down：每架首次坠毁播一次；已有 VoiceCrashing 则跳过
    // （SoundHandler ObjectCrashing 已播，避免双播）。
    for (let j = 0; j < this.teamMiGs.length; j++) {
      const m2 = this.teamMiGs[j];
      if (m2.isCrashing && !this._migDeathVoiced.has(m2.id)) {
        this._migDeathVoiced.add(m2.id);
        if (!m2.rules.voiceCrashing) {
          const dv =
            (game.rules && game.rules.audioVisual && game.rules.audioVisual.airstrikeDeathSound) ||
            "MIGVoiceDie";
          if (dv && !m2.isDestroyed) {
            game.events.dispatch(new TriggerSoundFxEventModule.TriggerSoundFxEvent(dv, m2.tile));
          }
        }
      }
    }
    // 目标在开火前被毁 → 中止语音；飞机目标消失后自行离场。
    if (this.targetObject && this.targetObject.isDestroyed) {
      if (this.fired && !this._targetAcquiredVoicePlayed) {
        this.playAbortVoice(game, gameObject);
        this._targetAcquiredVoicePlayed = true;
      }
      this.clearTarget();
    }
    // 幸存建筑自动重锁：持续轰炸直到摧毁，无需手动再点。
    if (
      this.fired &&
      !this.interrupted &&
      !this.pendingLaunch &&
      this.targetObject &&
      !this.targetObject.isDestroyed &&
      !this._hasArmedPlanes()
    ) {
      this._armPendingLaunch(gameObject, this.targetObject, this.targetTile);
    }
    // 出界 4 tile 的飞机幕后清理：仅 exit MoveTask 不够——飞行器无法在
    // 出界占位 tile 上「停住」，会被拉回界内并可见爆炸。
    const mapSize = game.map.tiles.getMapSize();
    const exitMargin = 4;
    for (let m = 0; m < this.teamMiGs.length; m++) {
      const mm = this.teamMiGs[m];
      if (!mm.isDestroyed && !mm.isCrashing && mm.tile) {
        const tt = mm.tile;
        if (
          tt.rx < -exitMargin ||
          tt.ry < -exitMargin ||
          tt.rx > mapSize.width - 1 + exitMargin ||
          tt.ry > mapSize.height - 1 + exitMargin
        ) {
          game.destroyObject(mm, { player: mm.owner, obj: mm });
        }
      }
    }
    // 从 team 丢弃已毁飞机。全部离场/被毁后才 reset（原版
    // ReleaseTarget → Fired=0，随后 AirstrikeRechargeTime）。
    let anyRemoved = false;
    this.teamMiGs = this.teamMiGs.filter((mig) => {
      if (mig.isDestroyed) {
        anyRemoved = true;
        return false;
      }
      return true;
    });
    // 旧波全清后，pending 下一波开始冷却倒数（激光保持锁定）。
    if (this.pendingLaunch && this.teamMiGs.length === 0 && this.cooldownTicks <= 0) {
      this.cooldownTicks = this.getAirstrikeTeam(gameObject).rechargeTime;
    }
    // pending 时跳过正常 reset（上面已处理倒数，激光仍锁着）。
    if (anyRemoved && this.teamMiGs.length === 0 && this.fired && !this.pendingLaunch) {
      this.fired = false;
      this.interrupted = false;
      this._guideGraceTicks = 0;
      const team = this.getAirstrikeTeam(gameObject);
      this.cooldownTicks = team.rechargeTime;
      this.clearTarget();
    }
  }

  /** Boris 死亡：有在空飞机则 cancel 返航；否则播中止语音并回滚。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](gameObject: any, game: any): void {
    if (this.fired && this.teamMiGs.length > 0) {
      this.cancel(game, gameObject);
    } else if (this.fired) {
      this.playAbortVoice(game, gameObject);
      this.fired = false;
      this.clearTarget();
    }
  }

  /** 释放状态（编队/锁定/已投弹集合/激光）。 */
  dispose(): void {
    this.teamMiGs = [];
    this.pendingLaunch = false;
    this._migFired.clear();
    this.activeLaser = null;
  }
}

/**
 * 每架 MiG 的出界清理 trait。原先仅在 Boris 的 AirstrikeTrait.onTick
 * 里做——Boris 一死该 tick 就停，返航中的飞机可能飞出图外永不销毁。
 * 挂到每架刷出的 MiG 上后，清理与 Boris 生死无关：明确出界即自毁。
 */
class OutOfBoundsCleanupTrait {
  /** 是否启用出界自毁。 */
  enabled: boolean;

  constructor() {
    this.enabled = true;
  }

  /** 启用/禁用出界自毁。 */
  setEnabled(e: boolean): void {
    this.enabled = e;
  }

  /** 每 tick：出界 margin=4（与 AirstrikeTrait.onTick 一致）则销毁。 */
  [NotifyTickModule.NotifyTick.onTick](gameObject: any, game: any): void {
    if (!this.enabled || gameObject.isDestroyed || gameObject.isCrashing || !gameObject.tile) {
      return;
    }
    const mapSize = game.map.tiles.getMapSize();
    const exitMargin = 4;
    const tt = gameObject.tile;
    if (
      tt.rx < -exitMargin ||
      tt.ry < -exitMargin ||
      tt.rx > mapSize.width - 1 + exitMargin ||
      tt.ry > mapSize.height - 1 + exitMargin
    ) {
      game.destroyObject(gameObject, { player: gameObject.owner, obj: gameObject });
    }
  }
}
