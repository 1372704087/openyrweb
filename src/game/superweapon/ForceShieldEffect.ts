/**
 * ForceShieldEffect — 力场护盾超武特效。
 *
 * 原版 YR 行为：
 *  - ForceShieldRadius（**格**，非 lepton）内的己方/盟友建筑获得
 *    invulnerableTrait.setActiveFor(ForceShieldDuration) 无敌；
 *  - 同时对发动者断电 ForceShieldBlackoutDuration 帧（PowerTrait.setBlackoutFor）；
 *  - 无敌即将结束前播放 ForceShieldFading 特效音。
 * 与铁幕不同：只保护不杀伤。半径按格直接使用（2026-07-25 修复了误除
 * LEPTONS_PER_TILE 导致 maxTiles 恒为 1 的问题——孪生已是修复后行为）。
 *
 * 由 game/superweapon/ForceShieldEffect.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { SuperWeaponEffect } from "game/superweapon/SuperWeaponEffect"; // 已转换
import { TriggerSoundFxEvent } from "game/event/TriggerSoundFxEvent"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ForceShieldEffect extends SuperWeaponEffect {
  /** 淡出音剩余触发帧（相对 duration）。 */
  private _fadeFrames: number;
  /** 特效音 INI 名。 */
  private _specialSound: string | undefined;
  /** 激活时的 world tick。 */
  private _activationTick: number;
  /** 淡出音是否已播。 */
  private _fadeSoundPlayed: boolean;
  /** 无敌持续帧数。 */
  private _duration: number;
  /** 未使用（与孪生字段对齐）。 */
  private _endFlashSet: boolean;
  /** 本次套盾的对象列表。 */
  private _shieldedObjects: any[];

  constructor(type?: any, owner?: any, tile?: any) {
    super(type, owner, tile);
    this._fadeFrames = 0;
    this._specialSound = undefined;
    this._activationTick = 0;
    this._fadeSoundPlayed = false;
    this._duration = 0;
    this._endFlashSet = false;
    this._shieldedObjects = [];
  }

  onStart(world: any): void {
    const cd = world.rules.combatDamage;
    const duration = (cd && cd.forceShieldDuration) || 0;
    const radiusCells = (cd && cd.forceShieldRadius) || 0;
    const blackout = (cd && cd.forceShieldBlackoutDuration) || 0;
    // 记录淡出音时机，供 onTick 查询。
    this._fadeFrames = (cd && cd.forceShieldPlayFadeSoundTime) || 0;
    this._specialSound = undefined;
    if (this._fadeFrames > 0 && void 0 !== this.type) {
      const typeRef = this.type;
      const fsSwRules = [...world.rules.superWeaponRules.values()].find(
        (r: any) => r.type === typeRef,
      );
      if (fsSwRules) this._specialSound = fsSwRules.specialSound;
    }
    this._activationTick = world.currentTick;
    this._fadeSoundPlayed = false;
    this._duration = duration;
    this._endFlashSet = false;
    this._shieldedObjects = [];
    // 为 ForceShieldRadius（格）内每个己方/盟友 techno 套盾。
    // forceShieldRadius 按原版 INI 规范是格数，不是 lepton。
    if (duration > 0 && radiusCells > 0) {
      const maxTiles = Math.max(1, Math.round(radiusCells));
      let tile: any;
      const finder = new RadialTileFinder(
        world.map.tiles,
        world.map.mapBounds,
        this.tile,
        { width: 1, height: 1 },
        0,
        maxTiles,
        () => true,
      );
      while ((tile = finder.getNextTile())) {
        for (const obj of world.map.getGroundObjectsOnTile(tile)) {
          if (!obj.isTechno() || obj.isDestroyed) continue;
          // 力场保护建筑（及地面单位），不保护飞机。
          if (obj.isUnit()) continue;
          if (obj.rules.missileSpawn) continue;
          // 只保护己方或盟友建筑。
          if (obj.owner !== this.owner && !world.alliances.areAllied(obj.owner, this.owner)) {
            continue;
          }
          obj.invulnerableTrait.setActiveFor(duration, world.currentTick);
          // 标记为力场无敌，渲染层可与铁幕区分色调；
          // 用 setForceShieldActiveFor 避免被铁幕调用覆盖。
          obj.invulnerableTrait.setForceShieldActiveFor(duration, world.currentTick);
          this._shieldedObjects.push(obj);
        }
      }
    }
    // 代价：发动者电力黑屏 ForceShieldBlackoutDuration 帧。
    if (blackout > 0 && this.owner && this.owner.powerTrait) {
      this.owner.powerTrait.setBlackoutFor(blackout, world);
    }
  }

  onTick(world: any): boolean {
    const elapsed = world.currentTick - this._activationTick;
    // 持续时间到点时播 specialSound（ForceShieldFading）。
    if (!this._fadeSoundPlayed && this._specialSound && elapsed >= this._duration) {
      world.events.dispatch(new TriggerSoundFxEvent(this._specialSound, this.tile));
      this._fadeSoundPlayed = true;
    }
    // 持续期内保持 Running。
    return elapsed >= this._duration;
  }
}
