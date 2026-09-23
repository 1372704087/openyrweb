/**
 * MissileSpawnTrait — 导弹出生体（可配置 warhead/damage/launcher，被毁时引爆）。
 *
 * 由 game/gameobject/trait/MissileSpawnTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as CollisionTypeModule from "game/gameobject/unit/CollisionType"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MissileSpawnTrait {
  warhead: any;
  damage: any;
  launcher: any;

  setWarhead(warhead: any) {
    this.warhead = warhead;
    return this;
  }
  setDamage(damage: any) {
    this.damage = damage;
    return this;
  }
  setLauncher(launcher: any) {
    this.launcher = launcher;
    return this;
  }
  [NotifyDestroyModule.NotifyDestroy.onDestroy](obj: any, world: any) {
    if (!this.warhead || !this.damage || !this.launcher) return;
    this.warhead.detonate(
      world,
      this.damage,
      obj.tile,
      obj.tileElevation,
      obj.position.worldPosition,
      obj.zone,
      CollisionTypeModule.CollisionType.None,
      world.createTarget(void 0, obj.tile),
      { player: obj.owner, obj: this.launcher, weapon: void 0 },
    );
  }
  dispose() {
    this.launcher = void 0;
  }
}
