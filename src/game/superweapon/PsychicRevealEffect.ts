/**
 * PsychicRevealEffect — 心灵探测（永久开图）超武特效。
 *
 * 激活时以 PsychicRevealRadius（缺省 10）为半径，仅对发动者永久揭示
 * 激活格周围的迷雾；实现与 RevealAroundWaypointExecutor 一致
 * （mapShroudTrait.getPlayerShroud(player).revealAround(tile, radius)）。
 * 不会过期——区别于 revealTemporarily。
 *
 * 由 game/superweapon/PsychicRevealEffect.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { SuperWeaponEffect } from "game/superweapon/SuperWeaponEffect"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class PsychicRevealEffect extends SuperWeaponEffect {
  onStart(world: any): void {
    const radius = (world.rules.combatDamage && world.rules.combatDamage.psychicRevealRadius) || 10;
    // 仅对发动者永久开图（单人情报，非全局揭示）。
    if (this.owner) {
      const shroud = world.mapShroudTrait && world.mapShroudTrait.getPlayerShroud(this.owner);
      if (shroud && this.tile) shroud.revealAround(this.tile, radius);
    }
  }

  onTick(_world: any): boolean {
    return true;
  }
}
