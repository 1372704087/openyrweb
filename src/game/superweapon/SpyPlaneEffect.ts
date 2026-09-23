/**
 * SpyPlaneEffect — 间谍机超武特效（苏军雷达塔支援能力）。
 *
 * SPYP 侦察机从随机地图边缘飞入，掠过目标格（FlyBy 不减速）；在距目标
 * ≤ SpyCameraWeapon Range 内每 SpyPlaneCameraFrames tick 拍一张照，
 * 永久揭示机位周围 SpyCameraWeapon Damage 格并播快门音；飞抵对侧
 * 出口后销毁。
 *
 * 由 game/superweapon/SpyPlaneEffect.ts.js 重写为 TS（行为完全一致，
 * 枚举值脚本提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { SuperWeaponEffect } from "game/superweapon/SuperWeaponEffect"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { FacingUtil } from "game/gameobject/unit/FacingUtil"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { TriggerSoundFxEvent } from "game/event/TriggerSoundFxEvent"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 间谍机阶段（模块内状态机，不对外导出——与孪生一致）。 */
enum SpyPlaneState {
  /** 首 tick 刷机。 */
  Spawning = 0,
  /** 飞行中。 */
  EnRoute = 1,
}

/** 原版 YR 写死的间谍机单位名。 */
const SPYP_TYPE = "SPYP";

export class SpyPlaneEffect extends SuperWeaponEffect {
  /** 当前阶段。 */
  private state: SpyPlaneState;
  /** 快门间隔计数。 */
  private cameraTickCounter: number;
  /** 揭示半径（格，来自 SpyCameraWeapon Damage）。 */
  private revealRadius: number;
  /** 开始拍照的距目标距离（SpyCameraWeapon Range）。 */
  private cameraRange: number;
  /** 拍照间隔 tick。 */
  private cameraFrames: number;
  /** 快门音效名。 */
  private cameraSound: string;
  /** 间谍机实例。 */
  private spyPlane: any;

  constructor(type: any, owner: any, tile: any) {
    super(type, owner, tile);
    this.state = SpyPlaneState.Spawning;
    this.cameraTickCounter = 0;
    this.revealRadius = 6;
    this.cameraRange = 20;
    this.cameraFrames = 16;
    this.cameraSound = "SpyPlaneSnapshot";
    this.spyPlane = undefined;
  }

  onStart(world: any): void {
    // 读 SPYP 武器规则得到揭示半径与开始拍照距离。
    let revealRadius = 6;
    let cameraRange = 20;
    try {
      const planeRules = world.rules.getObject(SPYP_TYPE, ObjectType.Aircraft);
      if (planeRules && planeRules.primary) {
        const weaponRules = world.rules.getWeapon(planeRules.primary);
        if (weaponRules) {
          if (weaponRules.damage) revealRadius = weaponRules.damage;
          if (weaponRules.range && weaponRules.range !== Number.POSITIVE_INFINITY) {
            cameraRange = weaponRules.range;
          }
        }
      }
    } catch (err) {
      console.warn("SpyPlaneEffect: could not read SPYP weapon rules", err);
    }
    this.revealRadius = revealRadius;
    this.cameraRange = cameraRange;
    const av = world.rules.audioVisual;
    this.cameraFrames = (av && av.spyPlaneCameraFrames) || 16;
    this.cameraSound = (av && av.spyPlaneCamera) || "SpyPlaneSnapshot";
  }

