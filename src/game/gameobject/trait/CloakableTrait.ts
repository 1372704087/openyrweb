/**
 * CloakableTrait — 隐形（cloakDelay 冷却后自动 Cloak，受伤解除并重置冷却）。
 *
 * 由 game/gameobject/trait/CloakableTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ObjectCloakChangeEventModule from "game/event/ObjectCloakChangeEvent"; // 未转换（any-shim）
import { GameSpeed } from "game/GameSpeed"; // 已转换
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 未转换（any-shim）
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CloakableTrait {
  gameObject: any;
  cloakDelayMinutes: any;
  isActive: any;
  cooldownTicks: any;

  constructor(gameObject: any, cloakDelayMinutes: any) {
    this.gameObject = gameObject;
    this.cloakDelayMinutes = cloakDelayMinutes;
    this.isActive = false;
    this.resetCloakCooldown();
  }
  isCloaked() {
    return this.isActive;
  }
  uncloak(world: any) {
    const wasActive = this.isActive;
    this.resetCloakCooldown();
    if (wasActive) {
      this.isActive = false;
      world.events.dispatch(new ObjectCloakChangeEventModule.ObjectCloakChangeEvent(this.gameObject));
    }
  }
  resetCloakCooldown() {
    this.cooldownTicks = Math.floor(60 * this.cloakDelayMinutes * GameSpeed.BASE_TICKS_PER_SECOND);
  }
  [NotifySpawnModule.NotifySpawn.onSpawn](_obj: any, _world: any) {
    this.resetCloakCooldown();
  }
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any) {
    if (0 < this.cooldownTicks) this.cooldownTicks--;
    if (
      this.cooldownTicks <= 0 &&
      !this.isActive &&
      !(obj.isVehicle() && obj.submergibleTrait && !obj.submergibleTrait.isSubmerged()) &&
      !obj.temporalTrait.getTarget()
    ) {
      this.isActive = true;
      world.events.dispatch(new ObjectCloakChangeEventModule.ObjectCloakChangeEvent(this.gameObject));
    }
  }
  [NotifyDamageModule.NotifyDamage.onDamage](_obj: any, world: any) {
    this.uncloak(world);
  }
  dispose() {
    this.gameObject = void 0;
  }
}
