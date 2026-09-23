/**
 * DominatorEffect — 心灵支配者超武特效（YR）。
 *
 * 发动时：
 *  1. 立刻按 DominatorFirstAnim 计算点火延迟（FirstAnim 时长 ×
 *     DominatorFireAtPercentage）；
 *  2. 倒计时到点后：引爆 DominatorWarhead（范围伤害）、在
 *     DominatorCaptureRange 内俘获敌方有机单位、派发
 *     TriggerAnimEvent(DominatorSecondAnim)（地面光环），SuperWeaponFxHandler
 *     另行叠加纯红屏幕 tint。
 *
 * onTick 返回约定：false=继续跑，true=结束（SuperWeaponsTrait 以
 * onTick 为真时 finish）。
 *
 * 由 game/superweapon/DominatorEffect.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { Warhead } from "game/Warhead"; // 已转换
import { SuperWeaponEffect } from "game/superweapon/SuperWeaponEffect"; // 已转换
import { TriggerAnimEvent } from "game/event/TriggerAnimEvent"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class DominatorEffect extends SuperWeaponEffect {
  /** 距点火剩余 tick。 */
  private _fireTicksLeft: number;
  /** 是否已点火结算。 */
  private _hasFired: boolean;

  constructor(type: any, owner: any, tile: any) {
    super(type, owner, tile);
    this._fireTicksLeft = 0;
    this._hasFired = false;
  }

  onStart(world: any): void {
    const av = world.rules.audioVisual;
    this._hasFired = false;
    // 用 FirstAnim 时长 × DominatorFireAtPercentage 推算点火延迟。
    const firePct = av.dominatorFireAtPercentage || 100;
    this._fireTicksLeft = Math.floor((60 * firePct) / 100); // 兜底缺省
    if (av.dominatorFirstAnim && firePct < 100) {
      try {
        const animArt = world.art.getAnimation(av.dominatorFirstAnim);
        if (animArt && animArt.art) {
          const rateRaw = animArt.art.getNumber("Rate", 60 * GameSpeed.BASE_TICKS_PER_SECOND);
          const endFrame = animArt.art.getNumber("End", 60);
          const frameCount = endFrame + 1;
          const rateFPS = rateRaw / 60;
          const totalTicks = Math.ceil((GameSpeed.BASE_TICKS_PER_SECOND / rateFPS) * frameCount);
          this._fireTicksLeft = Math.floor((totalTicks * firePct) / 100);
        }
      } catch (_) {
        // 上面已设兜底值
      }
    }
    // 百分比 < 100 时至少保证 1 tick 延迟
    if (firePct < 100 && this._fireTicksLeft < 1) this._fireTicksLeft = 1;
  }

  onTick(world: any): boolean {
    // 返回：false=继续，true=结束
    if (this._hasFired) return true;
    if (0 < this._fireTicksLeft) {
      this._fireTicksLeft--;
      return false;
    }
    // 到点——结算弹头伤害并俘获单位
    this._hasFired = true;
    const av = world.rules.audioVisual;
    const ctx = { player: this.owner };
    // 1. 引爆支配者弹头（范围伤害 + 视觉）。
    if (av.dominatorWarhead) {
      const wh = new Warhead(world.rules.getWarhead(av.dominatorWarhead));
      // 孪生只传 9 参；尾部 smudge/cellSpread/suppressAnim 省略（与 JS 调用一致）。
      (wh as any).detonate(
        world,
        av.dominatorDamage,
        this.tile,
        0,
        Coords.tile3dToWorld(this.tile.rx + 0.5, this.tile.ry + 0.5, this.tile.z),
        world.map.getTileZone(this.tile),
        0,
        { obj: undefined, getBridge: undefined },
        { player: this.owner },
      );
    }
    // 2. 俘获范围内幸存的敌方有机单位。
    const captureRange = av.dominatorCaptureRange;
    if (0 < captureRange) {
      const finder = new RadialTileFinder(
        world.map.tiles,
        world.map.mapBounds,
        this.tile,
        { width: 1, height: 1 },
        0,
        captureRange,
        () => true,
      );
      let tile: any;
      while ((tile = finder.getNextTile())) {
        for (const obj of world.map.getGroundObjectsOnTile(tile)) {
          if (!obj.isTechno()) continue;
          if (obj.isDestroyed) continue;
          if (obj.owner === this.owner) continue;
          if (world.alliances.areAllied(obj.owner, this.owner)) continue;
          if (obj.rules.immuneToPsionics) continue;
          if (obj.isBuilding()) continue;
          if (!obj.mindControllableTrait) continue;
          if (obj.mindControllableTrait.isActive()) continue;
          if (obj.isUnit() && obj.tile !== tile) continue;
          world.changeObjectOwner(obj, this.owner);
        }
      }
    }
    // 3. 派发 SecondAnim（地面光环）。
    if (av.dominatorSecondAnim) {
      world.events.dispatch(new TriggerAnimEvent(av.dominatorSecondAnim, this.tile));
    }
    return true;
  }
}
