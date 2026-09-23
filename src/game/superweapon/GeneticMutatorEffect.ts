/**
 * GeneticMutatorEffect — 基因突变器超武特效（YR）。
 *
 * 原版行为：
 *  - 半径内步兵以 infDeathType=Mutate(9) 死亡，渲染层播 GENDEATH；
 *  - GENDEATH 结束（_genDeathAnimDone）后在原位刷出 BRUTE，归属发动者；
 *  - 友军与敌军步兵都会被转化；NotHuman 步兵直接处决不转化；
 *  - 单轮结算，避免双刷。
 *
 * 由 game/superweapon/GeneticMutatorEffect.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { SuperWeaponEffect } from "game/superweapon/SuperWeaponEffect"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 等待 GENDEATH 动画完成后再刷 BRUTE 的挂起项。 */
interface PendingMutation {
  obj: any;
  tile: any;
  subCell: number;
}

export class GeneticMutatorEffect extends SuperWeaponEffect {
  /** 待转化步兵列表（动画完成后刷 BRUTE）。 */
  private _pending: PendingMutation[] | null;
  /** 超时保护倒数（孪生维护但未在 onTick 中强制触发）。 */
  private _timeoutTicks: number;

  constructor(type: any, owner: any, tile: any) {
    super(type, owner, tile);
    this._pending = [];
    this._timeoutTicks = 120;
  }

  onStart(world: any): void {
    const av = world.rules.audioVisual;
    const general = world.rules.general;
    const useExplosion = !!general.mutateExplosion;
    const whName = useExplosion ? av.mutateExplosionWarhead : av.mutateWarhead;
    let cellSpread = useExplosion ? 5 : 1;
    if (whName) {
      try {
        const whR = world.rules.getWarhead(whName);
        if (whR.cellSpread > 0) cellSpread = whR.cellSpread;
      } catch (err) {}
    }
    const hasBrute = world.rules.hasObject("BRUTE", ObjectType.Infantry);
    if (!hasBrute && !whName) return;
    const finder = new RadialTileFinder(
      world.map.tiles,
      world.map.mapBounds,
      this.tile,
      { width: 1, height: 1 },
      0,
      Math.ceil(cellSpread),
      () => true,
    );
    let tile: any;
    while ((tile = finder.getNextTile())) {
      for (const u of world.map.getGroundObjectsOnTile(tile)) {
        if (!u.isInfantry() || u.isDestroyed) continue;
        const dist = Math.sqrt((u.tile.rx - this.tile.rx) ** 2 + (u.tile.ry - this.tile.ry) ** 2);
        if (dist > cellSpread) continue;
        if (u.rules.isHuman && hasBrute) {
          // 销毁前记下刷 BRUTE 所需的位置信息
          this._pending.push({
            obj: u,
            tile: u.tile,
            subCell: u.position.subCell,
          });
          u.infDeathType = 9;
          // 记录施法者颜色，使 GENDEATH 变形动画用施法者阵营色而非受害者色
          // （Infantry renderable 在 infDeathType=9 的 onRemove 时读取）
          u._mutateCasterColor = this.owner.color;
          world.destroyObject(u, { player: this.owner }, undefined, true);
        } else {
          world.destroyObject(u, { player: this.owner });
        }
      }
    }
    if (!this._pending.length) return;
  }

  onTick(world: any): boolean {
    if (!this._pending) return true;
    const remaining: PendingMutation[] = [];
    for (const p of this._pending) {
      if (!p.obj._genDeathAnimDone) {
        remaining.push(p);
        continue;
      }
      try {
        const brute = world.createUnitForPlayer(
          world.rules.getObject("BRUTE", ObjectType.Infantry),
          this.owner,
        );
        brute.direction = 225;
        brute.position.subCell = p.subCell;
        world.spawnObject(brute, p.tile);
      } catch (err) {}
    }
    this._pending = remaining;
    if (remaining.length) {
      this._timeoutTicks--;
      return false;
    }
    this._pending = null;
    return true;
  }
}