  onTick(world: any): boolean {
    if (this.state === SpyPlaneState.Spawning) {
      this.spawnSpyPlane(world);
      this.state = SpyPlaneState.EnRoute;
    }
    // 机毁/坠毁 → 结束
    if (!this.spyPlane || this.spyPlane.isDestroyed || this.spyPlane.isCrashing) return true;
    const planeTile = this.spyPlane.tile;
    // 出界清理（与 AirstrikeTrait 相同余量）
    if (planeTile) {
      const mapSize = world.map.tiles.getMapSize();
      const exitMargin = 4;
      if (
        planeTile.rx < -exitMargin ||
        planeTile.ry < -exitMargin ||
        planeTile.rx > mapSize.width - 1 + exitMargin ||
        planeTile.ry > mapSize.height - 1 + exitMargin
      ) {
        world.destroyObject(this.spyPlane, {
          player: this.spyPlane.owner,
          obj: this.spyPlane,
        });
        return true;
      }
    }
    // 拍照阶段：接近目标时按 cameraFrames 间隔揭示 + 快门音
    if (planeTile && this.tile) {
      const dx = planeTile.rx - this.tile.rx;
      const dy = planeTile.ry - this.tile.ry;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= this.cameraRange) {
        this.cameraTickCounter++;
        if (this.cameraTickCounter >= this.cameraFrames) {
          this.cameraTickCounter = 0;
          const shroud =
            world.mapShroudTrait && world.mapShroudTrait.getPlayerShroud(this.owner);
          if (shroud) shroud.revealAround(planeTile, this.revealRadius);
          if (this.cameraSound) {
            world.events.dispatch(new TriggerSoundFxEvent(this.cameraSound, planeTile));
          }
        }
      }
    }
    // 任务队列空 → 出境销毁并结束
    if (!this.spyPlane.unitOrderTrait.hasTasks()) {
      world.destroyObject(this.spyPlane, {
        player: this.spyPlane.owner,
        obj: this.spyPlane,
      });
      return true;
    }
    return false;
  }

  /** 从随机边缘刷 SPYP，航向目标并设置出境 CallbackTask。 */
  private spawnSpyPlane(world: any): void {
    let planeRules: any;
    try {
      planeRules = world.rules.getObject(SPYP_TYPE, ObjectType.Aircraft);
    } catch (err) {
      console.warn('SpyPlaneEffect: aircraft type "' + SPYP_TYPE + '" not found');
      return;
    }
    const mapSize = world.map.tiles.getMapSize();
    const target = this.tile;
    // 随机选一条边飞入，从对侧飞出。
    const dir = Math.floor(world.generateRandom() * 4);
    let entryTile: any;
    let exitTile: any;
    const offset = 1;
    const exitOffset = 12;
    const tx = Math.max(offset, Math.min(target.rx, mapSize.width - 1 - offset));
    const ty = Math.max(offset, Math.min(target.ry, mapSize.height - 1 - offset));
    if (dir === 0) {
      entryTile =
        world.map.tiles.getByMapCoords(tx, offset) ||
        world.map.tiles.getPlaceholderTile(tx, offset);
      exitTile = world.map.tiles.getPlaceholderTile(tx, mapSize.height - 1 + exitOffset);
    } else if (dir === 1) {
      entryTile =
        world.map.tiles.getByMapCoords(tx, mapSize.height - 1 - offset) ||
        world.map.tiles.getPlaceholderTile(tx, mapSize.height - 1 - offset);
      exitTile = world.map.tiles.getPlaceholderTile(tx, -exitOffset);
    } else if (dir === 2) {
      entryTile =
        world.map.tiles.getByMapCoords(mapSize.width - 1 - offset, ty) ||
        world.map.tiles.getPlaceholderTile(mapSize.width - 1 - offset, ty);
      exitTile = world.map.tiles.getPlaceholderTile(-exitOffset, ty);
    } else {
      entryTile =
        world.map.tiles.getByMapCoords(offset, ty) ||
        world.map.tiles.getPlaceholderTile(offset, ty);
      exitTile = world.map.tiles.getPlaceholderTile(mapSize.width - 1 + exitOffset, ty);
    }
    const plane = world.createUnitForPlayer(planeRules, this.owner);
    world.spawnObject(plane, entryTile);
    plane.position.tileElevation = Coords.worldToTileHeight(
      plane.rules.flightLevel ?? world.rules.general.flightLevel,
    );
    plane.zone = ZoneType.Air;
    plane.onBridge = false;
    plane.direction = FacingUtil.fromMapCoords(
      new Vector2(target.rx - entryTile.rx, target.ry - entryTile.ry),
    );
    // 直穿到对侧（FlyBy，不减速）
    plane.unitOrderTrait.addTask(
      new MoveTask(world, exitTile, false, { allowOutOfBoundsTarget: true }),
    );
    plane.unitOrderTrait.addTask(
      new CallbackTask(function () {
        if (!plane.isDestroyed) {
          world.destroyObject(plane, { player: plane.owner, obj: plane });
        }
      }),
    );
    this.spyPlane = plane;
  }
}
